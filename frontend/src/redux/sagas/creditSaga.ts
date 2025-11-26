import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  getCreditRequest,
  getCreditSuccess,
  getCreditFailure,
} from '../reducers/creditReducer';
import { getCredit } from '@/services/api/credit';
import { AxiosResponse } from 'axios';

export function* getCreditSaga(): SagaIterator {
  try {
    const response: AxiosResponse = yield call(getCredit);

    yield put(getCreditSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(getCreditFailure((error as Error).message));
  }
}

export function* creditSaga() {
  yield takeLatest(getCreditRequest, getCreditSaga);
}
