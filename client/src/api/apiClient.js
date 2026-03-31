import { SERVER } from '../app/config';
import store from '../store/store';
import { logout, setToken } from '../store/authSlice';
import { validateToken } from '../lib/tokenManager';
import { showToast } from '../components/ToastManager';

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

// Create fetch wrapper with request interceptor logic
const createFetchConfig = (url, options = {}) => {
  // First try to get token from Redux store
  let token = store.getState().auth.token;
  
  // If no token in store, try localStorage as fallback
  if (!token) {
    token = localStorage.getItem('token');
    
    // If found in localStorage but not in store, update the store
    if (token) {
      store.dispatch(setToken(token));
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add token to request headers if available
  if (token) {
    // Validate token before using it
    if (validateToken(token)) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      store.dispatch(setToken(null));
      console.warn('Invalid token detected and removed');
    }
  }

  // Create AbortController for request cancellation
  const controller = new AbortController();
  pendingRequests.push(controller);

  return {
    url: `${SERVER}${url}`,
    config: {
      ...options,
      headers,
      signal: controller.signal,
    },
    controller,
  };
};

// Fetch wrapper with error handling and token refresh
const fetchWithInterceptor = async (url, options = {}) => {
  const { url: fullUrl, config, controller } = createFetchConfig(url, options);
  
  try {
    const response = await fetch(fullUrl, config);
    
    // Remove controller from pending list
    pendingRequests = pendingRequests.filter(c => c !== controller);
    
    // Check if the URL contains 'notes' to prevent logout on note editing
    const isNoteEditRequest = url.includes('/notes/') || url.includes('/notes/new');
    
    // Handle 401 errors with token refresh
    if (response.status === 401 && !options._retry) {
      if (isRefreshing) {
        try {
          // Wait for the refresh to complete
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          // Retry with new token
          const retryHeaders = { ...config.headers, Authorization: `Bearer ${token}` };
          return fetchWithInterceptor(url, { ...options, headers: retryHeaders });
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
          throw err;
        }
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${SERVER}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.getState().auth.token}`
          },
        });
        
        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed');
        }
        
        const { token } = await refreshResponse.json();
        
        if (validateToken(token)) {
          store.dispatch(setToken(token));
          showToast({
            message: 'Session refreshed successfully',
            type: 'success',
            duration: 3000
          });
          processQueue(null, token);
          
          // Retry original request with new token
          const retryHeaders = { ...config.headers, Authorization: `Bearer ${token}` };
          return fetchWithInterceptor(url, { ...options, headers: retryHeaders, _retry: true });
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
            duration: 0
          });
        }
        
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other error status codes
    if (response.status === 403) {
      showToast({
        message: 'You don\'t have permission to perform this action',
        type: 'error',
        duration: 5000
      });
    } else if (response.status >= 500) {
      showToast({
        message: 'Server error. Please try again later.',
        type: 'error',
        duration: 5000
      });
    }
    
    // Parse response based on content type
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = {
        status: response.status,
        data: await response.json().catch(() => null)
      };
      throw error;
    }
    
    const data = await response.json();
    return { data, status: response.status, headers: response.headers };
  } catch (error) {
    // Remove controller from pending list
    pendingRequests = pendingRequests.filter(c => c !== controller);
    throw error;
  }
};

// Create axios-like API client interface
const apiClient = {
  get: (url, config = {}) => fetchWithInterceptor(url, { ...config, method: 'GET' }),
  post: (url, data, config = {}) => fetchWithInterceptor(url, { 
    ...config, 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (url, data, config = {}) => fetchWithInterceptor(url, { 
    ...config, 
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (url, data, config = {}) => fetchWithInterceptor(url, { 
    ...config, 
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (url, config = {}) => fetchWithInterceptor(url, { ...config, method: 'DELETE' }),
};

// Function to cancel all pending requests
export const cancelPendingRequests = () => {
  pendingRequests.forEach((controller) => {
    controller.abort();
  });
  pendingRequests = [];
};

export { apiClient };