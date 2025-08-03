/** @format */

import { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  signupSuccess,
  signupFailure,
  signupRequest,
  getProfileSuccess,
  getProfileFailure,
  getProfileRequest,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
} from '../reducers/authReducer';
import { changePassword, getProfile, login, signup } from '@/services/api/auth';

function* loginSaga(
  action: PayloadAction<{ email: string; password: string }>,
): SagaIterator {
  try {
    const response = yield call(login, action.payload);

    const { user, token } = response.data;
    yield put(loginSuccess({ user, token }));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    yield put(loginFailure(errorMessage));
  }
}

function* signupSaga(
  action: PayloadAction<{
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
    accountType: string;
    jobPreference: string;
    organizationName: string;
    referralCode: string;
  }>,
): SagaIterator {
  try {
    const response = yield call(signup, action.payload);
    console.log('Signup response:', response);

    const { data } = response;

    yield put(signupSuccess({ user }));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Signup failed';
    yield put(signupFailure(errorMessage));
  }
}

function* getUserProfileSaga(): SagaIterator {
  try {
    const response = yield call(getProfile);

    const userProfile = response.data;
    yield put(getProfileSuccess(userProfile));
  } catch (error: unknown) {
    console.log('Error fetching user profile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch user profile';
    yield put(getProfileFailure(errorMessage));
  }
}

function* changePasswordSaga(action: PayloadAction<any>): SagaIterator {
  try {
    console.log(action.payload);
    const response = yield call(changePassword, action.payload);
    yield put(changePasswordSuccess(response.data));
  } catch (error: unknown) {
    console.log('Error changing password:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to change password';
    yield put(changePasswordFailure(errorMessage));
  }
}

export function* watchAuth(): SagaIterator {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(signupRequest.type, signupSaga);
  yield takeLatest(getProfileRequest.type, getUserProfileSaga);
  yield takeLatest(changePasswordRequest.type, changePasswordSaga);
}
