/** @format */

import { call, put, takeLatest } from 'redux-saga/effects';
import { AxiosResponse } from 'axios';
import { PayloadAction } from '@reduxjs/toolkit';

import {
  // details
  getStudentDetailsRequest,
  getStudentDetailsSuccess,
  getStudentDetailsFailure,

  // education
  getStudentEducationRequest,
  getStudentEducationSuccess,
  getStudentEducationFailure,
  addStudentEducationRequest,
  addStudentEducationSuccess,
  addStudentEducationFailure,
  removeStudentEducationRequest,
  removeStudentEducationSuccess,
  removeStudentEducationFailure,
  updateStudentEducationRequest,
  updateStudentEducationSuccess,
  updateStudentEducationFailure,

  // experience
  getStudentExperienceRequest,
  getStudentExperienceSuccess,
  getStudentExperienceFailure,
  addStudentExperienceRequest,
  addStudentExperienceSuccess,
  addStudentExperienceFailure,
  removeStudentExperienceRequest,
  removeStudentExperienceSuccess,
  removeStudentExperienceFailure,
  updateStudentExperienceRequest,
  updateStudentExperienceSuccess,
  updateStudentExperienceFailure,

  // projects
  getAllProjectsRequest,
  getAllProjectsSuccess,
  getAllProjectsFailure,
  addStudentProjectRequest,
  addStudentProjectSuccess,
  addStudentProjectFailure,
  removeStudentProjectRequest,
  removeStudentProjectSuccess,
  removeStudentProjectFailure,
  updateStudentProjectRequest,
  updateStudentProjectSuccess,
  updateStudentProjectFailure,

  // skills
  getStudentSkllsRequest,
  getStudentSkllsSuccess,
  getStudentSkllsFailure,
  addStudentSkillRequest,
  addStudentSkillSuccess,
  addStudentSkillFailure,
  removeStudentSkillRequest,
  removeStudentSkillSuccess,
  removeStudentSkillFailure,
  updateStudentSkillRequest,
  updateStudentSkillSuccess,
  updateStudentSkillFailure,

  // job preference + saved jobs
  updateStudentJobPreferenceRequest,
  updateStudentJobPreferenceSuccess,
  updateStudentJobPreferenceFailure,
  getStudentJobPreferenceRequest,
  getStudentJobPreferenceSuccess,
  getStudentJobPreferenceFailure,
  getAllSavedJobsRequest,
  getAllSavedJobsSuccess,
  getAllSavedJobsFailure,

  // resume
  getStudentResumeRequest,
  getStudentResumeSuccess,
  getStudentResumeFailure,

  // prefer toggle
  updateJobPreferedByStudentRequest,
  updateJobPreferedByStudentSuccess,
  updateJobPreferedByStudentFailure,
  postStudentEventsRequest,
  postStudentEventsSuccess,
  postStudentEventsFailure,
  getStudentEventsRequest,
  getStudentEventsSuccess,
  getStudentEventsFailure,
} from '../reducers/studentReducer';

import {
  // details
  getStudentDetails,

  // education
  addEducation,
  updateEducation,
  removeEducation,

  // experience
  getExperience,
  addExperience,
  updateExperience,
  removeExperience,

  // skills
  addSkill,
  updateSkill,
  removeSkill,

  // projects
  getAllProjects,
  addProject,
  updateProject,
  removeProject,

  // job pref + saved
  updateJobPreference,
  recommendProfileJob,
  getAllSavedJobs,

  // resume
  getResumeDetailsByResume,

  // prefer toggle
  updateJobPrefered,

  // saved josb
  saveJob,
  visitedJobs,
  viewedJobs,
  getSkills,
  getEducation,
  studentEvents,
  getStudentEvent,
} from '@/services/api/student';
import {
  savedStudentJobsRequest,
  savedStudentJobsSuccess,
  savedStudentJobsFailure,
  visitedJobsRequest,
  visitedJobsSuccess,
  visitedJobsFailure,
  viewedJobsRequest,
  viewedJobsSuccess,
  viewedJobsFailure,
} from '../reducers/jobReducer';
import { get } from 'lodash';

/* ============================================================
   Local types (align with your slice)
============================================================ */
type ID = string;

type Education = {
  _id: ID;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  country: string;
  gpa?: string;
  startDate: string;
  endDate?: string;
};

