import {
  CommunicationSettings,
  CommunicationSettingsResponse,
  UpdateCommunicationSettingsPayload,
} from '@/features/CommunicationSettings/CommunicationSettings.types';
import { baseApi } from '@/store/services/baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

export const communicationSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommunicationSettings: builder.query<
      CommunicationSettingsResponse,
      void
    >({
      query: () => ({
        url: '/settings/communication',
      }),
      transformResponse: (response: CommunicationSettings) =>
        wrapSettingsResponse('communication', response),

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
      transformResponse: (response: CommunicationSettings) =>
        unwrapApiResponse(response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          communicationSettingsApi.util.updateQueryData(
            'getCommunicationSettings',
            undefined,
            (draft) => {
              draft.communication = { ...draft.communication, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            communicationSettingsApi.util.updateQueryData(
              'getCommunicationSettings',
              undefined,
              (draft) => {
                draft.communication = data;
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
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
} = communicationSettingsApi;
