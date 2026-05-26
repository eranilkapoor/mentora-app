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
        url: '/profiles/onboarding',
        method: 'POST',
        body,
        formData: true,
      }),
      invalidatesTags: ['Auth', 'Profile', 'ProfileMedia', 'Preference'],
    }),

    getMyProfile: builder.query<ApiResponse<ProfileData>, void>({
      query: () => '/profiles/me',
      providesTags: ['Profile'],
    }),

    updatePersonalInfo: builder.mutation<
      ApiResponse<ProfileData>,
      PersonalData
    >({
      query: (body) => ({
        url: '/profiles/personal',
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
        url: '/profiles/physical',
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
        url: '/profiles/education',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    updateFamilyInfo: builder.mutation<ApiResponse<ProfileData>, FamilyData>({
      query: (body) => ({
        url: '/profiles/family',
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
        url: '/profiles/location',
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
        url: '/profiles/preferences',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    getMyProfileMediaImages: builder.query<ApiResponse<ProfileImage[]>, void>({
      query: () => '/profiles/media/images',
      providesTags: ['ProfileMedia'],
    }),

    addProfileMediaImages: builder.mutation<
      ApiResponse<ProfileImage[]>,
      FormData
    >({
      query: (body) => ({
        url: '/profiles/media/images',
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
        url: `/profiles/media/images/${mediaId}/primary`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ProfileMedia'],
    }),

    removeProfileMediaImage: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      query: ({ mediaId }) => ({
        url: `/profiles/media/images/${mediaId}`,
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
