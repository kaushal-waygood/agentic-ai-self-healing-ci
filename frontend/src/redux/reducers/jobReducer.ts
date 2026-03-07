/** @format */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Job } from '../types/jobType';

// --- FIX: Removed the duplicate interface definitions ---
interface Pagination {
  total: number;
  page: number;
  currentPage?: number;
  limit: number;
  totalPages: number;
  totalJobs?: number;
  hasNextPage?: boolean;
}

export interface JobFilters {
  query: string;
  country: string;
  state: string;
  city: string;
  datePosted: string;
  employmentType: string[];
  experience: string[];
  education: string[];
}

interface JobState {
  jobs: Job[];
  savedJobs: Job[];
  viewedJobs: Job[];
  visitedJobs: Job[];
  job: Job | null;
  preferedJob: Job[];
  loading: boolean;
  cacheHit: boolean;
  error: string | null;
  pagination: Pagination;
  filters: JobFilters;
  notification?: string;
}

const initialState: JobState = {
  jobs: [],
  savedJobs: [],
  viewedJobs: [],
  visitedJobs: [],
  preferedJob: [],
  job: null,
  loading: false,
  cacheHit: false,
  error: null,
  notification: undefined,
  pagination: {
    total: 0,
    page: 1,
    currentPage: 1,
    limit: 10,
    totalPages: 0,
    totalJobs: 0,
    hasNextPage: true,
  },
  filters: {
    query: '',
    country: '',
    state: '',
    city: '',
    datePosted: '',
    employmentType: [],
    experience: [],
    education: [],
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
        state?: string;
        city?: string;
        datePosted?: string;
        employmentType?: string[];
        experience?: string[];
        education?: string[];
      }>,
    ) => {
      state.loading = true;
      state.error = null;
      if (!action.payload.append) {
        state.filters = {
          query: action.payload.query ?? state.filters.query,
          country: action.payload.country ?? state.filters.country,
          state: action.payload.state ?? state.filters.state,
          city: action.payload.city ?? state.filters.city,
          datePosted: action.payload.datePosted ?? state.filters.datePosted,
          employmentType:
            action.payload.employmentType ?? state.filters.employmentType,
          experience: action.payload.experience ?? state.filters.experience,
          education: action.payload.education ?? state.filters.education,
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
        const jobsMap = new Map(
          state.jobs.map((job) => [job._id || (job as any).jobId, job]),
        );
        action.payload.jobs.forEach((job) =>
          jobsMap.set(job._id || (job as any).jobId, job),
        );
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
        state?: string;
        city?: string;
        datePosted?: string;
        employmentType?: string[];
        experience?: string[];
        education?: string[];
      }>,
    ) => {
      if (!state.cacheHit) {
        state.loading = true;
      }
      state.error = null;
      state.notification = null;
      if (!action.payload.append) {
        state.jobs = [];
        state.filters = {
          query: action.payload.query ?? state.filters.query,
          country: action.payload.country ?? state.filters.country,
          state: action.payload.state ?? state.filters.state,
          city: action.payload.city ?? state.filters.city,
          datePosted: action.payload.datePosted ?? state.filters.datePosted,
          employmentType:
            action.payload.employmentType ?? state.filters.employmentType,
          experience: action.payload.experience ?? state.filters.experience,
          education: action.payload.education ?? state.filters.education,
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
      state.cacheHit = false;
      state.pagination = {
        ...action.payload.pagination,
        hasNextPage:
          action.payload.jobs.length > 0 &&
          action.payload.pagination.hasNextPage,
      };
      if (action.payload.append) {
        const jobsMap = new Map(
          state.jobs.map((job) => [job._id || (job as any).jobId, job]),
        );
        action.payload.jobs.forEach((job) =>
          jobsMap.set(job._id || (job as any).jobId, job),
        );
        state.jobs = Array.from(jobsMap.values());
      } else {
        state.jobs = action.payload.jobs;
      }
    },
    // --- FIX: Added the missing comma ---
    searchJobFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.cacheHit = false;
      state.error = action.payload;
    },

    getRecommendJobsRequest: (
      state,
      action: PayloadAction<{ page: number; append?: boolean }>,
    ) => {
      if (!state.cacheHit) {
        state.loading = true;
      }
      state.error = null;
      state.notification = null;
      if (!action.payload.append) {
        state.jobs = [];
      }
    },
    getRecommendJobsSuccess: (
      state,
      action: PayloadAction<{
        jobs: Job[];
        pagination: Pagination;
        append?: boolean;
      }>,
    ) => {
      state.loading = false;
      state.cacheHit = false;
      state.pagination = {
        ...action.payload.pagination,
        hasNextPage:
          action.payload.jobs.length > 0 &&
          action.payload.pagination.hasNextPage,
      };
      if (action.payload.append) {
        const jobsMap = new Map(
          state.jobs.map((job) => [job._id || (job as any).jobId, job]),
        );
        action.payload.jobs.forEach((job) =>
          jobsMap.set(job._id || (job as any).jobId, job),
        );
        state.jobs = Array.from(jobsMap.values());
      } else {
        state.jobs = action.payload.jobs;
      }
    },
    getRecommendJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.cacheHit = false;
      state.error = action.payload;
    },

    savedStudentJobsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    savedStudentJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.savedJobs = action.payload;
    },
    savedStudentJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    visitedJobsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    visitedJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.visitedJobs = action.payload;
    },
    visitedJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    viewedJobsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    viewedJobsSuccess: (state, action: PayloadAction<Job[]>) => {
      state.loading = false;
      state.viewedJobs = action.payload;
    },
    viewedJobsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    findSingleJobRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    findSingleJobSuccess: (state, action: PayloadAction<Job>) => {
      state.loading = false;
      state.job = action.payload;
    },
    findSingleJobFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Cache control ──────────────────────────────────────────────
    setCacheHit: (state, action: PayloadAction<boolean>) => {
      state.cacheHit = action.payload;
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
  getRecommendJobsRequest,
  getRecommendJobsSuccess,
  getRecommendJobsFailure,
  savedStudentJobsRequest,
  savedStudentJobsSuccess,
  savedStudentJobsFailure,
  visitedJobsRequest,
  visitedJobsSuccess,
  visitedJobsFailure,
  viewedJobsRequest,
  viewedJobsSuccess,
  viewedJobsFailure,
  findSingleJobRequest,
  findSingleJobSuccess,
  findSingleJobFailure,
  setCacheHit,
} = jobSlice.actions;

export default jobSlice.reducer;
