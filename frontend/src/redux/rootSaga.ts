import { all, call } from 'redux-saga/effects';
import { watchAuth } from './sagas/authSaga';
import { organizationWatcher } from './sagas/organizationSaga';
import { jobsWatcher } from './sagas/jobSaga';

export function* rootSaga() {
  console.log('rootSaga');
  try {
    yield all([watchAuth(), organizationWatcher(), jobsWatcher()]);
  } catch (error) {
    console.error('Saga error:', error);
  }
}
