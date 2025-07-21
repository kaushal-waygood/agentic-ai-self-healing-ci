import {
  addOrganizationMemberRequest,
  addOrganizationMemberSuccess,
  addOrganizationMemberFailure,
  editOrganizationMemberRequest,
  editOrganizationMemberSuccess,
  editOrganizationMemberFailure,
  getAllOrganizationMemberRequest,
  getAllOrganizationMembersSuccess,
  getAllOrganizationMembersFailure,
  deleteOrganizationMemberRequest,
  deleteOrganizationMemberSuccess,
  deleteOrganizationMemberFailure,
  filterOrganizationMemberRequest,
  filterOrganizationMemberSuccess,
  filterOrganizationMemberFailure,
  getAllOrgMembersUniqueDepartmentsRequest,
  getAllOrgMembersUniqueDepartmentsSuccess,
  getAllOrgMembersUniqueDepartmentsFailure,
  getAllOrgMembersUniqueCourseRequest,
  getAllOrgMembersUniqueCourseSuccess,
  getAllOrgMembersUniqueCourseFailure,
} from '../reducers/organizationsReducer';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  addOrganizationMember,
  editOrganizationMember,
  deleteOrganizationMember,
  filterOrganizationMembers,
  getOrganizationMembers,
  getAllOrgMembersUniqueDepartments,
  getAllOrgMembersUniqueCourses,
} from '@/services/api/organizations';
import { AxiosResponse } from 'axios';

function* handleAddOrganizationMember(
  action: PayloadAction<{
    fullName: string;
    email: string;
    role: string;
    department: string;
    course: string;
  }>,
) {
  try {
    const response: AxiosResponse = yield call(
      addOrganizationMember,
      action.payload,
    );
    yield put(addOrganizationMemberSuccess(response.data));
  } catch (error: any) {
    yield put(
      addOrganizationMemberFailure(error.message || 'Failed to add member'),
    );
  }
}

function* handleEditOrganizationMember(
  action: PayloadAction<{
    fullName: string;
    email: string;
    role: string;
    department: string;
    course: string;
  }>,
) {
  try {
    const response: AxiosResponse = yield call(
      editOrganizationMember,
      action.payload,
    );
    yield put(editOrganizationMemberSuccess(response.data));
  } catch (error: any) {
    yield put(
      editOrganizationMemberFailure(error.message || 'Failed to add member'),
    );
  }
}

function* getOrganizationsMemberSaga() {
  try {
    const response: AxiosResponse = yield call(getOrganizationMembers);
    yield put(getAllOrganizationMembersSuccess(response.data.members));
  } catch (error: unknown | Error) {
    console.error('Saga error:', error);
    yield put(getAllOrganizationMembersFailure((error as Error).message));
  }
}

function* deleteOrganizationMemberSaga(action: PayloadAction<{ id: string }>) {
  try {
    const response: AxiosResponse = yield call(
      deleteOrganizationMember,
      action.payload.id,
    );

    yield put(deleteOrganizationMemberSuccess({ id: action.payload.id }));
  } catch (error: any) {
    yield put(
      deleteOrganizationMemberFailure(
        error.message || 'Failed to delete member',
      ),
    );
  }
}

function* filterOrganizationMemberSaga(action: PayloadAction<FilterPayload>) {
  try {
    const params = new URLSearchParams();

    // Dynamically build query string
    for (const key in action.payload) {
      const value = action.payload[key as keyof FilterPayload];
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    }

    const response: AxiosResponse = yield call(
      filterOrganizationMembers,
      params.toString(), // send as query string
    );

    yield put(filterOrganizationMemberSuccess(response.data.members));
  } catch (error: unknown | Error) {
    console.error('Saga error:', error);
    yield put(filterOrganizationMemberFailure((error as Error).message));
  }
}

function* getAllOrgMembersUniqueDepartmentsSaga() {
  try {
    const response: AxiosResponse = yield call(
      getAllOrgMembersUniqueDepartments,
    );

    yield put(
      getAllOrgMembersUniqueDepartmentsSuccess(response.data.departments),
    );
  } catch (error: unknown | Error) {
    console.error('Saga error:', error);
    yield put(
      getAllOrgMembersUniqueDepartmentsFailure(
        (error as Error).message || 'Failed to fetch unique departments',
      ),
    );
  }
}

function* getAllOrgMembersUniqueCourseSaga() {
  try {
    const response: AxiosResponse = yield call(getAllOrgMembersUniqueCourses);

    yield put(getAllOrgMembersUniqueCourseSuccess(response.data.courses));
  } catch (error: unknown | Error) {
    console.error('Saga error:', error);
    yield put(
      getAllOrgMembersUniqueCourseFailure(
        (error as Error).message || 'Failed to fetch unique departments',
      ),
    );
  }
}

export function* organizationWatcher() {
  yield takeLatest(
    addOrganizationMemberRequest.type,
    handleAddOrganizationMember,
  );

  yield takeLatest(
    editOrganizationMemberRequest.type,
    handleEditOrganizationMember,
  );
  yield takeLatest(
    getAllOrganizationMemberRequest.type,
    getOrganizationsMemberSaga,
  );
  yield takeLatest(
    deleteOrganizationMemberRequest.type,
    deleteOrganizationMemberSaga,
  );
  yield takeLatest(
    filterOrganizationMemberRequest.type,
    filterOrganizationMemberSaga,
  );
  yield takeLatest(
    getAllOrgMembersUniqueDepartmentsRequest.type,
    getAllOrgMembersUniqueDepartmentsSaga,
  );
  yield takeLatest(
    getAllOrgMembersUniqueCourseRequest.type,
    getAllOrgMembersUniqueCourseSaga,
  );
}
