import {
  LocalizationSettings,
  LocalizationSettingsResponse,
  UpdateLocalizationSettingsPayload,
} from '@/features/LocalizationSettings/LocalizationSettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setLocalizationSettings,
  updateLocalizationSettings as updateCachedLocalizationSettings,
} from '../slices/settings.slice';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setLocalizationSettings(unwrapApiResponse(data).localization)
          );
        } catch {
          // Keep persisted Redux defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousLocalization = (
          getState() as {
            settings?: { localization?: LocalizationSettings };
          }
        ).settings?.localization;
        dispatch(updateCachedLocalizationSettings(patch));
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
            setLocalizationSettings(unwrapApiResponse(data).localization)
          );
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
          if (previousLocalization) {
            dispatch(setLocalizationSettings(previousLocalization));
          }
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
