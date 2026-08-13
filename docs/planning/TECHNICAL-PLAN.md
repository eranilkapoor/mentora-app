# Mentora Technical Plan

## Architecture

Mentora uses this technology stack:

- `mentora-api-server`: modular NestJS API server with MongoDB, optional Redis, Socket.IO, schedulers, storage, notifications, payments, subscriptions, analytics, support, and admin APIs.
- `mentora-mobile-app`: Expo React Native app for iOS, Android, and Web with React Navigation, Redux Toolkit Query, persisted auth, localization, push notifications, media, billing, settings, and support.
- `packages/api-contract`: shared TypeScript API contract package.
- `mentora-public-website`: Next.js public website for brand, plans, privacy, terms, account deletion, community guidelines, support, app-link content, and CRM demo-request capture.

Mentora must use its own database and environments. Do not point this app at any non-Mentora production data.

## Identity Model

Use one generic `users` collection for login identities:

```text
roles: student, parent, mentor, teacher, content_manager, support, admin, super_admin
```

Student academic data lives in `student_profiles`, not in the user document.

Active Mentora profile APIs must use `students`, `student_profiles`, `parent_profiles`, and parent-student relationship records. The old source-app `profiles` module and collection are removed from runtime code because they contained matrimonial fields and ambiguous ownership semantics.

CRM identity and access management uses this hierarchy:

```text
Platform
└── Organization / Organization
    ├── Branch
    ├── Department
    ├── Team
    └── Users / Memberships
```

Organization-scoped CRM users are stored as `users` plus `user_memberships`. A membership can carry branch, department, and team scope IDs, plus the CRM role and explicit permission overrides. Super admins can operate across all organizations; other users are constrained by active organization membership and optional scoped IDs.

IAM APIs include `admin/branches`, `admin/departments`, `admin/teams`, `admin/organization-users`, `admin/rbac`, and `admin/identity/hierarchy`. The CRM should use `GET /api/v1/admin/identity/hierarchy?organizationId=...` to hydrate all hierarchy dropdowns from server data.

See [CRM And App Role Operations](CRM-AND-APP-ROLE-OPERATIONS.md) for the role-by-role operation matrix covering what platform users, organization users, and app users can see, list, filter, add, edit, change status, archive, restore, export, or manage.

See [SaaS Billing Plan](SAAS-BILLING-PLAN.md) for the split between consumer student/parent subscriptions and organization CRM SaaS subscriptions, including plan limits, organization billing ownership, payment/invoice scoping, and enterprise billing gaps.

## Super Admin CRM Behavior

Platform super admins operate globally, but organization-owned writes still require a selected organization context.

- Default login context: `All organizations` and `All branches`.
- Platform-wide modules are available immediately: Dashboard, Organizations, Users, Roles, Permissions, Security, Integrations, Reports/Audit-style platform views.
- Hierarchy modules are visible immediately: Branches, Departments, and Teams. They require selecting a specific organization before listing, creating, editing, archiving, restoring, or exporting records.
- Organization-owned modules such as Leads, Applications, Admissions, Campaigns, Communications, Tasks, Documents, Finance, Events, Field Force, Workflows, and Programs require a selected organization before create/update/status/archive operations.

## RBAC Readiness

Roles and Permissions are code-side ready for controlled MVP demos.

Implemented:

- Create, list, search/filter through CRM, get by ID, update, active/inactive status changes, and role-to-permission mapping.
- Backend role/permission delete endpoints now soft-disable records by setting `isActive=false`; they do not physically delete RBAC definitions.
- Permission disable is blocked when the permission is assigned to an active role.
- Role disable is blocked when the role is assigned to users.

Remaining production hardening:

- Add audit writes for RBAC create/update/disable.
- Add immutable protection for seeded system roles and system permissions if required by product policy.
- Add E2E access tests for super admin, organization admin, branch admin, counselor, finance, and support.

## CRM Product Layers

Backend module coverage and admin CRM navigation are aligned to five layers:

- Platform Foundation: organization registration, subscription plans, billing, feature flags, usage limits, super admin, activation/suspension, domains, branding, global settings, and audit logs.
- Identity and Organization: authentication, users, roles, permissions, branches, departments, teams, reporting hierarchy, data visibility, login history, and device sessions.
- Generic CRM: leads, contacts, lead sources/stages, activities, notes, tasks, follow-ups, meetings, assignments, tags, custom fields, imports/exports, and communication timeline.
- Education-Specific Modules: academic sessions, programs, courses, specializations, applications, document verification, admissions, interviews, offers, scholarships, enrollment, fees, and student portal.
- Growth and Automation: campaigns, landing pages, workflow automation, lead scoring, attribution, telephony, chatbots, analytics, AI assistance, and channel modules for email, SMS, WhatsApp, push, and calls.

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
study_plans
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

## API Surface Boundaries

Mentora now uses two clear API faces:

- Customer, student, parent, and public website APIs do not use an admin prefix. Examples: `/api/v1/auth`, `/api/v1/students`, `/api/v1/learning`, `/api/v1/payments`, `/api/v1/subscriptions`, `/api/v1/settings`, `/api/v1/support/tickets`, `/api/v1/notifications`, `/api/v1/feature-flags`, and `/api/v1/leads/capture`.
- CRM, super admin, organization admin, counselor, finance, marketing, call center, and operations APIs use `/api/v1/admin/...`. Examples: `/api/v1/admin/auth/login`, `/api/v1/admin/dashboard/bootstrap`, `/api/v1/admin/organizations`, `/api/v1/admin/branches`, `/api/v1/admin/leads`, `/api/v1/admin/applications`, `/api/v1/admin/admissions`, `/api/v1/admin/tasks`, `/api/v1/admin/reports`, and `/api/v1/admin/security-policies`.

Feature flags remain a customer/runtime capability. Admin access control is governed by RBAC, memberships, organization context, branch context, security policies, audit logs, and session controls, not feature flags.

Support and leads are shared domains with separate API faces where needed: public lead capture uses `/api/v1/leads/capture`, CRM lead management uses `/api/v1/admin/leads`, customer support uses `/api/v1/support/tickets`, and CRM support operations use `/api/v1/admin/support/tickets`.

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
POST   /api/v1/students/:studentId/eligibility-documents
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
GET    /api/v1/study-plans
POST   /api/v1/study-plans
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
GET    /api/v1/classrooms/:classroomId/messages
POST   /api/v1/classrooms/:classroomId/messages
GET    /api/v1/classrooms/:classroomId/files
POST   /api/v1/classrooms/:classroomId/files
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

Education CRM:

```text
GET    /api/v1/admin/dashboard/bootstrap
GET    /api/v1/admin/dashboard?organizationId=:organizationId
GET    /api/v1/admin/module-records/coverage
GET    /api/v1/admin/module-records?organizationId=:organizationId&moduleKey=:moduleKey
POST   /api/v1/admin/module-records
POST   /api/v1/admin/module-records/:recordId
GET    /api/v1/me/contexts
POST   /api/v1/me/context
```

Public website:

```text
POST   /api/demo-request
```

The public website route validates first name plus email/phone and forwards to `POST /api/v1/leads/capture` when `NEXT_PUBLIC_API_BASE_URL` is configured. This keeps the browser on a same-origin endpoint and avoids CORS friction during demos.

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
