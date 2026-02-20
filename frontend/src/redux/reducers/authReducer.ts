/** @format */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../types/authType';

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  message: '',
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;

      // Instead of state.user = action.payload.user
      // Pick only what you actually need for the UI
      const { _id, fullName, email, dailyStreak } = action.payload.user;
      state.user = { _id, fullName, email, dailyStreak };
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    googleLoginSuccess: (
      state,
      action: PayloadAction<{ user: any; token: string }>,
    ) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },

    signupRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    signupSuccess: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>,
    ) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    getProfileRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getProfileSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    getProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    changePasswordRequest: (state, action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.message = 'Password changed successfully';
      state.error = null;
    },
    changePasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    logoutRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    getGetMeRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getGetMeSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      // IMPORTANT: We do NOT touch state.token here, so it stays persisted
      state.error = null;
    },
    getGetMeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    verifyEmailRequest: (
      state,
      action: PayloadAction<{ email: string; otp: string }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    verifyEmailSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    verifyEmailFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    setUserGoogleAuth: (state, action) => {
      if (state.user) {
        state.user.googleAuth = action.payload;
      }
    },

    loginHistoryRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginHistorySuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = null;
    },
    loginHistoryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,

  signupRequest,
  signupSuccess,
  signupFailure,

  getProfileRequest,
  getProfileSuccess,
  getProfileFailure,

  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,

  logoutRequest,
  logoutSuccess,
  logoutFailure,
  setUserGoogleAuth,

  getGetMeRequest,
  getGetMeSuccess,
  getGetMeFailure,

  verifyEmailRequest,
  verifyEmailSuccess,
  verifyEmailFailure,

  loginHistoryRequest,
  loginHistorySuccess,
  loginHistoryFailure,

  googleLoginSuccess,
} = authSlice.actions;
export default authSlice.reducer;
