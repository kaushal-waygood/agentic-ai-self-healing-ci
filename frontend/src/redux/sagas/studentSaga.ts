import {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,
} from '../reducers/studentReducer';

import { call, put, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { getStudentDetails } from '@/services/api/student';

function* getStudentDetailsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    console.log(response.data);
    yield put(getStudentDetailsSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(getStudentDetailsFailure((error as Error).message));
  }
}

export function* studentWatcher() {
  yield takeLatest(getStudentDetailsRequest.type, getStudentDetailsSaga);
}
