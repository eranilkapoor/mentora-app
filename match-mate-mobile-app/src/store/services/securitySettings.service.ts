import { baseApi } from './baseApi';

import {
  LoginHistoryResponse,
  SecuritySettings,
  SecuritySettingsResponse,
  UpdateSecuritySettingsPayload,
} from '@/features/SecuritySettings/SecuritySettings.types';
import { ApiResponse } from '@/core/types';

export const securitySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Security Settings
     */
    getSecuritySettings: builder.query<SecuritySettingsResponse, void>({
      query: () => ({
        url: '/settings/security',
        method: 'GET',
      }),
      transformResponse: (response: SecuritySettings) => ({
        security: response,
      }),

      providesTags: ['SecuritySettings'],
    }),

    /**
     * Update Security Settings
     */
    updateSecuritySettings: builder.mutation<
      SecuritySettings,
      UpdateSecuritySettingsPayload
    >({
      query: (body) => ({
        url: '/settings/security',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
    revokeDevice: builder.mutation<SecuritySettings, { deviceId: string }>({
      query: ({ deviceId }) => ({
        url: `/settings/security/devices/${deviceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
    revokeAllDevices: builder.mutation<SecuritySettings, void>({
      query: () => ({
        url: '/settings/security/devices',
        method: 'DELETE',
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
    getLoginHistory: builder.query<LoginHistoryResponse, void>({
      query: () => ({
        url: '/settings/security/login-history',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LoginHistoryResponse>) =>
        response.success ? response.data : { sessions: [] },
      providesTags: ['SecuritySettings'],
    }),
    revokeSession: builder.mutation<void, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/settings/security/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useRevokeDeviceMutation,
  useRevokeAllDevicesMutation,
  useGetLoginHistoryQuery,
  useRevokeSessionMutation,
} = securitySettingsApi;
