# Mentora Technical Plan

## Architecture

Mentora uses this technology stack:

- `mentora-api-server`: modular NestJS API server with MongoDB, optional Redis, Socket.IO, schedulers, storage, notifications, payments, subscriptions, analytics, support, and admin APIs.
- `mentora-mobile-app`: Expo React Native app for iOS, Android, and Web with React Navigation, Redux Toolkit Query, persisted auth, localization, push notifications, media, billing, settings, and support.
- `packages/api-contract`: shared TypeScript API contract package.
- `mentora-public-website`: static public website for brand, plans, privacy, terms, account deletion, community guidelines, support, and app-link content.

Mentora must use its own database and environments. Do not point this app at any non-Mentora production data.

## Identity Model

Use one generic `users` collection for login identities:

```text
roles: student, parent, mentor, teacher, content_manager, support, admin, super_admin
```

Student academic data lives in `student_profiles`, not in the user document.

Supported account modes:

- Independent adult student: `User -> StudentProfile`.
- Parent-managed child: `Parent User -> StudentProfile`.
- Child with login: `Parent User <-> Student User -> StudentProfile`.
- Adult student with optional parent/guardian link.
- Multiple guardians for one student.

## Implemented Backend Domain

The Mentora learning domain is implemented in `mentora-api-server/src/modules/learning` with these concrete concerns:

```text
student_profiles
parent_profiles
parent_student_relationships
student_invitations
parental_controls
student_academic_records
academic_boards
universities
institutions
academic_levels
grades
streams
courses
subjects
topics
curriculums
student_subject_enrollments
learning_schedules
learning_entitlements
ai_tutor_sessions
ai_tutor_messages
question_banks
questions
assessments
assessment_attempts
assessment_answers
assessment_results
student_topic_progress
learning_recommendations
classrooms
classroom_messages
classroom_files
tutor_profiles
tutor_availability
tutor_session_notes
safety_events
```

Future enterprise extensions still planned: whiteboards, live media rooms, tutor session requests, tutor payouts, knowledge-base ingestion, model usage metering, dedicated safety review queues, and retention/export automation.

## Complete Student Profile

The student profile should be implemented as a complete learning CRM record, not only a short onboarding form.

Required profile sections:

- Personal
- Academic
- Parents
- Address
- Previous Education
- Exam Scores
- Course Preference
- Documents
- Payments
- Communication History
- Activity Timeline

This helps Mentora with personalization, parent supervision, support operations, payment entitlement, AI context, compliance, and audit. The profile editor should allow progressive completion: only minimum identity, age policy, academic level, course preference, and parent/consent/payment fields should block critical flows.

See `docs/planning/STUDENT-PROFILE-MODEL.md` for fields, section ownership, and screen direction.

Keep existing infrastructure modules where useful:

```text
auth
user-sessions
notifications
storage
payments
subscriptions
settings
support
admin
analytics
feature-flags
monitoring
cache
audit
```

## AI Access Guard

All AI tutor sessions must pass one centralized access service.

Input:

```ts
interface AiAccessCheckInput {
  studentProfileId: string;
  subjectId: string;
  scheduleId?: string;
  requestedAt: Date;
}
```

Checks:

- Student exists and is active.
- Requesting user can act for the student.
- Parental controls permit usage.
- Schedule is active and current time is inside the allowed window.
- Subject is enrolled and included in entitlement.
- Subscription/payment entitlement is active.
- Usage and daily limits are available.
- Session has not been cancelled or expired.

Result:

```ts
interface AiAccessResult {
  allowed: boolean;
  denialReason?:
    | "OUTSIDE_SCHEDULE"
    | "NO_SUBSCRIPTION"
    | "SUBJECT_NOT_INCLUDED"
    | "PARENTAL_CONTROL_BLOCKED"
    | "DAILY_LIMIT_EXCEEDED"
    | "ENTITLEMENT_EXPIRED";
  entitlementId?: string;
  remainingMinutes?: number;
}
```

## Primary API Surfaces

Family:

```text
POST   /api/v1/students
GET    /api/v1/students
GET    /api/v1/students/:studentId
PATCH  /api/v1/students/:studentId
PATCH  /api/v1/students/:studentId/profile-sections/:section
GET    /api/v1/students/parents/me/profile
PATCH  /api/v1/students/parents/me/profile
POST   /api/v1/students/:studentId/parents
PATCH  /api/v1/students/:studentId/parental-controls
GET    /api/v1/students/:studentId/parental-controls
POST   /api/v1/students/:studentId/invitations
GET    /api/v1/students/:studentId/invitations
POST   /api/v1/students/:studentId/invitations/:invitationId/revoke
POST   /api/v1/students/invitations/accept
```

Academic:

