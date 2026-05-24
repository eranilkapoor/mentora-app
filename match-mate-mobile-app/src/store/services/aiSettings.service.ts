import {
  AiSettings,
  AiSettingsResponse,
  UpdateAiSettingsPayload,
} from '@/features/AiSettings/AiSettings.types';
import { baseApi } from './baseApi';

export const aiSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Ai Settings
     */
    getAiSettings: builder.query<AiSettingsResponse, void>({
      query: () => ({
        url: '/settings/ai',
        method: 'GET',
      }),
      transformResponse: (response: AiSettings) => ({
        ai: response,
      }),

      providesTags: ['AiSettings'],
    }),

    /**
     * Update Ai Settings
     */
    updateAiSettings: builder.mutation<
      AiSettingsResponse,
      UpdateAiSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/ai',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AiSettings'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetAiSettingsQuery, useUpdateAiSettingsMutation } =
  aiSettingsApi;
