import { setToken, setUser, logout } from '../store/authSlice';
import { getToken, validateToken } from './tokenManager';
import { SERVER } from '../app/config';

export const initializeAuth = async (store) => {
  const token = getToken();
  
  if (!token) {
    store.dispatch(logout());
    return;
  }

  // Validate token before attempting to use it
  if (!validateToken(token)) {
    store.dispatch(logout());
    return;
  }

  try {
    // Set the token in Redux store
    store.dispatch(setToken(token));
    
    // Fetch user data
    const response = await fetch(`${SERVER}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      store.dispatch(setUser(userData));
    } else if (response.status === 401) {
      // Token is invalid or expired
      store.dispatch(logout());
    } else {
      // Other errors - don't logout, just log the error
      console.error('Error fetching user data:', response.statusText);
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
    // Only logout on auth-related errors, not on network errors
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
  }
};
