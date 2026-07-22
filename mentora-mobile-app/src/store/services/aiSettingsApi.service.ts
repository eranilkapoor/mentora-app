import {
  AiSettings,
  AiSettingsResponse,
  UpdateAiSettingsPayload,
} from '@/features/AiSettings/AiSettings.types';
import { baseApi } from './baseApi.service';
import { unwrapApiResponse, wrapSettingsResponse } from './settingsApi.helpers';

export const aiSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get Ai Settings
     */
    getAiSettings: builder.query<AiSettingsResponse, void>({
      query: () => ({
        url: '/settings/ai',
        method: 'GET',
      }),
      transformResponse: (response: AiSettings) =>
        wrapSettingsResponse('ai', response),

      providesTags: ['AiSettings'],
    }),

    /**
     * Update Ai Settings
     */
    updateAiSettings: builder.mutation<
      AiSettingsResponse,
      UpdateAiSettingsPayload
    >({
      query: (body) => ({
        url: '/settings/ai',
        method: 'PUT',
        body,
      }),
      transformResponse: (response: AiSettings) =>
        wrapSettingsResponse('ai', response),
      async onQueryStarted(patch, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          aiSettingsApi.util.updateQueryData(
            'getAiSettings',
            undefined,
            (draft) => {
              draft.ai = { ...draft.ai, ...patch };
            }
          )
        );

        try {
          const { data } = await queryFulfilled;
          dispatch(
            aiSettingsApi.util.updateQueryData(
              'getAiSettings',
              undefined,
              (draft) => {
                draft.ai = unwrapApiResponse(data).ai;
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

export const { useGetAiSettingsQuery, useUpdateAiSettingsMutation } =
  aiSettingsApi;
