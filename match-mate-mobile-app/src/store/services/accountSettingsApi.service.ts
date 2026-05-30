import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  AccountSettings,
  AccountSettingsResponse,
  ConnectProviderPayload,
  DeactivateAccountPayload,
  RequestEmailChangePayload,
  RequestPhoneChangePayload,
  UpdateAccountSettingsPayload,
} from '../../features/AccountSettings/accountSettings.types';

export const accountSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Account Settings
     */
    getAccountSettings: builder.query<AccountSettingsResponse, void>({
      query: () => ({
        url: '/settings/account',
        method: 'GET',
      }),
      transformResponse: (
        response: AccountSettings | ApiResponse<AccountSettings>
      ) => ({
        account:
          response && 'data' in response && response.data
            ? response.data
            : (response as AccountSettings),
      }),

      providesTags: ['AccountSettings'],
    }),

    /**
     * Update account settings
     */
    updateAccountSettings: builder.mutation<
      AccountSettingsResponse,
      UpdateAccountSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/account',
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
        url: '/settings/account/deactivate',
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
        url: '/settings/account/delete',
        method: 'POST',
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Connect Social Provider
     */
    connectProvider: builder.mutation<void, ConnectProviderPayload>({
      query: ({ provider }) => ({
        url: `/settings/account/linked/${provider}`,
        method: 'POST',
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    /**
     * Disconnect Social Provider
     */
    disconnectProvider: builder.mutation<void, ConnectProviderPayload>({
      query: ({ provider }) => ({
        url: `/settings/account/linked/${provider}`,
        method: 'DELETE',
      }),

      invalidatesTags: ['AccountSettings'],
    }),

    deleteAccountRequest: builder.mutation<void, void>({
      query: () => ({ url: '/settings/account/delete', method: 'POST' }),
      invalidatesTags: ['AccountSettings'],
    }),
    disconnectLinkedAccount: builder.mutation<void, { provider: string }>({
      query: ({ provider }) => ({
        url: `/settings/account/linked/${provider}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AccountSettings'],
    }),
    requestEmailChange: builder.mutation<void, RequestEmailChangePayload>({
      query: (body) => ({
        url: '/settings/account/email',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AccountSettings'],
    }),
    requestPhoneChange: builder.mutation<void, RequestPhoneChangePayload>({
      query: (body) => ({
        url: '/settings/account/phone',
        method: 'POST',
        body,
      }),
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
  useRequestEmailChangeMutation,
  useRequestPhoneChangeMutation,
} = accountSettingsApi;
