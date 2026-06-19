import { baseApi } from './baseApi.service';
import { ApiResponse } from '@/core/types';

import {
  ChannelPreference,
  NotificationSettings,
  NotificationSettingsResponse,
  UpdateNotificationSettingsPayload,
} from '@/features/NotificationSettings/NotificationSettings.types';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setNotificationSettings,
  updateNotificationSettings as updateCachedNotificationSettings,
} from '../slices/settings.slice';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setNotificationSettings(unwrapApiResponse(data).notification)
          );
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousNotification = (
          getState() as {
            settings?: { notification?: NotificationSettings };
          }
        ).settings?.notification;
        dispatch(updateCachedNotificationSettings(patch));
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
          dispatch(setNotificationSettings(data));
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
          if (previousNotification) {
            dispatch(setNotificationSettings(previousNotification));
          }
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
        { dispatch, getState, queryFulfilled }
      ) {
        const previousNotification = (
          getState() as {
            settings?: { notification?: NotificationSettings };
          }
        ).settings?.notification;
        dispatch(
          updateCachedNotificationSettings({
            preferences: {
              ...(previousNotification?.preferences ?? {}),
              [event]: {
                ...(previousNotification?.preferences?.[event] ?? {}),
                [channel]: value,
              },
            } as NotificationSettings['preferences'],
          })
        );
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
          dispatch(setNotificationSettings(data));
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
          if (previousNotification) {
            dispatch(setNotificationSettings(previousNotification));
          }
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
