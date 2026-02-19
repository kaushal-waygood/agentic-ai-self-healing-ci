import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  getCreditRequest,
  getCreditSuccess,
  getCreditFailure,
  getTotalCreditRequest,
  getTotalCreditSuccess,
  getTotalCreditFailure,
  earnCreditRequest,
  earnCreditSuccess,
  earnCreditFailure,
  fetchDailyStreakRequest,
  fetchDailyStreakSuccess,
  fetchDailyStreakFailure,
} from '../reducers/creditReducer';
import {
  earnSocialCredit,
  getCredit,
  getTotalCredit,
} from '@/services/api/credit';
import { AxiosResponse } from 'axios';
import { fetchDailyStreak } from '@/services/api/streakApi';

export function* getCreditSaga(): SagaIterator {
  try {
    const response: AxiosResponse = yield call(getCredit);
    yield put(getCreditSuccess(response.data));
  } catch (error: unknown) {
    yield put(
      getCreditFailure(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    );
  }
}

export function* getTotalCreditSaga(): SagaIterator {
  try {
    const response: AxiosResponse = yield call(getTotalCredit);
    yield put(getTotalCreditSuccess(response.data));
  } catch (error: unknown) {
    yield put(
      getTotalCreditFailure(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    );
  }
}

export function* earnCreditSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const response: AxiosResponse = yield call(
      earnSocialCredit,
      action.payload.action,
      action.payload.meta,
    );
    yield put(earnCreditSuccess(response.data));
    yield put(getCreditRequest()); // Refresh credit after earning
  } catch (error: unknown) {
    yield put(
      earnCreditFailure(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    );
  }
}

export function* fetchDailyStreakSaga(): SagaIterator {
  try {
    const response: AxiosResponse = yield call(fetchDailyStreak);

    yield put(fetchDailyStreakSuccess(response));
  } catch (error: unknown) {
    yield put(
      fetchDailyStreakFailure(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    );
  }
}

export function* creditSaga() {
  yield takeLatest(getCreditRequest.type, getCreditSaga);
  yield takeLatest(getTotalCreditRequest.type, getTotalCreditSaga);
  yield takeLatest(earnCreditRequest.type, earnCreditSaga);
  yield takeLatest(fetchDailyStreakRequest.type, fetchDailyStreakSaga);
}
