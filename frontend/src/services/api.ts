import axios from 'axios';

const API_BASE_URL = "http://144.91.114.195:4000/" || 'http://localhost:8080';

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite retry loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Make refresh token request
        const refreshResponse = await axios.get(
          `${API_BASE_URL}/api/v1/auth/refresh-token`,
          {
            withCredentials: true,
          },
        );

        const { accessToken } = refreshResponse.data;

        // Store new access token
        localStorage.setItem('accessToken', accessToken);

        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;

        // Retry the original request
        return apiInstance(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear stored tokens and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
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
