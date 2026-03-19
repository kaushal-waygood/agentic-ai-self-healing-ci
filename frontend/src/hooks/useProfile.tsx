'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import {
  getStudentDetailsRequest,
  getStudentSkllsRequest,
  removeStudentSkillRequest,
  updateStudentSkillRequest,
  getStudentEducationRequest,
  removeStudentEducationRequest,
  getStudentExperienceRequest,
  removeStudentExperienceRequest,
  getAllProjectsRequest,
  addStudentProjectRequest,
  updateStudentProjectRequest,
  removeStudentProjectRequest,
  addStudentExperienceRequest,
  updateStudentExperienceRequest,
  addStudentEducationRequest,
  updateStudentEducationRequest,
  addStudentSkillRequest,
} from '@/redux/reducers/studentReducer';

const dummyAvatar =
  'https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-701751694975293fcgzulxp2k.png';

export type ProfileState = {
  fullName: string;
  email: string;
  phone: string;
  jobRole: string;
  location: string;
  avatar: string;
  uploadedCV?: string;
};

export type JobPreferences = {
  preferredCountries: string[];
  preferredCities: string[];
  isRemote: boolean;
  relocationWillingness: boolean;
  preferredJobTitles: string[];
  preferredJobTypes: string[];
  preferredIndustries: string[];
  preferredExperienceLevel: string | null;
  preferredSalary: {
    min: number | null;
    max: number | null;
    currency: string;
    period: string;
  };
  preferredCertifications: string[];
  preferredEducationLevel: string | null;
  preferredCompanySizes: string[];
  preferredCompanyCultures: string[];
  visaSponsorshipRequired: boolean;
  immediateAvailability: boolean;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
};

export const useProfile = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const studentWrapper = useSelector(
    (state: RootState) => state.student.students?.[0],
  );
  const authUser = useSelector((state: RootState) => state.auth.user);

  const studentData = studentWrapper?.student;

  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    email: '',
    phone: '',
    jobRole: '',
    location: '',
    avatar: '',
    uploadedCV: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(dummyAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -----------------------------
     Sync Profile
  ------------------------------ */

  useEffect(() => {
    // if (!studentData) return;
    if (!studentData && !authUser) return;
    const resolvedEmail = authUser?.email ?? studentData?.email ?? '';
    setProfile({
      fullName: studentData?.fullName ?? '',
      // email: studentData.email ?? '',
      email: resolvedEmail,
      phone: studentData?.phone ?? '',
      jobRole: studentData?.jobRole ?? '',
      location: studentData?.location ?? '',
      avatar: studentData?.profileImage ?? '',
      uploadedCV: studentData?.resumeUrl ?? '',
    });

    setPreview(studentData?.profileImage || dummyAvatar);
    // }, [studentData]);
  }, [studentData, authUser]);

  /* -----------------------------
     Input handlers
  ------------------------------ */
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }, []);

  const onAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const img = e.target.files?.[0];
      if (!img) return;

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(img);
    },
    [],
  );

  /* -----------------------------
     File helpers
  ------------------------------ */
  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /* -----------------------------
     Upload CV with progress
  ------------------------------ */
  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('cv', file);

    let rampTimer: ReturnType<typeof setInterval> | null = null;

    rampTimer = setInterval(() => {
      setProgress((prev) => (prev < 95 ? Math.min(95, prev + 5) : prev));
    }, 800);

    try {
      await apiInstance.post('/students/resume/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            if (percent < 95) setProgress(percent);
          }
        },
      });

      dispatch(getStudentDetailsRequest());
      toast({ title: 'Resume processed successfully' });

      setProgress(100);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      if (rampTimer) clearInterval(rampTimer);
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  }, [file, dispatch, toast]);

  /* -----------------------------
    Update profile
------------------------------ */
  // Add 'data?: ProfileState' as an optional parameter
  const updateProfile = useCallback(
    async (data?: ProfileState) => {
      try {
        const formData = new FormData();

        // Use the passed data if available, otherwise fallback to current state
        const payload = data || profile;

        formData.append('fullName', payload.fullName);
        formData.append('phone', payload.phone);
        formData.append('jobRole', payload.jobRole);
        formData.append('location', payload.location);

        if (profileImageFile) {
          formData.append('profileImage', profileImageFile);
        }

        await apiInstance.patch('/students/profile/update', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        dispatch(getStudentDetailsRequest());
        toast({ title: 'Profile updated' });

        // cleanup
        setProfileImageFile(null);
      } catch (error) {
        toast({
          title: 'Profile update failed',
          variant: 'destructive',
          description: `${error?.response.data.error.message}`,
        });
      }
    },
    [profile, profileImageFile, dispatch],
  );
  return {
    profile,
    setProfile,
    preview,
    onChange,
    onAvatarChange,
    updateProfile,

    file,
    setFile,
    progress,
    isUploading,
    isDragging,
    setIsDragging,

    handleUpload,
    handleRemoveFile,
    handleButtonClick,

    setProfileImageFile,
    fileInputRef,
  };
};

