import { ApiResponse } from '@/core/types';
import { baseApi } from './baseApi.service';

export type SupportTicketCategory =
  | 'account'
  | 'billing'
  | 'matches'
  | 'chat'
  | 'safety'
  | 'technical'
  | 'feedback'
  | 'other';

export type SupportTicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface SupportTicketMessage {
  authorId: string;
  authorType: 'user' | 'agent' | 'system';
  message: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicket {
  _id: string;
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  messages: SupportTicketMessage[];
  lastUserReplyAt?: string;
  lastAgentReplyAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketsResponse {
  items: SupportTicket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CreateSupportTicketPayload {
  subject: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  message: string;
}

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
      CreateSupportTicketPayload
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
      { ticketId: string; message: string }
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
