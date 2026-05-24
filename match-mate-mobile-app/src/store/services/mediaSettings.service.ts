import {
  MediaSettings,
  MediaSettingsResponse,
  UpdateMediaSettingsPayload,
} from '@/features/MediaSettings/MediaSettings.types';
import { baseApi } from './baseApi';

export const mediaSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Media Settings
     */
    getMediaSettings: builder.query<MediaSettingsResponse, void>({
      query: () => ({
        url: '/settings/media',
        method: 'GET',
      }),
      transformResponse: (response: MediaSettings) => ({
        media: response,
      }),

      providesTags: ['MediaSettings'],
    }),

    /**
     * Update Media Settings
     */
    updateMediaSettings: builder.mutation<
      MediaSettingsResponse,
      UpdateMediaSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/media',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MediaSettings'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetMediaSettingsQuery, useUpdateMediaSettingsMutation } =
  mediaSettingsApi;
