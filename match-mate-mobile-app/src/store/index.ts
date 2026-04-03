import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { baseApi } from './services/baseApi';
import { setupListeners } from '@reduxjs/toolkit/query/react';

/* ================= Root Reducer ================= */
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  settings: settingsReducer,
});

/* ================= Persist Config ================= */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'], // Only persist these reducers
};

/* ================= Persisted Reducer ================= */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ================= Store ================= */
export const store = configureStore({
  reducer: persistedReducer, // ✅ wrapped reducer
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware), // ✅ add RTK Query middleware
});

setupListeners(store.dispatch);

/* ================= Persistor ================= */
export const persistor = persistStore(store);

/* ================= Types ================= */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
