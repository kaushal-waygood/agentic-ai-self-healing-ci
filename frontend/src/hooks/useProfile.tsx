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

export type ProfileState = {
  fullName: string;
  email: string;
  phone: string;
  jobPreference: string;
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

  // ✅ Normalize shape safely
  const studentData = studentWrapper?.student ?? studentWrapper;

  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    email: '',
    phone: '',
    jobPreference: '',
    location: '',
    avatar: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!studentData) return;

    setProfile({
      fullName: studentData.fullName ?? '',
      email: studentData.email ?? '',
      phone: studentData.phone ?? '',
      jobPreference: studentData.jobRole ?? '',
      location: studentData.location ?? '',
      avatar: studentData.avatar ?? '',
      uploadedCV: studentData.uploadedCV,
    });
  }, [studentData]);

  const updateProfile = useCallback(async () => {
    try {
      await apiInstance.patch('/students/profile/update', {
        fullName: profile.fullName,
        phone: profile.phone,
        jobPreference: profile.jobPreference,
        location: profile.location,
      });

      dispatch(getStudentDetailsRequest());
      toast({ title: 'Profile updated' });
    } catch {
      toast({ title: 'Profile update failed', variant: 'destructive' });
    }
  }, [profile, dispatch, toast]);

  const uploadCV = useCallback(async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('cv', file);

      await apiInstance.post('/students/upload-resume', fd);
      dispatch(getStudentDetailsRequest());

      toast({ title: 'Resume uploaded' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  }, [file, dispatch, toast]);

  return {
    profile,
    setProfile,
    updateProfile,
    file,
    setFile,
    uploadCV,
    isUploading,
    fileInputRef,
  };
};

export const useExperience = () => {
  const dispatch = useDispatch();
  const experiences = useSelector(
    (s: RootState) => s.student.experiences?.experiences || [],
  );

  useEffect(() => {
    dispatch(getStudentExperienceRequest());
  }, [dispatch]);

  const createExperience = useCallback(
    (data: any) => dispatch(addStudentExperienceRequest(data)),
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
    educations,
    createEducation,
    updateEducation,
    deleteEducation,
  };
};

export const useSkills = () => {
  const dispatch = useDispatch();
  const skills = useSelector((s: RootState) => s.student.skills?.skills || []);

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
