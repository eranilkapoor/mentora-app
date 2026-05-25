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
    gender?: string;
    city?: string;
    state?: string;
    country?: Country;
    maritalStatus?: MaritalStatus;
    religion?: Religion;
    caste?: Caste;
    aboutMe?: string;
    motherTongue?: string;
    hobbies?: string[];
    languages?: string[];
  };
  physical?: {
    height?: string | number;
  };
  education?: {
    qualification?: Qualification;
    occupation?: string;
    jobRole?: string;
    annualIncomeAmount?: number;
    companyName?: string;
    field?: string;
    university?: string;
  };
  family?: {
    fatherOccupation?: string;
    motherOccupation?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
  };
  images?: MatchImage[];
  age?: number;
  profileScore?: number;
  profileCompletionPercentage?: number;
  matchScore?: number;
  isShortlisted?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  privacy?: {
    isMatched?: boolean;
    canViewPersonalDetails?: boolean;
    canViewPhotos?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
    showIncome?: boolean;
  };
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
  profile?: DiscoveryProfile;
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

    getShortlistedProfiles: builder.query<
      PaginatedResponse<DiscoveryProfile>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/match/shortlisted',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 30,
        },
      }),
      providesTags: ['Shortlist', 'Match'],
    }),

    getMatchProfile: builder.query<ApiResponse<DiscoveryProfile>, string>({
      query: (userId) => ({
        url: `/match/profile/${userId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, userId) => [
        { type: 'Match' as const, id: userId },
      ],
    }),

    getReceivedInterests: builder.query<
      PaginatedResponse<InterestRecord>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/match/interests/received',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }),
      providesTags: ['Match'],
    }),

    getSentInterests: builder.query<
      PaginatedResponse<InterestRecord>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/match/interests/sent',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
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

    shortlistProfile: builder.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `/match/shortlist/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Shortlist'],
    }),

    removeShortlistedProfile: builder.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `/match/shortlist/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shortlist'],
    }),

    respondToInterest: builder.mutation<
      unknown,
      { interestId: string; action: 'ACCEPT' | 'REJECT' }
    >({
      query: (body) => ({
        url: '/match/interest/respond',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Match'],
    }),

    withdrawInterest: builder.mutation<unknown, { interestId: string }>({
      query: ({ interestId }) => ({
        url: `/match/interest/${interestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Match'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetDiscoveryProfilesQuery,
  useGetMatchProfileQuery,
  useGetMyMatchesQuery,
  useGetShortlistedProfilesQuery,
  useGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useRemoveShortlistedProfileMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useWithdrawInterestMutation,
} = matchApi;
