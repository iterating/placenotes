import axios from 'axios';
import { SERVER } from '../app/config';
import store from '../store/store';
import { logout } from '../store/authSlice';
import { validateToken, setToken } from '../lib/tokenManager';
import { showToast } from '../components/ToastManager';

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

    // Check if the URL contains 'notes' to prevent logout on note editing
    const isNoteEditRequest = originalRequest.url && (
      originalRequest.url.includes('/notes/') || 
      originalRequest.url.includes('/notes/new')
    );

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
          // Don't automatically logout for note edit requests
          if (!isNoteEditRequest) {
            store.dispatch(logout());
            showToast({
              message: 'Your session has expired. Please log in again.',
              type: 'error',
              duration: 7000
            });
          } else {
            showToast({
              message: 'Authentication issue detected. Your work is safe, but you may need to login again soon.',
              type: 'warning',
              duration: 10000
            });
          }
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await apiClient.post('/api/auth/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${store.getState().auth.token}`
          }
        });
        const { token } = response.data;
        
        if (validateToken(token)) {
          store.dispatch(setToken(token));
          showToast({
            message: 'Session refreshed successfully',
            type: 'success',
            duration: 3000
          });
          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid refresh token');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Don't automatically logout for note edit requests
        if (!isNoteEditRequest) {
          store.dispatch(logout());
          showToast({
            message: 'Your session has expired. Please log in again.',
            type: 'error',
            duration: 7000
          });
        } else {
          console.warn('Token refresh failed during note edit. Continuing without logout.');
          showToast({
            message: 'Please save your changes! Your session is expiring but we\'re keeping you logged in to finish this edit.',
            type: 'warning',
            duration: 0 // Won't auto-dismiss
          });
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } else if (error.response?.status === 403) {
      showToast({
        message: 'You don\'t have permission to perform this action',
        type: 'error',
        duration: 5000
      });
    } else if (error.response?.status >= 500) {
      showToast({
        message: 'Server error. Please try again later.',
        type: 'error',
        duration: 5000
      });
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