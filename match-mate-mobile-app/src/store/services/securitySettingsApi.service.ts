import { baseApi } from './baseApi.service';

import {
  LoginHistoryResponse,
  EnableTwoFactorResponse,
  SecuritySettings,
  SecuritySettingsResponse,
  TotpSetupResponse,
  TwoFactorStatus,
  UpdateSecuritySettingsPayload,
} from '@/features/SecuritySettings/SecuritySettings.types';
import { ApiResponse } from '@/core/types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setSecuritySettings,
  updateSecuritySettings as updateCachedSecuritySettings,
} from '../slices/settings.slice';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setSecuritySettings(unwrapApiResponse(data).security));
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousSecurity = (
          getState() as {
            settings?: { security?: SecuritySettings };
          }
        ).settings?.security;
        dispatch(updateCachedSecuritySettings(patch));
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
          dispatch(setSecuritySettings(data));
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
          if (previousSecurity) {
            dispatch(setSecuritySettings(previousSecurity));
          }
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
        response.success
          ? {
              sessions: response.data?.sessions ?? [],
              timeline: response.data?.timeline ?? [],
            }
          : { sessions: [], timeline: [] },
      providesTags: ['SecuritySettings'],
    }),
    revokeSession: builder.mutation<void, { sessionId: string }>({
      query: ({ sessionId }) => ({
        url: `/settings/security/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
    getTwoFactorStatus: builder.query<TwoFactorStatus, void>({
      query: () => '/auth/2fa/status',
      transformResponse: (response: ApiResponse<TwoFactorStatus>) =>
        response.success
          ? response.data
          : {
              enabled: false,
              method: 'none',
              authenticatorConfigured: false,
              recoveryCodesRemaining: 0,
            },
      providesTags: ['SecuritySettings'],
    }),
    setupTotp: builder.mutation<ApiResponse<TotpSetupResponse>, void>({
      query: () => ({ url: '/auth/2fa/totp/setup', method: 'POST' }),
      invalidatesTags: ['SecuritySettings'],
    }),
    enableTotp: builder.mutation<
      ApiResponse<EnableTwoFactorResponse>,
      { code: string }
    >({
      query: (body) => ({ url: '/auth/2fa/totp/enable', method: 'POST', body }),
      invalidatesTags: ['SecuritySettings'],
    }),
    requestSmsTwoFactor: builder.mutation<ApiResponse<{ sent: boolean }>, void>(
      {
        query: () => ({ url: '/auth/2fa/sms/request', method: 'POST' }),
      }
    ),
    enableSmsTwoFactor: builder.mutation<
      ApiResponse<EnableTwoFactorResponse>,
      { code: string }
    >({
      query: (body) => ({ url: '/auth/2fa/sms/enable', method: 'POST', body }),
      invalidatesTags: ['SecuritySettings'],
    }),
    disableTwoFactor: builder.mutation<
      ApiResponse<EnableTwoFactorResponse>,
      { code?: string }
    >({
      query: (body) => ({ url: '/auth/2fa/disable', method: 'POST', body }),
      invalidatesTags: ['SecuritySettings'],
    }),
    regenerateRecoveryCodes: builder.mutation<
      ApiResponse<{ recoveryCodes: string[] }>,
      { code: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/recovery-codes/regenerate',
        method: 'POST',
        body,
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
  useGetTwoFactorStatusQuery,
  useSetupTotpMutation,
  useEnableTotpMutation,
  useRequestSmsTwoFactorMutation,
  useEnableSmsTwoFactorMutation,
  useDisableTwoFactorMutation,
  useRegenerateRecoveryCodesMutation,
} = securitySettingsApi;
