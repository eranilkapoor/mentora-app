import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { Mutex } from 'async-mutex';

import { RootState } from '../index';

import { logout, setAccessToken } from '../slices/authSlice';

import { generateUUID, getDeviceId } from '../../core/utils/device';

const mutex = new Mutex();

/* ──────────────────────────────────────────────
 * Secure Storage Helpers
 * ────────────────────────────────────────────── */

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  return SecureStore.getItemAsync('refreshToken');
}

export async function setRefreshToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await SecureStore.setItemAsync('refreshToken', token);
}

export async function clearRefreshToken(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  await SecureStore.deleteItemAsync('refreshToken');
}

/* ──────────────────────────────────────────────
 * Base Query
 * ────────────────────────────────────────────── */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,

  credentials: 'include',

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
      process.env.EXPO_PUBLIC_CLIENT_VERSION ?? '1.0.0'
    );

    headers.set('X-Correlation-Id', generateUUID());

    headers.set('X-Request-Id', generateUUID());

    return headers;
  },
});

/* ──────────────────────────────────────────────
 * Perform Logout Cleanup
 * ────────────────────────────────────────────── */

async function performLogout(api: Parameters<BaseQueryFn>[1]): Promise<void> {
  try {
    const refreshToken =
      Platform.OS !== 'web' ? await getRefreshToken() : undefined;

    // Call logout API
    await rawBaseQuery(
      {
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include',
        body: Platform.OS !== 'web' ? { refreshToken } : undefined,
      },
      api,
      {}
    );
  } catch (error) {
    console.error('Logout API failed:', error);
  }

  await clearRefreshToken();

  api.dispatch(logout());
}

/* ──────────────────────────────────────────────
 * Base Query With Refresh Logic
 * ────────────────────────────────────────────── */

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  const isRefreshRequest =
    typeof args !== 'string' && args.url === '/auth/refresh';

  if (result.error?.status === 401 && !isRefreshRequest) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshToken =
          Platform.OS !== 'web' ? await getRefreshToken() : undefined;

        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            credentials: 'include',

            body: Platform.OS !== 'web' ? { refreshToken } : undefined,
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as {
            accessToken: string;
            refreshToken?: string;
          };

          /* Update Access Token */

          api.dispatch(setAccessToken(data.accessToken));

          /* Update Refresh Token */

          if (Platform.OS !== 'web' && data.refreshToken) {
            await setRefreshToken(data.refreshToken);
          }

          /* Retry Original Request */

          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          /* Refresh Failed */

          await performLogout(api);
        }
      } catch (error) {
        console.error('Refresh token error:', error);

        await performLogout(api);
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

/* ──────────────────────────────────────────────
 * API
 * ────────────────────────────────────────────── */

export const baseApi = createApi({
  reducerPath: 'baseApi',

  baseQuery: baseQueryWithAuth,

  tagTypes: [
    'Preference',
    'Profile',
    'ProfileMedia',
    'Auth',
    'AccountSettings',
    'PrivacySettings',
    'CommunicationSettings',
    'AccessibilitySettings',
    'AiSettings',
    'MediaSettings',
    'LocalizationSettings',
    'SecuritySettings',
  ],

  endpoints: () => ({}),
});
