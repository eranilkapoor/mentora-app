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

import { logout, setAccessToken } from '../slices/auth.slice';

import { generateUUID, getDeviceId } from '../../core/utils/device';
import config, {
  getApiBaseUrl,
  getClientVersion,
} from '../../core/utils/config';
import { reportError } from '@/core/utils/errorReporter';

const mutex = new Mutex();
let webRefreshToken: string | null = null;

/* ──────────────────────────────────────────────
 * Secure Storage Helpers
 * ────────────────────────────────────────────── */

export async function getRefreshToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return webRefreshToken;
  }

  return SecureStore.getItemAsync('refreshToken');
}

export async function setRefreshToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    webRefreshToken = token;
    return;
  }

  await SecureStore.setItemAsync('refreshToken', token);
}

export async function clearRefreshToken(): Promise<void> {
  if (Platform.OS === 'web') {
    webRefreshToken = null;
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

    headers.set('X-Environment', config.env);

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
      },
      api,
      {}
    );
  } catch (error) {
    reportError(error, {
      source: 'baseApi.performLogout',
    });
  }

  await clearRefreshToken();

  api.dispatch(logout());
  api.dispatch(baseApi.util.resetApiState());
}

const getRequestUrl = (args: string | FetchArgs): string =>
  typeof args === 'string' ? args : args.url;

const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/social-login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/magic-link/request',
  '/auth/magic-link/verify',
  '/auth/2fa/verify',
]);

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

  const requestUrl = getRequestUrl(args);
  const isRefreshRequest = requestUrl === '/auth/refresh';
  const isPublicAuthRequest = PUBLIC_AUTH_ENDPOINTS.has(requestUrl);

  if (
    result.error?.status === 401 &&
    !isRefreshRequest &&
    !isPublicAuthRequest
  ) {
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
        reportError(error, {
          source: 'baseApi.refreshFlow',
        });

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
    'ProfileMediaImages',
    'ProfileMediaVideos',
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
    'Referral',
    'Match',
    'Shortlist',
    'Chat',
    'Notification',
    'SupportTicket',
    'SuccessStory',
    'FeatureFlags',
    'Student',
    'Subject',
    'LearningSchedule',
    'LearningEntitlement',
    'LearningProgress',
    'AiTutorSession',
  ],

  endpoints: () => ({}),
});
