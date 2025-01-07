import axios from 'axios';
import { SERVER } from '../app/config';
import store from '../store/store';
import { logout } from '../store/authSlice';
import { validateToken, setToken } from '../lib/tokenManager';

const apiClient = axios.create({
  baseURL: SERVER,
});

// Clear all pending requests on logout
let pendingRequests = [];
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor to add the token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    
    // Validate token before using it
    if (token && validateToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request to pending list
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    pendingRequests.push(source);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Remove request from pending list
    if (response.config.cancelToken) {
      pendingRequests = pendingRequests.filter(
        (source) => source.token !== response.config.cancelToken
      );
    }
    return response;
  },
  async (error) => {
    // Remove request from pending list
    if (error.config?.cancelToken) {
      pendingRequests = pendingRequests.filter(
        (source) => source.token !== error.config.cancelToken
      );
    }

    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          // Wait for the refresh to complete
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post('/auth/refresh', {
          token: store.getState().auth.token
        });
        const { token } = response.data;
        
        if (validateToken(token)) {
          store.dispatch(setToken(token));
          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid refresh token');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Function to cancel all pending requests
export const cancelPendingRequests = () => {
  pendingRequests.forEach((source) => {
    source.cancel('Request cancelled due to logout');
  });
  pendingRequests = [];
};

export { apiClient };