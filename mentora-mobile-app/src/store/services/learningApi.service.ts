import { baseApi } from './baseApi.service';

export type TutorType = 'ai' | 'human' | 'hybrid';
export type DeliveryMode = 'chat' | 'audio' | 'video' | 'offline' | 'in_person';
export type ScheduleStatus =
  'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';

export interface StudentProfileSummary {
  id: string;
  _id?: string;
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
  _id?: string;
  name: string;
  code?: string;
  category?: string;
  grade?: string;
  board?: string;
  topicsCount?: number;
}

export interface LearningSchedule {
  id: string;
  _id?: string;
  studentProfileId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  topicName?: string;
  tutorType: TutorType;
  deliveryMode: DeliveryMode;
  title?: string;
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
  _id?: string;
  studentProfileId: string;
  planName?: string;
  entitlementType?: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled' | 'used' | 'revoked';
  includedSubjectIds?: string[];
  allocatedQuantity?: number;
  usedQuantity?: number;
  remainingMinutes?: number;
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

export interface LearningRecommendation {
  id?: string;
  _id?: string;
  studentProfileId: string;
  subjectId?: string;
  topicId?: string;
  type: 'topic_revision' | 'assessment' | 'ai_session' | 'parent_review';
  title: string;
  reason?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'accepted' | 'dismissed' | 'completed';
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
  _id?: string;
  studentProfileId: string;
  subjectId: string;
  scheduleId?: string;
  status: 'active' | 'completed' | 'blocked';
}

export interface AiTutorSessionCreateResult {
  session: AiTutorSession;
  access: AiTutorAccessCheck;
  context?: unknown;
}

export interface AiTutorMessage {
  id: string;
  _id?: string;
  sessionId: string;
  sender: 'student' | 'ai';
  messageType: string;
  content: string;
  safetyStatus: 'allowed' | 'review' | 'blocked';
  createdAt?: string;
}

export interface AiTutorSessionDetail {
  session: AiTutorSession;
  messages: AiTutorMessage[];
  context?: unknown;
}

export interface AiTutorMessagePayload {
  sessionId: string;
  content: string;
  messageType?: 'text' | 'question' | 'answer' | 'audio' | 'image';
}

export interface AssessmentSummary {
  id?: string;
  _id?: string;
  title: string;
  subjectId: string;
  assessmentType: 'diagnostic' | 'practice' | 'homework' | 'quiz' | 'exam';
  durationMinutes?: number;
  passingScorePercentage?: number;
}

export interface ParentProgressDashboard {
  students: Array<{
    student: StudentProfileSummary;
    progress: LearningProgressSummary;
    recommendations: LearningRecommendation[];
  }>;
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
      ApiEnvelope<AiTutorSessionCreateResult>,
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
    getAiTutorSession: builder.query<
      ApiEnvelope<AiTutorSessionDetail>,
      { sessionId: string }
    >({
      query: ({ sessionId }) => `/ai-tutor/sessions/${sessionId}`,
      providesTags: ['AiTutorSession'],
    }),
    sendAiTutorMessage: builder.mutation<
      ApiEnvelope<{
        studentMessage: AiTutorMessage;
        aiMessage: AiTutorMessage;
      }>,
      AiTutorMessagePayload
    >({
      query: ({ sessionId, ...body }) => ({
        url: `/ai-tutor/sessions/${sessionId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AiTutorSession', 'LearningProgress'],
    }),
    getAssessments: builder.query<
      ApiEnvelope<AssessmentSummary[]>,
      { subjectId?: string } | void
    >({
      query: (arg) =>
        arg?.subjectId
          ? `/assessments?subjectId=${encodeURIComponent(arg.subjectId)}`
          : '/assessments',
      providesTags: ['LearningProgress'],
    }),
    getLearningRecommendations: builder.query<
      ApiEnvelope<LearningRecommendation[]>,
      { studentProfileId: string }
    >({
      query: ({ studentProfileId }) =>
        `/students/${studentProfileId}/recommendations`,
      providesTags: ['LearningProgress'],
    }),
    getParentProgressDashboard: builder.query<
      ApiEnvelope<ParentProgressDashboard>,
      void
    >({
      query: () => '/parents/progress-dashboard',
      providesTags: ['LearningProgress', 'Student'],
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
  useGetAiTutorSessionQuery,
  useSendAiTutorMessageMutation,
  useGetAssessmentsQuery,
  useGetLearningRecommendationsQuery,
  useGetParentProgressDashboardQuery,
} = learningApi;
