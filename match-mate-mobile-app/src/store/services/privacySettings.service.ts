import { baseApi } from '@/store/services/baseApi';

import {
  PrivacySettings,
  BlockedUsersResponse,
  PrivacySettingsResponse,
  UpdatePrivacySettingsPayload,
} from '../../features/PrivacySettings/PrivacySettings.types';

export const privacySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettingsResponse, void>({
      query: () => ({
        url: '/settings/privacy',
      }),
      transformResponse: (response: PrivacySettings) => ({
        privacy: response,
      }),

      providesTags: ['PrivacySettings'],
    }),

    updatePrivacySettings: builder.mutation<
      PrivacySettings,
      UpdatePrivacySettingsPayload
    >({
      query: (body) => ({
        url: '/settings/privacy',
        method: 'PUT',
        body,
      }),

      invalidatesTags: ['PrivacySettings'],
    }),
    getBlockedUsers: builder.query<BlockedUsersResponse, void>({
      query: () => ({
        url: '/settings/privacy/blocked',
        method: 'GET',
      }),
      providesTags: ['PrivacySettings'],
    }),
    unblockUser: builder.mutation<void, { targetUserId: string }>({
      query: (body) => ({
        url: '/settings/privacy/unblock',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PrivacySettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
} = privacySettingsApi;
