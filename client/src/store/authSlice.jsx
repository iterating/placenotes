import { createSlice } from '@reduxjs/toolkit';
import { setToken as setTokenInManager, getToken } from '../lib/tokenManager';

// Get initial token from localStorage
const storedToken = localStorage.getItem('token');

const initialState = {
  token: storedToken,
  user: null,
  isAuthenticated: Boolean(storedToken),
  notes: [],
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      const token = action.payload;
      state.token = token;
      state.isAuthenticated = Boolean(token);
      
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
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
      localStorage.setItem('token', token);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.notes = [];
      localStorage.removeItem('token');
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.notes = [];
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
    }
  }
});

export const { 
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