```text
POST   /api/v1/students/:studentId/academic-records
GET    /api/v1/students/:studentId/academic-records
PATCH  /api/v1/students/:studentId/previous-education
PATCH  /api/v1/students/:studentId/exam-scores
PATCH  /api/v1/students/:studentId/course-preference
PATCH  /api/v1/students/:studentId/documents
POST   /api/v1/students/:studentId/subjects
GET    /api/v1/students/:studentId/progress
GET    /api/v1/students/:studentId/topic-progress
PATCH  /api/v1/students/:studentId/topic-progress
GET    /api/v1/students/:studentId/recommendations
GET    /api/v1/academic-catalog/:type
POST   /api/v1/academic-catalog/:type
GET    /api/v1/subjects
POST   /api/v1/subjects
GET    /api/v1/topics
POST   /api/v1/topics
GET    /api/v1/curriculums
POST   /api/v1/curriculums
```

Scheduling:

```text
POST   /api/v1/students/:studentId/schedules
GET    /api/v1/students/:studentId/schedules
POST   /api/v1/schedules/:scheduleId/cancel
POST   /api/v1/schedules/:scheduleId/reschedule
POST   /api/v1/learning-entitlements
GET    /api/v1/learning-entitlements?studentProfileId=:studentId
```

AI tutor:

```text
POST   /api/v1/ai-tutor/sessions
GET    /api/v1/ai-tutor/sessions/:sessionId
GET    /api/v1/ai-tutor/sessions/:sessionId/context
POST   /api/v1/ai-tutor/sessions/:sessionId/messages
POST   /api/v1/ai-tutor/sessions/:sessionId/complete
GET    /api/v1/students/:studentId/ai-history
```

Assessments and progress:

```text
GET    /api/v1/question-banks
POST   /api/v1/question-banks
GET    /api/v1/questions
POST   /api/v1/questions
GET    /api/v1/assessments
POST   /api/v1/assessments
POST   /api/v1/assessments/:assessmentId/attempts
POST   /api/v1/assessment-attempts/:attemptId/answers
POST   /api/v1/assessment-attempts/:attemptId/complete
POST   /api/v1/learning-recommendations
GET    /api/v1/parents/progress-dashboard
```

Classroom:

```text
Future-facing schemas exist for classroom records, messages, files, tutor profiles, tutor availability, and tutor session notes. Dedicated classroom/tutor controllers are not complete yet.
POST   /api/v1/classrooms/:scheduleId/join
POST   /api/v1/classrooms/:classroomId/leave
GET    /api/v1/classrooms/:classroomId/messages
POST   /api/v1/classrooms/:classroomId/messages
POST   /api/v1/classrooms/:classroomId/files
GET    /api/v1/classrooms/:classroomId/whiteboard
PATCH  /api/v1/classrooms/:classroomId/whiteboard
POST   /api/v1/classrooms/:classroomId/summary
```

Tutor marketplace:

```text
Future-facing. Tutor schemas exist, but marketplace booking APIs are not launch-complete yet.
GET    /api/v1/tutors
GET    /api/v1/tutors/:tutorId
GET    /api/v1/tutors/:tutorId/availability
POST   /api/v1/tutors/:tutorId/session-requests
PATCH  /api/v1/tutor-session-requests/:requestId
POST   /api/v1/tutor-sessions/:scheduleId/notes
GET    /api/v1/tutors/me/earnings
```

Subscriptions:

```text
GET    /api/v1/plans
POST   /api/v1/subscriptions
GET    /api/v1/subscriptions/current
GET    /api/v1/subscriptions/usage
GET    /api/v1/students/:studentId/payments
GET    /api/v1/students/:studentId/communications
POST   /api/v1/payments/create-order
POST   /api/v1/payments/verify
```

## Mobile Navigation

Student mode:

```text
Home
Learn
Schedule
Progress
Profile
```

Parent mode:

```text
Dashboard
Children
Schedule
Payments
Settings
```

Add an account switcher so a parent can view as parent or as one child profile.

## Safety Requirements

- Age-appropriate responses.
- No unsafe sexual content.
- No encouragement of self-harm.
- No direct collection of unnecessary personal data.
- No unrestricted external links for minors.
- No asking children to contact strangers.
- Parent-visible summaries and safety alerts.
- Moderation before and after model output.
- Safety event logging and report-content flow.
- Secure document access and retention controls.

## Classroom Requirements

- Pre-join device/network check.
- Join button eligibility must come from the API, not the client clock alone.
- Chat, audio, video, file upload, whiteboard, notes, transcript, and summary APIs must share one classroom audit trail.
- Human tutor sessions require attendance, tutor notes, homework, and parent-visible summary.
- AI sessions require prompt context, transcript policy, usage counters, moderation, and safety events.
