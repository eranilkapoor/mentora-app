# Mentora Technical Plan

## Architecture

Mentora uses this technology stack:

- `mentora-api-server`: modular NestJS API server with MongoDB, optional Redis, Socket.IO, schedulers, storage, notifications, payments, subscriptions, analytics, support, and admin APIs.
- `mentora-mobile-app`: Expo React Native app for iOS, Android, and Web with React Navigation, Redux Toolkit Query, persisted auth, localization, push notifications, media, billing, settings, and support.
- `packages/api-contract`: shared TypeScript API contract package.
- Future public website: frontend public website for brand, plans, privacy, support, and app download routes.

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

## New Backend Modules

Create Mentora modules in phases:

```text
parents
student-profiles
student-profile-sections
parent-student-relationships
student-invitations
guardian-invitations
consent-records
parental-controls
student-preferences
student-addresses
student-documents
student-communications
student-activity-timeline
academic-records
previous-education
exam-scores
course-preferences
education-boards
universities
institutions
academic-levels
grades
streams
courses
subjects
subject-topics
curriculums
student-subject-enrollments
learning-schedules
ai-tutor-sessions
ai-tutor-messages
knowledge-base
assessments
assessment-attempts
student-progress
learning-plans
learning-subscriptions
learning-entitlements
usage-counters
safety
reports
classrooms
classroom-messages
classroom-whiteboards
classroom-files
tutor-profiles
tutor-availability
tutor-session-requests
tutor-session-notes
tutor-payouts
safety-events
safety-review
```

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
GET    /api/v1/students/:studentId/profile
PATCH  /api/v1/students/:studentId/profile/personal
PATCH  /api/v1/students/:studentId/profile/academic
POST   /api/v1/students/:studentId/invite
POST   /api/v1/students/:studentId/parents
GET    /api/v1/students/:studentId/parents
PATCH  /api/v1/students/:studentId/parental-controls
PATCH  /api/v1/students/:studentId/address
GET    /api/v1/students/:studentId/activity-timeline
```

Academic:

```text
POST   /api/v1/students/:studentId/academic-records
GET    /api/v1/students/:studentId/academic-records
POST   /api/v1/students/:studentId/previous-education
GET    /api/v1/students/:studentId/previous-education
POST   /api/v1/students/:studentId/exam-scores
GET    /api/v1/students/:studentId/exam-scores
PATCH  /api/v1/students/:studentId/course-preferences
GET    /api/v1/students/:studentId/course-preferences
POST   /api/v1/students/:studentId/subjects
GET    /api/v1/students/:studentId/progress
GET    /api/v1/students/:studentId/documents
POST   /api/v1/students/:studentId/documents
```

Scheduling:

```text
POST   /api/v1/students/:studentId/schedules
GET    /api/v1/students/:studentId/schedules
PATCH  /api/v1/schedules/:scheduleId
POST   /api/v1/schedules/:scheduleId/cancel
POST   /api/v1/schedules/:scheduleId/start
```

AI tutor:

```text
POST   /api/v1/ai-tutor/sessions
GET    /api/v1/ai-tutor/sessions/:sessionId
POST   /api/v1/ai-tutor/sessions/:sessionId/messages
POST   /api/v1/ai-tutor/sessions/:sessionId/complete
GET    /api/v1/students/:studentId/ai-history
```

Classroom:

```text
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
