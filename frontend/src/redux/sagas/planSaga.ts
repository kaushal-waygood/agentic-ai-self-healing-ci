import { call, put, takeLatest, all } from 'redux-saga/effects';
import apiInstance from '@/services/api';
import {
  fetchPlanRequest,
  fetchPlanSuccess,
  fetchPlanFailure,
} from '../reducers/planReducer';
import { getPlanDetails } from '@/services/api/plan';

function* fetchPlanWorker(): Generator<any, void, any> {
  try {
    const res = yield call(getPlanDetails);
    yield put(fetchPlanSuccess(res.data));
  } catch (error: any) {
    yield put(fetchPlanFailure(error?.message || 'Failed to fetch plan'));
  }
}

export function* planWatcher() {
  yield takeLatest(fetchPlanRequest.type, fetchPlanWorker);
}
