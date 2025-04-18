import { createSlice } from '@reduxjs/toolkit';

// Get initial state from localStorage if available
const getInitialState = () => {
  try {
    const persistedToken = localStorage.getItem('token');
    const persistedUser = localStorage.getItem('user');
    
    return {
      token: persistedToken || null,
      user: persistedUser ? JSON.parse(persistedUser) : null,
      isAuthenticated: Boolean(persistedToken),
      notes: [],
      loading: false,
      error: null
    };
  } catch (error) {
    console.error('Error loading persisted state:', error);
    return {
      token: null,
      user: null,
      isAuthenticated: false,
      notes: [],
      loading: false,
      error: null
    };
  }
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
      state.error = null;
      
      // Persist to localStorage
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    setToken(state, action) {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(state.token);
    },
    setNotes(state, action) {
      state.notes = action.payload;
    },
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      const { token, user } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.token = token;
      state.error = null;
      
      // Persist to localStorage
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.notes = [];
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.notes = [];
      state.loading = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { 
  setCredentials,
  setToken, 
  setUser, 
  setNotes,
  loginStart,
  loginSuccess,
  loginFailure,
  logout 
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;
export const selectNotes = (state) => state.auth.notes;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;