import {
  CommunicationSettings,
  CommunicationSettingsResponse,
  UpdateCommunicationSettingsPayload,
} from '@/features/CommunicationSettings/CommunicationSettings.types';
import { baseApi } from '@/store/services/baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';
import {
  setCommunicationSettings,
  updateCommunicationSettings as updateCachedCommunicationSettings,
} from '../slices/settings.slice';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCommunicationSettings(unwrapApiResponse(data).communication)
          );
        } catch {
          // Keep local defaults when remote settings are unavailable.
        }
      },

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
      async onQueryStarted(patch, { dispatch, getState, queryFulfilled }) {
        const previousCommunication = (
          getState() as {
            settings?: { communication?: CommunicationSettings };
          }
        ).settings?.communication;
        dispatch(updateCachedCommunicationSettings(patch));
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
          dispatch(setCommunicationSettings(data));
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
          if (previousCommunication) {
            dispatch(setCommunicationSettings(previousCommunication));
          }
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
