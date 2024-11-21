import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import noteSlice from './noteSlice';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    notes: noteSlice.reducer,
  },
});

export default store;