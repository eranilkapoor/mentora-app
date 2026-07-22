import { baseApi } from './baseApi.service';

export type TutorType = 'ai' | 'human' | 'hybrid';
export type DeliveryMode = 'chat' | 'audio' | 'video' | 'offline' | 'in_person';
export type ScheduleStatus =
  'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';

export interface StudentProfileSummary {
  id: string;
  userId?: string;
  displayName: string;
  grade?: string;
  academicLevel?: string;
  institutionName?: string;
  primarySubjects: string[];
  profileCompletionPercentage?: number;
  parentalControlsEnabled?: boolean;
}

export interface SubjectSummary {
  id: string;
  name: string;
  code?: string;
  grade?: string;
  board?: string;
  topicsCount?: number;
}

export interface LearningSchedule {
  id: string;
  studentProfileId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  topicName?: string;
  tutorType: TutorType;
  deliveryMode: DeliveryMode;
  startAt: string;
  endAt: string;
  timezone: string;
  status: ScheduleStatus;
  joinEnabled?: boolean;
  joinAvailableAt?: string;
  joinExpiresAt?: string;
}

export interface LearningEntitlement {
  id: string;
  studentProfileId: string;
  planName: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  includedSubjectIds: string[];
  remainingMinutes: number;
  expiresAt?: string;
}

export interface LearningProgressSummary {
  studentProfileId: string;
  totalLearningMinutes: number;
  completedSessions: number;
  averageAssessmentScore?: number;
  subjectProgress: Array<{
    subjectId: string;
    subjectName: string;
    masteryPercentage: number;
    recommendedTopic?: string;
  }>;
}

export interface AiTutorAccessCheck {
  allowed: boolean;
  denialReason?:
    | 'OUTSIDE_SCHEDULE'
    | 'NO_SUBSCRIPTION'
    | 'SUBJECT_NOT_INCLUDED'
    | 'PARENTAL_CONTROL_BLOCKED'
    | 'DAILY_LIMIT_EXCEEDED'
    | 'ENTITLEMENT_EXPIRED';
  remainingMinutes?: number;
  entitlementId?: string;
}

export interface CreateSchedulePayload {
  studentProfileId: string;
  subjectId: string;
  topicId?: string;
  tutorType: TutorType;
  deliveryMode: DeliveryMode;
  startAt: string;
  endAt: string;
  timezone: string;
  recurrenceRule?: string;
}

export interface StartAiTutorSessionPayload {
  studentProfileId: string;
  subjectId: string;
  scheduleId?: string;
  deliveryMode: Extract<DeliveryMode, 'chat' | 'audio' | 'video'>;
}

export interface AiTutorSession {
  id: string;
  studentProfileId: string;
  subjectId: string;
  scheduleId?: string;
  status: 'active' | 'completed' | 'blocked';
  access: AiTutorAccessCheck;
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export const learningApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudents: builder.query<ApiEnvelope<StudentProfileSummary[]>, void>({
      query: () => '/students',
      providesTags: ['Student'],
    }),
    getSubjects: builder.query<ApiEnvelope<SubjectSummary[]>, void>({
      query: () => '/subjects',
      providesTags: ['Subject'],
    }),
    getStudentSchedules: builder.query<
      ApiEnvelope<LearningSchedule[]>,
      { studentProfileId: string }
    >({
      query: ({ studentProfileId }) =>
        `/students/${studentProfileId}/schedules`,
      providesTags: ['LearningSchedule'],
    }),
    createLearningSchedule: builder.mutation<
      ApiEnvelope<LearningSchedule>,
      CreateSchedulePayload
    >({
      query: ({ studentProfileId, ...body }) => ({
        url: `/students/${studentProfileId}/schedules`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LearningSchedule', 'LearningEntitlement'],
    }),
    cancelLearningSchedule: builder.mutation<
      ApiEnvelope<LearningSchedule>,
      { scheduleId: string; reason?: string }
    >({
      query: ({ scheduleId, reason }) => ({
        url: `/schedules/${scheduleId}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['LearningSchedule', 'LearningEntitlement'],
    }),
    getLearningEntitlements: builder.query<
      ApiEnvelope<LearningEntitlement[]>,
      { studentProfileId: string }
    >({
      query: ({ studentProfileId }) =>
        `/learning-entitlements?studentProfileId=${encodeURIComponent(
          studentProfileId
        )}`,
      providesTags: ['LearningEntitlement'],
    }),
    getStudentProgress: builder.query<
      ApiEnvelope<LearningProgressSummary>,
      { studentProfileId: string }
    >({
      query: ({ studentProfileId }) => `/students/${studentProfileId}/progress`,
      providesTags: ['LearningProgress'],
    }),
    startAiTutorSession: builder.mutation<
      ApiEnvelope<AiTutorSession>,
      StartAiTutorSessionPayload
    >({
      query: (body) => ({
        url: '/ai-tutor/sessions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'AiTutorSession',
        'LearningEntitlement',
        'LearningProgress',
      ],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetSubjectsQuery,
  useGetStudentSchedulesQuery,
  useCreateLearningScheduleMutation,
  useCancelLearningScheduleMutation,
  useGetLearningEntitlementsQuery,
  useGetStudentProgressQuery,
  useStartAiTutorSessionMutation,
} = learningApi;
