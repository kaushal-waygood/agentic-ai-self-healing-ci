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
  updateStudentExperienceRequest,
  updateStudentExperienceSuccess,
  updateStudentExperienceFailure,

  // student Projects
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,
  updateStudentProjectRequest,
  updateStudentProjectSuccess,
  updateStudentProjectFailure,

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
  getStudentResumeRequest,
  getStudentResumeSuccess,
  getStudentResumeFailure,
  updateJobPreferedByStudentRequest,
  updateJobPreferedByStudentSuccess,
  updateJobPreferedByStudentFailure,
  getAllSavedJobsRequest,
  getAllSavedJobsSuccess,
  getAllSavedJobsFailure,
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
  updateExperience,
  removeExperience,
  addProject,
  updateProject,
  removeProject,
  getResumeDetailsByResume,
  updateJobPrefered,
  getAllSavedJobs,
} from '@/services/api/student';
import { PayloadAction } from '@reduxjs/toolkit';
function* getStudentDetailsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    yield put(getStudentDetailsSuccess(response.data));
  } catch (error: unknown) {
    yield put(getStudentDetailsFailure((error as Error).message));
  }
}

// student Education
function* addStudentEducationSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addEducation, action.payload);
    yield put(addStudentEducationSuccess(response.data));
  } catch (error: unknown) {
    yield put(addStudentEducationFailure((error as Error).message));
  }
}

function* removeStudentEducationSaga(action: PayloadAction<any>) {
  try {
    yield call(removeEducation, action.payload);
    yield put(removeStudentEducationSuccess(action.payload)); // Pass the ID directly
  } catch (error: unknown) {
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
  } catch (error: unknown) {
    yield put(updateStudentEducationFailure((error as Error).message));
  }
}

// student Experience
function* addStudentExperienceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addExperience, action.payload);
    yield put(addStudentExperienceSuccess(response.data));
  } catch (error: unknown) {
    yield put(addStudentExperienceFailure((error as Error).message));
  }
}

function* removeStudentExperienceSaga(action: PayloadAction<any>) {
  try {
    yield call(removeExperience, action.payload);
    yield put(removeStudentExperienceSuccess(action.payload));
  } catch (error: unknown) {
    yield put(removeStudentExperienceFailure((error as Error).message));
  }
}

function* updateStudentExperienceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateExperience,
      action.payload.experienceId,
      action.payload.expData,
    );
    yield put(updateStudentExperienceSuccess(response.data));
  } catch (error: unknown) {
    yield put(updateStudentExperienceFailure((error as Error).message));
  }
}

// student Skills
function* addStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addSkill, action.payload);
    yield put(addStudentSkillSuccess(response.data));
  } catch (error: unknown) {
    yield put(addStudentSkillFailure((error as Error).message));
  }
}

function* removeStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    yield call(removeSkill, action.payload);
    yield put(removeStudentSkillSuccess(action.payload));
  } catch (error: unknown) {
    yield put(removeStudentSkillFailure((error as Error).message));
  }
}

function* updateStudentSkillsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateSkill,
      action.payload.skillId,
      action.payload.skillData,
    );
    yield put(updateStudentSkillSuccess(response.data));
  } catch (error: unknown) {
    yield put(updateStudentSkillFailure((error as Error).message));
  }
}

// student Projects
function* addStudentProjectsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(addProject, action.payload);
    yield put(addStudentProjectSuccess(response.data));
  } catch (error: unknown) {
    yield put(addStudentProjectFailure((error as Error).message));
  }
}

function* updateStudentProjectsSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateProject,
      action.payload.projectId,
      action.payload.projectData,
    );
    yield put(updateStudentProjectSuccess(response.data));
  } catch (error: unknown) {
    yield put(updateStudentProjectFailure((error as Error).message));
  }
}

function* removeStudentProjectsSaga(action: PayloadAction<any>) {
  try {
    yield call(removeProject, action.payload);
    yield put(removeStudentProjectSuccess(action.payload));
  } catch (error: unknown) {
    yield put(removeStudentProjectFailure((error as Error).message));
  }
}

// student Job Preference
function* updateStudentJobPreferenceSaga(action: PayloadAction<any>) {
  try {
    const response: AxiosResponse = yield call(
      updateJobPreference,
      action.payload,
    );
    yield put(updateStudentJobPreferenceSuccess(response.data));
  } catch (error: unknown) {
    yield put(updateStudentJobPreferenceFailure((error as Error).message));
  }
}

function* getStudentJobPreferenceSaga() {
  try {
    const response: AxiosResponse = yield call(recommendProfileJob);
    yield put(getStudentJobPreferenceSuccess(response.data));
  } catch (error: unknown) {
    yield put(getStudentJobPreferenceFailure((error as Error).message));
  }
}

function* getStudentSavedJobsSaga() {
  try {
    const response: AxiosResponse = yield call(getAllSavedJobs);
    yield put(getAllSavedJobsSuccess(response.data.savedJobs || response.data));
  } catch (error: unknown) {
    yield put(getAllSavedJobsFailure((error as Error).message));
  }
}

function* updateJobPreferedByStudentSaga(action: PayloadAction<any>) {
  try {
    yield call(updateJobPrefered, action.payload);
    yield put(updateJobPreferedByStudentSuccess());
  } catch (error: unknown) {
    yield put(updateJobPreferedByStudentFailure((error as Error).message));
  }
}

export function* studentWatcher() {
  yield takeLatest(getStudentDetailsRequest.type, getStudentDetailsSaga);

  // student Education
  yield takeLatest(addStudentEducationRequest.type, addStudentEducationSaga);
  yield takeLatest(
    removeStudentEducationRequest.type,
    removeStudentEducationSaga,
  );
  yield takeLatest(
    updateStudentEducationRequest.type,
    updateStudentEducationSaga,
  );

  // student Experience
  yield takeLatest(addStudentExperienceRequest.type, addStudentExperienceSaga);
  yield takeLatest(
    updateStudentExperienceRequest.type,
    updateStudentExperienceSaga,
  );
  yield takeLatest(
    removeStudentExperienceRequest.type,
    removeStudentExperienceSaga,
  );

  // student Skills
  yield takeLatest(addStudentSkillRequest.type, addStudentSkillsSaga);
  yield takeLatest(removeStudentSkillRequest.type, removeStudentSkillsSaga);
  yield takeLatest(updateStudentSkillRequest.type, updateStudentSkillsSaga);

  // student Projects
  yield takeLatest(addStudentProjectRequest.type, addStudentProjectsSaga);
  yield takeLatest(updateStudentProjectRequest.type, updateStudentProjectsSaga);
  yield takeLatest(removeStudentProjectRequest.type, removeStudentProjectsSaga);

  yield takeLatest(
    updateStudentJobPreferenceRequest.type,
    updateStudentJobPreferenceSaga,
  );
  yield takeLatest(
    getStudentJobPreferenceRequest.type,
    getStudentJobPreferenceSaga,
  );

  yield takeLatest(
    updateJobPreferedByStudentRequest.type,
    updateJobPreferedByStudentSaga,
  );
  yield takeLatest(getAllSavedJobsRequest.type, getStudentSavedJobsSaga);
}
