# Mentora Project Plan

## Product

Mentora is a family-managed AI learning platform for students, parents, and guardians.

The core model is:

```text
Parent or Student User
  -> one or more Student Profiles
  -> academic records and selected subjects
  -> subscription or paid entitlement
  -> scheduled learning session
  -> AI tutor
  -> assessment, progress, and parent/student reporting
```

Adult students must be able to register independently. Parent accounts are optional relationships, not a required owner for every student.

## MVP Audience

Start with a narrow and useful audience:

- Classes 6-10.
- One education board.
- Three subjects: Mathematics, Science, English.
- Text-based AI tutor.
- Parent-managed children plus independent student registration.

## MVP Scope

- Parent registration and login.
- Independent student registration and login.
- Multiple child profiles under one parent.
- Student invitations for child login.
- Parent-student relationship permissions.
- Parental controls for minors and linked students.
- Complete student profile covering personal details, academic details, parents, address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline.
- Institution, board, grade, course, subject, topic, and curriculum master data.
- Student subject enrollment.
- Subscription plans, payments, and explicit learning entitlements.
- Session scheduling with scheduled-time access validation.
- Text AI tutor sessions with message history.
- Session summaries, learning history, and parent progress dashboard.
- Question banks, questions, assessments, attempts, answers, results, topic progress, and recommendations.
- Public website for brand, plans, support, privacy, terms, account deletion, and community guidelines.
- Notifications for session reminders, completion, payments, and safety alerts.
- Admin management for users, subjects, content, plans, payments, and safety review.

## Enterprise Competitive Scope

Mentora should evolve beyond the MVP into an enterprise-grade tutoring platform with capabilities seen in leading tutoring and learning apps:

- Parent and learner spaces with account switching.
- Class marketplace and tutor availability for human mentors.
- Single, recurring weekly, group, offline, and hybrid sessions.
- Live classroom with chat, audio, video, whiteboard, file uploads, shared notes, and lesson summaries.
- AI tutor chat/audio/video with server-side schedule, entitlement, subject, safety, and parental-control guardrails.
- Parent-visible AI history, summaries, moderation alerts, and learning reports.
- Tutor app mode for availability, session requests, classroom launch, notes, homework, attendance, invoices, and earnings.
- Enterprise audit, retention, safety review, transcript export, and notification controls.

See `docs/planning/ENTERPRISE-AI-TUTOR-APP-PLAN.md` for the detailed competitor-aligned product blueprint.

## Platform Foundation

Keep and evolve:

- Auth, JWT, refresh sessions, device sessions, OTP, social login, password reset.
- Mobile shell, navigation, RTK Query, persisted auth, i18n, theme, settings, support.
- Notifications, storage, media upload, monitoring, logging, audit, Redis, queues.
- Payment and subscription lifecycle as the foundation for learning plans.
- Chat/WebSocket infrastructure as the foundation for AI tutor message delivery.
- Admin/RBAC foundations.

Remove or rename when encountered:

- Discovery-marketplace APIs, request workflows that are not learning/session based, non-learning preferences, curated-profile routes, outcome-story modules not tied to learning, and non-learning subscription limits.

## Phases

| Phase | Status  | Goal                               | Key Work                                                                                           |
| ----- | ------- | ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1     | Done    | Mentora foundation                 | Branding, package names, env defaults, separate database, docs, architecture cleanup               |
| 2     | Done    | Family and academic profile        | Student profiles, parent profiles, relationships, invitations, parental controls, academic records |
| 3     | Done    | Academic catalogue                 | Boards, institutions, grades, courses, subjects, topics, curriculums, seed data                    |
| 4     | Done    | Scheduling and entitlements        | Learning schedules, subject enrollments, plans, subscriptions, payments, AI access guard           |
| 5     | Done    | AI tutor                           | AI sessions, messages, prompt context, safety checks, session summaries                            |
| 6     | Done    | Progress and assessments           | Question banks, assessments, attempts, topic progress, recommendations, parent reports             |
| 7     | Partial | Public website and admin hardening | Public website exists; admin flows, operational evidence, and launch readiness still need QA       |
| 8     | Planned | Enterprise classroom               | Chat/audio/video classroom, whiteboard, files, notes, recordings, live captions, network preflight |
| 9     | Planned | Human tutor marketplace            | Tutor profiles, availability, booking requests, trial/recurring sessions, notes, payouts           |
| 10    | Planned | Compliance and scale               | Safety review queues, audit exports, retention policies, analytics, enterprise reporting           |

## Non-Goals For MVP

- B2B school CRM.
- Complete university/college catalogue for every country.
- Voice tutor, handwritten answer checking, live human mentor marketplace, group classes, and gamification.
- Reusing any non-Mentora production database or user data.

## Student Profile Scope

Mentora needs a complete student profile because the profile becomes the operating record for learning, parent management, support, payment entitlement, and audit. The full section list is:

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

For MVP, Personal, Academic, Parents for parent-managed minors, Address at country/state/city/timezone level, Course Preference, Payments, Communication History, and Activity Timeline are required. Previous Education, Exam Scores, and Documents can be progressively completed, but the data model and APIs should be planned from the start.

Detailed fields and API direction are documented in `docs/planning/STUDENT-PROFILE-MODEL.md`.

## Success Criteria

- A parent can create multiple child profiles, assign subjects, purchase or receive entitlements, schedule tutoring, switch between children, and view learning history/progress.
- An adult student can register without a parent, complete academic onboarding, subscribe, schedule a session, and use the AI tutor with server-side access checks.
- AI tutor access is denied outside schedule, without entitlement, when a subject is not included, when parental controls block usage, or when another active session already exists for that student.
- Students can start assessments, submit answers, complete attempts, and generate results that feed progress and recommendations.
- Admin can manage academic master data, plans, users, payments, content, and safety events.
