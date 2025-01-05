import { createSlice } from '@reduxjs/toolkit';
import { setToken as setTokenInManager } from '../lib/tokenManager';

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
  notes: [],
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      if (action.payload) {
        setTokenInManager(action.payload);
      } else {
        setTokenInManager(null);
      }
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setNotes(state, action) {
      state.notes = action.payload;
    },
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.notes = action.payload.notes || [];
      setTokenInManager(action.payload.token);
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.notes = [];
      setTokenInManager(null);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.notes = [];
      state.error = null;
      state.loading = false;
      setTokenInManager(null);
      localStorage.clear();
      sessionStorage.clear();
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