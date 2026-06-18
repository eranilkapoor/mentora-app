import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';
import type {
  CreateSupportTicketRequest,
  ReplySupportTicketRequest,
  SupportTicket,
  SupportTicketsResponse,
  SupportTicketStatus,
} from '@matchmate/api-contract';

export type {
  CreateSupportTicketRequest,
  ReplySupportTicketRequest,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketsResponse,
  SupportTicketStatus,
} from '@matchmate/api-contract';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTickets: builder.query<
      ApiResponse<SupportTicketsResponse>,
      { page?: number; limit?: number; status?: SupportTicketStatus } | void
    >({
      query: (params) => ({
        url: '/support/tickets',
        method: 'GET',
        ...(params ? { params } : {}),
      }),
      providesTags: ['SupportTicket'],
    }),

    getSupportTicket: builder.query<ApiResponse<SupportTicket>, string>({
      query: (ticketId) => `/support/tickets/${ticketId}`,
      providesTags: (_result, _error, ticketId) => [
        'SupportTicket',
        { type: 'SupportTicket', id: ticketId },
      ],
    }),

    createSupportTicket: builder.mutation<
      ApiResponse<SupportTicket>,
      CreateSupportTicketRequest
    >({
      query: (body) => ({
        url: '/support/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportTicket', 'Notification'],
    }),

    replyToSupportTicket: builder.mutation<
      ApiResponse<SupportTicket>,
      ReplySupportTicketRequest
    >({
      query: ({ ticketId, message }) => ({
        url: `/support/tickets/${ticketId}/replies`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [
        'SupportTicket',
        { type: 'SupportTicket', id: ticketId },
        'Notification',
      ],
    }),

    closeSupportTicket: builder.mutation<ApiResponse<SupportTicket>, string>({
      query: (ticketId) => ({
        url: `/support/tickets/${ticketId}/close`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, ticketId) => [
        'SupportTicket',
        { type: 'SupportTicket', id: ticketId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketQuery,
  useCreateSupportTicketMutation,
  useReplyToSupportTicketMutation,
  useCloseSupportTicketMutation,
} = supportApi;
