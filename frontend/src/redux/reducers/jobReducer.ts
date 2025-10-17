/** @format */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '../types/jobType';

// --- FIX: Removed the duplicate interface definitions ---
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface JobState {
  jobs: Job[];
  job: Job | null;
  preferedJob: Job[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: {
    query: string;
    country: string;
    city: string;
    datePosted: string;
    employmentType: string[];
    experience: string[];
  };
}

const initialState: JobState = {
  jobs: [],
  preferedJob: [],
  job: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    query: '',
    country: '',
    city: '',
    datePosted: '',
    employmentType: [],
    experience: [],
  },
};

const jobSlice = createSlice({
  name: 'job',
  initialState,
  // --- FIX: Organized all reducers into a single, clean block ---
  reducers: {
    getAllJobsRequest: (
      state,
      action: PayloadAction<{
        page: number;
        append?: boolean;
        query?: string;
        country?: string;
        city?: string;
        datePosted?: string;
        employmentType?: string[];
        experience?: string[];
      }>,
    ) => {
      state.loading = true;
      state.error = null;
      if (!action.payload.append) {
        state.filters = {
          query: action.payload.query ?? state.filters.query,
          country: action.payload.country ?? state.filters.country,
          city: action.payload.city ?? state.filters.city,
          datePosted: action.payload.datePosted ?? state.filters.datePosted,
          employmentType:
            action.payload.employmentType ?? state.filters.employmentType,
          experience: action.payload.experience ?? state.filters.experience,
        };
      }
    },
    getAllJobsSuccess: (
      state,
      action: PayloadAction<{
        jobs: Job[];
        pagination: Pagination;
        append?: boolean;
      }>,
    ) => {
      state.loading = false;
      state.pagination = action.payload.pagination;
      if (action.payload.append) {
        const jobsMap = new Map(state.jobs.map((job) => [job._id, job]));
        action.payload.jobs.forEach((job) => jobsMap.set(job._id, job));
        state.jobs = Array.from(jobsMap.values());
      } else {
        state.jobs = action.payload.jobs;
      }
    },
    getAllJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    getJobBySlugRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    getJobBySlugSuccess: (state, action: PayloadAction<Job>) => {
      state.loading = false;
      state.job = action.payload;
    },
    getJobBySlugFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    postJobMannalByOrgAdminRequest: (state, action: PayloadAction<Job>) => {
      state.loading = true;
      state.error = null;
    },
    postJobMannalByOrgAdminSuccess: (state, action: PayloadAction<Job>) => {
      state.loading = false;
      state.job = action.payload;
    },
    postJobMannalByOrgAdminFailiure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getAllJobPostsByOrgAdminRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllJobPostsByOrgAdminSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.jobs = action.payload;
    },
    getAllJobPostsByOrgAdminFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateJobStatusRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    updateJobStatusSuccess: (state, action: PayloadAction<Job>) => {
      state.loading = false;
      state.job = action.payload;
    },
    updateJobStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getJobPreferenceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // --- FIX: Removed stray underscore typo ---
    getJobPreferenceSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.preferedJob = action.payload;
    },
    getJobPreferenceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    searchJobRequest: (
      state,
      action: PayloadAction<{
        page: number;
        append?: boolean;
        query?: string;
        country?: string;
        city?: string;
        datePosted?: string;
        employmentType?: string[];
        experience?: string[];
      }>,
    ) => {
      state.loading = true;
      state.error = null;
      if (!action.payload.append) {
        state.filters = {
          query: action.payload.query ?? state.filters.query,
          country: action.payload.country ?? state.filters.country,
          city: action.payload.city ?? state.filters.city,
          datePosted: action.payload.datePosted ?? state.filters.datePosted,
          employmentType:
            action.payload.employmentType ?? state.filters.employmentType,
          experience: action.payload.experience ?? state.filters.experience,
        };
      }
    },
    searchJobSuccess: (
      state,
      action: PayloadAction<{
        jobs: Job[];
        pagination: Pagination;
        append?: boolean;
      }>,
    ) => {
      state.loading = false;
      state.pagination = action.payload.pagination;
      if (action.payload.append) {
        const jobsMap = new Map(state.jobs.map((job) => [job._id, job]));
        action.payload.jobs.forEach((job) => jobsMap.set(job._id, job));
        state.jobs = Array.from(jobsMap.values());
      } else {
        state.jobs = action.payload.jobs;
      }
    },
    // --- FIX: Added the missing comma ---
    searchJobFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  getAllJobsRequest,
  getAllJobsSuccess,
  getAllJobsFailure,
  setCurrentPage,
  getJobBySlugRequest,
  getJobBySlugSuccess,
  getJobBySlugFailure,
  postJobMannalByOrgAdminRequest,
  postJobMannalByOrgAdminSuccess,
  postJobMannalByOrgAdminFailiure,
  getAllJobPostsByOrgAdminRequest,
  getAllJobPostsByOrgAdminSuccess,
  getAllJobPostsByOrgAdminFailure,
  updateJobStatusRequest,
  updateJobStatusSuccess,
  updateJobStatusFailure,
  getJobPreferenceRequest,
  getJobPreferenceSuccess,
  getJobPreferenceFailure,
  searchJobRequest,
  searchJobSuccess,
  searchJobFailure,
} = jobSlice.actions;

export default jobSlice.reducer;
