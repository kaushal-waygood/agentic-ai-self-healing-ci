import {
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,

  // student Education
  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,
  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,
  updateStudentEducationRequest,
  updateStudentEducationSuccess,
  updateStudentEducationFailure,

  // student Experience
  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,
  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,

  // student Projects
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,

  // student Skills
  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,
  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
  updateStudentSkillRequest,
  updateStudentSkillSuccess,
  updateStudentSkillFailure,

  //job preference
  updateStudentJobPreferenceRequest,
  updateStudentJobPreferenceSuccess,
  updateStudentJobPreferenceFailure,
  getStudentJobPreferenceRequest,
  getStudentJobPreferenceSuccess,
  getStudentJobPreferenceFailure,
} from '../reducers/studentReducer';

import { call, put, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import {
  getStudentDetails,
  addEducation,
  addExperience,
  addSkill,
  updateEducation,
  removeEducation,
  updateSkill,
  removeSkill,
  updateJobPreference,
  recommendProfileJob,
} from '@/services/api/student';
import { PayloadAction } from '@reduxjs/toolkit';

function* getStudentDetailsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    yield put(getStudentDetailsSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(getStudentDetailsFailure((error as Error).message));
  }
}

function* addStudentEducationSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addEducation, action.payload);
    yield put(addStudentEducationSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(addStudentEducationFailure((error as Error).message));
  }
}

function* removeStudentEducationSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(removeEducation, action.payload);
    yield put(removeStudentEducationSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(removeStudentEducationFailure((error as Error).message));
  }
}

function* updateStudentEducationSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateEducation,
      action.payload.educationId,
      action.payload.eduData,
    );
    yield put(updateStudentEducationSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(updateStudentEducationFailure((error as Error).message));
  }
}

function* addStudentExperienceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addExperience, action.payload);
    yield put(addStudentExperienceSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(addStudentExperienceFailure((error as Error).message));
  }
}

function* addStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addSkill, action.payload);
    yield put(addStudentSkillSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(addStudentSkillFailure((error as Error).message));
  }
}

function* removeStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(removeSkill, action.payload);
    yield put(removeStudentSkillSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(removeStudentSkillFailure((error as Error).message));
  }
}

function* updateStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(updateSkill, action.payload);
    yield put(updateStudentSkillSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(updateStudentSkillFailure((error as Error).message));
  }
}

function* addStudentProjectsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    yield put(getStudentDetailsSuccess(response.data.studentDetails));
  } catch (error: unknown | Error) {
    yield put(getStudentDetailsFailure((error as Error).message));
  }
}

function* updateStudentJobPreferenceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateJobPreference,
      action.payload,
    );
    yield put(updateStudentJobPreferenceSuccess(response.data));
  } catch (error: unknown | Error) {
    yield put(updateStudentJobPreferenceFailure((error as Error).message));
  }
}

function* getStudentJobPreferenceSaga() {
  try {
    console.log('saga calling');
    const response: AxiosResponse = yield call(recommendProfileJob);
    yield put(getStudentJobPreferenceSuccess(response.data.preferences));
  } catch (error: unknown | Error) {
    yield put(getStudentJobPreferenceFailure((error as Error).message));
  }
}

export function* studentWatcher() {
  yield takeLatest(getStudentDetailsRequest.type, getStudentDetailsSaga);

  yield takeLatest(addStudentEducationRequest.type, addStudentEducationSaga);
  yield takeLatest(
    removeStudentEducationRequest.type,
    removeStudentEducationSaga,
  );
  yield takeLatest(
    updateStudentEducationRequest.type,
    updateStudentEducationSaga,
  );

  yield takeLatest(addStudentExperienceRequest.type, addStudentExperienceSaga);
  yield takeLatest(addStudentSkillRequest.type, addStudentSkillsSaga);
  yield takeLatest(removeStudentSkillRequest.type, removeStudentSkillsSaga);
  yield takeLatest(updateStudentSkillRequest.type, updateStudentSkillsSaga);

  yield takeLatest(
    updateStudentJobPreferenceRequest.type,
    updateStudentJobPreferenceSaga,
  );

  yield takeLatest(
    getStudentJobPreferenceRequest.type,
    getStudentJobPreferenceSaga,
  );
}
