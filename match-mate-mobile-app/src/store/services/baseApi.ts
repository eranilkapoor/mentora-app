import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { RootState } from '../index';
import { Platform } from 'react-native';
import { getDeviceId, generateUUID } from '../../core/utils/device';
import { logout, setAccessToken } from '../slices/authSlice';

import { Mutex } from 'async-mutex';

// 👉 For mobile secure storage
import * as SecureStore from 'expo-secure-store';

const mutex = new Mutex();

// 🔐 Refresh token getter (Mobile only)
const getRefreshToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') return null;
  return await SecureStore.getItemAsync('refreshToken');
};

// 🔹 Base Query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
  credentials: 'include', // sends cookies on every request
  prepareHeaders: async (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const deviceId = await getDeviceId();

    headers.set('X-Device-Id', deviceId);
    headers.set('X-Platform', Platform.OS);
    headers.set(
      'X-Client-Version',
      (process.env.EXPO_PUBLIC_CLIENT_VERSION as string) ?? '1.0.0'
    );
    headers.set('X-Correlation-Id', generateUUID());
    headers.set('X-Request-Id', generateUUID());

    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            ...(Platform.OS !== 'web'
              ? {
                  body: {
                    refreshToken: await getRefreshToken(), // from SecureStore / AsyncStorage
                  },
                }
              : {}),
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as {
            accessToken: string;
            refreshToken?: string;
          };

          // ✅ Update access token
          api.dispatch(setAccessToken(data.accessToken));

          // 🔄 Update refresh token (if provided)
          if (Platform.OS !== 'web' && data.refreshToken) {
            await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          }

          // 🔁 Retry original request
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // ❌ Refresh failed → logout
          api.dispatch(logout());
          if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync('refreshToken');
          }
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        api.dispatch(logout());
        if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync('refreshToken');
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

// 🔹 Base API
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Preference', 'Profile', 'Auth'],
  endpoints: () => ({}),
});
