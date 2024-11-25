import { configureStore } from '@reduxjs/toolkit';
import {produce} from 'immer';
import authSlice from './authSlice';
import noteSlice from './noteSlice';

const initialState = {
  notes: [],
  currentLocation: null,
};

const notesReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };

    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    notes: notesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;
