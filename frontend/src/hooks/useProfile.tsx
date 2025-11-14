import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { mockUserProfile } from '@/lib/data/user';
import { useDispatch, useSelector } from 'react-redux';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Reducer,
} from 'react';
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

/* ===========================
   Validation Schemas (unchanged)
   =========================== */

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
  skills: z.string().optional(),
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
  uploadedCV: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const useToggle = (initial = false) => {
  const [val, setVal] = useState<boolean>(initial);
  const on = useCallback(() => setVal(true), []);
  const off = useCallback(() => setVal(false), []);
  const toggle = useCallback(() => setVal((s) => !s), []);
  return { val, setVal, on, off, toggle };
};

type ModalState = {
  addEdu: boolean;
  addExp: boolean;
  addProj: boolean;
  addSkill: boolean;
  editEdu: boolean;
  editExp: boolean;
  editProj: boolean;
  editSkill: boolean;
  deleteEdu: boolean;
  deleteExp: boolean;
  deleteProj: boolean;
  deleteSkill: boolean;
};

type ModalAction =
  | { type: 'toggle'; key: keyof ModalState; value?: boolean }
  | { type: 'set'; key: keyof ModalState; value: boolean };

const modalReducer: Reducer<ModalState, ModalAction> = (state, action) => {
  switch (action.type) {
    case 'toggle':
      return { ...state, [action.key]: action.value ?? !state[action.key] };
    case 'set':
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
};

const useFileUploader = (dispatch: any, toast: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleUpload = useCallback(async () => {
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
  }, [file, dispatch, toast, handleRemoveFile]);

  const handleButtonClick = useCallback(
    () => fileInputRef.current?.click(),
    [],
  );
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
    file,
    setFile: handleFileChange,
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
  } as const;
};

