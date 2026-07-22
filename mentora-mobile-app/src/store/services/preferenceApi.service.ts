import { baseApi } from './baseApi.service';
import { PreferenceData } from '@/features/EditPreference/EditPreference.types';
import { ApiResponse } from '@/core/types/api/api.types';
import {
  AboutPartnerData,
  MatchSettingsData,
  MatchWeightsData,
  PartnerFiltersData,
} from '@/core/types';

export const preferenceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPreference: builder.query<ApiResponse<PreferenceData>, void>({
      query: () => '/preferences/me',
      providesTags: ['Preference'],
    }),

    updatePreferenceFilters: builder.mutation<
      ApiResponse<PreferenceData>,
      PartnerFiltersData
    >({
      query: (body) => ({
        url: '/preferences/filters',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Preference'],
    }),

    updatePreferenceSettings: builder.mutation<
      ApiResponse<PreferenceData>,
      MatchSettingsData
    >({
      query: (body) => ({
        url: '/preferences/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Preference'],
    }),

    updatePreferenceWeights: builder.mutation<
      ApiResponse<PreferenceData>,
      MatchWeightsData
    >({
      query: (body) => ({
        url: '/preferences/weights',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Preference'],
    }),

    updateAboutPartner: builder.mutation<
      ApiResponse<PreferenceData>,
      AboutPartnerData
    >({
      query: (body) => ({
        url: '/preferences/about',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Preference'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetMyPreferenceQuery,
  useUpdatePreferenceFiltersMutation,
  useUpdatePreferenceSettingsMutation,
  useUpdatePreferenceWeightsMutation,
  useUpdateAboutPartnerMutation,
} = preferenceApi;
