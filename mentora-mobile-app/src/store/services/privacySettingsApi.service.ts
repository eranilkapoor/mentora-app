import { baseApi } from '@/store/services/baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  PrivacySettings,
  BlockedUsersResponse,
  HiddenProfilesResponse,
  PrivacySettingsResponse,
  UpdatePrivacySettingsPayload,
} from '../../features/PrivacySettings/PrivacySettings.types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setPrivacySettings,
  updatePrivacySettings as updateCachedPrivacySettings,
} from '../slices/settings.slice';

export const privacySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettingsResponse, void>({
      query: () => ({
        url: '/settings/privacy',
      }),
      transformResponse: (response: PrivacySettings) =>
        wrapSettingsResponse('privacy', response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPrivacySettings(unwrapApiResponse(data).privacy));
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousPrivacy = (
          getState() as {
            settings?: { privacy?: PrivacySettings };
          }
        ).settings?.privacy;
        dispatch(updateCachedPrivacySettings(patch));
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
          dispatch(setPrivacySettings(data));
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
          if (previousPrivacy) {
            dispatch(setPrivacySettings(previousPrivacy));
          }
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
    getHiddenProfiles: builder.query<HiddenProfilesResponse, void>({
      query: () => ({
        url: '/settings/privacy/hidden',
        method: 'GET',
      }),
      transformResponse: (
        response: HiddenProfilesResponse | ApiResponse<HiddenProfilesResponse>
      ) =>
        response && 'data' in response && response.data
          ? response.data
          : (response as HiddenProfilesResponse),
      providesTags: ['PrivacySettings'],
    }),
    hideProfile: builder.mutation<
      void,
      { targetUserId: string; reason?: string }
    >({
      query: (body) => ({
        url: '/settings/privacy/hide',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'PrivacySettings',
        'Shortlist',
        { type: 'Match', id: 'DISCOVERY' },
        { type: 'Match', id: 'MY' },
        { type: 'Match', id: 'INTERESTS' },
      ],
    }),
    unhideProfile: builder.mutation<void, { targetUserId: string }>({
      query: (body) => ({
        url: '/settings/privacy/unhide',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PrivacySettings', { type: 'Match', id: 'DISCOVERY' }],
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
      invalidatesTags: [
        'PrivacySettings',
        'Chat',
        'Shortlist',
        { type: 'Match', id: 'DISCOVERY' },
        { type: 'Match', id: 'MY' },
        { type: 'Match', id: 'INTERESTS' },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetBlockedUsersQuery,
  useGetHiddenProfilesQuery,
  useHideProfileMutation,
  useUnhideProfileMutation,
  useUnblockUserMutation,
  useBlockUserMutation,
  useReportUserMutation,
} = privacySettingsApi;
