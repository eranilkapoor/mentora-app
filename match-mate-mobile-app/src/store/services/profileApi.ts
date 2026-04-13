import {
  ApiResponse,
  ProfileData,
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
} from '../../core/types';
import { baseApi } from './baseApi';

// 🔹 Base API (you can also move this to baseApi.ts)
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),

  overrideExisting: false,
});

// ✅ EXPORT HOOKS
export const {
  useGetMyProfileQuery,
  useUpdatePersonalInfoMutation,
  useUpdatePhysicalInfoMutation,
  useUpdateEducationInfoMutation,
  useUpdateFamilyInfoMutation,
  useUpdatePreferencesMutation,
} = profileApi;
