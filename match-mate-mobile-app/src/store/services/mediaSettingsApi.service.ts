import {
  MediaSettings,
  MediaSettingsResponse,
  UpdateMediaSettingsPayload,
} from '@/features/MediaSettings/MediaSettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

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
      transformResponse: (response: MediaSettings) =>
        wrapSettingsResponse('media', response),

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
      transformResponse: (response: MediaSettings) =>
        wrapSettingsResponse('media', response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          mediaSettingsApi.util.updateQueryData(
            'getMediaSettings',
            undefined,
            (draft) => {
              draft.media = { ...draft.media, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            mediaSettingsApi.util.updateQueryData(
              'getMediaSettings',
              undefined,
              (draft) => {
                draft.media = unwrapApiResponse(data).media;
              }
            )
          );
        } catch {
          optimistic.undo();
        }
      },
    }),
  }),

  overrideExisting: false,
});

export const { useGetMediaSettingsQuery, useUpdateMediaSettingsMutation } =
  mediaSettingsApi;
