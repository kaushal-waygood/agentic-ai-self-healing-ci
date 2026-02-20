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
  getDocumentCountsSuccess,
  getDocumentCountsFailure,
  getDocumentCountsRequest,
} from '../reducers/aiReducer';
import {
  generateCVByJobDescription,
  savedStudentResume,
  savedStudentCoverLetter,
  deleteSavedResume,
  deleteSavedCoverLetter,
  renameSavedResume,
  renameSavedCoverLetter,
  fetchDocumentCounts,
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

function* deleteSavedResumeSaga(action: PayloadAction<{ cvId: string }>) {
  try {
    const { cvId } = action.payload;
    yield call(deleteSavedResume, cvId);
    yield put(savedStudentResumeRequest());
    yield put(getDocumentCountsRequest());
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Delete failed';
    yield put(deleteSavedResumeFailure(errorMessage));
  }
}
function* deleteSavedCoverLetterSaga(action: PayloadAction<{ clId: string }>) {
  try {
    const { clId } = action.payload;
    yield call(deleteSavedCoverLetter, clId);

    yield put(savedStudentCoverLetterRequest());
    yield put(getDocumentCountsRequest());
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Delete failed';
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
    yield put(savedStudentResumeRequest());
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

    yield call(renameSavedCoverLetter, clId, newTitle);

    // ✅ Re-fetch latest data
    yield put(savedStudentCoverLetterRequest());
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Rename failed';
    yield put(renameSavedCoverLetterFailure(errorMessage));
  }
}

function* fetchDocumentCountsSaga() {
  try {
    const response = yield call(fetchDocumentCounts);
    // Based on your Postman result, the data is in response.data.data
    yield put(getDocumentCountsSuccess(response.data.data));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error || 'Failed to fetch document counts';
    yield put(getDocumentCountsFailure(errorMessage));
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

  yield takeLatest(getDocumentCountsRequest.type, fetchDocumentCountsSaga);
}
