# MatchMate API Server

NestJS API server for the MatchMate matrimonial platform. The server owns authentication, onboarding, profiles, preferences, discovery, matching, chat, notifications, payments, subscriptions, settings, safety, storage, analytics, and seeding.

## Architecture

The codebase follows a modular NestJS layout:

- `src/modules/*`: domain modules such as `auth`, `profiles`, `matches`, `chats`, `settings`, `notifications`, `payments`, `subscriptions`, `safety`, and `seeder`.
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
- Controllers use plural REST resources where applicable, for example `profiles`, `matches`, `chats`, `notifications`, `payments`, and `subscriptions`.
- Schema classes are singular domain entities, for example `NotificationTemplate` and `NotificationLog`.
- DTO files should be action-specific, for example `register.dto.ts`, `send-message.dto.ts`, and `update-profile-privacy.dto.ts`.
- Shared safety concepts such as blocks, reports, and verification live in `modules/safety`.

## API Response Standard

Controllers should return the shared API response envelope through `successResponse`, and should use `SuccessCode` / `ErrorCode` constants where available. This keeps frontend translations and user-facing messages consistent.

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
- Seed data through the explicit `npm run seed` command. Production seeding requires `SEEDER_CONFIRM=MATCHMATE_PROD`.
- Run `npm run lint` and `npm run build` before deployment.
- Keep route changes synced with the mobile app RTK services.
