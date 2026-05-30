import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import settingsReducer from './slices/settings.slice';
import chatsReducer from './slices/chats.slice';
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
import { baseApi } from './services/baseApi.service';
import { setupListeners } from '@reduxjs/toolkit/query/react';

/* ================= Persist Config ================= */
const persistConfig = {
  key: 'root-v2',
  storage: AsyncStorage,
  whitelist: [],
};
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['accessToken', 'user'],
};

const settingsPersistConfig = {
  key: 'settings',
  storage: AsyncStorage,
};

/* ================= Root Reducer ================= */
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  chats: chatsReducer, // No persistence for chats
});

/* ================= Persisted Reducer ================= */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/* ================= Store ================= */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

/* ================= Persistor ================= */
export const persistor = persistStore(store);

/* ================= Types ================= */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
