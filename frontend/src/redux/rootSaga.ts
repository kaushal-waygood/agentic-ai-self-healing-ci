import { all } from 'redux-saga/effects';
import { watchAuth } from './sagas/authSaga';
import { organizationWatcher } from './sagas/organizationSaga';
import { jobsWatcher } from './sagas/jobSaga';
import { studentWatcher } from './sagas/studentSaga';
import { watchAI } from './sagas/aiSaga';

export function* rootSaga() {
  try {
    yield all([
      watchAuth(),
      organizationWatcher(),
      jobsWatcher(),
      studentWatcher(),
      watchAI(),
    ]);
  } catch (error) {
    console.error('Saga error:', error);
  }
}
