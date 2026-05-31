import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  ChannelPreference,
  NotificationSettings,
  NotificationSettingsResponse,
  UpdateNotificationSettingsPayload,
} from '@/features/NotificationSettings/NotificationSettings.types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

export const notificationSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Notification Settings
     */
    getNotificationSettings: builder.query<NotificationSettingsResponse, void>({
      query: () => ({
        url: '/settings/notifications',
        method: 'GET',
      }),
      transformResponse: (
        response: NotificationSettings | ApiResponse<NotificationSettings>
      ) => wrapSettingsResponse('notification', response),

      providesTags: ['NotificationSettings'],
    }),

    /**
     * Update Notification Settings
     */
    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      UpdateNotificationSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/notifications',
        method: 'PUT',
        body,
      }),
      transformResponse: (
        response: NotificationSettings | ApiResponse<NotificationSettings>
      ) => unwrapApiResponse(response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          notificationSettingsApi.util.updateQueryData(
            'getNotificationSettings',
            undefined,
            (draft) => {
              draft.notification = { ...draft.notification, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            notificationSettingsApi.util.updateQueryData(
              'getNotificationSettings',
              undefined,
              (draft) => {
                draft.notification = data;
              }
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),

    updateNotificationChannel: builder.mutation<
      NotificationSettings,
      {
        event: keyof NotificationSettings['preferences'];
        channel: keyof ChannelPreference;
        value: boolean;
      }
    >({
      query: ({ event, channel, value }) => ({
        url: `/settings/notifications/preferences/${event}/${channel}`,
        method: 'PATCH',
        body: { value },
      }),
      transformResponse: (
        response: NotificationSettings | ApiResponse<NotificationSettings>
      ) => unwrapApiResponse(response),
      async onQueryStarted(
        { event, channel, value },
        { dispatch, queryFulfilled }
      ) {
        const optimistic = dispatch(
          notificationSettingsApi.util.updateQueryData(
            'getNotificationSettings',
            undefined,
            (draft) => {
              draft.notification.preferences[event] = {
                ...draft.notification.preferences[event],
                [channel]: value,
              };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            notificationSettingsApi.util.updateQueryData(
              'getNotificationSettings',
              undefined,
              (draft) => {
                draft.notification = data;
              }
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useUpdateNotificationChannelMutation,
} = notificationSettingsApi;
