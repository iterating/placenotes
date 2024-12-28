import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import noteSlice from './noteSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    notes: noteSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
