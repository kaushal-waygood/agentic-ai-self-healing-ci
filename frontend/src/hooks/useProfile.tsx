import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';
import { mockUserProfile } from '@/lib/data/user';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import {
  getStudentDetailsRequest,
  getStudentResumeRequest,
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
import { AxiosResponse } from 'axios';

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
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past jobs.',
      path: ['endDate'],
    },
  );

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
  .refine(
    (data) => data.isCurrent || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required for past projects.',
      path: ['endDate'],
    },
  );

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  email: z.string().email(),
  phone: z.string().optional(),
  jobPreference: z.string().min(2, {
    message: 'Job preference must be at least 2 characters.',
  }),

  // Rich profile data
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  projects: z.array(projectEntrySchema).optional(),
  skills: z.string().optional(),

  // Narratives
  narrativeChallenges: z.string().optional(),
  narrativeAchievements: z.string().optional(),
  narrativeAppreciation: z.string().optional(),

  // Job Search Preferences
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
      val === '' ||
      val === null ||
      val === undefined ||
      Number.isNaN(Number(val))
        ? undefined
        : Number(val),
    z.number().min(0, 'Radius must be positive').optional(),
  ),
  excludedJobPublishers: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export interface ProfileFormProps {
  isOnboarding?: boolean;
}

export const useProfile = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { students, loading, error } = useSelector(
    (state: RootState) => state.student,
  );

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

  const [expandedIndex, setExpandedIndex] = useState(null);

  const [deleteEduIndex, setDeleteEduIndex] = useState(0);
  const [deleteExpIndex, setDeleteExpIndex] = useState(0);
  const [deleteProjIndex, setDeleteProjIndex] = useState(0);
  const [deleteSkillIndex, setDeleteSkillIndex] = useState(0);

  const [isNameEditable, setIsNameEditable] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(false);
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [isJobPrefEditable, setIsJobPrefEditable] = useState(false);
  const [handleName, setHandleName] = useState('');
  const [handleEmail, setHandleEmail] = useState('');
  const [handlePhone, setHandlePhone] = useState('');
  const [handleJobPreference, setHandleJobPreference] = useState('');

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const personalInfoForm = useForm<
    Pick<ProfileFormValues, 'fullName' | 'email' | 'phone'>
  >({
    resolver: zodResolver(
      profileFormSchema.pick({ fullName: true, email: true }),
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
    if (students && Object.keys(students).length > 0) {
      personalInfoForm.reset({
        fullName: students.fullName || '',
        email: students.email || '',
        phone: students.phone || '',
      });
      careerDetailsForm.reset({
        jobPreference: students.jobRole || '',
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
        preferredEmploymentTypes:
          mockUserProfile.preferredEmploymentTypes || [],
        preferredJobRequirements:
          mockUserProfile.preferredJobRequirements || [],
        preferredSearchRadius:
          mockUserProfile.preferredSearchRadius === undefined
            ? undefined
            : mockUserProfile.preferredSearchRadius,
        excludedJobPublishers: mockUserProfile.excludedJobPublishers || '',
      });
    }
  }, [students]);

  const defaultValues: ProfileFormValues = {
    fullName: students.fullName,
    email: students.email,
    phone: students.phone,
    jobPreference: students.jobRole,
    education: (students.education || []).map((edu) => ({
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
    experience: students.experience,
    projects: (students.projects || []).map((proj) => ({
      name: proj.projectName || '',
      description: proj.description || '',
      technologies: proj.technologies || '',
      link: proj.link || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      isCurrent: proj.isCurrent || false,
      _id: proj._id || '',
    })),
    skills: students.skills || [],
    // Narratives
    narrativeChallenges: mockUserProfile.narratives.challenges,
    narrativeAchievements: mockUserProfile.narratives.achievements,
    narrativeAppreciation: mockUserProfile.narratives.appreciation,
    // Job Search Preferences
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

  const handleDeleteSkills = (index: number) => {
    dispatch(removeStudentSkillRequest(index));
    setDeleteSkill(false);
  };

  const handleDeleteExp = (index: number) => {
    dispatch(removeStudentExperienceRequest(index));
    setDeleteExp(false);
  };

  const handleDeleteProject = (index) => {
    dispatch(removeStudentProjectRequest(index));
    setDeleteProj(false);
  };

  const deleteEducation = (index: number) => {
    dispatch(removeStudentEducationRequest(index));
    setDeleteEdu(false);
  };

  // The rest of the handlers remain the same as they correctly use the dispatch function.
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
    const fetchStudentDetails = async () => {
      try {
        dispatch(getStudentDetailsRequest());
      } catch (error) {
        console.error('Error fetching student details:', error);
      }
    };

    fetchStudentDetails();
  }, [dispatch]);

  const onCancel = () => {
    setAddEdu(false);
  };

  const handleLevelChange = (index: number, level: string) => {
    dispatch(updateStudentSkillRequest({ index, level }));
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleEdit = (index) => {
    setEditProjIndex(index);
  };

  const toggleNameEdit = () => {
    setIsNameEditable((prev) => !prev);
    setIsEmailEditable(false);
  };
  const toggleEmailEdit = () => setIsEmailEditable((prev) => !prev);

  const handlePersonalInfoEdit = async (handle: string) => {
    if (handle === 'fullName') {
      const response: AxiosResponse = await apiInstance.patch(
        '/students/fullname/update',
        {
          fullName: handleName,
        },
      );

      setIsNameEditable(false);
      setHandleName('');
      toast({
        title: 'Personal Information Updated',
        description: 'Your personal information has been saved successfully.',
      });
    } else if (handle === 'email') {
      const response: AxiosResponse = await apiInstance.patch(
        '/students/email/update',
        {
          email: handleEmail,
        },
      );

      setIsEmailEditable(false);
      setHandleEmail('');
    } else if (handle === 'jobPreference') {
      dispatch(updateStudentJobPreferenceRequest(handleJobPreference));
      setIsJobPrefEditable((prev) => !prev);
    } else if (handle === 'phone') {
      const response: AxiosResponse = await apiInstance.patch(
        '/students/email/update',
        {
          email: handleEmail,
        },
      );

      setIsPhoneEditable(false);
      setHandlePhone('');
    }
  };

  const handleFileChange = async (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      dispatch(getStudentResumeRequest(formData));
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, []);

  return {
    //state
    isNameEditable,
    isEmailEditable,
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
    handleName,
    setHandleName,
    handleEmail,
    setHandleEmail,
    handleJobPreference,
    setHandleJobPreference,
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

    //form
    personalInfoForm,
    careerDetailsForm,
    narrativesForm,
    jobSearchForm,

    //handlers
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
    handlePersonalInfoEdit,

    defaultValues,

    //functions
  };
};
