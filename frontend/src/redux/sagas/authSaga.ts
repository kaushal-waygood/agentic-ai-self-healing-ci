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
  logoutSuccess,
  logoutFailure,
  logoutRequest,
  getGetMeRequest,
  getGetMeSuccess,
  getGetMeFailure,
  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,
} from '../reducers/authReducer';
import {
  changePassword,
  getMe,
  getProfile,
  login,
  logout,
  signup,
  verifyEmail,
} from '@/services/api/auth';

function* loginSaga(
  action: PayloadAction<{ email: string; password: string }>,
): SagaIterator {
  try {
    const response = yield call(login, action.payload);

    const { user, accessToken: token } = response.data;
    localStorage.setItem('accessToken', token);
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

    const { data } = response;

    yield put(signupSuccess({ user: data.user, token: data.accessToken }));
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
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch user profile';
    yield put(getProfileFailure(errorMessage));
  }
}

function* changePasswordSaga(action: PayloadAction<any>): SagaIterator {
  try {
    const response = yield call(changePassword, action.payload);
    yield put(changePasswordSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to change password';
    yield put(changePasswordFailure(errorMessage));
  }
}

function* getGetMeSaga(): SagaIterator {
  try {
    const response = yield call(getMe);
    yield put(getGetMeSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch user profile';
    yield put(getGetMeFailure(errorMessage));
  }
}

function* logoutSaga(): SagaIterator {
  const Router = require('next/router');
  try {
    yield call(logout);

    // 🔥 Clear all client-side auth traces
    localStorage.removeItem('persist:root');
    localStorage.removeItem('accessToken');
    yield put(logoutSuccess());
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Logout failed';
    yield put(logoutFailure(errorMessage));
  }
}

function* verifyEmailSaga(
  action: PayloadAction<{ email: string; otp: string }>,
): SagaIterator {
  try {
    // Pass the payload (email, otp) to the API call
    const response = yield call(verifyEmail, action.payload);
    console.log(response);

    // Assuming backend returns { user, accessToken }
    const { user, accessToken: token } = response.data;

    // Set token in storage
    localStorage.setItem('accessToken', token);

    // Dispatch success to Redux
    yield put(verifyEmailSuccess({ user, token }));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error.message || 'Verification failed';
    yield put(verifyEmailFailure(errorMessage));
  }
}

export function* watchAuth(): SagaIterator {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(signupRequest.type, signupSaga);
  yield takeLatest(getProfileRequest.type, getUserProfileSaga);
  yield takeLatest(changePasswordRequest.type, changePasswordSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(getGetMeRequest.type, getGetMeSaga);
  yield takeLatest(verifyEmailRequest.type, verifyEmailSaga);
}
