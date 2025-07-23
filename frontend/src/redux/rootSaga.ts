import { all, call } from 'redux-saga/effects';
import { watchAuth } from './sagas/authSaga';
import { organizationWatcher } from './sagas/organizationSaga';
import { jobsWatcher } from './sagas/jobSaga';
import { studentWatcher } from './sagas/studentSaga';

export function* rootSaga() {
  try {
    yield all([
      watchAuth(),
      organizationWatcher(),
      jobsWatcher(),
      studentWatcher(),
    ]);
  } catch (error) {
    console.error('Saga error:', error);
  }
}
