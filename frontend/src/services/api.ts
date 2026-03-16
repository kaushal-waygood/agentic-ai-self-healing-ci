'use client';

import { getToken } from '@/hooks/useToken';
import { logoutRequest } from '@/redux/reducers/authReducer';
import store from '@/redux/store';
import axios from 'axios';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
      ? 'https://api.dev.zobsai.com'
      : 'http://127.0.0.1:8080';

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://zobsai.com'
    : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
      ? 'https://api.zobsai.com'
      : 'http://127.0.0.1:3000';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('localStorage access error:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage access error:', error);
    }
  },
};

const apiInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  const accessToken = getToken();

  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    delete config.headers['Authorization'];
  }

  return config;
});

let isLoggingOut = false;

apiInstance.interceptors.response.use(
  (response) => {
    isLoggingOut = false;
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const message = (error.response?.data?.message || '').toLowerCase();
    const url = error.config?.url || '';

    const isPublicRoute = url.includes('/jobs') || url.includes('/jobs/find');
    // On 401 or Token expired 403, simply logout immediately.
    const isTokenError =
      (status === 401 &&
        !error.config?.url?.includes('/user/me/password/change')) ||
      status === 402 ||
      (status === 403 &&
        (message.includes('expired') ||
          message.includes('invalid or expired')));

    // if (isTokenError && !isLoggingOut) {
    //   isLoggingOut = true;
    //   delete apiInstance.defaults.headers.common['Authorization'];
    //   store.dispatch(logoutRequest());
    // }

    if (isTokenError && !isLoggingOut && !isPublicRoute) {
      isLoggingOut = true;
      delete apiInstance.defaults.headers.common['Authorization'];
      store.dispatch(logoutRequest());
    }

    return Promise.reject(error);
  },
);

export default apiInstance;
