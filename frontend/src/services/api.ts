'use client';

import { getToken, getRefreshToken } from '@/hooks/useToken';
import { logoutRequest, setTokens } from '@/redux/reducers/authReducer';
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

const refreshTokensApi = async (refreshToken: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/v1/user/refresh`, {
    refreshToken,
  });
  return response.data;
};

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
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

apiInstance.interceptors.response.use(
  (response) => {
    isLoggingOut = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = (error.response?.data?.message || '').toLowerCase();

    // Attempt refresh on auth-related errors: 401, 402, or 403 (token expired/invalid)
    // For 403, only refresh when it's a token error (not role-based "Access denied")
    const isTokenError =
      status === 401 ||
      status === 402 ||
      (status === 403 &&
        (message.includes('expired') || message.includes('invalid or expired')));

    if (!isTokenError) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        delete apiInstance.defaults.headers.common['Authorization'];
        store.dispatch(logoutRequest());
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        delete apiInstance.defaults.headers.common['Authorization'];
        store.dispatch(logoutRequest());
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiInstance(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const data = await refreshTokensApi(refreshToken);

      store.dispatch(
        setTokens({
          token: data.accessToken,
          refreshToken: data.refreshToken,
        }),
      );

      isRefreshing = false;
      onRefreshed(data.accessToken);

      originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;

      return apiInstance(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshed(null);

      if (!isLoggingOut) {
        isLoggingOut = true;
        delete apiInstance.defaults.headers.common['Authorization'];
        store.dispatch(logoutRequest());
      }

      return Promise.reject(refreshError);
    }
  },
);

export default apiInstance;
