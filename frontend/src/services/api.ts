'use client';

import axios from 'axios';

console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_NODE_ENV);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : 'http://dev.api.zobsai.com';

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

  // Add access token to requests if it exists
  const accessToken = safeLocalStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

export default apiInstance;
