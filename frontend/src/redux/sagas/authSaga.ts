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
  loginHistoryRequest,
  loginHistorySuccess,
  loginHistoryFailure,
} from '../reducers/authReducer';
import {
  changePassword,
  getMe,
  getProfile,
  login,
  loginHistory,
  logout,
  signup,
  verifyEmail,
} from '@/services/api/auth';

function* loginSaga(
  action: PayloadAction<{ email: string; password: string }>,
): SagaIterator {
  try {
    const response = yield call(login, action.payload);
    const { user, accessToken: token, refreshToken } = response.data;
    yield put(loginSuccess({ user, token, refreshToken }));
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

function* getGetMeSaga(token: string): SagaIterator {
  try {
    const response = yield call(getMe, token.payload);

    yield put(getGetMeSuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch user profile';
    yield put(getGetMeFailure(errorMessage));
  }
}

function* logoutSaga(): SagaIterator {
  const Router = require('next/router');
  const { clearDashboardCache } = require('@/lib/dashboardCache');
  try {
    clearDashboardCache();
    localStorage.removeItem('persist:root');
    localStorage.clear();
    yield put(logoutSuccess());
    Router.push('/login');
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
    const response = yield call(verifyEmail, action.payload);
    const { user, accessToken: token, refreshToken } = response.data;
    yield put(verifyEmailSuccess({ user, token, refreshToken }));
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error.message || 'Verification failed';
    yield put(verifyEmailFailure(errorMessage));
  }
}

function* loginHistorySaga(action: PayloadAction<any>): SagaIterator {
  try {
    const response = yield call(loginHistory, action.payload);
    yield put(loginHistorySuccess(response.data));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch login history';
    yield put(loginHistoryFailure(errorMessage));
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
  yield takeLatest(loginHistoryRequest.type, loginHistorySaga);
}
