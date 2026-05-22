import { baseApi } from './baseApi';

import {
  AccountSettingsResponse,
  UpdateTwoFactorPayload,
  DeactivateAccountPayload,
  ConnectProviderPayload,
} from '../../features/AccountSettings/types/accountSettings.types';

export const accountSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Account Settings
     */
    getAccountSettings: builder.query<AccountSettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),

      providesTags: ['AccountSettings'],
    }),

    /**
     * Enable / Disable 2FA
     */
    updateTwoFactor: builder.mutation<void, UpdateTwoFactorPayload>({
      query: (body) => ({
        url: '/settings/two-factor',
        method: 'PUT',
        body,
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Deactivate Account
     */
    deactivateAccount: builder.mutation<void, DeactivateAccountPayload>({
      query: (body) => ({
        url: '/settings/deactivate',
        method: 'POST',
        body,
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Schedule Account Deletion
     */
    scheduleDeletion: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/schedule-delete',
        method: 'POST',
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Connect Social Provider
     */
    connectProvider: builder.mutation<void, ConnectProviderPayload>({
      query: ({ provider }) => ({
        url: `/settings/connect/${provider}`,
        method: 'POST',
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Disconnect Social Provider
     */
    disconnectProvider: builder.mutation<void, ConnectProviderPayload>({
      query: ({ provider }) => ({
        url: `/settings/connect/${provider}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['AccountSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAccountSettingsQuery,
  useUpdateTwoFactorMutation,
  useDeactivateAccountMutation,
  useScheduleDeletionMutation,
  useConnectProviderMutation,
  useDisconnectProviderMutation,
} = accountSettingsApi;
