import type { ApiResponse } from '@/core/types';
import type {
  SubmitSuccessStoryRequest,
  SuccessStoriesResponse,
  SuccessStory,
} from '@matchmate/api-contract';
import { baseApi } from './baseApi.service';

export type {
  SubmitSuccessStoryRequest,
  SuccessStory,
  SuccessStoryStatus,
} from '@matchmate/api-contract';

export const successStoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedSuccessStories: builder.query<
      ApiResponse<SuccessStoriesResponse>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/success-stories',
        method: 'GET',
        ...(params ? { params } : {}),
      }),
      providesTags: ['SuccessStory'],
    }),
    getMySuccessStories: builder.query<
      ApiResponse<SuccessStoriesResponse>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/success-stories/mine',
        method: 'GET',
        ...(params ? { params } : {}),
      }),
      providesTags: ['SuccessStory'],
    }),
    submitSuccessStory: builder.mutation<
      ApiResponse<SuccessStory>,
      SubmitSuccessStoryRequest
    >({
      query: (body) => ({
        url: '/success-stories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuccessStory'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublishedSuccessStoriesQuery,
  useGetMySuccessStoriesQuery,
  useSubmitSuccessStoryMutation,
} = successStoryApi;
