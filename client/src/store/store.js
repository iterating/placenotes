import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from '../lib/storage';
import authReducer from './authSlice';
import noteReducer from './noteSlice';
import messageReducer from './messageSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // only persist auth state
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    notes: noteReducer,
    messages: messageReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      },
    }),
});

export const persistor = persistStore(store);
export default store;