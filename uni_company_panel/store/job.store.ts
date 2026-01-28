import { create } from 'zustand';
import apiInstance from '@/services/api';

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  isActive: boolean;
  slug: string;
  createdAt: string;
  jobViews: number;
  appliedCount: number;
  responsibilities: string[];
  qualifications: string[];
  jobTypes: string[];
  remote: boolean;
  resumeRequired: boolean;
  tags: string[];
  salary?: {
    min?: number;
    max?: number;
    period?: string;
  };
  location?: {
    city?: string;
    state?: string;
  };
  country?: string;
  contractLength?: {
    value: number;
    type: string;
  };
  screeningQuestions?: Array<{
    question: string;
    type: string;
    required: boolean;
  }>;
  assignment?: {
    isEnabled: boolean;
    type: 'MANUAL' | 'FILE';
    instruction: string;
    fileUrl?: string;
  };
  applyMethod?: {
    method: 'EMAIL' | 'EXTERNAL';
    email?: string;
  };
}

// 2. Define the Store's State and Actions
interface JobStore {
  jobs: Job[];
  job: Job | null;
  loading: boolean;
  error: string | null;
  getJobs: () => Promise<void>;
  getSingleHostedJobs: (id: string) => Promise<void>;
  updateJobDescription: (id: string, description: string) => Promise<void>;
  mannualPostJob: (jobData: any) => Promise<void>;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  job: null,
  loading: false,
  error: null,

  getJobs: async () => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.get('/jobs/hosted/jobs/job-admin');

      const data = response.data;

      set({ jobs: data.jobs, loading: false });
    } catch (err: unknown | string) {
      console.error('Job fetching error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to fetch jobs',
        loading: false,
      });
    }
  },

  getSingleHostedJobs: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.get(`/jobs/${id}`);

      const data = response.data;

      set({ job: data.job, loading: false });
    } catch (err: unknown | string) {
      console.error('Job fetching error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to fetch jobs',
        loading: false,
      });
    }
  },

  updateJobDescription: async (id: string, description: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.patch(`/jobs/mannual/${id}`, {
        description,
      });

      const data = response.data;

      console.log(data);

      set({ job: data.job, loading: false });
    } catch (err: unknown | string) {
      console.error('Job updating error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to update job',
        loading: false,
      });
    }
  },

  mannualPostJob: async (jobData: any) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.post('/jobs/mannual', jobData);

      const data = response.data;

      set({ jobs: data, loading: false });
    } catch (err: unknown | string) {
      console.error('Job posting error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to post job',
        loading: false,
      });
    }
  },
}));
