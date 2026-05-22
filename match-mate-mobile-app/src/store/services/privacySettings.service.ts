import { baseApi } from '@/store/services/baseApi';

import {
  PrivacySettings,
  PrivacySettingsResponse,
  UpdatePrivacySettingsPayload,
} from '../../features/PrivacySettings/PrivacySettings.types';

export const privacySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettingsResponse, void>({
      query: () => ({
        url: '/settings',
      }),

      providesTags: ['PrivacySettings'],
    }),

    updatePrivacySettings: builder.mutation<
      PrivacySettings,
      UpdatePrivacySettingsPayload
    >({
      query: (body) => ({
        url: '/settings/privacy',
        method: 'PUT',
        body,
      }),

      invalidatesTags: ['PrivacySettings'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetPrivacySettingsQuery, useUpdatePrivacySettingsMutation } =
  privacySettingsApi;
