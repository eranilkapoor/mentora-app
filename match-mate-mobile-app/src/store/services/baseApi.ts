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
import { getApiBaseUrl, getClientVersion } from '../../core/utils/config';

const mutex = new Mutex();

/* ──────────────────────────────────────────────
 * Secure Storage Helpers
 * ────────────────────────────────────────────── */

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem('refreshToken') ?? null;
  }

  return SecureStore.getItemAsync('refreshToken');
}

export async function setRefreshToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem('refreshToken', token);
    return;
  }

  await SecureStore.setItemAsync('refreshToken', token);
}

export async function clearRefreshToken(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem('refreshToken');
    return;
  }

  await SecureStore.deleteItemAsync('refreshToken');
}

/* ──────────────────────────────────────────────
 * Base Query
 * ────────────────────────────────────────────── */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),

  credentials: 'include',

  prepareHeaders: async (headers, { getState }) => {
    const accessToken = (getState() as RootState).auth.accessToken;

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const deviceId = await getDeviceId();

    headers.set('X-Device-Id', deviceId);

    headers.set('X-Platform', Platform.OS);

    headers.set('X-Client-Version', getClientVersion());

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
    const refreshToken = await getRefreshToken();

    // Call logout API
    await rawBaseQuery(
      {
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include',
        headers: refreshToken
          ? {
              'X-Refresh-Token': refreshToken,
            }
          : undefined,
        body: refreshToken ? { refreshToken } : undefined,
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
        const refreshToken = await getRefreshToken();

        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            credentials: 'include',
            headers: refreshToken
              ? {
                  'X-Refresh-Token': refreshToken,
                }
              : undefined,
            body: refreshToken ? { refreshToken } : undefined,
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

          if (data.refreshToken) {
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
    'NotificationSettings',
    'Membership',
    'Payment',
    'Match',
    'Chat',
  ],

  endpoints: () => ({}),
});