type Experience = {
  _id: ID;
  company: string;
  designation: string;
  employmentType?: string;
  location?: string;
  isCurrent?: boolean;
  startDate: string;
  endDate?: string;
  responsibilities?: string;
};

type Project = {
  _id: ID;
  projectName: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  technologies: string[];
  link?: string;
};

type Skill = {
  _id: ID;
  skill: string;
  level: string;
};

/* ============================================================
   Utils
============================================================ */
function getErrorMessage(err: unknown): string {
  const e = err as any;
  return (
    e?.response?.data?.message ||
    e?.message ||
    (typeof e === 'string' ? e : 'Unknown error')
  );
}

/* ============================================================
   Student details
============================================================ */
function* getStudentDetailsSaga() {
  try {
    const response: AxiosResponse = yield call(getStudentDetails);
    yield put(getStudentDetailsSuccess(response.data));
  } catch (error) {
    yield put(getStudentDetailsFailure(getErrorMessage(error)));
  }
}

/* ============================================================
   Education
============================================================ */
function* getStudentEducationSaga() {
  try {
    const response: AxiosResponse<Education[]> = yield call(getEducation);
    yield put(getStudentEducationSuccess(response.data));
  } catch (error) {
    yield put(getStudentEducationFailure(getErrorMessage(error)));
  }
}

function* addStudentEducationSaga(
  action: PayloadAction<Omit<Education, '_id'> | Education>,
) {
  try {
    const response: AxiosResponse<Education> = yield call(
      addEducation,
      action.payload,
    );
    yield put(addStudentEducationSuccess(response.data));
    yield put(getStudentEducationRequest());
  } catch (error) {
    yield put(addStudentEducationFailure(getErrorMessage(error)));
  }
}

function* removeStudentEducationSaga(action: PayloadAction<ID>) {
  try {
    yield call(removeEducation, action.payload);
    yield put(removeStudentEducationSuccess(action.payload));
  } catch (error) {
    yield put(removeStudentEducationFailure(getErrorMessage(error)));
  }
}

function* updateStudentEducationSaga(
  action: PayloadAction<{ data: Partial<Education> & { _id: ID }; index: ID }>,
) {
  try {
    const { index, data } = action.payload;
    const response: AxiosResponse<Education> = yield call(
      updateEducation,
      index,
      data,
    );
    yield put(updateStudentEducationSuccess(response.data));
    yield put(getStudentEducationRequest());
  } catch (error) {
    yield put(updateStudentEducationFailure(getErrorMessage(error)));
  }
}

/* ============================================================
   Experience
============================================================ */
function* getStudentExperienceSaga() {
  try {
    const response: AxiosResponse<Experience[]> = yield call(getExperience);
    yield put(getStudentExperienceSuccess(response.data));
  } catch (error) {
    yield put(getStudentExperienceFailure(getErrorMessage(error)));
  }
}

function* addStudentExperienceSaga(
  action: PayloadAction<Omit<Experience, '_id'> | Experience>,
) {
  try {
    const response: AxiosResponse<Experience> = yield call(
      addExperience,
      action.payload,
    );
    yield put(addStudentExperienceSuccess(response.data));
    yield put(getStudentExperienceRequest());
  } catch (error) {
    yield put(addStudentExperienceFailure(getErrorMessage(error)));
  }
}

function* removeStudentExperienceSaga(action: PayloadAction<ID>) {
  try {
    yield call(removeExperience, action.payload);
    yield put(removeStudentExperienceSuccess(action.payload));
    yield put(getStudentExperienceRequest());
  } catch (error) {
    yield put(removeStudentExperienceFailure(getErrorMessage(error)));
  }
}

function* updateStudentExperienceSaga(
  action: PayloadAction<{ data: Partial<Experience> & { _id: ID }; index: ID }>,
) {
  try {
    const { index, data } = action.payload;
    const response: AxiosResponse<Experience> = yield call(
      updateExperience,
      index,
      data,
    );
    yield put(updateStudentExperienceSuccess(response.data));
    yield put(getStudentExperienceRequest());
  } catch (error) {
    yield put(updateStudentExperienceFailure(getErrorMessage(error)));
  }
}

/* ============================================================
   Skills
============================================================ */
function* getStudentSkillsSaga() {
  try {
    const response: AxiosResponse<Skill[]> = yield call(getSkills);
    yield put(getStudentSkllsSuccess(response.data));
  } catch (error) {
    yield put(getStudentSkllsFailure(getErrorMessage(error)));
  }
}

