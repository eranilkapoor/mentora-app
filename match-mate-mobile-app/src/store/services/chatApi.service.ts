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
    text?: string;
    senderId?: string;
    sentAt?: string;
  };
  unreadCount: number;
  updatedAt?: string;
}

export interface ChatConversationsResponse {
  items: ChatConversation[];
  unreadTotal: number;
  total: number;
  page: number;
  limit: number;
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
      { search?: string } | void
    >({
      query: (params) => ({
        url: '/chats/conversations',
        method: 'GET',
        params: params ?? undefined,
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
  }),

  overrideExisting: false,
});

export const {
  useGetConversationsQuery,
  useCreateDirectRoomMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
