import { ApiResponse, TrackAnalyticsEventRequest } from '@/core/types';
import { baseApi } from './baseApi.service';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    trackAnalyticsEvent: builder.mutation<
      ApiResponse<Record<string, unknown>>,
      TrackAnalyticsEventRequest
    >({
      query: (body) => ({
        url: '/analytics/track',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useTrackAnalyticsEventMutation } = analyticsApi;
