import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import noteSlice from './noteSlice';

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    notes: noteSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;