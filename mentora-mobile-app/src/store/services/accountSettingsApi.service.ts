import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  AccountSettings,
  AccountSettingsResponse,
  ConnectProviderPayload,
  ConnectSocialProviderPayload,
  DataExportResponse,
  DeactivateAccountPayload,
  RecordConsentPayload,
  RequestEmailChangePayload,
  RequestPhoneChangePayload,
  UserConsent,
} from '../../features/AccountSettings/accountSettings.types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import { setAccountSettings } from '../slices/settings.slice';

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
      keepUnusedDataFor: 0,
      transformResponse: (
        response: AccountSettings | ApiResponse<AccountSettings>
      ) => wrapSettingsResponse('account', response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setAccountSettings(unwrapApiResponse(data).account));
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

      providesTags: ['AccountSettings'],
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

    reactivateAccount: builder.mutation<void, void>({
      query: () => ({
        url: '/settings/account/reactivate',
        method: 'POST',
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
    cancelDeleteAccountRequest: builder.mutation<void, void>({
      query: () => ({ url: '/settings/account/delete/cancel', method: 'POST' }),
      invalidatesTags: ['AccountSettings'],
    }),
    disconnectLinkedAccount: builder.mutation<void, { provider: string }>({
      query: ({ provider }) => ({
        url: `/settings/account/linked/${provider}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AccountSettings'],
    }),
    connectSocialLinkedAccount: builder.mutation<
      void,
      ConnectSocialProviderPayload
    >({
      query: (body) => ({
        url: '/settings/account/linked/social',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AccountSettings'],
    }),
    setPrimaryLinkedAccount: builder.mutation<void, { provider: string }>({
      query: ({ provider }) => ({
        url: `/settings/account/linked/${provider}/primary`,
        method: 'PUT',
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
    getDataExport: builder.query<DataExportResponse, void>({
      query: () => ({
        url: '/settings/account/data-export',
        method: 'GET',
      }),
      transformResponse: (
        response: DataExportResponse | ApiResponse<DataExportResponse>
      ) => unwrapApiResponse(response),
    }),
    getConsents: builder.query<UserConsent[], void>({
      query: () => ({
        url: '/settings/account/consents',
        method: 'GET',
      }),
      transformResponse: (
        response: UserConsent[] | ApiResponse<UserConsent[]>
      ) => unwrapApiResponse(response),
      providesTags: ['AccountSettings'],
    }),
    recordConsent: builder.mutation<UserConsent, RecordConsentPayload>({
      query: (body) => ({
        url: '/settings/account/consents',
        method: 'POST',
        body,
      }),
      transformResponse: (response: UserConsent | ApiResponse<UserConsent>) =>
        unwrapApiResponse(response),
      invalidatesTags: ['AccountSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAccountSettingsQuery,
  useDeactivateAccountMutation,
  useReactivateAccountMutation,
  useScheduleDeletionMutation,
  useDisconnectProviderMutation,
  useDeleteAccountRequestMutation,
  useCancelDeleteAccountRequestMutation,
  useDisconnectLinkedAccountMutation,
  useConnectSocialLinkedAccountMutation,
  useSetPrimaryLinkedAccountMutation,
  useRequestEmailChangeMutation,
  useRequestPhoneChangeMutation,
  useGetDataExportQuery,
  useGetConsentsQuery,
  useRecordConsentMutation,
} = accountSettingsApi;
