import { baseApi } from './baseApi';

import {
  AccountSettings,
  UpdateAccountSettingsPayload,
  DeactivateAccountPayload,
  ConnectProviderPayload,
  AccountSettingsResponse,
} from '../../features/AccountSettings/accountSettings.types';

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
     * Update account settings
     */
    updateAccountSettings: builder.mutation<AccountSettingsResponse, UpdateAccountSettingsPayload>({
      query: (body) => ({
        url: '/settings',
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

    deleteAccountRequest: builder.mutation<void, void>({
      query: () => ({ url: '/settings/account/delete', method: 'POST' }),
      invalidatesTags: ['AccountSettings'],
    }),
    disconnectLinkedAccount: builder.mutation<void, { provider: string }>({
      query: (body) => ({ url: '/settings/account/linked/disconnect', method: 'POST', body }),
      invalidatesTags: ['AccountSettings'],
    }),

  }),

  overrideExisting: false,
});

export const {
  useGetAccountSettingsQuery,
  useUpdateAccountSettingsMutation,
  useDeactivateAccountMutation,
  useScheduleDeletionMutation,
  useConnectProviderMutation,
  useDisconnectProviderMutation,
  useDeleteAccountRequestMutation,
  useDisconnectLinkedAccountMutation,
} = accountSettingsApi;
