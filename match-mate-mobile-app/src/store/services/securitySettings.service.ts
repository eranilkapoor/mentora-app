import { baseApi } from './baseApi';

import { SecuritySettings, SecuritySettingsResponse, UpdateSecuritySettingsPayload } from '@/features/SecuritySettings/SecuritySettings.types';

export const securitySettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Security Settings
     */
    getSecuritySettings: builder.query<SecuritySettingsResponse, void>({
      query: () => ({
        url: '/settings',
        method: 'GET',
      }),

      providesTags: ['SecuritySettings'],
    }),

    /**
     * Update Security Settings
     */
    updateSecuritySettings: builder.mutation<SecuritySettings, UpdateSecuritySettingsPayload>({
      query: (body) => ({ 
        url: '/settings/security', 
        method: 'PUT', 
        body 
      }),
      invalidatesTags: ['SecuritySettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation
} = securitySettingsApi;
