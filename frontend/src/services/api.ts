'use client';

import { getToken } from '@/hooks/useToken';
import { logoutRequest } from '@/redux/reducers/authReducer';
import store from '@/redux/store';
import axios from 'axios';

console.log("TEST", process.env.NEXT_PUBLIC_NODE_ENV);

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
      ? 'https://api.dev.zobsai.com'
      : 'https://api.dev.zobsai.com';

const token = getToken();

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
    Authorization: `Bearer ${token}`,
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
  }

  return config;
});

let isLoggingOut = false;

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // if (error.response?.status === 403 && !isLoggingOut) {
    //   isLoggingOut = true;

    //   delete apiInstance.defaults.headers.common['Authorization'];
    //   store.dispatch(logoutRequest());
    // }
    // return Promise.reject(error);
    if (
      error.response?.status === 403 &&
      !isLoggingOut &&
      error.response?.data?.message?.toLowerCase().includes('token')
    ) {
      isLoggingOut = true;
      delete apiInstance.defaults.headers.common['Authorization'];
      store.dispatch(logoutRequest());
    }
    return Promise.reject(error);
  },
);

export default apiInstance;
