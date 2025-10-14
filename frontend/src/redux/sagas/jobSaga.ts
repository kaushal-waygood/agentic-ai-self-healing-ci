import {
  getAllJobs,
  getJobBySlug,
  postJobMannalByOrgAdmin,
  getAllJobsByOrgAdmin,
  updateJobStatus,
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
  jobStreamError,
  addJob,
  endJobStream,
  fetchJobsStream,
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

function createJobStreamChannel(filters: any) {
  return eventChannel((emitter) => {
    const queryParams = new URLSearchParams();
    console.log('Filters:', queryParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          if (value.length > 0) queryParams.append(key, value.join(','));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const eventSource = new EventSource(
      `${API_BASE_URL}/api/v1/jobs/stream?${queryParams.toString()}`,
    );

    console.log('Event source created:', eventSource);

    eventSource.addEventListener('new-job', (event) => {
      try {
        const job = JSON.parse(event.data);
        console.log('New job:', job);
        emitter(addJob(job));
      } catch (e) {
        console.error('Failed to parse job data from stream:', e);
      }
    });

    eventSource.addEventListener('end-stream', () => {
      emitter(END); // Signal the end of the channel
    });

    eventSource.addEventListener('error', (event) => {
      let message = 'An error occurred while streaming jobs.';
      if (event.data) {
        try {
          message = JSON.parse(event.data).message || message;
          console.log(message);
        } catch (e) {}
      }
      emitter(jobStreamError(message));
      emitter(END);
    });

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      emitter(jobStreamError('A network error occurred with the job stream.'));
      emitter(END);
    };

    return () => {
      eventSource.close();
    };
  });
}

// The new worker saga that manages the channel

function* handleJobStreamSaga(action: PayloadAction<any>): SagaIterator {
  // 1. Call the function to create the channel
  const channel = yield call(createJobStreamChannel, action.payload);

  console.log('Channel created:', channel);

  try {
    // 2. Start a loop to listen for actions emitted from the channel
    while (true) {
      // `take` will wait for the channel to emit something
      const actionFromChannel = yield take(channel);
      console.log('Action from channel:', actionFromChannel);
      yield put(actionFromChannel);
    }
  } catch (error: unknown | Error) {
    yield put(jobStreamError((error as Error).message || 'Saga channel error'));
  } finally {
    // 3. This `finally` block will run when the channel is closed (via END)
    console.log('Job stream finished.');
    // Dispatch the final action to set loading to false
    yield put(endJobStream());
  }
}

export function* jobsWatcher() {
  yield takeLatest(fetchJobsStream.type, handleJobStreamSaga);
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
}
