'use client';

import axios from 'axios';

// The API_BASE_URL logic is correct.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'https://api.zobsai.com'
    : 'https://api.zobsai.com';

const apiInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    Accept: 'application/json',
  },
  // This is the key part for cookie-based authentication.
  withCredentials: true,
});

apiInstance.interceptors.request.use((config) => {
  // This logic for FormData is fine to keep.
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  // --- REMOVED SECTION ---
  // The browser will automatically attach the httpOnly cookie.
  // You do NOT need to set the Authorization header manually.
  /*
  const accessToken = safeLocalStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  */

  return config;
});

export default apiInstance;
