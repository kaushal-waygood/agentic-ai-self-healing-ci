import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production'
    ? 'http://144.91.114.195:4000'
    : 'http://localhost:8080';

const apiInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
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

// Response Interceptor - simply handle errors without token refresh
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors by clearing auth and redirecting to login
    if (error.response?.status === 401) {
      clearAuth();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

// Helper function to clear authentication
export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  // You might also want to clear other auth-related storage
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  return !!token;
};

// Helper function to get access token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to set access token (useful after login)
export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export default apiInstance;
