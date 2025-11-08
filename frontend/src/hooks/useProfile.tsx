import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { mockUserProfile } from '@/lib/data/user';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getStudentDetailsRequest,
  removeStudentEducationRequest,
  removeStudentExperienceRequest,
  removeStudentProjectRequest,
  removeStudentSkillRequest,
  updateStudentJobPreferenceRequest,
  updateStudentSkillRequest,
} from '@/redux/reducers/studentReducer';
import { RootState } from '@/redux/rootReducer';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
] as const;

const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  gpa: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const experienceEntrySchema = z
  .object({
    company: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    employmentType: z.enum(employmentTypes).optional(),
    location: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    responsibilities: z.string().optional(),
  })
  .refine((d) => d.isCurrent || (!!d.endDate && d.endDate.length > 0), {
    message: 'End date is required for past jobs.',
    path: ['endDate'],
  });

const projectEntrySchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    technologies: z.string().optional(),
    link: z
      .string()
      .url({ message: 'Please enter a valid URL.' })
      .or(z.literal(''))
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().default(false).optional(),
  })
  .refine((d) => d.isCurrent || (!!d.endDate && d.endDate.length > 0), {
    message: 'End date is required for past projects.',
    path: ['endDate'],
  });

const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' }),
  avatar: z.string().url({ message: 'Please enter a valid URL.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  jobPreference: z
    .string()
    .min(2, { message: 'Job preference must be at least 2 characters.' }),
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skills: z.string().optional(), // your UI uses array in places; we’ll widen defaultValues below
  narrativeChallenges: z.string().optional(),
  narrativeAchievements: z.string().optional(),
  narrativeAppreciation: z.string().optional(),
  preferredCountry: z.string().optional(),
  preferredLanguage: z.string().optional(),
  preferredDatePosted: z
    .enum(['all', 'today', '3days', 'week', 'month'])
    .optional(),
  prefersWorkFromHome: z.boolean().optional(),
  preferredEmploymentTypes: z.array(z.string()).optional(),
  preferredJobRequirements: z.array(z.string()).optional(),
  preferredSearchRadius: z.preprocess(
    (val) =>
      val === '' || val == null || Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z.number().min(0, 'Radius must be positive').optional(),
  ),
  excludedJobPublishers: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const useProfile = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { students } = useSelector((state: RootState) => state.student);

  const [addExp, setAddExp] = useState(false);
  const [addProj, setAddProj] = useState(false);
  const [addEdu, setAddEdu] = useState(false);
  const [addSkill, setAddSkill] = useState(false);

  const [editEdu, setEditEdu] = useState(false);
  const [editExp, setEditExp] = useState(false);
  const [editProj, setEditProj] = useState(false);
  const [editSkill, setEditSkill] = useState(false);

  const [editEduIndex, setEditEduIndex] = useState(0);
  const [editExpIndex, setEditExpIndex] = useState(0);
  const [editProjIndex, setEditProjIndex] = useState(0);
  const [editSkillIndex, setEditSkillIndex] = useState(0);

  const [deleteEdu, setDeleteEdu] = useState(false);
  const [deleteExp, setDeleteExp] = useState(false);
  const [deleteProj, setDeleteProj] = useState(false);
  const [deleteSkill, setDeleteSkill] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [deleteEduIndex, setDeleteEduIndex] = useState(0);
  const [deleteExpIndex, setDeleteExpIndex] = useState(0);
  const [deleteProjIndex, setDeleteProjIndex] = useState(0);
  const [deleteSkillIndex, setDeleteSkillIndex] = useState(0);

  const [isNameEditable, setIsNameEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isJobPrefEditable, setIsJobPrefEditable] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getStudentData = () => {
    if (!Array.isArray(students) || students.length === 0) return null;
    return students[0]?.studentDetails || students[0] || null;
  };

  const studentData = getStudentData();

  const personalInfoForm = useForm<
    Pick<
      ProfileFormValues,
      'fullName' | 'email' | 'phone' | 'avatar' | 'jobPreference'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        jobPreference: true,
      }),
    ),
    mode: 'onChange',
  });

  const careerDetailsForm = useForm<
    Pick<ProfileFormValues, 'jobPreference' | 'skills'>
  >({
    resolver: zodResolver(
      profileFormSchema.pick({ jobPreference: true, skills: true }),
    ),
    mode: 'onChange',
  });

  const narrativesForm = useForm<
    Pick<
      ProfileFormValues,
      'narrativeChallenges' | 'narrativeAchievements' | 'narrativeAppreciation'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        narrativeChallenges: true,
        narrativeAchievements: true,
        narrativeAppreciation: true,
      }),
    ),
    mode: 'onChange',
  });

  const jobSearchForm = useForm<
    Pick<
      ProfileFormValues,
      | 'preferredCountry'
      | 'preferredLanguage'
      | 'preferredDatePosted'
      | 'prefersWorkFromHome'
      | 'preferredEmploymentTypes'
      | 'preferredJobRequirements'
      | 'preferredSearchRadius'
      | 'excludedJobPublishers'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        preferredCountry: true,
        preferredLanguage: true,
        preferredDatePosted: true,
        prefersWorkFromHome: true,
        preferredEmploymentTypes: true,
        preferredJobRequirements: true,
        preferredSearchRadius: true,
        excludedJobPublishers: true,
      }),
    ),
    mode: 'onChange',
  });

  useEffect(() => {
    const sd = getStudentData();
    if (!sd) return;

    personalInfoForm.reset({
      fullName: sd.fullName || '',
      email: sd.email || '',
      phone: sd.phone || '',
      avatar: sd.avatar || '',
      jobPreference: sd.jobRole || '',
    });

    careerDetailsForm.reset({
      jobPreference: sd.jobRole || '',
    });

    narrativesForm.reset({
      narrativeChallenges: mockUserProfile.narratives.challenges,
      narrativeAchievements: mockUserProfile.narratives.achievements,
      narrativeAppreciation: mockUserProfile.narratives.appreciation,
    });

    jobSearchForm.reset({
      preferredCountry: mockUserProfile.preferredCountry || 'US',
      preferredLanguage: mockUserProfile.preferredLanguage || 'en',
      preferredDatePosted: mockUserProfile.preferredDatePosted || 'all',
      prefersWorkFromHome: mockUserProfile.prefersWorkFromHome || false,
      preferredEmploymentTypes: mockUserProfile.preferredEmploymentTypes || [],
      preferredJobRequirements: mockUserProfile.preferredJobRequirements || [],
      preferredSearchRadius:
        mockUserProfile.preferredSearchRadius === undefined
          ? undefined
          : mockUserProfile.preferredSearchRadius,
      excludedJobPublishers: mockUserProfile.excludedJobPublishers || '',
    });
  }, [students]);

  const defaultValues: any = {
    fullName: studentData?.fullName || '',
    email: studentData?.email || '',
    phone: studentData?.phone || '',
    jobPreference: studentData?.jobRole || '',
    education: (studentData?.education || []).map((edu: any) => ({
      institution: edu.institute || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || '',
      country: edu.country || '',
      gpa: edu.grade || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      _id: edu._id || '',
      educationId: edu.educationId || '',
    })),
    experience: studentData?.experience || [],
    projects: (studentData?.projects || []).map((proj: any) => ({
      name: proj.projectName || '',
      description: proj.description || '',
      technologies: proj.technologies || '',
      link: proj.link || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      isCurrent: proj.isCurrent || false,
      _id: proj._id || '',
    })),
    skills: studentData?.skills || [],
    narrativeChallenges: mockUserProfile.narratives.challenges,
    narrativeAchievements: mockUserProfile.narratives.achievements,
    narrativeAppreciation: mockUserProfile.narratives.appreciation,
    preferredCountry: mockUserProfile.preferredCountry || 'US',
    preferredLanguage: mockUserProfile.preferredLanguage || 'en',
    preferredDatePosted: mockUserProfile.preferredDatePosted || 'all',
    prefersWorkFromHome: mockUserProfile.prefersWorkFromHome || false,
    preferredEmploymentTypes: mockUserProfile.preferredEmploymentTypes || [],
    preferredJobRequirements: mockUserProfile.preferredJobRequirements || [],
    preferredSearchRadius:
      mockUserProfile.preferredSearchRadius === undefined
        ? undefined
        : mockUserProfile.preferredSearchRadius,
    excludedJobPublishers: mockUserProfile.excludedJobPublishers || '',
  };

  const handleDeleteSkills = (index: string) => {
    if (index) {
      dispatch(removeStudentSkillRequest(index));
    } else {
      console.error('Skill ID not found for deletion');
    }
    setDeleteSkill(false);
  };

  const handleDeleteExp = (index: string) => {
    if (index) {
      dispatch(removeStudentExperienceRequest(index));
    } else {
      console.error('Experience ID not found for deletion');
    }
    setDeleteExp(false);
  };

  const handleDeleteProject = (index: string) => {
    if (index) {
      dispatch(removeStudentProjectRequest(index));
    } else {
      console.error('Project ID not found for deletion');
    }
    setDeleteProj(false);
  };

  const deleteEducation = (index: string) => {
    if (index) {
      dispatch(removeStudentEducationRequest(index));
    } else {
      console.error('Education ID not found for deletion');
    }
    setDeleteEdu(false);
  };

  const handlePersonalInfoSubmit = (
    data: Pick<ProfileFormValues, 'fullName' | 'email'>,
  ) => {
    toast({
      title: 'Personal Information Updated',
      description: 'Your personal information has been saved successfully.',
    });
  };

  const handleCareerDetailsSubmit = (
    data: Pick<ProfileFormValues, 'jobPreference' | 'skills'>,
  ) => {
    toast({
      title: 'Career Details Updated',
      description: 'Your career details have been saved successfully.',
    });
  };

  const handleNarrativesSubmit = (
    data: Pick<
      ProfileFormValues,
      'narrativeChallenges' | 'narrativeAchievements' | 'narrativeAppreciation'
    >,
  ) => {
    toast({
      title: 'Narratives Updated',
      description: 'Your narratives have been saved successfully.',
    });
  };

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  const onCancel = () => setAddEdu(false);

  const handleLevelChange = (index: string, level: string) => {
    console.log('handleLevelChange', index, level);
    if (index) {
      dispatch(
        updateStudentSkillRequest({ skillId: index, skillData: { level } }),
      );
    } else {
      console.error('Skill ID not found for update');
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleEdit = (index: number) => {
    setEditProjIndex(index);
  };

  const toggleNameEdit = () => setIsNameEditable((prev) => !prev);
  const toggleEmailEdit = () => setIsEmailEditable((prev) => !prev);
  const togglePhoneEdit = () => setIsPhoneEditable((prev) => !prev);

  const handleCancelEdit = (field: 'fullName' | 'email' | 'phone' | 'all') => {
    personalInfoForm.reset();
    if (field === 'fullName') setIsNameEditable(false);
    if (field === 'email') setIsEmailEditable(false);
    if (field === 'phone') setIsPhoneEditable(false);
    if (field === 'all') {
      setIsNameEditable(false);
      setIsEmailEditable(false);
      setIsPhoneEditable(false);
    }
  };

  const handlePersonalInfoEdit = async (
    field: 'fullName' | 'email' | 'phone' | 'jobPreference',
  ) => {
    try {
      if (field === 'fullName') {
        const fullName = personalInfoForm.getValues('fullName');
        await apiInstance.patch('/students/fullname/update', { fullName });
        setIsNameEditable(false);
        dispatch(getStudentDetailsRequest());
        toast({ title: 'Full Name Updated' });
      } else if (field === 'email') {
        const email = personalInfoForm.getValues('email');
        await apiInstance.patch('/students/email/update', { email });
        setIsEmailEditable(false);
        dispatch(getStudentDetailsRequest());
        toast({ title: 'Email Updated' });
      } else if (field === 'phone') {
        const phone = personalInfoForm.getValues('phone');
        await apiInstance.patch('/students/phone/update', { phone });
        setIsPhoneEditable(false);
        dispatch(getStudentDetailsRequest());
        toast({ title: 'Phone Number Updated' });
      } else if (field === 'jobPreference') {
        const jobPreference = personalInfoForm.getValues('jobPreference');
        await apiInstance.post('/students/job-role/update', {
          jobRole: jobPreference,
        });
        setIsJobPrefEditable(false);
        dispatch(updateStudentJobPreferenceRequest({ jobRole: jobPreference }));
        toast({ title: 'Job Preference Updated' });
      }
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
      toast({ title: `Error updating ${field}`, variant: 'destructive' });
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      await apiInstance.post('/students/upload-resume', formData);

      dispatch(getStudentDetailsRequest());
      toast({
        title: 'Resume Uploaded Successfully',
        description: 'Your resume has been updated.',
      });
      handleRemoveFile();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) handleFileChange(files[0]);
    },
    [handleFileChange],
  );

  return {
    isNameEditable,
    isEmailEditable,
    isPhoneEditable,
    isJobPrefEditable,
    setIsJobPrefEditable,
    addEdu,
    addExp,
    addProj,
    addSkill,
    editProjIndex,
    expandedIndex,
    deleteEdu,
    deleteExp,
    deleteProj,
    deleteSkill,
    deleteEduIndex,
    deleteExpIndex,
    deleteProjIndex,
    deleteSkillIndex,
    editEdu,
    editExp,
    editProj,
    editSkill,
    editEduIndex,
    editExpIndex,
    editSkillIndex,
    setEditEdu,
    setEditExp,
    setEditProj,
    setEditSkill,
    setDeleteEdu,
    setDeleteExp,
    setDeleteProj,
    setDeleteSkill,
    setAddEdu,
    setAddExp,
    setAddProj,
    setAddSkill,
    setExpandedIndex,
    setDeleteEduIndex,
    setDeleteExpIndex,
    setDeleteProjIndex,
    setDeleteSkillIndex,
    setEditEduIndex,
    setEditExpIndex,
    setEditProjIndex,
    setEditSkillIndex,
    handleDeleteSkills,
    handleDeleteExp,
    handleDeleteProject,
    file,
    setFile,
    isDragging,
    setIsDragging,
    fileInputRef,
    isUploading,
    setIsUploading,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleDragEnter,
    handleButtonClick,
    handleRemoveFile,
    handleUpload,
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,
    jobSearchForm,
    handlePersonalInfoSubmit,
    handleCareerDetailsSubmit,
    handleNarrativesSubmit,
    onCancel,
    deleteEducation,
    handleLevelChange,
    toggleExpand,
    handleEdit,
    toggleNameEdit,
    toggleEmailEdit,
    togglePhoneEdit,
    handlePersonalInfoEdit,
    handleCancelEdit,
    defaultValues,
  };
};
