import axios from 'axios';
import { SERVER } from '../app/config';
import { getToken, setToken } from './tokenManager';

const apiClient = axios.create({
  baseURL: SERVER,
});

// Clear all pending requests on logout
let pendingRequests = [];

// Add a request interceptor to add the token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
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

// Add a response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    // Remove request from pending list
    pendingRequests = pendingRequests.filter(
      source => source.token !== response.config.cancelToken
    );
    return response;
  },
  async (error) => {
    // Remove request from pending list
    if (error.config) {
      pendingRequests = pendingRequests.filter(
        source => source.token !== error.config.cancelToken
      );
    }

    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(`${SERVER}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });

        const newToken = response.data.token;
        
        // Update the token
        setToken(newToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and reject
        setToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to cancel all pending requests
export const cancelPendingRequests = () => {
  pendingRequests.forEach(source => {
    source.cancel('Request cancelled due to logout');
  });
  pendingRequests = [];
};

export default apiClient;
