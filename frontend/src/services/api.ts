import axios from 'axios';

export const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'http://144.91.114.195:30070'
    : 'http://144.91.114.195:30070';

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
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  // Add access token to requests if it exists
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  return config;
});

export default apiInstance;
