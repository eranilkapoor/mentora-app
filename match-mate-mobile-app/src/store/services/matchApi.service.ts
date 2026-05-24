import { baseApi } from './baseApi';

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
    country?: string;
    maritalStatus?: string;
  };
  physical?: {
    height?: string | number;
  };
  education?: {
    qualification?: string;
    occupation?: string;
    jobRole?: string;
  };
  images?: MatchImage[];
  age?: number;
  height?: string | number;
  religion?: string;
  caste?: string;
  city?: string;
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

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

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
