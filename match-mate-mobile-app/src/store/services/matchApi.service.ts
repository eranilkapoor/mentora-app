import { baseApi } from './baseApi.service';
import type { PaginationMeta } from '@matchmate/api-contract';
import {
  ApiResponse,
  Caste,
  Country,
  MaritalStatus,
  OccupationType,
  Qualification,
  Religion,
  ReligiousDetails,
} from '@/core/types';

export interface MatchImage {
  url: string;
  isPrimary?: boolean;
  isActive?: boolean;
  isBlurred?: boolean;
  blurReason?: string;
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
    religiousDetails?: ReligiousDetails;
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
    occupationType?: OccupationType;
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
  visibilityScore?: number;
  boostedMatchScore?: number;
  activeBoost?: {
    multiplier: number;
    endsAt: string;
  };
  matchScore?: number;
  compatibility?: {
    score: number;
    myPreferenceScore: number;
    theirPreferenceScore: number;
    signals?: Array<{
      key: string;
      matched: boolean;
      weight: number;
    }>;
  };
  curation?: {
    id: string;
    note?: string;
    priority?: number;
    curatedById?: string;
    curatedAt?: string;
    expiresAt?: string;
  };
  isShortlisted?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
  privacy?: {
    isMatched?: boolean;
    canViewPersonalDetails?: boolean;
    canViewPhotos?: boolean;
    photosBlurred?: boolean;
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
  contactAccess?: MatchContactAccess;
  contactDetails?: MatchContactDetails;
}

export interface MatchContactDetails {
  email?: {
    address?: string;
    verified?: boolean;
  };
  phone?: {
    countryCode?: string;
    number?: string;
    verified?: boolean;
  };
}

export interface MatchContactAccess {
  allowed?: boolean;
  isMatched?: boolean;
  canRevealPhone?: boolean;
  canRevealEmail?: boolean;
  canRequestContact?: boolean;
  requiresUpgrade?: boolean;
  reason?: string;
  limit?: number;
  consumed?: boolean;
}

export interface MatchContactReveal {
  contactDetails?: MatchContactDetails;
  contactAccess?: MatchContactAccess;
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

export interface ProfileViewerRecord {
  viewerId: string;
  viewedAt?: string;
  profile?: DiscoveryProfile;
}

export interface MatchStats {
  activeMatches: number;
  sentInterests: number;
  receivedInterests: number;
  acceptedInterests: number;
  shortlisted: number;
  profileViews: number;
}

type PaginatedResponse<T> = ApiResponse<T[]> & {
  data: T[];
  meta?: PaginationMeta | null;
};

export type MatchTab = 'recommended' | 'new' | 'online' | 'nearby' | 'curated';

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
  recommended: '/matches/recommended',
  new: '/matches/new',
  online: '/matches/online',
  nearby: '/matches/nearby',
  curated: '/matches/curated',
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
        url: '/matches/my',
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
        url: '/matches/shortlisted',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 30,
        },
      }),
      providesTags: ['Shortlist'],
    }),

    getWhoViewedMe: builder.query<
      PaginatedResponse<ProfileViewerRecord>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/matches/who-viewed-me',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
        },
      }),
      providesTags: [{ type: 'Match', id: 'VIEWERS' }],
    }),

    getMatchStats: builder.query<ApiResponse<MatchStats>, void>({
      query: () => ({
        url: '/matches/stats',
        method: 'GET',
      }),
      providesTags: [{ type: 'Match', id: 'STATS' }],
    }),

    getMatchProfile: builder.query<ApiResponse<DiscoveryProfile>, string>({
      query: (userId) => ({
        url: `/matches/profile/${userId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, userId) => [
        { type: 'Match' as const, id: userId },
      ],
    }),

    revealMatchContact: builder.mutation<
      ApiResponse<MatchContactReveal>,
      { userId: string }
    >({
      query: ({ userId }) => ({
        url: `/matches/profile/${userId}/contact`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: 'Match' as const, id: userId },
      ],
    }),

    getReceivedInterests: builder.query<
      PaginatedResponse<InterestRecord>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/matches/interests/received',
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
        url: '/matches/interests/sent',
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
        url: '/matches/interest',
        method: 'POST',
        body,
      }),
      invalidatesTags: matchListTags,
    }),

    shortlistProfile: builder.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `/matches/shortlist/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Shortlist'],
    }),

    removeShortlistedProfile: builder.mutation<unknown, { userId: string }>({
      query: ({ userId }) => ({
        url: `/matches/shortlist/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Shortlist'],
    }),

    unmatchProfile: builder.mutation<
      unknown,
      { userId: string; reason?: string }
    >({
      query: ({ userId, reason }) => ({
        url: `/matches/unmatch/${userId}`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      invalidatesTags: matchListTags,
    }),

    respondToInterest: builder.mutation<
      unknown,
      { interestId: string; action: 'ACCEPT' | 'REJECT' }
    >({
      query: (body) => ({
        url: '/matches/interest/respond',
        method: 'POST',
        body,
      }),
      invalidatesTags: matchListTags,
    }),

    withdrawInterest: builder.mutation<unknown, { interestId: string }>({
      query: ({ interestId }) => ({
        url: `/matches/interest/${interestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Match', id: 'INTERESTS' }],
    }),

    dismissCuratedMatch: builder.mutation<unknown, { curatedMatchId: string }>({
      query: ({ curatedMatchId }) => ({
        url: `/matches/curated/${curatedMatchId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Match', id: 'DISCOVERY' }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetDiscoveryProfilesQuery,
  useGetMatchProfileQuery,
  useRevealMatchContactMutation,
  useGetMyMatchesQuery,
  useGetMatchStatsQuery,
  useGetShortlistedProfilesQuery,
  useGetWhoViewedMeQuery,
  useGetReceivedInterestsQuery,
  useGetSentInterestsQuery,
  useRemoveShortlistedProfileMutation,
  useRespondToInterestMutation,
  useSendInterestMutation,
  useShortlistProfileMutation,
  useUnmatchProfileMutation,
  useWithdrawInterestMutation,
  useDismissCuratedMatchMutation,
} = matchApi;
