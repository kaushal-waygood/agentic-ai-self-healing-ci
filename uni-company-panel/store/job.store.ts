import { create } from 'zustand';
import apiInstance from '@/services/api';
import { useMultiCompanyStore } from './multi-company.store';

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
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  error: string | null;
  getJobs: () => Promise<void>;
  getSingleHostedJobs: (id: string) => Promise<void>;
  updateJobDescription: (id: string, updates: Partial<Job>) => Promise<boolean>;
  mannualPostJob: (jobData: any) => Promise<void>;
  deleteJob: (id: string) => Promise<boolean>;
  rewriteJobDescriptionWithAI: (description: string) => Promise<string | null>;
  bulkDeleteJobs: (ids: string[]) => Promise<boolean>;
  toggleJobStatus: (id: string) => Promise<boolean>;
}

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],
  job: null,
  loading: false,
  error: null,
  meta: null,

  toggleJobStatus: async (jobId: string) => {
    try {
      await apiInstance.patch(`/jobs/status/${jobId}`);
      set((state) => ({
        jobs: state.jobs.map((job) =>
          // job._id === jobId ? { ...job, isActive: !job.isActive } : job,
          job._id === jobId || job.id === jobId
            ? { ...job, isActive: !job.isActive }
            : job,
        ),
      }));
      return true;
    } catch (err: any) {
      console.error('Toggle status error:', err);
      return false;
    }
  },
  getJobs: async (status: string) => {
    try {
      set({ loading: true, error: null });

      const { currentCompany } = useMultiCompanyStore.getState();
      const companyId = currentCompany?._id;

      const response = await apiInstance.get(
        companyId
          ? `/jobs/hosted/jobs/job-admin?companyId=${companyId}`
          : '/jobs/hosted/jobs/job-admin',
      );

      const { data, meta } = response.data;

      const transformedJobs =
        data?.map((job: any) => ({
          ...job,
          _id: job._id || job.id,
        })) ?? [];

      set({
        jobs: transformedJobs,
        meta: meta ?? null,
        loading: false,
      });
    } catch (err: any) {
      console.error('Job fetching error:', err);
      set({
        jobs: [],
        meta: null,
        error:
          err.response?.data?.message || err.message || 'Failed to fetch jobs',
        loading: false,
      });
    }
  },

  bulkDeleteJobs: async (ids: string[]) => {
    try {
      set({ error: null });
      await apiInstance.post('/jobs/hosted/jobs/bulk-delete', { ids });

      // Remove all deleted IDs from the local state at once
      set((state) => ({
        jobs: state.jobs.filter((job) => !ids.includes(job._id)),
      }));

      return true;
    } catch (err: any) {
      set({ error: 'Bulk delete failed' });
      return false;
    }
  },
  getSingleHostedJobs: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.get(`/jobs/${id}`);

      const data = response.data;

      set({ job: data.job, loading: false });
    } catch (err: any | string) {
      console.error('Job fetching error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to fetch jobs',
        loading: false,
      });
    }
  },
  deleteJob: async (id: string) => {
    try {
      set({ error: null });

      // 1. Make the API call to your new backend route
      await apiInstance.delete(`/jobs/hosted/jobs/${id}`);

      // 2. Update local state by filtering out the deleted job
      set((state) => ({
        // jobs: state.jobs.filter((job) => job._id !== id),
        jobs: state.jobs.filter((job) => job._id !== id && job.id !== id),
        // loading: false,
      }));

      return true;
    } catch (err: any) {
      console.error('Job deletion error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to delete job',
        loading: false,
      });
      return false;
    }
  },
  // Rename updateJobDescription to something more generic like updateJob
  updateJobDescription: async (id: string, updates: Partial<Job>) => {
    try {
      set({ loading: true, error: null });

      console.log(updates);

      // We pass the 'updates' object directly as the request body
      const response = await apiInstance.patch(`/jobs/mannual/${id}`, updates);

      const data = response.data;
      console.log('response', data);
      // set({ job: data.job, loading: false });
      set((state) => ({
        job: data.job,
        jobs: state.jobs.map((job) =>
          job._id === id || job.id === id ? { ...job, ...data.job } : job,
        ),
        loading: false,
      }));
      return true;
    } catch (err: any) {
      console.error('Job updating error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to update job',
        loading: false,
      });
      return false;
    }
  },

  mannualPostJob: async (jobData: any) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.post('/jobs/mannual', jobData);

      const data = response.data;

      // set({ jobs: data, loading: false });
      set((state) => ({
        jobs: [data.job, ...state.jobs],
        loading: false,
      }));
    } catch (err: any | string) {
      console.error('Job posting error:', err);
      set({
        error:
          err.response?.data?.message || err.message || 'Failed to post job',
        loading: false,
      });
    }
  },

  rewriteJobDescriptionWithAI: async (description: string) => {
    try {
      set({ loading: true, error: null });

      const response = await apiInstance.post('/jobs/generate-jd', {
        description: description,
      });

      const rewrittenText = response.data.jobDescription;
      set({ loading: false });

      return rewrittenText;
    } catch (err: any) {
      console.error('AI Rewrite error:', err);
      set({
        error:
          err.response?.data?.message ||
          err.message ||
          'Failed to rewrite description',
        loading: false,
      });
      return null;
    }
  },
}));
