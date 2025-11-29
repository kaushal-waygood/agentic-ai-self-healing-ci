import {
  getAutopilotRequest,
  getAutopilotSuccess,
  getAutopilotFailure,
  createAutopilotRequest,
  createAutopilotSuccess,
  createAutopilotFailure,
} from '../reducers/autopilotReducer';

import { call, put, takeLatest } from 'redux-saga/effects';
import { createAutoPilot, getAllAutopilot } from '@/services/api/autopilot';
import { AxiosResponse } from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';

function* getAutopilotSaga() {
  try {
    const response: AxiosResponse = yield call(getAllAutopilot);
    yield put(getAutopilotSuccess(response.data.data));
  } catch (error: any) {
    yield put(getAutopilotFailure(error.message));
  }
}

function* createAutopilotSaga(action: PayloadAction<any>) {
  console.log(action.payload);
  try {
    const response: AxiosResponse = yield call(createAutoPilot, action.payload);
    yield put(createAutopilotSuccess(response.data.data));
    yield put(getAutopilotRequest());
  } catch (error: any) {
    yield put(createAutopilotFailure(error.message));
  }
}

export function* autopilotWatcher() {
  yield takeLatest(getAutopilotRequest.type, getAutopilotSaga);
  yield takeLatest(createAutopilotRequest.type, createAutopilotSaga);
}
