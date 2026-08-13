import type {
  FetchArgs,
  FetchBaseQueryError,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';
import {
  ApiResponse,
  EducationData,
  FamilyData,
  Genders,
  OnbardingResponse,
  PersonalData,
  PhysicalData,
  PreferencesData,
  ProfileData,
  ProfileImage,
  Qualifications,
  Religions,
} from '../../core/types';
import { baseApi } from './baseApi.service';

type StudentProfileRecord = {
  _id?: string;
  id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  personal?: Record<string, unknown>;
  academic?: Record<string, unknown>;
  parents?: Record<string, unknown>;
  address?: Record<string, unknown>;
  coursePreference?: Record<string, unknown>;
  learningGoals?: string[];
  profileCompletionPercentage?: number;
  status?: string;
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

function unwrapData<T>(value: unknown): T | undefined {
  if (value && typeof value === 'object' && 'data' in value) {
    return (value as ApiEnvelope<T>).data;
  }
  return value as T;
}

function successResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    code: 'OK',
    data,
    message,
    success: true,
  };
}

function parseJsonObject(value: unknown): Record<string, unknown> {
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function getFormDataValue(body: FormData, key: string): unknown {
  const getter = (body as unknown as { get?: (name: string) => unknown }).get;
  return typeof getter === 'function' ? getter.call(body, key) : undefined;
}

function getStudentId(student: StudentProfileRecord | undefined) {
  return student?._id ?? student?.id ?? '';
}

function toProfileData(student?: StudentProfileRecord): ProfileData {
  const personal = student?.personal ?? {};
  const academic = student?.academic ?? {};
  const parents = student?.parents ?? {};
  const address = student?.address ?? {};
  const coursePreference = student?.coursePreference ?? {};
  const firstName = student?.firstName ?? String(personal.firstName ?? '');
  const lastName = student?.lastName ?? String(personal.lastName ?? '');

  return {
    personal: {
      ...(personal as unknown as Partial<PersonalData>),
      firstName,
      lastName,
      dateOfBirth: student?.dateOfBirth ?? String(personal.dateOfBirth ?? ''),
      gender:
        student?.gender === Genders.FEMALE || personal.gender === Genders.FEMALE
          ? Genders.FEMALE
          : Genders.MALE,
      religion:
        personal.religion === Religions.NO_RELIGION
          ? Religions.NO_RELIGION
          : Religions.OTHER,
      city: String(address.city ?? personal.city ?? ''),
      state: String(address.state ?? personal.state ?? ''),
      aboutMe:
        String(coursePreference.primaryGoal ?? personal.aboutMe ?? '') ||
        (student?.learningGoals ?? []).join(', '),
    },
    physical: {} as PhysicalData,
    education: {
      ...(academic as unknown as Partial<EducationData>),
      occupation: String(academic.currentClass ?? academic.academicLevel ?? ''),
      qualification:
        academic.qualification === Qualifications.TENTH ||
        academic.academicLevel === Qualifications.TENTH
          ? Qualifications.TENTH
          : Qualifications.OTHER,
      university: String(academic.institutionName ?? ''),
      field: String(coursePreference.subjects ?? coursePreference.course ?? ''),
    },
    family: {
      ...(parents as FamilyData),
    },
    preferences: {
      ...(coursePreference as PreferencesData),
    },
    images: [],
    profileCompletionPercentage: student?.profileCompletionPercentage ?? 0,
    status: student?.status,
    summary: {
      profileCompletionPercentage: student?.profileCompletionPercentage ?? 0,
    },
  };
}

function formDataToStudentPayload(body: FormData) {
  const basic = parseJsonObject(getFormDataValue(body, 'basic'));
  const preferences = parseJsonObject(getFormDataValue(body, 'preferences'));

  return {
    dateOfBirth: String(basic.dateOfBirth ?? ''),
    email: typeof basic.email === 'string' ? basic.email : undefined,
    firstName: String(basic.firstName ?? ''),
    gender: typeof basic.gender === 'string' ? basic.gender : undefined,
    lastName: typeof basic.lastName === 'string' ? basic.lastName : undefined,
    learningGoals: Array.isArray(preferences.learningGoals)
      ? (preferences.learningGoals as string[])
      : undefined,
    ownershipType: 'self_managed',
    phone: typeof basic.phone === 'string' ? basic.phone : undefined,
  };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    onboardingProfile: builder.mutation<
      ApiResponse<OnbardingResponse>,
      FormData
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          body: formDataToStudentPayload(body),
          method: 'POST',
          url: '/students',
        });
        if (result.error) return { error: result.error };
        return {
          data: result.data as ApiResponse<OnbardingResponse>,
        };
      },
      invalidatesTags: ['Profile', 'Student', 'Preference'],
    }),

    getMyProfile: builder.query<ApiResponse<ProfileData>, void>({
      async queryFn(_arg, _api, _extraOptions, baseQuery) {
        const result = await baseQuery('/students');
        if (result.error) return { error: result.error };
        const students = unwrapData<StudentProfileRecord[]>(result.data) ?? [];
        return {
          data: successResponse(toProfileData(students[0]), 'Profile fetched'),
        };
      },
      providesTags: ['Profile', 'Student'],
    }),

    updatePersonalInfo: builder.mutation<
      ApiResponse<ProfileData>,
      PersonalData
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const studentsResult = await baseQuery('/students');
        if (studentsResult.error) return { error: studentsResult.error };
        const student = unwrapData<StudentProfileRecord[]>(
          studentsResult.data
        )?.[0];
        const studentId = getStudentId(student);
        if (!studentId) {
          return { error: { status: 404, data: 'Student profile not found' } };
        }
        const result = await baseQuery({
          body: {
            data: {
              ...body,
              firstName: body.firstName,
              lastName: body.lastName,
            },
          },
          method: 'PATCH',
          url: `/students/${studentId}/profile-sections/personal`,
        });
        if (result.error) return { error: result.error };
        return { data: result.data as ApiResponse<ProfileData> };
      },
      invalidatesTags: ['Profile', 'Student'],
    }),

    updatePhysicalInfo: builder.mutation<
      ApiResponse<ProfileData>,
      PhysicalData
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        return updateFirstStudentSection(baseQuery, 'personal', {
          physical: body,
        });
      },
      invalidatesTags: ['Profile', 'Student'],
    }),

    updateEducationInfo: builder.mutation<
      ApiResponse<ProfileData>,
      EducationData
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        return updateFirstStudentSection(baseQuery, 'academic', body);
      },
      invalidatesTags: ['Profile', 'Student'],
    }),

    updateFamilyInfo: builder.mutation<ApiResponse<ProfileData>, FamilyData>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        return updateFirstStudentSection(baseQuery, 'parents', body);
      },
      invalidatesTags: ['Profile', 'Student'],
    }),

    updateProfileLocation: builder.mutation<
      ApiResponse<ProfileData>,
      { latitude: number; longitude: number }
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        return updateFirstStudentSection(baseQuery, 'address', body);
      },
      invalidatesTags: ['Profile', 'Student'],
    }),

    updatePreferences: builder.mutation<
      ApiResponse<ProfileData>,
      PreferencesData
    >({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        return updateFirstStudentSection(baseQuery, 'coursePreference', body);
      },
      invalidatesTags: ['Profile', 'Student', 'Preference'],
    }),

    getMyProfileMediaImages: builder.query<ApiResponse<ProfileImage[]>, void>({
      queryFn: () => ({
        data: successResponse(
          [],
          'Profile media is managed by student documents'
        ),
      }),
      providesTags: ['ProfileMediaImages'],
    }),

    getMyProfileMediaVideos: builder.query<ApiResponse<ProfileImage[]>, void>({
      queryFn: () => ({
        data: successResponse(
          [],
          'Profile media is managed by student documents'
        ),
      }),
      providesTags: ['ProfileMediaVideos'],
    }),

    addProfileMediaImages: builder.mutation<
      ApiResponse<ProfileImage[]>,
      FormData
    >({
      queryFn: () => ({
        data: successResponse([], 'Profile media upload is retired'),
      }),
      invalidatesTags: ['ProfileMediaImages', 'Profile'],
    }),

    setPrimaryProfileMediaImage: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      queryFn: () => ({
        data: successResponse(undefined, 'No-op'),
      }),
      invalidatesTags: ['ProfileMediaImages', 'Profile'],
    }),

    removeProfileMediaImage: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      queryFn: () => ({
        data: successResponse(undefined, 'No-op'),
      }),
      invalidatesTags: ['ProfileMediaImages', 'Profile'],
    }),

    addProfileMediaVideos: builder.mutation<
      ApiResponse<ProfileImage[]>,
      FormData
    >({
      queryFn: () => ({
        data: successResponse([], 'Profile video upload is retired'),
      }),
      invalidatesTags: ['ProfileMediaVideos', 'Profile'],
    }),

    setPrimaryProfileMediaVideo: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      queryFn: () => ({
        data: successResponse(undefined, 'No-op'),
      }),
      invalidatesTags: ['ProfileMediaVideos', 'Profile'],
    }),

    removeProfileMediaVideo: builder.mutation<
      ApiResponse<void>,
      { mediaId: string }
    >({
      queryFn: () => ({
        data: successResponse(undefined, 'No-op'),
      }),
      invalidatesTags: ['ProfileMediaVideos', 'Profile'],
    }),
  }),

  overrideExisting: false,
});

async function updateFirstStudentSection(
  baseQuery: (
    arg: string | FetchArgs
  ) =>
    | QueryReturnValue<unknown, FetchBaseQueryError>
    | PromiseLike<QueryReturnValue<unknown, FetchBaseQueryError>>,
  section: string,
  data: unknown
) {
  const studentsResult = await baseQuery('/students');
  if (studentsResult.error) return { error: studentsResult.error };
  const student = unwrapData<StudentProfileRecord[]>(studentsResult.data)?.[0];
  const studentId = getStudentId(student);
  if (!studentId) {
    return { error: { status: 404, data: 'Student profile not found' } };
  }
  const result = await baseQuery({
    body: { data },
    method: 'PATCH',
    url: `/students/${studentId}/profile-sections/${section}`,
  });
  if (result.error) return { error: result.error };
  return { data: result.data as ApiResponse<ProfileData> };
}

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
  useGetMyProfileMediaVideosQuery,
  useAddProfileMediaImagesMutation,
  useAddProfileMediaVideosMutation,
  useSetPrimaryProfileMediaImageMutation,
  useSetPrimaryProfileMediaVideoMutation,
  useRemoveProfileMediaImageMutation,
  useRemoveProfileMediaVideoMutation,
} = profileApi;
