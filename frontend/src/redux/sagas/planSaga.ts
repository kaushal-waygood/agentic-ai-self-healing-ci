import { call, put, takeLatest, all } from 'redux-saga/effects';
import apiInstance from '@/services/api';
import {
  fetchPlanRequest,
  fetchPlanSuccess,
  fetchPlanFailure,
} from '../reducers/planReducer';

function* fetchPlanWorker(): Generator<any, void, any> {
  try {
    const [limitsRes, planRes] = yield all([
      call(apiInstance.get, '/plan/usage-limit'),
      call(apiInstance.get, '/plan/get-user-plan-type'),
    ]);

    yield put(
      fetchPlanSuccess({
        usageLimits: limitsRes.data.data.usageLimits,
        usageData: limitsRes.data.data.usageCounters,
        planType: planRes.data.data.planType,
      }),
    );
  } catch (error: any) {
    yield put(fetchPlanFailure(error?.message || 'Failed to fetch plan'));
  }
}

export function* watchPlanSaga(): Generator<any, void, any> {
  yield takeLatest(fetchPlanRequest.type, fetchPlanWorker);
}
