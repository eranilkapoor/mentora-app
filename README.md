# Match Mate

Match Mate is a full-stack matrimonial platform with a NestJS API server and an Expo React Native app for iOS, Android, and Web. The product is built around Indian matrimonial workflows: onboarding, structured profiles, partner preferences, discovery, interest requests, mutual matches, real-time chat, verification, subscriptions, referrals, notifications, privacy controls, and admin moderation.

This repository is a modular monorepo-style project with two primary applications and one shared package:

- `match-mate-api-server`: NestJS backend API, WebSocket gateways, schedulers, storage, notifications, support tickets, payments, subscriptions, analytics, and admin APIs.
- `match-mate-mobile-app`: Expo React Native mobile/web app with Redux Toolkit Query, secure auth, localization, settings, discovery, chat, membership checkout, wallet/referrals, support, and profile flows.
- `packages/api-contract`: shared TypeScript contracts for membership, billing, payment, and subscription API shapes used by mobile services.

## Repository Layout

```text
match-mate-app/
  match-mate-api-server/       NestJS API server
  match-mate-mobile-app/       Expo React Native app
  packages/
    api-contract/              Shared TypeScript API contract types
  docs/                        Planning, launch, operations, and standards docs
    README.md                  Documentation index
    planning/                  Product, technical, roadmap, and flow plans
    launch/                    Launch readiness, QA, EAS, billing, and monitoring
    operations/                Deployment and command references
    standards/                 Coding and naming standards
  README.md                    Repository entry point
```

## Documentation

Detailed documentation lives under [docs](docs/README.md). To avoid duplicated and drifting information, use these ownership rules:

- Root `README.md`: repository orientation, setup, local commands, and links.
- [Technical Plan](docs/planning/TECHNICAL-PLAN.md): architecture, module map, API strategy, endpoint reference, technical product flows, infrastructure, and production notes.
- [Database Plan](docs/planning/DATABASE-PLAN.md): MongoDB collections, entity relationships, Redis/cache behavior, indexes, lifecycle, and database operations.
- [Project Plan](docs/planning/PROJECT-PLAN.md): product scope, delivery model, responsibilities, and milestones.
- [Task Roadmap](docs/planning/TASK-ROADMAP.md): enterprise feature roadmap and backlog.
- [Flow Plan](docs/planning/FLOW-PLAN.md): UX and screen-flow blueprint.
- [Commands](docs/operations/COMMANDS.md): extended command reference.
- [Deployment Plan](docs/operations/DEPLOYMENT-PLAN.md): deployment and release operations.
- [Launch Plan](docs/launch/LAUNCH-PLAN.md): launch-readiness audit and fix-now status.
- [Coding Standard](docs/standards/CODING-STANDARD.md): naming, folder, file, class, function, and NestJS conventions.

## Architecture Snapshot

The detailed architecture lives in the [Technical Plan](docs/planning/TECHNICAL-PLAN.md). In short:

- Backend: modular NestJS monolith with MongoDB, optional Redis, Socket.IO, local/S3 storage, provider-backed notifications, payments, support, admin, and analytics.
- Frontend: Expo React Native app using React Navigation, Redux Toolkit Query, persisted storage, localization, push notifications, media capture/playback, and shared API contract types.
- Contracts: `packages/api-contract` reduces drift for high-change membership, billing, payment, and subscription surfaces.

## Quick Start

### Prerequisites

- Node.js 20 or later.
- npm.
- MongoDB, unless using the configured local DB fallback.
- Redis, if `CACHE_DRIVER=redis` or queues/socket adapter require Redis.
- Expo tooling for the mobile app.
- Optional provider accounts for Google/Facebook/Apple auth, FCM, email, SMS, Razorpay, S3, and mobile store billing.

### Install Dependencies

```bash
cd match-mate-api-server
npm install

cd ../match-mate-mobile-app
npm install
```

## Environment

### Backend

The API server loads environment files in this order:

```text
.env.${NODE_ENV}
.env
```

For local development, `npm run start:dev` sets `NODE_ENV=development`, so `.env.development` is loaded before `.env`.

Create or update:

```text
match-mate-api-server/.env.development
match-mate-api-server/.env.staging
match-mate-api-server/.env.production
match-mate-api-server/.env.example
```

Important backend variable groups:

