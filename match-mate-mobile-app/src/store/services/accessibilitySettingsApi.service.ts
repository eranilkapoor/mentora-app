import {
  AccessibilitySettings,
  AccessibilitySettingsResponse,
  UpdateAccessibilitySettingsPayload,
} from '@/features/AccessibilitySettings/AccessibilitySettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import { updateAccessibilitySettings } from '../slices/settings.slice';

export const accessibilitySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Accessibility Settings
     */
    getAccessibilitySettings: builder.query<
      AccessibilitySettingsResponse,
      void
    >({
      query: () => ({
        url: '/settings/accessibility',
        method: 'GET',
      }),
      transformResponse: (response: AccessibilitySettings) =>
        wrapSettingsResponse('accessibility', response),

      providesTags: ['AccessibilitySettings'],
    }),

    /**
     * Update Accessibility Settings
     */
    updateAccessibilitySettings: builder.mutation<
      AccessibilitySettings,
      UpdateAccessibilitySettingsPayload
    >({
      query: (body) => ({
        url: '/settings/accessibility',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: AccessibilitySettings) =>
        unwrapApiResponse(response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        dispatch(updateAccessibilitySettings(patch));

        const optimistic = dispatch(
          accessibilitySettingsApi.util.updateQueryData(
            'getAccessibilitySettings',
            undefined,
            (draft) => {
              draft.accessibility = { ...draft.accessibility, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            accessibilitySettingsApi.util.updateQueryData(
              'getAccessibilitySettings',
              undefined,
              (draft) => {
                draft.accessibility = data;
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
  useGetAccessibilitySettingsQuery,
  useUpdateAccessibilitySettingsMutation,
} = accessibilitySettingsApi;
