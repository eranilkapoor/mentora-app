import { baseApi } from './baseApi';
import {
  ApiResponse,
  Caste,
  Country,
  MaritalStatus,
  OccupationType,
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
  relationship?: {
    isMatched?: boolean;
    interestId?: string;
    interestStatus?: 'pending' | 'accepted' | 'rejected';
    interestDirection?: 'sent' | 'received';
  };
}

export interface MatchRecord {
  _id: string;
  userId: string;
  targetUserId: string;
  matchedUserId?: string;
  matchedOn?: string;
  isActive?: boolean;
  profile?: DiscoveryProfile;
}

export interface InterestRecord {
  _id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
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

export interface DiscoveryProfileQuery {
  type: MatchTab;
  page?: number;
  limit?: number;
  radiusKm?: number;
  search?: string;
  minAge?: number;
  maxAge?: number;
  minHeight?: number;
  maxHeight?: number;
  city?: string;
  state?: string;
  religion?: Religion;
  caste?: Caste;
  qualification?: Qualification;
  occupationType?: OccupationType;
  verifiedOnly?: boolean;
}

const discoveryPath: Record<MatchTab, string> = {
  recommended: '/match/recommended',
  new: '/match/new',
  online: '/match/online',
  nearby: '/match/nearby',
};

const matchListTags = [
  { type: 'Match' as const, id: 'DISCOVERY' },
  { type: 'Match' as const, id: 'MY' },
  { type: 'Match' as const, id: 'INTERESTS' },
];

export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscoveryProfiles: builder.query<
      PaginatedResponse<DiscoveryProfile>,
      DiscoveryProfileQuery
    >({
      query: ({ type, page = 1, limit = 20, radiusKm, ...filters }) => {
        const params = Object.entries({
          page,
          limit,
          ...(type === 'nearby' && radiusKm ? { radiusKm } : {}),
          ...filters,
        }).reduce<Record<string, string | number | boolean>>(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = value;
            }
            return acc;
          },
          {}
        );

        return {
          url: discoveryPath[type],
          method: 'GET',
          params,
        };
      },
      providesTags: [{ type: 'Match', id: 'DISCOVERY' }],
    }),

    getMyMatches: builder.query<
      PaginatedResponse<MatchRecord>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/match/my',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: [{ type: 'Match', id: 'MY' }],
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
      providesTags: ['Shortlist'],
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
      providesTags: [{ type: 'Match', id: 'INTERESTS' }],
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
      providesTags: [{ type: 'Match', id: 'INTERESTS' }],
    }),

    sendInterest: builder.mutation<unknown, { receiverId: string }>({
      query: (body) => ({
        url: '/match/interest',
        method: 'POST',
        body,
      }),
      invalidatesTags: matchListTags,
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
      invalidatesTags: matchListTags,
    }),

    withdrawInterest: builder.mutation<unknown, { interestId: string }>({
      query: ({ interestId }) => ({
        url: `/match/interest/${interestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Match', id: 'INTERESTS' }],
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
