import { AiSettingsResponse, UpdateAiSettingsPayload } from '@/features/AiSettings/AiSettings.types';
import { baseApi } from './baseApi';

export const aiSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Ai Settings
     */
    getAiSettings: builder.query<AiSettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),

      providesTags: ['AiSettings'],
    }),

    /**
     * Update Ai Settings
     */
    updateAiSettings: builder.mutation<AiSettingsResponse, UpdateAiSettingsPayload>({
      query: (body) => ({ 
        url: '/settings/ai', 
        method: 'PUT', 
        body 
      }),
      invalidatesTags: ['AiSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAiSettingsQuery,
  useUpdateAiSettingsMutation
} = aiSettingsApi;