- `NODE_ENV`, `PORT`, `API_PREFIX`, `API_VERSION`, `API_BASE_URL`, `ALLOWED_ORIGINS`.
- `MONGO_URI`.
- `CACHE_DRIVER`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASS`.
- `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`.
- `AUTH_*_ENABLED` and provider credentials for Google, Facebook, Apple, phone OTP, and magic link.
- `STORAGE_DRIVER`, `AWS_*`.
- `NOTIFICATION_*`, `PAYMENT_*`, `MATCH_DAILY_DIGEST_*`, `MEDIA_*`, `SHUTDOWN_DRAIN_MS`.

### Mobile

The Expo app uses `EXPO_PUBLIC_*` variables. Production builds must receive these values through the build profile or environment because they are embedded into the client bundle.

Create or update:

```text
match-mate-mobile-app/.env.development
match-mate-mobile-app/.env.example
```

Important mobile variable groups:

- `EXPO_PUBLIC_ENV`, `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_PORT`, `EXPO_PUBLIC_API_PATH`, `EXPO_PUBLIC_CLIENT_VERSION`.
- `EXPO_PUBLIC_AUTH_*_ENABLED`.
- `EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED`, `EXPO_PUBLIC_STORE_BILLING_ENABLED`.
- `EXPO_PUBLIC_GOOGLE_*`, `EXPO_PUBLIC_FACEBOOK_CLIENT_ID`.

The mobile app resolves API URLs through `src/core/utils/config.ts`:

- If `EXPO_PUBLIC_API_BASE_URL` is set, it uses that value plus `EXPO_PUBLIC_API_PATH`.
- In production, if the base URL is missing, it falls back to `https://matchmate.webnza.com`.
- In development, it derives the local host from web hostname or Expo host URI, so IP changes are handled automatically when possible.

## Running Locally

### API Server

```bash
cd match-mate-api-server
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

Health probes:

```text
GET /api/v1/live
GET /api/v1/ready
```

### Mobile App

```bash
cd match-mate-mobile-app
npm run start
```

Platform shortcuts:

```bash
npm run ios
npm run android
npm run web
```

Clear Expo cache:

```bash
npm run start:clear
```

## Common Commands

### Backend

Run from `match-mate-api-server`.

| Command | Purpose |
| ------- | ------- |
| `npm run start:dev` | Development server with watch mode |
| `npm run build` | Clean and build NestJS app |
| `npm run start:prod` | Run compiled production server |
| `npm run start:staging` | Run compiled staging server |
| `npm run lint:check` | Check linting |
| `npm run lint` | Auto-fix linting |
| `npm run typecheck` | TypeScript typecheck |
| `npm run format:check` | Prettier check |
| `npm run format` | Prettier write |
| `npm run seed` | Run master seeder |
| `npm run smoke:dev` | Smoke test local dev API |
| `npm run test` | Jest unit tests |
| `npm run test:cov` | Jest coverage |
| `npm run test:e2e` | Jest e2e tests |

### Mobile

Run from `match-mate-mobile-app`.

| Command | Purpose |
| ------- | ------- |
| `npm run start` | Start Expo |
| `npm run start:clear` | Start Expo with cache clear |
| `npm run ios` | Start iOS target |
| `npm run android` | Start Android target |
| `npm run web` | Start web target |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | TypeScript typecheck |
| `npm run format:check` | Prettier check |
| `npm run format` | Prettier write |
| `npm run build:android:development` | EAS Android dev build |
| `npm run build:android:preview` | EAS Android preview build |
| `npm run build:android:production` | EAS Android production build |

## Verification Before PR

```bash
cd match-mate-api-server
npm run lint:check
npm run typecheck
npm run test
npm run build

cd ../match-mate-mobile-app
npm run lint
npm run typecheck
```

## Git and Hooks

The root repository owns Git hooks and repository-level hygiene. Keep Husky/hooks at the repository root, not inside a nested app folder, so both backend and mobile checks run consistently.

Recommended branch naming:

```text
feature/<short-name>
fix/<short-name>
chore/<short-name>
refactor/<short-name>
```

Recommended commit style:

```text
feat: add referral wallet redemption
fix: prevent duplicate settings toggle requests
chore: update Expo env example
refactor: move admin payment routes under admin module
```

## License

This project is proprietary and confidential. All rights reserved.

Copyright 2026 Match Mate.
