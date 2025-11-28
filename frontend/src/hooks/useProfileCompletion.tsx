// src/hooks/useProfileCompletion.ts

import apiInstance from '@/services/api';
import { useState, useEffect } from 'react';

// A type to represent the API response
interface ProfileCompletionData {
  percentage: number;
  breakdown: {
    completed: number;
    total: number;
  };
  categories: {
    coreProfile: boolean;
    resume: boolean;
    education: boolean;
    workExperience: boolean;
    skills: boolean;
    projects: boolean;
    jobPreferences: boolean;
    coverLetter: boolean;
  };
}

const useProfileCompletion = () => {
  const [data, setData] = useState<ProfileCompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCompletionData = async () => {
      try {
        const response = await apiInstance.get('/students/profile/status');
        const result: ProfileCompletionData = response.data;
        setData(result);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionData();
  }, []);

  return { data, isLoading, error };
};

export default useProfileCompletion;
