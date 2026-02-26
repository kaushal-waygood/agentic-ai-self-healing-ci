import {
  getAllJobs,
  getJobBySlug,
  postJobMannalByOrgAdmin,
  getAllJobsByOrgAdmin,
  updateJobStatus,
  searchJobs,
  getRecommendJobs,
  findSingleJob,
} from '@/services/api/job';
import { call, put, take, takeLatest } from 'redux-saga/effects';
import {
  getAllJobsRequest,
  getAllJobsSuccess,
  getAllJobsFailure,
  getJobBySlugRequest,
  getJobBySlugFailure,
  getJobBySlugSuccess,
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
  findSingleJobRequest,
  findSingleJobSuccess,
  findSingleJobFailure,
} from '../reducers/jobReducer';
import { AxiosResponse } from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';
import { recommendProfileJob } from '@/services/api/student';
import { END, eventChannel, SagaIterator } from 'redux-saga';
import { API_BASE_URL } from '@/services/api';

function* getAllJobsSaga(
  // ADD: The 'append' flag to the action type
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
) {
  try {
    const {
      // ADD: Destructure the 'append' flag
      append,
      page,
      query,
      country,
      city,
      datePosted,
      employmentType,
      experience,
    } = action.payload;

    // No change to the API call itself
    const response: AxiosResponse = yield call(getAllJobs, {
      page,
      query,
      country,
      city,
      datePosted,
      employmentType: employmentType?.join(','),
      experience: experience?.join(','),
    });

    // CHANGED: Pass the 'append' flag to the success action
    yield put(
      getAllJobsSuccess({
        jobs: response.data.jobs,
        pagination: response.data.pagination,
        append: append, // Pass the flag along to the reducer
      }),
    );
  } catch (error: unknown | Error) {
    console.error(error);
    yield put(
      getAllJobsFailure((error as Error).message || 'Failed to fetch jobs'),
    );
  }
}

function* getJobBySlugSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse = yield call(getJobBySlug, action.payload);
    yield put(getJobBySlugSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(getJobBySlugFailure((error as Error).message));
  }
}

function* postJobMannalByOrgAdminSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      postJobMannalByOrgAdmin,
      action.payload,
    );
    yield put(postJobMannalByOrgAdminSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(postJobMannalByOrgAdminFailiure((error as Error).message));
  }
}

function* getAllJobPostsByOrgAdminSaga() {
  try {
    const response: AxiosResponse = yield call(getAllJobsByOrgAdmin);
    yield put(getAllJobPostsByOrgAdminSuccess(response.data.jobs));
  } catch (error: unknown | Error) {
    yield put(getAllJobPostsByOrgAdminFailure((error as Error).message));
  }
}

function* updateJobStatusSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(updateJobStatus, action.payload);
    yield put(updateJobStatusSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(updateJobStatusFailure((error as Error).message));
  }
}

function* preferedJobs() {
  try {
    const response: AxiosResponse = yield call(recommendProfileJob);
    yield put(getJobPreferenceFailure(response.data.jobs));
  } catch (error: unknown | Error) {
    yield put(getJobPreferenceFailure((error as Error).message));
  }
}

// --- In-memory search cache for frontend ---
const searchCache = new Map<
  string,
  { data: { jobs: any[]; pagination: any }; expiresAt: number }
>();
const SEARCH_CACHE_TTL_MS = 0; // 3 minutes
const MAX_CACHE_ENTRIES = 50;

function makeSearchCacheKey(params: Record<string, any>): string {
  return JSON.stringify({
    p: params.page,
    q: params.query,
    co: params.country,
    st: params.state,
    ci: params.city,
    dp: params.datePosted,
    et: params.employmentType,
    ex: params.experience,
    ed: params.education,
  });
}

function pruneSearchCache() {
  if (searchCache.size <= MAX_CACHE_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of searchCache) {
    if (entry.expiresAt < now || searchCache.size > MAX_CACHE_ENTRIES) {
      searchCache.delete(key);
    }
  }
}

function* searchJobsSaga(
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
) {
  try {
    const {
      append,
      page,
      query,
      country,
      city,
      state,
      datePosted,
      employmentType,
      experience,
      education,
    } = action.payload;

    // Try cache for non-append (fresh) searches
    const cacheKey = makeSearchCacheKey(action.payload);
    if (!append) {
      const cached = searchCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        yield put(
          searchJobSuccess({
            jobs: cached.data.jobs,
            pagination: cached.data.pagination,
            append,
          }),
        );
        return;
      }
    }

    const response: AxiosResponse = yield call(searchJobs, {
      page,
      query,
      country,
      state,
      city,
      datePosted,
      employmentType: employmentType?.join(','),
      experience: experience?.join(','),
      education: education?.join(','), // ADD THIS
    });

    const responseData = {
      jobs: response.data.jobs,
      pagination: response.data.pagination,
    };

    // Store in cache
    searchCache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    });
    pruneSearchCache();

    yield put(
      searchJobSuccess({
        ...responseData,
        append,
      }),
    );
  } catch (error: unknown | Error) {
    console.error(error);
    yield put(
      searchJobFailure((error as Error).message || 'Failed to search for jobs'),
    );
  }
}

function* getRecommendJobsSaga() {
  try {
    const response: AxiosResponse = yield call(getRecommendJobs);
    yield put(getRecommendJobsSuccess(response.data.jobs));
  } catch (error: unknown | Error) {
    yield put(getRecommendJobsFailure((error as Error).message));
  }
}

function* findSingleJobSaga(action: PayloadAction<string>) {
  try {
    const response: AxiosResponse = yield call(findSingleJob, action.payload);
    yield put(findSingleJobSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(findSingleJobFailure((error as Error).message));
  }
}

export function* jobsWatcher() {
  // yield takeLatest(fetchJobsStream.type, handleJobStreamSaga);
  yield takeLatest(getAllJobsRequest.type, getAllJobsSaga);
  yield takeLatest(getJobBySlugRequest.type, getJobBySlugSaga);
  yield takeLatest(
    postJobMannalByOrgAdminRequest.type,
    postJobMannalByOrgAdminSaga,
  );
  yield takeLatest(
    getAllJobPostsByOrgAdminRequest.type,
    getAllJobPostsByOrgAdminSaga,
  );
  yield takeLatest(updateJobStatusRequest.type, updateJobStatusSaga);
  yield takeLatest(getJobPreferenceRequest.type, preferedJobs);
  yield takeLatest(searchJobRequest.type, searchJobsSaga);
  yield takeLatest(getRecommendJobsRequest.type, getRecommendJobsSaga);
  yield takeLatest(findSingleJobRequest.type, findSingleJobSaga);
}
