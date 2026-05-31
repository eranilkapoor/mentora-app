import { baseApi } from '@/store/services/baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  PrivacySettings,
  BlockedUsersResponse,
  PrivacySettingsResponse,
  UpdatePrivacySettingsPayload,
} from '../../features/PrivacySettings/PrivacySettings.types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

export const privacySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettingsResponse, void>({
      query: () => ({
        url: '/settings/privacy',
      }),
      transformResponse: (response: PrivacySettings) =>
        wrapSettingsResponse('privacy', response),

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
      transformResponse: (response: PrivacySettings) =>
        unwrapApiResponse(response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          privacySettingsApi.util.updateQueryData(
            'getPrivacySettings',
            undefined,
            (draft) => {
              draft.privacy = { ...draft.privacy, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            privacySettingsApi.util.updateQueryData(
              'getPrivacySettings',
              undefined,
              (draft) => {
                draft.privacy = data;
              }
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),
    getBlockedUsers: builder.query<BlockedUsersResponse, void>({
      query: () => ({
        url: '/settings/privacy/blocked',
        method: 'GET',
      }),
      transformResponse: (
        response: BlockedUsersResponse | ApiResponse<BlockedUsersResponse>
      ) =>
        response && 'data' in response && response.data
          ? response.data
          : (response as BlockedUsersResponse),
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
