import { baseApi } from './baseApi';
import {
  ApiResponse,
  Caste,
  Country,
  MaritalStatus,
  Qualification,
  Religion,
} from '@/core/types';

export interface MatchImage {
  url: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface DiscoveryProfile {
  _id?: string;
  userId: string;
  personal?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    country?: Country;
    maritalStatus?: MaritalStatus;
    religion?: Religion;
    caste?: Caste;
  };
  physical?: {
    height?: string | number;
  };
  education?: {
    qualification?: Qualification;
    occupation?: string;
    jobRole?: string;
  };
  images?: MatchImage[];
  age?: number;
  profileScore?: number;
  matchScore?: number;
  lastActiveAt?: string;
  createdAt?: string;
}

export interface MatchRecord {
  _id: string;
  userId: string;
  targetUserId: string;
  matchedOn?: string;
  isActive?: boolean;
}

export interface InterestRecord {
  _id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

type PaginatedResponse<T> = ApiResponse<T[]> & {
  data: T[];
  meta?: PaginationMeta | null;
};

export type MatchTab = 'recommended' | 'new' | 'online' | 'nearby';

const discoveryPath: Record<MatchTab, string> = {
  recommended: '/match/recommended',
  new: '/match/new',
  online: '/match/online',
  nearby: '/match/nearby',
};

export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscoveryProfiles: builder.query<
      PaginatedResponse<DiscoveryProfile>,
      { type: MatchTab; page?: number; limit?: number; radiusKm?: number }
    >({
      query: ({ type, page = 1, limit = 20, radiusKm }) => ({
        url: discoveryPath[type],
        method: 'GET',
        params: {
          page,
          limit,
          ...(type === 'nearby' && radiusKm ? { radiusKm } : {}),
        },
      }),
      providesTags: ['Match'],
    }),

    getMyMatches: builder.query<PaginatedResponse<MatchRecord>, void>({
      query: () => ({
        url: '/match/my',
        method: 'GET',
      }),
      providesTags: ['Match'],
    }),

    sendInterest: builder.mutation<unknown, { receiverId: string }>({
      query: (body) => ({
        url: '/match/interest',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Match'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetDiscoveryProfilesQuery,
  useGetMyMatchesQuery,
  useSendInterestMutation,
} = matchApi;
