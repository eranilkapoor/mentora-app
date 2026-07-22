import {
  MediaSettings,
  MediaSettingsResponse,
  UpdateMediaSettingsPayload,
} from '@/features/MediaSettings/MediaSettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setMediaSettings,
  updateMediaSettings as updateCachedMediaSettings,
} from '../slices/settings.slice';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setMediaSettings(unwrapApiResponse(data).media));
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousMedia = (
          getState() as {
            settings?: { media?: MediaSettings };
          }
        ).settings?.media;
        dispatch(updateCachedMediaSettings(patch));
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
          dispatch(setMediaSettings(unwrapApiResponse(data).media));
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
          if (previousMedia) {
            dispatch(setMediaSettings(previousMedia));
          }
        }
      },
    }),
  }),

  overrideExisting: false,
});

export const { useGetMediaSettingsQuery, useUpdateMediaSettingsMutation } =
  mediaSettingsApi;
