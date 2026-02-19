import { all } from 'redux-saga/effects';
import { watchAuth } from './sagas/authSaga';
import { organizationWatcher } from './sagas/organizationSaga';
import { jobsWatcher } from './sagas/jobSaga';
import { studentWatcher } from './sagas/studentSaga';
import { watchAI } from './sagas/aiSaga';
import { autopilotWatcher } from './sagas/autopilotSaga';
import { creditSaga } from './sagas/creditSaga';
import checkoutSaga from './sagas/checkoutSaga';
import { planWatcher } from './sagas/planSaga';

export function* rootSaga() {
  try {
    yield all([
      watchAuth(),
      organizationWatcher(),
      jobsWatcher(),
      studentWatcher(),
      watchAI(),
      autopilotWatcher(),
      creditSaga(),
      checkoutSaga(),
      planWatcher(),
    ]);
  } catch (error) {
    console.error('Saga error:', error);
  }
}
