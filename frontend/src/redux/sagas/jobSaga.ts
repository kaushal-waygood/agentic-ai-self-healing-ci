import {
  getAllJobs,
  getJobBySlug,
  postJobMannalByOrgAdmin,
  getAllJobsByOrgAdmin,
  updateJobStatus,
} from '@/services/api/job';
import { call, put, takeLatest } from 'redux-saga/effects';
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
} from '../reducers/jobReducer';
import { AxiosResponse } from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';

function* getAllJobsSaga(
  action: PayloadAction<{
    page: number;
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
      page,
      query,
      country,
      city,
      datePosted,
      employmentType,
      experience,
    } = action.payload;

    const response: AxiosResponse = yield call(getAllJobs, {
      page,
      query,
      country,
      city,
      datePosted,
      employmentType: employmentType?.join(','),
      experience: experience?.join(','),
    });

    yield put(
      getAllJobsSuccess({
        jobs: response.data.jobs,
        pagination: response.data.pagination,
      }),
    );
  } catch (error: unknown | Error) {
    console.log(error);

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
    console.log(response);
    yield put(postJobMannalByOrgAdminSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(postJobMannalByOrgAdminFailiure((error as Error).message));
  }
}

function* getAllJobPostsByOrgAdminSaga() {
  try {
    const response: AxiosResponse = yield call(getAllJobsByOrgAdmin);
    console.log(response);
    yield put(getAllJobPostsByOrgAdminSuccess(response.data.jobs));
  } catch (error: unknown | Error) {
    yield put(getAllJobPostsByOrgAdminFailure((error as Error).message));
  }
}

function* updateJobStatusSaga(action: PayloadAction<any>) {
  try {
    console.log(action.payload);
    const response: AxiosResponse = yield call(updateJobStatus, action.payload);
    yield put(updateJobStatusSuccess(response.data.job));
  } catch (error: unknown | Error) {
    yield put(updateJobStatusFailure((error as Error).message));
  }
}

export function* jobsWatcher() {
  console.log('jobsWatcher');
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
}
