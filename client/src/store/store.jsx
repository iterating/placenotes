import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import notesReducer from './noteSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
