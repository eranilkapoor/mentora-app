import {
  ApiResponse,
  ProfileData,
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
  OnbardingResponse,
  ProfileImage,
} from '../../core/types';
import { baseApi } from './baseApi';

// 🔹 Base API (you can also move this to baseApi.ts)
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    onboardingProfile: builder.mutation<
      ApiResponse<OnbardingResponse>,
      FormData
    >({
      query: (body) => ({
        url: '/profile/onboarding',
        method: 'POST',
        body,
        formData: true,
      }),
    }),

    getMyProfile: builder.query<ApiResponse<ProfileData>, void>({
      query: () => '/profile/me',
      providesTags: ['Profile'],
    }),

    updatePersonalInfo: builder.mutation<
      ApiResponse<ProfileData>,
      PersonalData
    >({
      query: (body) => ({
        url: '/profile/personal',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updatePhysicalInfo: builder.mutation<
      ApiResponse<ProfileData>,
      PhysicalData
    >({
      query: (body) => ({
        url: '/profile/physical',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updateEducationInfo: builder.mutation<
      ApiResponse<ProfileData>,
      EducationData
    >({
      query: (body) => ({
        url: '/profile/education',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updateFamilyInfo: builder.mutation<ApiResponse<ProfileData>, FamilyData>({
      query: (body) => ({
        url: '/profile/family',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updateProfileLocation: builder.mutation<
      ApiResponse<ProfileData>,
      { latitude: number; longitude: number }
    >({
      query: (body) => ({
        url: '/profile/location',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updatePreferences: builder.mutation<
      ApiResponse<ProfileData>,
      PreferencesData
    >({
      query: (body) => ({
        url: '/profile/preferences',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    getMyProfileMediaImages: builder.query<ApiResponse<ProfileImage[]>, void>({
      query: () => '/profile/media/images',
      providesTags: ['ProfileMedia'],
    }),

    addProfileMediaImages: builder.mutation<
      ApiResponse<ProfileImage[]>,
      FormData
    >({
      query: (body) => ({
        url: '/profile/media/images',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['ProfileMedia', 'Profile'],
    }),

    setPrimaryProfileMediaImage: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      query: ({ mediaId }) => ({
        url: `/profile/media/images/${mediaId}/primary`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ProfileMedia'],
    }),

    removeProfileMediaImage: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      query: ({ mediaId }) => ({
        url: `/profile/media/images/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProfileMedia', 'Profile'],
    }),
  }),

  overrideExisting: false,
});

// ✅ EXPORT HOOKS
export const {
  useOnboardingProfileMutation,
  useGetMyProfileQuery,
  useUpdatePersonalInfoMutation,
  useUpdatePhysicalInfoMutation,
  useUpdateEducationInfoMutation,
  useUpdateFamilyInfoMutation,
  useUpdateProfileLocationMutation,
  useUpdatePreferencesMutation,
  useGetMyProfileMediaImagesQuery,
  useAddProfileMediaImagesMutation,
  useSetPrimaryProfileMediaImageMutation,
  useRemoveProfileMediaImageMutation,
} = profileApi;