function* addStudentSkillsSaga(
  action: PayloadAction<Omit<Skill, '_id'> | Skill>,
) {
  try {
    const response: AxiosResponse<Skill> = yield call(addSkill, action.payload);
    yield put(addStudentSkillSuccess(response.data));
    yield put(getStudentSkllsRequest());
  } catch (error) {
    yield put(addStudentSkillFailure(getErrorMessage(error)));
  }
}

function* removeStudentSkillsSaga(action: PayloadAction<ID>) {
  try {
    yield call(removeSkill, action.payload);
    yield put(removeStudentSkillSuccess(action.payload));
    yield put(getStudentSkllsRequest());
  } catch (error) {
    yield put(removeStudentSkillFailure(getErrorMessage(error)));
  }
}

function* updateStudentSkillsSaga(
  action: PayloadAction<{ data: Partial<Skill> & { _id: ID }; index: ID }>,
) {
  try {
    const { skillId, skillData } = action.payload;
    const response: AxiosResponse<Skill> = yield call(
      updateSkill,
      skillId,
      skillData,
    );
    yield put(updateStudentSkillSuccess(response.data));
    yield put(getStudentSkllsRequest());
  } catch (error) {
    yield put(updateStudentSkillFailure(getErrorMessage(error)));
  }
}

/* ============================================================
   Projects
============================================================ */
function* getAllProjectsSaga() {
  try {
    const response: AxiosResponse<Project[]> = yield call(getAllProjects);
    yield put(getAllProjectsSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(getAllProjectsFailure(getErrorMessage(error)));
  }
}

function* addStudentProjectsSaga(
  action: PayloadAction<Omit<Project, '_id'> | Project>,
) {
  try {
    const response: AxiosResponse<Project> = yield call(
      addProject,
      action.payload,
    );
    yield put(addStudentProjectSuccess(response.data));
    yield put(getAllProjectsRequest());
  } catch (error) {
    yield put(addStudentProjectFailure(getErrorMessage(error)));
  }
}

function* updateStudentProjectsSaga(
  action: PayloadAction<{ data: Partial<Project> & { _id: ID }; index: ID }>,
) {
  try {
    const { index, data } = action.payload;
    const response: AxiosResponse<Project> = yield call(
      updateProject,
      index,
      data,
    );
    yield put(updateStudentProjectSuccess(response.data));
    yield put(getAllProjectsRequest());
  } catch (error) {
    yield put(updateStudentProjectFailure(getErrorMessage(error)));
  }
}

function* removeStudentProjectsSaga(action: PayloadAction<ID>) {
  try {
    yield call(removeProject, action.payload);
    yield put(removeStudentProjectSuccess(action.payload));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(removeStudentProjectFailure(getErrorMessage(error)));
  }
}

/* ============================================================
   Job Preference
============================================================ */
function* updateStudentJobPreferenceSaga(
  action: PayloadAction<Record<string, any>>,
) {
  try {
    const response: AxiosResponse = yield call(
      updateJobPreference,
      action.payload,
    );
    yield put(updateStudentJobPreferenceSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(updateStudentJobPreferenceFailure(getErrorMessage(error)));
  }
}

function* getStudentJobPreferenceSaga() {
  try {
    const response: AxiosResponse = yield call(recommendProfileJob);
    yield put(getStudentJobPreferenceSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(getStudentJobPreferenceFailure(getErrorMessage(error)));
  }
}

function* getStudentSavedJobsSaga() {
  try {
    const response: AxiosResponse = yield call(getAllSavedJobs);
    const payload = Array.isArray(response.data)
      ? response.data
      : response.data?.savedJobs ?? [];
    yield put(getAllSavedJobsSuccess(payload));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(getAllSavedJobsFailure(getErrorMessage(error)));
  }
}

function* getStudentResumeSaga() {
  try {
    const response: AxiosResponse = yield call(getResumeDetailsByResume);
    yield put(getStudentResumeSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(getStudentResumeFailure(getErrorMessage(error)));
  }
}

function* updateJobPreferedByStudentSaga(
  action: PayloadAction<Record<string, any>>,
) {
  try {
    yield call(updateJobPrefered, action.payload);
    yield put(updateJobPreferedByStudentSuccess());
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(updateJobPreferedByStudentFailure(getErrorMessage(error)));
  }
}

function* savedJobsSaga(action: PayloadAction<Record<string, any>>) {
  try {
    const response: AxiosResponse = yield call(saveJob, action.payload);
    yield put(savedStudentJobsSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(savedStudentJobsFailure(getErrorMessage(error)));
  }
}

function* visitedJobsSaga(action: PayloadAction<Record<string, any>>) {
  try {
    const response: AxiosResponse = yield call(visitedJobs, action.payload);
    yield put(visitedJobsSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(visitedJobsFailure(getErrorMessage(error)));
  }
}

function* viewedJobsSaga(action: PayloadAction<Record<string, any>>) {
  try {
    const response: AxiosResponse = yield call(viewedJobs, action.payload);
    yield put(viewedJobsSuccess(response.data));
    yield put(getStudentDetailsRequest());
  } catch (error) {
    yield put(viewedJobsFailure(getErrorMessage(error)));
  }
}

function* postStudentEventsSaga(action: PayloadAction<Record<string, any>>) {
  try {
    const response: AxiosResponse = yield call(studentEvents, action.payload);
    yield put(postStudentEventsSuccess(response.data));
  } catch (error) {
    yield put(postStudentEventsFailure(getErrorMessage(error)));
  }
}

function* getStudentEventsSaga(action: PayloadAction<Record<string, any>>) {
  try {
    const response: AxiosResponse = yield call(getStudentEvent, action.payload);
    yield put(getStudentEventsSuccess(response.data));
  } catch (error) {
    yield put(getStudentEventsFailure(getErrorMessage(error)));
  }
}

export function* studentWatcher() {
  // details
  yield takeLatest(getStudentDetailsRequest.type, getStudentDetailsSaga);

  // education
  yield takeLatest(getStudentEducationRequest.type, getStudentEducationSaga);
  yield takeLatest(addStudentEducationRequest.type, addStudentEducationSaga);
  yield takeLatest(
    removeStudentEducationRequest.type,
    removeStudentEducationSaga,
  );
  yield takeLatest(
    updateStudentEducationRequest.type,
    updateStudentEducationSaga,
  );

  // experience
  yield takeLatest(getStudentExperienceRequest.type, getStudentExperienceSaga);
  yield takeLatest(addStudentExperienceRequest.type, addStudentExperienceSaga);
  yield takeLatest(
    updateStudentExperienceRequest.type,
    updateStudentExperienceSaga,
  );
  yield takeLatest(
    removeStudentExperienceRequest.type,
    removeStudentExperienceSaga,
  );

  // skills
  yield takeLatest(getStudentSkllsRequest.type, getStudentSkillsSaga);
  yield takeLatest(addStudentSkillRequest.type, addStudentSkillsSaga);
  yield takeLatest(removeStudentSkillRequest.type, removeStudentSkillsSaga);
  yield takeLatest(updateStudentSkillRequest.type, updateStudentSkillsSaga);

  // projects
  yield takeLatest(getAllProjectsRequest.type, getAllProjectsSaga);
  yield takeLatest(addStudentProjectRequest.type, addStudentProjectsSaga);
  yield takeLatest(updateStudentProjectRequest.type, updateStudentProjectsSaga);
  yield takeLatest(removeStudentProjectRequest.type, removeStudentProjectsSaga);

  // job preference + saved jobs
  yield takeLatest(
    updateStudentJobPreferenceRequest.type,
    updateStudentJobPreferenceSaga,
  );
  yield takeLatest(
    getStudentJobPreferenceRequest.type,
    getStudentJobPreferenceSaga,
  );
  yield takeLatest(getAllSavedJobsRequest.type, getStudentSavedJobsSaga);

  // resume
  yield takeLatest(getStudentResumeRequest.type, getStudentResumeSaga);

  // prefer toggle
  yield takeLatest(
    updateJobPreferedByStudentRequest.type,
    updateJobPreferedByStudentSaga,
  );

  yield takeLatest(savedStudentJobsRequest.type, savedJobsSaga);
  yield takeLatest(visitedJobsRequest.type, visitedJobsSaga);
  yield takeLatest(viewedJobsRequest.type, viewedJobsSaga);

  yield takeLatest(postStudentEventsRequest.type, postStudentEventsSaga);
  yield takeLatest(postStudentEventsRequest.type, getStudentEventsSaga);
}
