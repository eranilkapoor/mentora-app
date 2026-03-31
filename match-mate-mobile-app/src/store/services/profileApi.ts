import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import { ApiResponse, ProfileData } from '../../core/types/api';
import {
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
} from '../../core/types/profile.types';
import { Platform } from 'react-native';
import { getDeviceId } from '../../core/utils/device';

// 🔹 Base API (you can also move this to baseApi.ts)
export const profileApi = createApi({
  reducerPath: 'profileApi',

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,

    prepareHeaders: async (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      const deviceId = await getDeviceId();

      headers.set('X-Device-Id', deviceId);
      headers.set('X-Platform', Platform.OS);
      headers.set('X-Client-Version', '1.0');

      return headers;
    },
  }),

  tagTypes: ['Profile'],

  endpoints: (builder) => ({
    // ✅ GET PROFILE
    getMyProfile: builder.query<ApiResponse<ProfileData>, void>({
      query: () => ({
        url: '/profile/me',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    // ✅ UPDATE PERSONAL
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

    // ✅ UPDATE PHYSICAL
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

    // ✅ UPDATE EDUCATION
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

    // ✅ UPDATE FAMILY
    updateFamilyInfo: builder.mutation<ApiResponse<ProfileData>, FamilyData>({
      query: (body) => ({
        url: '/profile/family',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    // ✅ UPDATE PREFERENCES
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
