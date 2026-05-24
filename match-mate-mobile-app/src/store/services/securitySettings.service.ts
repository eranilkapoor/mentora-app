import { baseApi } from './baseApi';

import {
  SecuritySettings,
  SecuritySettingsResponse,
  UpdateSecuritySettingsPayload,
} from '@/features/SecuritySettings/SecuritySettings.types';

export const securitySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Security Settings
     */
    getSecuritySettings: builder.query<SecuritySettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
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
  }),

  overrideExisting: false,
});

export const {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useRevokeDeviceMutation,
  useRevokeAllDevicesMutation,
} = securitySettingsApi;
