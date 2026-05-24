import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi';

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

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createDirectRoom: builder.mutation<
      ApiResponse<DirectRoomResponse>,
      { targetUserId: string; initialMessage?: string }
    >({
      query: (body) => ({
        url: '/chat/rooms/direct',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),

  overrideExisting: false,
});

export const { useCreateDirectRoomMutation } = chatApi;