export const useExperience = () => {
  const dispatch = useDispatch();
  const experiences = useSelector(
    (s: RootState) => s.student.experiences?.experiences || [],
  );
  const loading = useSelector((s: RootState) => s.student.loading);

  useEffect(() => {
    dispatch(getStudentExperienceRequest());
  }, [dispatch]);

  const createExperience = useCallback(
    (data: any) => {
      dispatch(addStudentExperienceRequest(data));
      dispatch(getStudentExperienceRequest());
    },
    [dispatch],
  );

  const updateExperience = useCallback(
    (id: string, data: any) =>
      dispatch(updateStudentExperienceRequest({ id, data })),
    [dispatch],
  );

  const deleteExperience = useCallback(
    (id: string) => dispatch(removeStudentExperienceRequest(id)),
    [dispatch],
  );

  return {
    experiences,
    loading,
    createExperience,
    updateExperience,
    deleteExperience,
  };
};

export const useEducation = () => {
  const dispatch = useDispatch();
  const educations = useSelector(
    (s: RootState) => s.student.educations?.educations || [],
  );

  useEffect(() => {
    dispatch(getStudentEducationRequest());
  }, [dispatch]);

  const loading = useSelector((s: RootState) => s.student.loading);

  const createEducation = useCallback(
    (data: any) => dispatch(addStudentEducationRequest(data)),
    [dispatch],
  );

  const updateEducation = useCallback(
    (id: string, data: any) =>
      dispatch(updateStudentEducationRequest({ id, data })),
    [dispatch],
  );

  const deleteEducation = useCallback(
    (id: string) => dispatch(removeStudentEducationRequest(id)),
    [dispatch],
  );

  return {
    loading,
    educations,
    createEducation,
    updateEducation,
    deleteEducation,
  };
};

export const useSkills = () => {
  const dispatch = useDispatch();
  const skills = useSelector((s: RootState) => s.student.skills?.skills || []);
  const loading = useSelector((s: RootState) => s.student.loading);
  useEffect(() => {
    dispatch(getStudentSkllsRequest());
  }, [dispatch]);

  const createSkill = useCallback(
    (data: { name: string; level: string }) =>
      dispatch(addStudentSkillRequest(data)),
    [dispatch],
  );

  const updateSkill = useCallback(
    (id: string, data: { level: string }) =>
      dispatch(updateStudentSkillRequest({ skillId: id, skillData: data })),
    [dispatch],
  );

  const deleteSkill = useCallback(
    (id: string) => dispatch(removeStudentSkillRequest(id)),
    [dispatch],
  );

  return {
    skills,
    loading,
    createSkill,
    updateSkill,
    deleteSkill,
  };
};

export const useProjects = () => {
  const dispatch = useDispatch();
  const projects = useSelector(
    (s: RootState) => s.student.projects?.projects || [],
  );

  const loading = useSelector((s: RootState) => s.student.loading);

  useEffect(() => {
    dispatch(getAllProjectsRequest());
  }, [dispatch]);

  const createProject = useCallback(
    (data: any) => dispatch(addStudentProjectRequest(data)),
    [dispatch],
  );

  const updateProject = useCallback(
    (id: string, data: any) =>
      dispatch(updateStudentProjectRequest({ id, data })),
    [dispatch],
  );

  const deleteProject = useCallback(
    (id: string) => dispatch(removeStudentProjectRequest(id)),
    [dispatch],
  );

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
  };
};

export const useJobPreferences = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const studentWrapper = useSelector((s: RootState) => s.student.students?.[0]);

  const jobPreferences =
    studentWrapper?.student?.jobPreferences ?? studentWrapper;

  // optional: fetch fresh data if missing
  useEffect(() => {
    if (!jobPreferences) {
      dispatch(getStudentDetailsRequest());
    }
  }, [jobPreferences, dispatch]);

  /**
   * Update entire job preference object
   */
  const updateJobPreferences = useCallback(
    async (data: Partial<JobPreferences>) => {
      try {
        // normalize dangerous fields
        const payload = {
          ...data,
          relocationWillingness:
            typeof data.relocationWillingness === 'string'
              ? data.relocationWillingness === 'true'
              : data.relocationWillingness,
        };

        await apiInstance.post('/students/job-preferences', payload);

        dispatch(getStudentDetailsRequest());
        toast({ title: 'Job preferences updated' });
      } catch (err) {
        toast({
          title: 'Failed to update job preferences',
          variant: 'destructive',
        });
      }
    },
    [dispatch, toast],
  );

  return {
    jobPreferences,
    updateJobPreferences,
  };
};
