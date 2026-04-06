import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  retry,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { Platform } from 'react-native';
import { getDeviceId, generateUUID } from '../../core/utils/device';
import { logout } from '../slices/authSlice';

// 🔹 Base Query
const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,

  prepareHeaders: async (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    const deviceId = await getDeviceId();

    headers.set('X-Device-Id', deviceId);
    headers.set('X-Platform', Platform.OS);
    headers.set(
      'X-Client-Version',
      (process.env.EXPO_PUBLIC_CLIENT_VERSION as string) ?? '1.0.0'
    );
    headers.set('X-Correlation-Id', `${generateUUID()}`);
    headers.set('X-Request-Id', `${generateUUID()}`);

    return headers;
  },
});

// 🔥 Retry Wrapper (0 attempts)
const baseQueryWithRetry = retry(rawBaseQuery, {
  maxRetries: 0, // total = 0 attempts
});

// 🔥 Wrapper (for global error handling)
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQueryWithRetry(args, api, extraOptions);

  // 🔥 Handle 401 globally
  if (result.error?.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

// 🔹 Base API
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Profile', 'Auth'], // 👈 add all tags here
  endpoints: () => ({}),
});
