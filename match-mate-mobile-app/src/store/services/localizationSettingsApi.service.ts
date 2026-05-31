import {
  LocalizationSettings,
  LocalizationSettingsResponse,
  UpdateLocalizationSettingsPayload,
} from '@/features/LocalizationSettings/LocalizationSettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

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
      transformResponse: (response: LocalizationSettings) =>
        wrapSettingsResponse('localization', response),

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
      transformResponse: (response: LocalizationSettings) =>
        wrapSettingsResponse('localization', response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          localizationSettingsApi.util.updateQueryData(
            'getLocalizationSettings',
            undefined,
            (draft) => {
              draft.localization = { ...draft.localization, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            localizationSettingsApi.util.updateQueryData(
              'getLocalizationSettings',
              undefined,
              (draft) => {
                draft.localization = unwrapApiResponse(data).localization;
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

export const {
  useGetLocalizationSettingsQuery,
  useUpdateLocalizationSettingsMutation,
} = localizationSettingsApi;
