import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';

export interface DirectRoomResponse {
  roomId?: string;
  room?: {
    roomId?: string;
  };
  otherUser?: {
    userId?: string;
    name?: string;
    photo?: string;
  };
}

export interface ChatParticipant {
  userId: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  isOnline?: boolean;
}

export interface ChatConversation {
  roomId: string;
  participant: ChatParticipant;
  lastMessage?: {
    id?: string;
    text?: string;
    senderId?: string;
    sentAt?: string;
    status?: string;
    deliveredAt?: string | null;
    readAt?: string | null;
  };
  unreadCount: number;
  updatedAt?: string;
  settings?: {
    archived?: boolean;
    pinned?: boolean;
    mutedUntil?: string | null;
    lastReadAt?: string | null;
  };
}

export interface ChatConversationsResponse {
  items: ChatConversation[];
  unreadTotal: number;
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  type?: 'text' | 'image';
  content?: string;
  attachments: unknown[];
  status?: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt?: string;
}

export interface ChatMessagesResponse {
  roomId: string;
  items: ChatMessage[];
  nextCursor?: string | null;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<
      ApiResponse<ChatConversationsResponse>,
      {
        search?: string;
        onlyUnread?: boolean;
        includeArchived?: boolean;
        onlyArchived?: boolean;
        onlyPinned?: boolean;
        onlyMuted?: boolean;
        onlyOnline?: boolean;
        limit?: number;
        page?: number;
      } | void
    >({
      query: (params) => ({
        url: '/chats/conversations',
        method: 'GET',
        ...(params ? { params } : {}),
      }),
      providesTags: ['Chat'],
    }),

    createDirectRoom: builder.mutation<
      ApiResponse<DirectRoomResponse>,
      { targetUserId: string; initialMessage?: string }
    >({
      query: (body) => ({
        url: '/chats/rooms/direct',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    getMessages: builder.query<
      ApiResponse<ChatMessagesResponse>,
      { roomId: string; limit?: number; beforeMessageId?: string }
    >({
      query: ({ roomId, limit = 30, beforeMessageId }) => ({
        url: `/chats/rooms/${roomId}/messages`,
        method: 'GET',
        params: {
          limit,
          ...(beforeMessageId ? { beforeMessageId } : {}),
        },
      }),
      providesTags: ['Chat'],
    }),

    sendMessage: builder.mutation<
      ApiResponse<ChatMessage>,
      { roomId: string; content: string; clientMessageId?: string }
    >({
      query: ({ roomId, ...body }) => ({
        url: `/chats/rooms/${roomId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    updateRoomSettings: builder.mutation<
      ApiResponse<ChatConversation>,
      {
        roomId: string;
        archived?: boolean;
        pinned?: boolean;
        mutedUntil?: string | null;
      }
    >({
      query: ({ roomId, ...body }) => ({
        url: `/chats/rooms/${roomId}/settings`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    markRoomRead: builder.mutation<
      ApiResponse<{ roomId: string; updatedCount: number; readAt: string }>,
      { roomId: string; upToMessageId?: string }
    >({
      query: ({ roomId, ...body }) => ({
        url: `/chats/rooms/${roomId}/read`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetConversationsQuery,
  useCreateDirectRoomMutation,
  useGetMessagesQuery,
  useMarkRoomReadMutation,
  useSendMessageMutation,
  useUpdateRoomSettingsMutation,
} = chatApi;
