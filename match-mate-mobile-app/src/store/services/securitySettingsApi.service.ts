import { baseApi } from './baseApi.service';

import {
  LoginHistoryResponse,
  SecuritySettings,
  SecuritySettingsResponse,
  UpdateSecuritySettingsPayload,
} from '@/features/SecuritySettings/SecuritySettings.types';
import { ApiResponse } from '@/core/types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

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
      transformResponse: (response: SecuritySettings) =>
        wrapSettingsResponse('security', response),

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
      transformResponse: (response: SecuritySettings) =>
        unwrapApiResponse(response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          securitySettingsApi.util.updateQueryData(
            'getSecuritySettings',
            undefined,
            (draft) => {
              draft.security = { ...draft.security, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            securitySettingsApi.util.updateQueryData(
              'getSecuritySettings',
              undefined,
              (draft) => {
                draft.security = data;
              }
            )
          );
        } catch {
          optimistic.undo();
        }
      },
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
