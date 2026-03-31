import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
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
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { authApi } from './services/authApi';
import { profileApi } from './services/profileApi';

/* ================= Root Reducer ================= */
const rootReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
});

/* ================= Persist Config ================= */
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist these reducers
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
    }).concat(authApi.middleware, profileApi.middleware), // ✅ add RTK Query middleware
});

/* ================= Persistor ================= */
export const persistor = persistStore(store);

/* ================= Types ================= */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/* ================= Hooks ================= */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
