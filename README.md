# Mentora

Mentora is a B2C AI tutoring and mentorship platform for students and parents. This repository is the Mentora product workspace and should use Mentora branding, Mentora environments, Mentora data models, and a separate Mentora database.

The first product direction is a family-managed learning app:

- Students can register independently when age policy allows it.
- Parents can create and manage multiple child/student profiles.
- A student profile stores academic and learning data; a user account stores login identity.
- Parent access is modeled through optional parent-student relationships and permissions.
- Students schedule AI tutor sessions, assessments, revision, and events.
- AI tutor access is allowed only when schedule, subscription/payment, subject entitlement, parental controls, and safety checks pass.

## Repository Layout

```text
mentora-app/
  mentora-api-server/       NestJS API server
  mentora-mobile-app/       Expo React Native app
  packages/
    api-contract/           Shared TypeScript API contract types
  docs/                     Product, technical, database, flow, launch, operations, and standards docs
  README.md                 Repository entry point
```

The server and mobile apps are being cleaned into a Mentora-only product surface. Shared platform capabilities such as auth, profiles, chat, subscriptions, payments, notifications, settings, storage, admin, analytics, and support remain useful only when they describe student, parent, learning, tutoring, safety, and billing behavior.

## Core Product Model

```text
User
  Login identity for student, parent, mentor, support, admin, or content staff

StudentProfile
  Academic and learning identity. May belong to an independent student user or be parent managed.

ParentStudentRelationship
  Optional parent/guardian link with permissions and consent.

LearningSchedule
  Scheduled AI tutoring, revision, assessment, mentor session, or academic event.

LearningEntitlement
  Explicit paid/subscription/free access to a subject, AI minutes, session, assessment, or course.

AiTutorSession
  Controlled teaching session tied to student, subject, topic, schedule, entitlement, and safety context.
```

## Documentation

- [Technical Plan](docs/planning/TECHNICAL-PLAN.md): Mentora architecture, module map, API surfaces, and migration strategy.
- [Database Plan](docs/planning/DATABASE-PLAN.md): MongoDB collections for identity, family, academic, scheduling, AI tutor, progress, payments, and safety.
- [Project Plan](docs/planning/PROJECT-PLAN.md): product scope, MVP, phases, and non-goals.
- [Student Profile Model](docs/planning/STUDENT-PROFILE-MODEL.md): complete student profile sections including personal, academic, parents, documents, payments, communications, and activity timeline.
- [Task Roadmap](docs/planning/TASK-ROADMAP.md): implementation roadmap from copied foundation to Mentora modules.
- [Flow Plan](docs/planning/FLOW-PLAN.md): parent/student journeys and screen model.
- [Commands](docs/operations/COMMANDS.md): extended command reference.
- [Coding Standard](docs/standards/CODING-STANDARD.md): engineering conventions.

## Quick Start

### Prerequisites

- Node.js 20 or later.
- npm 10 or later.
- MongoDB, unless using the configured local DB fallback.
- Redis if `CACHE_DRIVER=redis` or queues/socket adapter require Redis.
- Expo tooling for the mobile app.
- Provider accounts as needed for Google/Facebook/Apple auth, FCM, email, SMS, Razorpay/store billing, S3, and monitoring.

### Install Dependencies

```bash
cd mentora-api-server
npm install

cd ../mentora-mobile-app
npm install
```

### Backend Environment

The API server loads environment files in this order:

```text
.env.${NODE_ENV}
.env
```

Create or update:

```text
mentora-api-server/.env.development
mentora-api-server/.env.staging
mentora-api-server/.env.production
mentora-api-server/.env.example
```

Use a separate Mentora database:

```text
MONGO_URI=mongodb://localhost:27017/mentora
JWT_ISSUER=mentora-api
API_BASE_URL=http://localhost:3000
APP_WEB_URL=http://localhost:3000
```

### Mobile Environment

The Expo app uses `EXPO_PUBLIC_*` variables:

```text
mentora-mobile-app/.env.development
mentora-mobile-app/.env.example
```

Important values:

```text
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_PATH=/api/v1
EXPO_PUBLIC_CLIENT_VERSION=1.0.0
```

## Running Locally

### API Server

```bash
cd mentora-api-server
npm run start:dev
```

Default local API:

```text
http://localhost:3000/api/v1
```

Swagger in non-production:

```text
http://localhost:3000/api/docs
```

### Mobile App

```bash
cd mentora-mobile-app
npm run start
```

Platform shortcuts:

```bash
npm run ios
npm run android
npm run web
```

## Repository Commands

Run from the repository root:

```bash
npm run lint
npm run typecheck:api
npm run typecheck:mobile
npm run build:api
npm run test:api
npm run test:mobile
```

## Current Implementation Status

Done:

- Established this standalone Mentora repository.
- Renamed top-level app folders to `mentora-api-server` and `mentora-mobile-app`.
- Updated root package scripts to point at the Mentora folders.
- Updated package/app metadata and mobile bundle identifiers to Mentora naming.
- Added Mentora product, technical, database, flow, student profile, and roadmap documentation.
- Added learning-domain API modules for students, academic records, subjects, schedules, entitlements, AI tutor sessions, classrooms, tutors, and safety events.
- Updated mobile navigation toward student learning tabs: Home, Learn, Schedule, Progress, Profile.
- Updated onboarding and edit profile toward student/parent-managed learning profiles with completion scoring.

Next:

- Finish replacing stale feature keys, notification categories, and legacy contract names with learning equivalents.
- Complete parent mode, child switching, documents, payments, communication history, and activity timeline.
- Expand seed data for Classes 6-10, boards, Mathematics, Science, English, and common academic tracks.
- Add tests around AI tutor schedule, entitlement, parental control, device/session, and safety guards.

## License

This project is proprietary and confidential. All rights reserved.

Copyright 2026 Mentora.
