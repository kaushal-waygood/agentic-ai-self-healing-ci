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
  deleteSavedResumeRequest,
  deleteSavedResumeSuccess,
  deleteSavedResumeFailure,
  deleteSavedCoverLetterRequest,
  deleteSavedCoverLetterSuccess,
  deleteSavedCoverLetterFailure,
  renameSavedResumeRequest,
  renameSavedResumeSuccess,
  renameSavedResumeFailure,
  renameSavedCoverLetterRequest,
  renameSavedCoverLetterSuccess,
  renameSavedCoverLetterFailure,
} from '../reducers/aiReducer';
import {
  generateCVByJobDescription,
  savedStudentResume,
  savedStudentCoverLetter,
  deleteSavedResume,
  deleteSavedCoverLetter,
  renameSavedResume,
  renameSavedCoverLetter,
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

function* deleteSavedResumeSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      deleteSavedResume,
      action.payload,
    );
    yield put(deleteSavedResumeSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(deleteSavedResumeFailure(errorMessage));
  }
}

function* deleteSavedCoverLetterSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      deleteSavedCoverLetter,
      action.payload,
    );
    yield put(deleteSavedCoverLetterSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(deleteSavedCoverLetterFailure(errorMessage));
  }
}

function* renameSavedResumeSaga(
  action: PayloadAction<{ cvId: string; newTitle: string }>,
) {
  try {
    const { cvId, newTitle } = action.payload;
    const response: AxiosResponse = yield call(
      renameSavedResume,
      cvId,
      newTitle,
    );
    yield put(renameSavedResumeSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(renameSavedResumeFailure(errorMessage));
  }
}

function* renameSavedCoverLetterSaga(
  action: PayloadAction<{ clId: string; newTitle: string }>,
) {
  try {
    const { clId, newTitle } = action.payload;
    const response: AxiosResponse = yield call(
      renameSavedCoverLetter,
      clId,
      newTitle,
    );
    yield put(renameSavedCoverLetterSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(renameSavedCoverLetterFailure(errorMessage));
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

  yield takeLatest(deleteSavedResumeRequest.type, deleteSavedResumeSaga);

  yield takeLatest(
    deleteSavedCoverLetterRequest.type,
    deleteSavedCoverLetterSaga,
  );

  yield takeLatest(renameSavedResumeRequest.type, renameSavedResumeSaga);

  yield takeLatest(
    renameSavedCoverLetterRequest.type,
    renameSavedCoverLetterSaga,
  );
}
