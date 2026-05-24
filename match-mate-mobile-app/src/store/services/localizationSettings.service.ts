import {
  LocalizationSettings,
  LocalizationSettingsResponse,
  UpdateLocalizationSettingsPayload,
} from '@/features/LocalizationSettings/LocalizationSettings.types';
import { baseApi } from './baseApi';

export const localizationSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Localization Settings
     */
    getLocalizationSettings: builder.query<LocalizationSettingsResponse, void>({
      query: () => ({
        url: '/settings/localization',
        method: 'GET',
      }),
      transformResponse: (response: LocalizationSettings) => ({
        localization: response,
      }),

      providesTags: ['LocalizationSettings'],
    }),

    /**
     * Update Localization Settings
     */
    updateLocalizationSettings: builder.mutation<
      LocalizationSettingsResponse,
      UpdateLocalizationSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/localization',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LocalizationSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
} = localizationSettingsApi;
