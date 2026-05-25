import {
  AccessibilitySettings,
  AccessibilitySettingsResponse,
  UpdateAccessibilitySettingsPayload,
} from '@/features/AccessibilitySettings/AccessibilitySettings.types';
import { baseApi } from './baseApi';

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
      invalidatesTags: ['AccessibilitySettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAccessibilitySettingsQuery,
  useUpdateAccessibilitySettingsMutation,
} = accessibilitySettingsApi;
