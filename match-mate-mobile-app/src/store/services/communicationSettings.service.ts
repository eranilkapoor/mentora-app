import {
  CommunicationSettings,
  CommunicationSettingsResponse,
  UpdateCommunicationSettingsPayload,
} from '@/features/CommunicationSettings/CommunicationSettings.types';
import { baseApi } from '@/store/services/baseApi';

export const communicationSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunicationSettings: builder.query<
      CommunicationSettingsResponse,
      void
    >({
      query: () => ({
        url: '/settings',
      }),

      providesTags: ['CommunicationSettings'],
    }),

    updateCommunicationSettings: builder.mutation<
      CommunicationSettings,
      UpdateCommunicationSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/communication',
        method: 'PUT',
        body,
      }),

      invalidatesTags: ['CommunicationSettings'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
} = communicationSettingsApi;
