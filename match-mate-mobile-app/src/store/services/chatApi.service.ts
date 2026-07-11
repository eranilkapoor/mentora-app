import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';
import type { PaginationMeta } from '@matchmate/api-contract';

export interface DirectRoomResponse {
  roomId?: string;
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED' | string;
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
  status?: 'PENDING' | 'ACTIVE' | 'REJECTED' | string;
  requestedById?: string;
  requestedAt?: string;
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

export interface ChatConversationsResponse extends PaginationMeta {
  items: ChatConversation[];
  unreadTotal: number;
  hasMore?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  type?: 'text' | 'image' | 'audio' | 'TEXT' | 'IMAGE' | 'AUDIO';
  content?: string;
  attachments: unknown[];
  status?: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt?: string;
}

export interface ChatAttachment {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
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
      {
        targetUserId: string;
        initialMessage?: string;
        clientMessageId?: string;
      }
    >({
      query: (body) => ({
        url: '/chats/rooms/direct',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    respondChatRequest: builder.mutation<
      ApiResponse<ChatConversation | { roomId: string; status: string }>,
      { roomId: string; action: 'ACCEPT' | 'REJECT' }
    >({
      query: ({ roomId, action }) => ({
        url: `/chats/rooms/${roomId}/request/respond`,
        method: 'POST',
        body: { action },
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
      {
        roomId: string;
        content?: string;
        type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE';
        clientMessageId?: string;
        attachments?: ChatAttachment[];
      }
    >({
      query: ({ roomId, ...body }) => ({
        url: `/chats/rooms/${roomId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),

    uploadChatAttachments: builder.mutation<
      ApiResponse<ChatAttachment[]>,
      FormData
    >({
      query: (body) => ({
        url: '/chats/attachments',
        method: 'POST',
        body,
        formData: true,
      }),
    }),

    deleteChatMessage: builder.mutation<
      ApiResponse<{ roomId: string; messageId: string; deletedAt: string }>,
      { roomId: string; messageId: string }
    >({
      query: ({ roomId, messageId }) => ({
        url: `/chats/rooms/${roomId}/messages/${messageId}`,
        method: 'DELETE',
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
  useRespondChatRequestMutation,
  useGetMessagesQuery,
  useMarkRoomReadMutation,
  useSendMessageMutation,
  useUploadChatAttachmentsMutation,
  useDeleteChatMessageMutation,
  useUpdateRoomSettingsMutation,
} = chatApi;
