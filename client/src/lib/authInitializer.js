import { setToken, setUser } from '../store/authSlice';
import { getToken } from './tokenManager';
import { SERVER } from '../app/config';

export const initializeAuth = async (store) => {
  const token = getToken();
  
  if (token) {
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
      } else {
        // If token is invalid, clear it
        store.dispatch(setToken(null));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      store.dispatch(setToken(null));
    }
  }
};
