import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'match'
  | 'chat'
  | 'system'
  | 'payment';

export type NotificationCategory =
  | 'interest_received'
  | 'interest_accepted'
  | 'profile_view'
  | 'match_found'
  | 'message_received'
  | 'subscription'
  | 'system';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  isRead: boolean;
  readAt?: string | null;
  actorId?: string;
  actorName?: string;
  actorImage?: string;
  referenceId?: string;
  action?: {
    screen: string;
    params?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}

export interface RegisterDeviceTokenPayload {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiResponse<NotificationsResponse>,
      {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
        category?: NotificationCategory;
        type?: NotificationType;
      } | void
    >({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        ...(params ? { params } : {}),
      }),
      providesTags: ['Notification'],
    }),

    getUnreadNotificationCount: builder.query<
      ApiResponse<UnreadNotificationCountResponse>,
      void
    >({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<
      ApiResponse<AppNotification>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation<
      ApiResponse<{ modifiedCount?: number }>,
      void
    >({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    registerNotificationDeviceToken: builder.mutation<
      ApiResponse<unknown>,
      RegisterDeviceTokenPayload
    >({
      query: (body) => ({
        url: '/notifications/device-tokens',
        method: 'POST',
        body,
      }),
    }),

    revokeNotificationDeviceToken: builder.mutation<
      ApiResponse<unknown>,
      Partial<RegisterDeviceTokenPayload>
    >({
      query: (body) => ({
        url: '/notifications/device-tokens/revoke',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRegisterNotificationDeviceTokenMutation,
  useRevokeNotificationDeviceTokenMutation,
} = notificationApi;
