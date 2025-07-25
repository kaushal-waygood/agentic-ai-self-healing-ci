import {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,
  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,
  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,
  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,
  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,
  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,
  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
} from '../reducers/studentReducer';

import { call, put, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import {
  getStudentDetails,
  addEducation,
  addExperience,
  addSkill,
} from '@/services/api/student';
import { PayloadAction } from '@reduxjs/toolkit';

function* getStudentDetailsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    // console.log(response.data);
    yield put(getStudentDetailsSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(getStudentDetailsFailure((error as Error).message));
  }
}

function* addStudentEducationSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addEducation, action.payload);
    console.log(response.data);
    yield put(addStudentEducationSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(addStudentEducationFailure((error as Error).message));
  }
}

function* addStudentExperienceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addExperience, action.payload);
    console.log(response.data);
    yield put(addStudentExperienceSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(addStudentExperienceFailure((error as Error).message));
  }
}

function* addStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addSkill, action.payload);
    console.log(response.data);
    yield put(addStudentSkillSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(addStudentSkillFailure((error as Error).message));
  }
}

function* addStudentProjectsSaga() {
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
  yield takeLatest(addStudentEducationRequest.type, addStudentEducationSaga);
  yield takeLatest(addStudentExperienceRequest.type, addStudentExperienceSaga);
  yield takeLatest(addStudentSkillRequest.type, addStudentSkillsSaga);
}
