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

  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

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

// apiInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         // Make sure to include credentials for refresh request
//         const refreshResponse = await axios.get(
//           `${API_BASE_URL}/api/v1/auth/refresh-token`,
//           {
//             withCredentials: true,
//           },
//         );

//         // Update the original request with new token
//         originalRequest.headers[
//           'Authorization'
//         ] = `Bearer ${refreshResponse.data.accessToken}`;

//         // Retry the original request
//         return apiInstance(originalRequest);
//       } catch (refreshError) {
//         // Handle refresh token failure (redirect to login, etc.)
//         window.location.href = '/login';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default apiInstance;
