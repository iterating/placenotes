import { createSlice } from '@reduxjs/toolkit';

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
    setCredentials: (state, { payload: { token, user } }) => {
      state.token = token;
      state.user = user;
      state.isAuthenticated = Boolean(token);
      state.error = null;
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
    }
  }
});

export const { 
  setCredentials,
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