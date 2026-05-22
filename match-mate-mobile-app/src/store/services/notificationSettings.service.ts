import { baseApi } from './baseApi';

import { ChannelPreference, NotificationSettings, NotificationSettingsResponse, UpdateNotificationSettingsPayload } from '@/features/NotificationSettings/NotificationSettings.types';

export const notificationSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Notification Settings
     */
    getNotificationSettings: builder.query<NotificationSettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),

      providesTags: ['NotificationSettings'],
    }),

    /**
     * Update Notification Settings
     */
    updateNotificationSettings: builder.mutation<NotificationSettings, UpdateNotificationSettingsPayload>({
      query: (body) => ({ 
        url: '/settings/notifications', 
        method: 'PUT', 
        body 
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    updateNotificationChannel: builder.mutation<
      NotificationSettings,
      { event: keyof NotificationSettings['preferences']; channel: keyof ChannelPreference; value: boolean }
    >({
      query: ({ event, channel, value }) => ({
        url: `/settings/notifications/preferences/${event}/${channel}`,
        method: 'PATCH',
        body: { value },
      }),
      invalidatesTags: ['NotificationSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useUpdateNotificationChannelMutation
} = notificationSettingsApi;
