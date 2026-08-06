# Mentora API Server

NestJS API server for the Mentora AI tutoring platform. The server owns authentication, onboarding, student and parent profiles, academic catalogue, schedules, AI tutor access, assessments, progress, notifications, payments, subscriptions, settings, safety, storage, analytics, support, admin, and seeding.

## Architecture

The codebase follows a modular NestJS layout:

- `src/modules/*`: domain modules such as `auth`, `learning`, `profiles`, `chats`, `settings`, `notifications`, `payments`, `subscriptions`, `safety`, `support`, `admin`, and `seeder`.
- `src/common`: shared decorators, guards, filters, DTOs, constants, enums, logger, middleware, and response helpers.
- `src/config`: environment-driven application, database, JWT, notification, storage, payment, and rate-limit configuration.
- `src/infrastructure`: database and infrastructure adapters.

Each feature module should prefer this structure:

- `controllers`: HTTP or gateway entrypoints only.
- `dto`: request and query DTOs, named by action.
- `schemas`: Mongoose schemas, named as singular domain entities.
- `repositories`: database access and persistence helpers.
- `services`: business orchestration and domain rules.

## Naming Conventions

- Folders and filenames use kebab-case.
- Classes use PascalCase.
- Controllers use plural REST resources where applicable, for example `students`, `subjects`, `schedules`, `assessments`, `notifications`, `payments`, and `subscriptions`.
- Schema classes are singular domain entities, for example `NotificationTemplate` and `NotificationLog`.
- DTO files should be action-specific, for example `register.dto.ts`, `send-message.dto.ts`, and `update-profile-privacy.dto.ts`.
- Shared safety concepts such as blocks, reports, and verification live in `modules/safety`.

## API Response Standard

Controllers should return the shared API response envelope through `successResponse`, and should use `SuccessCode` / `ErrorCode` constants where available. This keeps frontend translations and user-facing messages consistent.

## Mentora Learning Domain

The current Mentora-specific backend lives in `src/modules/learning` and includes:

- Student profiles with independent and parent-managed registration.
- Parent profiles, parent-student relationships, invitations, and relationship permissions.
- Parental controls for AI tutor access, assessments, external links, purchases, and scheduling.
- Academic catalogue: boards, universities, institutions, academic levels, grades, streams, courses, subjects, topics, and curriculums.
- Academic records, previous education, exam scores, course preference, and documents.
- Learning schedules, reminders, subject enrollments, and learning entitlements.
- AI tutor sessions/messages with centralized access checks, context builder, safety event logging, and session summaries.
- Assessment domain: question banks, questions, assessments, attempts, answers, results, topic progress, recommendations, and parent progress dashboard.

Important routes include:

```text
POST   /api/v1/students
POST   /api/v1/students/bulk
GET    /api/v1/students
GET    /api/v1/students/:studentId
PATCH  /api/v1/students/:studentId/profile-sections/:section
POST   /api/v1/students/:studentId/schedules
GET    /api/v1/students/:studentId/progress
GET    /api/v1/students/:studentId/topic-progress
GET    /api/v1/students/:studentId/recommendations
GET    /api/v1/students/:studentId/attendance
GET    /api/v1/classrooms/:classroomId/transcript
POST   /api/v1/ai-tutor/sessions
GET    /api/v1/ai-tutor/sessions/:sessionId/context
POST   /api/v1/ai-tutor/sessions/:sessionId/messages
POST   /api/v1/assessment-attempts/:attemptId/complete
GET    /api/v1/parents/progress-dashboard
```

## Logging

Use `AppLogger` from `src/common/logger/logger.service`. Do not instantiate Nest's built-in `Logger` directly in modules or services.

## Scripts

```bash
npm install
npm run start:dev
npm run lint
npm run build
npm run typecheck
npm run seed
```

## Production Notes

- Configure environment files with `.env.<NODE_ENV>` and `.env`.
- Seed data through the explicit `npm run seed` command. Production seeding must use Mentora-only seed data and must never point at copied or non-Mentora databases.
- Run `npm run lint` and `npm run build` before deployment.
- Keep route changes synced with the mobile app RTK services.
