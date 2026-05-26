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
      invalidatesTags: [
        'PrivacySettings',
        { type: 'Match', id: 'DISCOVERY' },
        { type: 'Match', id: 'MY' },
        { type: 'Match', id: 'INTERESTS' },
      ],
    }),
    blockUser: builder.mutation<void, { targetUserId: string }>({
      query: (body) => ({
        url: '/settings/privacy/block',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'PrivacySettings',
        'Chat',
        'Shortlist',
        { type: 'Match', id: 'DISCOVERY' },
        { type: 'Match', id: 'MY' },
        { type: 'Match', id: 'INTERESTS' },
      ],
    }),
    reportUser: builder.mutation<
      void,
      { targetUserId: string; reason?: string }
    >({
      query: (body) => ({
        url: '/settings/privacy/report',
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
  useBlockUserMutation,
  useReportUserMutation,
} = privacySettingsApi;
