import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  generateCVByJobDescriptionRequest,
  generateCVByJobDescriptionSuccess,
  generateCVByJobDescriptionFailure,
  savedStudentResumeRequest,
  savedStudentResumeSuccess,
  savedStudentResumeFailure,
  savedStudentCoverLetterRequest,
  savedStudentCoverLetterSuccess,
  savedStudentCoverLetterFailure,
} from '../reducers/aiReducer';
import {
  generateCVByJobDescription,
  savedStudentResume,
  savedStudentCoverLetter,
} from '@/services/api/ai';
import { AxiosResponse } from 'axios';

function* generateCVByJobDescriptionSaga(
  action: PayloadAction<{ jobDescription: string }>,
): SagaIterator {
  try {
    const response = yield call(generateCVByJobDescription, action.payload);
    yield put(generateCVByJobDescriptionSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(generateCVByJobDescriptionFailure(errorMessage));
  }
}

function* savedStudentResumeSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(savedStudentResume);
    yield put(savedStudentResumeSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(savedStudentResumeFailure(errorMessage));
  }
}

function* savedStudentCoverLetterSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(savedStudentCoverLetter);
    yield put(savedStudentCoverLetterSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(savedStudentCoverLetterFailure(errorMessage));
  }
}

export function* watchAI() {
  yield takeLatest(
    generateCVByJobDescriptionRequest.type,
    generateCVByJobDescriptionSaga,
  );
  yield takeLatest(savedStudentResumeRequest.type, savedStudentResumeSaga);
  yield takeLatest(
    savedStudentCoverLetterRequest.type,
    savedStudentCoverLetterSaga,
  );
}