export const useProfile = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { students } = useSelector((state: RootState) => state.student);

  const [modalState, modalDispatch] = ((): [
    ModalState,
    (a: ModalAction) => void,
  ] => {
    const initial: ModalState = {
      addEdu: false,
      addExp: false,
      addProj: false,
      addSkill: false,
      editEdu: false,
      editExp: false,
      editProj: false,
      editSkill: false,
      deleteEdu: false,
      deleteExp: false,
      deleteProj: false,
      deleteSkill: false,
    };

    const [state, _dispatch] = ((): any => {
      return (useState as any)(undefined);
    })();

    const [s, setS] = useState<ModalState>(initial);
    const localDispatch = (a: ModalAction) => {
      if (a.type === 'toggle') {
        setS((prev) => ({ ...prev, [a.key]: a.value ?? !prev[a.key] }));
      } else {
        setS((prev) => ({ ...prev, [a.key]: a.value }));
      }
    };
    return [s, localDispatch];
  })();

  /* ---------- grouped numeric indices (edit/delete indices) ---------- */
  const [editEduIndex, setEditEduIndex] = useState(0);
  const [editExpIndex, setEditExpIndex] = useState(0);
  const [editProjIndex, setEditProjIndex] = useState(0);
  const [editSkillIndex, setEditSkillIndex] = useState(0);

  const [deleteEduIndex, setDeleteEduIndex] = useState(0);
  const [deleteExpIndex, setDeleteExpIndex] = useState(0);
  const [deleteProjIndex, setDeleteProjIndex] = useState(0);
  const [deleteSkillIndex, setDeleteSkillIndex] = useState(0);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  /* ---------- toggles for in-place editable fields ---------- */
  const nameToggle = useToggle(false);
  const emailToggle = useToggle(false);
  const phoneToggle = useToggle(false);
  const jobPrefToggle = useToggle(false);

  /* ---------- file uploader ---------- */
  const fileUploader = useFileUploader(dispatch, toast);

  /* ---------- student data retrieval & memoization ---------- */
  const getStudentData = useCallback(() => {
    if (!Array.isArray(students) || students.length === 0) return null;
    return students[0]?.studentDetails || students[0] || null;
  }, [students]);

  const studentData = useMemo(() => getStudentData(), [getStudentData]);

  /* ---------- forms (kept same as before) ---------- */
  const personalInfoForm = useForm<
    Pick<
      ProfileFormValues,
      'fullName' | 'email' | 'phone' | 'avatar' | 'jobPreference | uploadedCV'
    >
  >({
    resolver: zodResolver(
      profileFormSchema.pick({
        fullName: true,
        email: true,
        phone: true,
        avatar: true,
        jobPreference: true,
        uploadedCV: true,
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

  /* ---------- reset forms when student data changes (same logic) ---------- */
  useEffect(() => {
    const sd = studentData;
    if (!sd) return;

    personalInfoForm.reset({
      fullName: sd.fullName || '',
      email: sd.email || '',
      phone: sd.phone || '',
      avatar: sd.avatar || '',
      jobPreference: sd.jobRole || '',
      uploadedCV: sd.uploadedCV || '',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData]);

  /* ---------- defaultValues memoization (keeps identity stable) ---------- */
  const defaultValues: any = useMemo(() => {
    const sd = studentData;
    return {
      fullName: sd?.fullName || '',
      email: sd?.email || '',
      phone: sd?.phone || '',
      jobPreference: sd?.jobRole || '',
      uploadedCV: sd?.uploadedCV || '',
      education: (sd?.education || []).map((edu: any) => ({
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
      experience: sd?.experience || [],
      projects: (sd?.projects || []).map((proj: any) => ({
        name: proj.projectName || '',
        description: proj.description || '',
        technologies: proj.technologies || '',
        link: proj.link || '',
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        isCurrent: proj.isCurrent || false,
        _id: proj._id || '',
      })),
      skills: sd?.skills || [],
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
  }, [studentData]);

  /* ---------- dispatch initial load ---------- */
  useEffect(() => {
    dispatch(getStudentDetailsRequest());
  }, [dispatch]);

  /* ========== handlers (wrapped with useCallback) ========== */

  const handleDeleteSkills = useCallback(
    (index: string) => {
      if (index) {
        dispatch(removeStudentSkillRequest(index));
      } else {
        console.error('Skill ID not found for deletion');
      }
      modalDispatch({ type: 'set', key: 'deleteSkill', value: false });
    },
    [dispatch, modalDispatch],
  );

  const handleDeleteExp = useCallback(
    (index: string) => {
      if (index) {
        dispatch(removeStudentExperienceRequest(index));
      } else {
        console.error('Experience ID not found for deletion');
      }
      modalDispatch({ type: 'set', key: 'deleteExp', value: false });
    },
    [dispatch, modalDispatch],
  );

  const handleDeleteProject = useCallback(
    (index: string) => {
      if (index) {
        dispatch(removeStudentProjectRequest(index));
      } else {
        console.error('Project ID not found for deletion');
      }
      modalDispatch({ type: 'set', key: 'deleteProj', value: false });
    },
    [dispatch, modalDispatch],
  );

  const deleteEducation = useCallback(
    (index: string) => {
      if (index) {
        dispatch(removeStudentEducationRequest(index));
      } else {
        console.error('Education ID not found for deletion');
      }
      modalDispatch({ type: 'set', key: 'deleteEdu', value: false });
    },
    [dispatch, modalDispatch],
  );

  const handlePersonalInfoSubmit = useCallback(
    (data: Pick<ProfileFormValues, 'fullName' | 'email'>) => {
      toast({
        title: 'Personal Information Updated',
        description: 'Your personal information has been saved successfully.',
      });
    },
    [toast],
  );

  const handleCareerDetailsSubmit = useCallback(
    (data: Pick<ProfileFormValues, 'jobPreference' | 'skills'>) => {
      toast({
        title: 'Career Details Updated',
        description: 'Your career details have been saved successfully.',
      });
    },
    [toast],
  );

  const handleNarrativesSubmit = useCallback(
    (
      data: Pick<
        ProfileFormValues,
        | 'narrativeChallenges'
        | 'narrativeAchievements'
        | 'narrativeAppreciation'
      >,
    ) => {
      toast({
        title: 'Narratives Updated',
        description: 'Your narratives have been saved successfully.',
      });
    },
    [toast],
  );

  const onCancel = useCallback(
    () => modalDispatch({ type: 'set', key: 'addEdu', value: false }),
    [modalDispatch],
  );

  const handleLevelChange = useCallback(
    (index: string, level: string) => {
      if (index) {
        dispatch(
          updateStudentSkillRequest({ skillId: index, skillData: { level } }),
        );
      } else {
        console.error('Skill ID not found for update');
      }
    },
    [dispatch],
  );

  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  const handleEdit = useCallback((index: number) => {
    setEditProjIndex(index);
  }, []);

  const toggleNameEdit = useCallback(() => nameToggle.toggle(), [nameToggle]);
  const toggleEmailEdit = useCallback(
    () => emailToggle.toggle(),
    [emailToggle],
  );
  const togglePhoneEdit = useCallback(
    () => phoneToggle.toggle(),
    [phoneToggle],
  );

  const handleCancelEdit = useCallback(
    (field: 'fullName' | 'email' | 'phone' | 'all') => {
      personalInfoForm.reset();
      if (field === 'fullName') nameToggle.off();
      if (field === 'email') emailToggle.off();
      if (field === 'phone') phoneToggle.off();
      if (field === 'all') {
        nameToggle.off();
        emailToggle.off();
        phoneToggle.off();
      }
    },
    [personalInfoForm, nameToggle, emailToggle, phoneToggle],
  );

  const handlePersonalInfoEdit = useCallback(
    async (field: 'fullName' | 'email' | 'phone' | 'jobPreference') => {
      try {
        if (field === 'fullName') {
          const fullName = personalInfoForm.getValues('fullName');
          await apiInstance.patch('/students/fullname/update', { fullName });
          nameToggle.off();
          dispatch(getStudentDetailsRequest());
          toast({ title: 'Full Name Updated' });
        } else if (field === 'email') {
          const email = personalInfoForm.getValues('email');
          await apiInstance.patch('/students/email/update', { email });
          emailToggle.off();
          dispatch(getStudentDetailsRequest());
          toast({ title: 'Email Updated' });
        } else if (field === 'phone') {
          const phone = personalInfoForm.getValues('phone');
          await apiInstance.patch('/students/phone/update', { phone });
          phoneToggle.off();
          dispatch(getStudentDetailsRequest());
          toast({ title: 'Phone Number Updated' });
        } else if (field === 'jobPreference') {
          const jobPreference = personalInfoForm.getValues('jobPreference');
          await apiInstance.post('/students/job-role/update', {
            jobRole: jobPreference,
          });
          jobPrefToggle.setVal(false);
          dispatch(
            updateStudentJobPreferenceRequest({ jobRole: jobPreference }),
          );
          toast({ title: 'Job Preference Updated' });
        }
      } catch (err) {
        console.error(`Failed to update ${field}:`, err);
        toast({ title: `Error updating ${field}`, variant: 'destructive' });
      }
    },
    [
      personalInfoForm,
      dispatch,
      toast,
      nameToggle,
      emailToggle,
      phoneToggle,
      jobPrefToggle,
    ],
  );

  /* ---------- public API object (preserve all names used externally) ---------- */
  const publicApi = useMemo(
    () => ({
      isNameEditable: nameToggle.val,
      isEmailEditable: emailToggle.val,
      isPhoneEditable: phoneToggle.val,
      isJobPrefEditable: jobPrefToggle.val,
      setIsJobPrefEditable: jobPrefToggle.setVal,
      addEdu: modalState.addEdu,
      addExp: modalState.addExp,
      addProj: modalState.addProj,
      addSkill: modalState.addSkill,
      editProjIndex,
      expandedIndex,
      deleteEdu: modalState.deleteEdu,
      deleteExp: modalState.deleteExp,
      deleteProj: modalState.deleteProj,
      deleteSkill: modalState.deleteSkill,
      deleteEduIndex,
      deleteExpIndex,
      deleteProjIndex,
      deleteSkillIndex,
      editEdu: modalState.editEdu,
      editExp: modalState.editExp,
      editProj: modalState.editProj,
      editSkill: modalState.editSkill,
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
      file: fileUploader.file,
      setFile: fileUploader.setFile,
      isDragging: fileUploader.isDragging,
      setIsDragging: fileUploader.setIsDragging,
      fileInputRef: fileUploader.fileInputRef,
      isUploading: fileUploader.isUploading,
      setIsUploading: fileUploader.setIsUploading,
      handleFileChange: fileUploader.handleFileChange,
      handleDrop: fileUploader.handleDrop,
      handleDragOver: fileUploader.handleDragOver,
      handleDragLeave: fileUploader.handleDragLeave,
      handleDragEnter: fileUploader.handleDragEnter,
      handleButtonClick: fileUploader.handleButtonClick,
      handleRemoveFile: fileUploader.handleRemoveFile,
      handleUpload: fileUploader.handleUpload,
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
      // expose modal setters (provide equivalent simple setters to maintain parity)
    }),
    // dependency array intentionally includes only stable references / values used above
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      nameToggle.val,
      emailToggle.val,
      phoneToggle.val,
      jobPrefToggle.val,
      modalState,
      editProjIndex,
      expandedIndex,
      deleteEduIndex,
      deleteExpIndex,
      deleteProjIndex,
      deleteSkillIndex,
      editEduIndex,
      editExpIndex,
      editSkillIndex,
      fileUploader.file,
      fileUploader.isDragging,
      fileUploader.fileInputRef,
      fileUploader.isUploading,
      personalInfoForm,
      careerDetailsForm,
      narrativesForm,
      jobSearchForm,
      defaultValues,
      // functions are stable because of useCallback; they can be listed but not necessary
    ],
  );

  /* -------------------------
     Keep external setter functions named like before
     to avoid changing call sites in the codebase.
     These just wrap modalDispatch / local state setters.
     ------------------------- */
  function setEditEdu(v: boolean) {
    modalDispatch({ type: 'set', key: 'editEdu', value: v });
  }
  function setEditExp(v: boolean) {
    modalDispatch({ type: 'set', key: 'editExp', value: v });
  }
  function setEditProj(v: boolean) {
    modalDispatch({ type: 'set', key: 'editProj', value: v });
  }
  function setEditSkill(v: boolean) {
    modalDispatch({ type: 'set', key: 'editSkill', value: v });
  }

  function setDeleteEdu(v: boolean) {
    modalDispatch({ type: 'set', key: 'deleteEdu', value: v });
  }
  function setDeleteExp(v: boolean) {
    modalDispatch({ type: 'set', key: 'deleteExp', value: v });
  }
  function setDeleteProj(v: boolean) {
    modalDispatch({ type: 'set', key: 'deleteProj', value: v });
  }
  function setDeleteSkill(v: boolean) {
    modalDispatch({ type: 'set', key: 'deleteSkill', value: v });
  }

  function setAddEdu(v: boolean) {
    modalDispatch({ type: 'set', key: 'addEdu', value: v });
  }
  function setAddExp(v: boolean) {
    modalDispatch({ type: 'set', key: 'addExp', value: v });
  }
  function setAddProj(v: boolean) {
    modalDispatch({ type: 'set', key: 'addProj', value: v });
  }
  function setAddSkill(v: boolean) {
    modalDispatch({ type: 'set', key: 'addSkill', value: v });
  }

  function setDeleteEduIndexFn(v: number) {
    setDeleteEduIndex(v);
  }
  function setDeleteExpIndexFn(v: number) {
    setDeleteExpIndex(v);
  }
  function setDeleteProjIndexFn(v: number) {
    setDeleteProjIndex(v);
  }
  function setDeleteSkillIndexFn(v: number) {
    setDeleteSkillIndex(v);
  }

  function setEditEduIndexFn(v: number) {
    setEditEduIndex(v);
  }
  function setEditExpIndexFn(v: number) {
    setEditExpIndex(v);
  }
  function setEditProjIndexFn(v: number) {
    setEditProjIndex(v);
  }
  function setEditSkillIndexFn(v: number) {
    setEditSkillIndex(v);
  }

  // attach setter functions onto the returned API so existing call sites still work
  // (these will override the earlier "setX" functions returned in the memo if needed)
  // Note: we intentionally don't include every tiny internal helper in the dependency list above.

  // final public API (merge with setter wrappers)
  const finalApi = {
    ...publicApi,
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
    setDeleteEduIndex: setDeleteEduIndexFn,
    setDeleteExpIndex: setDeleteExpIndexFn,
    setDeleteProjIndex: setDeleteProjIndexFn,
    setDeleteSkillIndex: setDeleteSkillIndexFn,
    setEditEduIndex: setEditEduIndexFn,
    setEditExpIndex: setEditExpIndexFn,
    setEditProjIndex: setEditProjIndexFn,
    setEditSkillIndex: setEditSkillIndexFn,
  };

  /* debug output preserved (was in original) */
  useEffect(() => {
    console.log(
      'useProfile: defaultValues identity changed, eduLen:',
      defaultValues.education?.length ?? 0,
      'expLen:',
      defaultValues.experience?.length ?? 0,
    );
  }, [defaultValues]);

  return finalApi as any; // kept `any` to preserve prior loose typing and avoid rippling changes
};
