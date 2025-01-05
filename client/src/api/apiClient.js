import axios from 'axios';
import { SERVER } from '../app/config';
import { getToken, setToken } from '../lib/tokenManager';

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

// Add a response interceptor to handle token updates and errors
apiClient.interceptors.response.use(
  (response) => {
    // Remove request from pending list
    if (response.config.cancelToken) {
      pendingRequests = pendingRequests.filter(
        (source) => source.token !== response.config.cancelToken
      );
    }

    // Check for new token in response headers
    const newToken = response.headers['x-auth-token'];
    if (newToken) {
      setToken(newToken);
    }

    return response;
  },
  (error) => {
    // Remove request from pending list
    if (error.config?.cancelToken) {
      pendingRequests = pendingRequests.filter(
        (source) => source.token !== error.config.cancelToken
      );
    }

    // Handle token expiration
    if (error.response?.status === 401) {
      setToken(null);
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

export default apiClient;
