# Match Mate

Match Mate is a full-stack matrimonial platform with a NestJS API server and an Expo React Native app for iOS, Android, and Web. The product is built around Indian matrimonial workflows: onboarding, structured profiles, partner preferences, discovery, interest requests, mutual matches, real-time chat, verification, subscriptions, referrals, notifications, privacy controls, and admin moderation.

This repository is a modular monorepo-style project with two primary applications:

- `match-mate-api-server`: NestJS backend API, WebSocket gateways, schedulers, storage, notifications, payments, and admin APIs.
- `match-mate-mobile-app`: Expo React Native mobile/web app with Redux Toolkit Query, secure auth, localization, settings, discovery, chat, membership, and profile flows.

## Repository Layout

```text
match-mate-app/
  match-mate-api-server/       NestJS API server
  match-mate-mobile-app/       Expo React Native app
  docs/                         Planning, launch, operations, and standards docs
    README.md                   Documentation index
    planning/                   Product, technical, roadmap, and flow plans
    launch/                     Launch readiness, QA, EAS, billing, and monitoring
    operations/                 Deployment and command references
    standards/                  Coding and naming standards
  README.md                     Repository entry point
```

## Documentation

The detailed project documentation lives under [docs](docs/README.md).

| Area | Document |
|---|---|
| Product and delivery plan | [Project Plan](docs/planning/PROJECT-PLAN.md) |
| Technical architecture | [Technical Plan](docs/planning/TECHNICAL-PLAN.md) |
| Enterprise feature roadmap | [Task Roadmap](docs/planning/TASK-ROADMAP.md) |
| UX and screen flows | [Flow Plan](docs/planning/FLOW-PLAN.md) |
| Launch readiness | [Launch Plan](docs/launch/LAUNCH-PLAN.md) |
| Play Store QA | [Play Store QA Checklist](docs/launch/PLAY-STORE-QA-CHECKLIST.md) |
| EAS production build | [EAS Production Checklist](docs/launch/EAS-PRODUCTION-CHECKLIST.md) |
| Deployment operations | [Deployment Plan](docs/operations/DEPLOYMENT-PLAN.md) |
| Developer commands | [Commands](docs/operations/COMMANDS.md) |
| Coding standards | [Coding Standard](docs/standards/CODING-STANDARD.md) |

## Current Architecture

The backend is a modular NestJS monolith. Domain modules own their schemas, repositories, services, controllers, tasks, and DTOs. This keeps the MVP deployable as one server while preserving clear future extraction paths for auth, chat, notifications, payments, matching, and admin.

```text
Expo app
  |
  | HTTPS / WebSocket
  v
NestJS API server
  |
  |-- Auth and sessions
  |-- Profiles, preferences, media, verification
  |-- Match discovery and interactions
  |-- Chat REST + Socket.IO
  |-- Notifications and device tokens
  |-- Settings
  |-- Payments, subscriptions, referrals
  |-- Admin, moderation, analytics
  |
  |-- MongoDB
  |-- Redis or local cache driver
  |-- Local storage or S3 storage driver
  |-- Optional FCM, email, SMS, payment providers
```

## Tech Stack

### Backend

| Area | Technology |
|---|---|
| Runtime | Node.js, TypeScript |
| Framework | NestJS 11 |
| Database | MongoDB with Mongoose |
| Cache / queue | Redis with ioredis and BullMQ, with local fallbacks where configured |
| Realtime | Socket.IO with optional Redis adapter |
| Auth | JWT, refresh token rotation, Passport, OAuth providers |
| Validation | class-validator, class-transformer, Joi env validation |
| Storage | Local upload folder or AWS S3 |
| Notifications | In-app DB notifications, Socket.IO, optional FCM, email, SMS |
| Payments | Razorpay/web payment flow, mobile store verification mode, invoice/refund/admin reporting APIs |
| Logging | Custom `AppLogger`, global logging interceptor, correlation IDs |
| API docs | Swagger in non-production environments |

### Frontend

| Area | Technology |
|---|---|
| App | Expo 54, React Native 0.81, React 19 |
| Platforms | iOS, Android, Web |
| Navigation | React Navigation native stack and bottom tabs |
| State | Redux Toolkit, RTK Query, redux-persist |
| Storage | expo-secure-store, AsyncStorage for persisted non-secret state |
| Realtime | socket.io-client |
| Media | expo-image-picker, expo-video, expo-video-thumbnails |
| Localization | i18next, react-i18next, expo-localization |
| Native features | Apple auth, biometric auth, location, push notifications, sharing, print |

## Quick Start

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB, unless using the configured local DB fallback
- Redis, if `CACHE_DRIVER=redis` or queues/socket adapter require Redis
- Expo tooling for the mobile app
- Optional provider accounts for Google/Facebook/Apple auth, FCM, email, SMS, Razorpay, S3

### Install Dependencies

```bash
cd match-mate-api-server
npm install

cd ../match-mate-mobile-app
npm install
```

### Backend Environment

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

Important backend variables:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `staging`, or `production` |
| `PORT` | API port, usually `3000` locally |
| `API_PREFIX` | API prefix, usually `api` |
| `API_VERSION` | API version, usually `v1` |
| `API_BASE_URL` | Public API origin |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `MONGO_URI` | MongoDB connection string |
| `CACHE_DRIVER` | `redis` or `local` |
| `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASS` | Redis configuration |
| `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | JWT settings |
| `AUTH_*_ENABLED` | Enables email/password, phone OTP, social, magic link |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Google auth |
| `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET` | Facebook auth |
| `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Apple auth |
| `STORAGE_DRIVER` | `local` or `s3` |
| `AWS_*` | S3 storage configuration |
| `NOTIFICATION_*` | Email, SMS, FCM, queue, and DLQ configuration |
| `PAYMENT_*` | Payment, webhook, GST, and store verification configuration |
| `MEDIA_*` | Moderation, FFmpeg, image/video upload limits |
| `SHUTDOWN_DRAIN_MS` | Graceful shutdown drain window |

### Mobile Environment

The Expo app uses `EXPO_PUBLIC_*` variables. Production builds must receive these values through the build profile or environment because they are embedded into the client bundle.

Create or update:

```text
match-mate-mobile-app/.env.development
match-mate-mobile-app/.env.example
```

Important mobile variables:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_ENV` | `development`, `preview`, or `production` |
| `EXPO_PUBLIC_API_BASE_URL` | API origin, for example `https://api.example.com` |
| `EXPO_PUBLIC_API_PORT` | Local API port fallback |
| `EXPO_PUBLIC_API_PATH` | API path, usually `/api/v1` |
| `EXPO_PUBLIC_CLIENT_VERSION` | Sent with API requests |
| `EXPO_PUBLIC_AUTH_PHONE_OTP_ENABLED` | Shows/hides phone OTP auth |
| `EXPO_PUBLIC_AUTH_SOCIAL_GOOGLE_ENABLED` | Shows/hides Google auth |
| `EXPO_PUBLIC_AUTH_SOCIAL_FACEBOOK_ENABLED` | Shows/hides Facebook auth |
| `EXPO_PUBLIC_AUTH_SOCIAL_APPLE_ENABLED` | Shows/hides Apple auth |
| `EXPO_PUBLIC_AUTH_MAGIC_LINK_ENABLED` | Shows/hides magic link auth |
| `EXPO_PUBLIC_AUTH_BIOMETRIC_ENABLED` | Shows/hides biometric auth |
| `EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED` | Enables push token registration |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Required for Google auth on web |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google iOS client id |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google Android client id |
| `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` | Google redirect URI when needed |
| `EXPO_PUBLIC_FACEBOOK_CLIENT_ID` | Facebook client id |

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

## Backend Commands

Run from `match-mate-api-server`.

| Command | Purpose |
|---|---|
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

## Mobile Commands

Run from `match-mate-mobile-app`.

| Command | Purpose |
|---|---|
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

## API Contract

The API uses a standard response envelope:

```json
{
  "success": true,
  "code": "SUCCESS_CODE",
  "message": "Human readable message",
  "data": {},
  "meta": {}
}
```

Error responses use the same envelope shape:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human readable error",
  "data": null,
  "errors": [],
  "meta": {}
}
```

Frontend translations should map backend `code` values under locale API-code translation files so screens can show localized success and error messages.

### Request Headers

The mobile app and API support these common headers:

| Header | Purpose |
|---|---|
| `Authorization: Bearer <token>` | Access token |
| `X-Refresh-Token` | Refresh token for token rotation |
| `X-Correlation-ID` | Request trace correlation |
| `X-Request-ID` | Request ID |
| `X-Client-Version` | Client app version |
| `X-Platform` | `ios`, `android`, `web`, etc. |
| `X-Device-ID` | Device/session tracking |
| `X-API-Key` | API key where configured |

### Auth and Session Endpoints

Base path: `/api/v1/auth`

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/register` | Email/password or phone/social-aware registration flow |
| `POST` | `/login` | Email/phone login |
| `POST` | `/send-otp` | Send phone OTP |
| `POST` | `/verify-otp` | Verify OTP |
| `POST` | `/social-login` | Google/Facebook/Apple social login |
| `POST` | `/forgot-password` | Request password reset |
| `POST` | `/reset-password` | Reset password from token |
| `POST` | `/magic-link/request` | Request magic link login |
| `POST` | `/magic-link/verify` | Verify magic link |
| `GET` | `/2fa/status` | Get 2FA status |
| `POST` | `/2fa/totp/setup` | Start authenticator setup |
| `POST` | `/2fa/totp/enable` | Enable authenticator 2FA |
| `POST` | `/2fa/sms/request` | Request SMS 2FA OTP |
| `POST` | `/2fa/sms/enable` | Enable SMS 2FA |
| `POST` | `/2fa/disable` | Disable 2FA |
| `POST` | `/2fa/recovery-codes/regenerate` | Regenerate recovery codes |
| `POST` | `/2fa/verify` | Complete 2FA challenge |
| `POST` | `/change-password` | Change password |
| `GET` | `/verify-user` | Verify current auth state |
| `POST` | `/refresh` | Rotate refresh token and issue access token |
| `POST` | `/logout` | Logout current session |
| `POST` | `/logout-all` | Logout all devices |
| `GET` | `/sessions` | List sessions |
| `DELETE` | `/sessions/:sessionId` | Revoke session |

### Profile, Media, Preferences, and Verification

Base paths: `/api/v1/profiles`, `/api/v1/profiles/media`, `/api/v1/preferences`, `/api/v1/verification`

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/profiles/onboarding` | Save onboarding profile/preferences/settings |
| `POST` | `/profiles` | Create profile |
| `GET` | `/profiles/me` | Get my profile |
| `PUT` | `/profiles/personal` | Update personal details |
| `PUT` | `/profiles/physical` | Update physical details |
| `PUT` | `/profiles/education` | Update education/career details |
| `PUT` | `/profiles/family` | Update family details |
| `PUT` | `/profiles/location` | Update location |
| `GET` | `/profiles/media/images` | List active profile images |
| `POST` | `/profiles/media/images` | Upload profile image |
| `PATCH` | `/profiles/media/images/:mediaId/primary` | Set primary image |
| `DELETE` | `/profiles/media/images/:mediaId` | Delete image |
| `GET` | `/profiles/media/videos` | List video intro media |
| `POST` | `/profiles/media/videos` | Upload video intro |
| `PATCH` | `/profiles/media/videos/:mediaId/primary` | Set primary video |
| `DELETE` | `/profiles/media/videos/:mediaId` | Delete video |
| `POST` | `/preferences` | Create preferences |
| `GET` | `/preferences/me` | Get my preferences |
| `PUT` | `/preferences/filters` | Update filter preferences |
| `PUT` | `/preferences/settings` | Update preference settings |
| `PUT` | `/preferences/weights` | Update scoring weights |
| `PUT` | `/preferences/about` | Update preference bio/about |
| `GET` | `/verification/me` | Get verification status |
| `POST` | `/verification/submit` | Submit document/selfie KYC |
| `POST` | `/verification/ekyc/initiate` | Start eKYC flow |

### Match and Interaction Endpoints

Base path: `/api/v1/matches`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/recommended` | Recommended matches |
| `GET` | `/new` | New profiles |
| `GET` | `/nearby` | Nearby matches |
| `GET` | `/online` | Online matches |
| `GET` | `/my` | My mutual matches |
| `GET` | `/stats` | Match statistics |
| `GET` | `/who-viewed-me` | Who viewed my profile |
| `POST` | `/unmatch/:userId` | Unmatch a user |
| `GET` | `/shortlisted` | My shortlisted profiles |
| `POST` | `/shortlist/:userId` | Shortlist profile |
| `DELETE` | `/shortlist/:userId` | Remove shortlist |
| `GET` | `/profile/:userId` | Match profile detail |
| `POST` | `/interest` | Send interest |
| `POST` | `/interest/respond` | Accept/reject interest |
| `DELETE` | `/interest/:interestId` | Withdraw interest |
| `GET` | `/interests/received` | Received interests |
| `GET` | `/interests/sent` | Sent interests |

Discovery endpoints support query filters such as pagination, age, height, city/location, religion/community fields, online/nearby modes, and other match preference filters defined in `match-query.dto.ts`.

### Chat Endpoints

Base path: `/api/v1/chats`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Chat module health |
| `GET` | `/conversations` | Conversation list |
| `GET` | `/contacts` | Available chat contacts |
| `POST` | `/rooms/direct` | Create/get direct room |
| `GET` | `/rooms/:roomId` | Get room detail |
| `GET` | `/rooms/:roomId/messages` | Paginated message history |
| `POST` | `/rooms/:roomId/messages` | Send message |
| `POST` | `/attachments` | Upload chat attachment |
| `DELETE` | `/rooms/:roomId/messages/:messageId` | Delete own message |
| `POST` | `/rooms/:roomId/read` | Mark room read |
| `PATCH` | `/rooms/:roomId/settings` | Pin, mute, archive, or update room settings |

Socket.IO supports real-time chat, read receipts, delivery status, typing indicators, presence, block/report effects, and in-app notification events. The client connects with the same auth/session context used by REST calls.

### Settings Endpoints

Base path: `/api/v1/settings`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Get all settings |
| `GET`/`PUT` | `/privacy` | Privacy settings |
| `GET` | `/privacy/blocked` | Blocked users |
| `POST` | `/privacy/block` | Block user |
| `POST` | `/privacy/unblock` | Unblock user |
| `POST` | `/privacy/report` | Report user/content |
| `GET` | `/privacy/hidden` | Hidden profiles |
| `POST` | `/privacy/hide` | Hide profile from specific user |
| `POST` | `/privacy/unhide` | Remove hidden profile |
| `GET`/`PUT` | `/account` | Account settings |
| `POST` | `/account/deactivate` | Deactivate account |
| `POST` | `/account/delete` | Request account deletion |
| `DELETE` | `/account/linked/:provider` | Disconnect linked provider |
| `POST` | `/account/email` | Change email flow |
| `POST` | `/account/phone` | Change phone flow |
| `GET` | `/account/data-export` | Download/export user data |
| `GET`/`POST` | `/account/consents` | Consent history and acceptance |
| `GET`/`PUT` | `/notifications` | Notification settings |
| `PATCH` | `/notifications/preferences/:event/:channel` | Toggle notification preference |
| `GET`/`PUT` | `/communication` | Communication settings |
| `GET`/`PUT` | `/security` | Security settings |
| `POST` | `/security/pin` | Set app PIN |
| `DELETE` | `/security/pin` | Remove app PIN |
| `DELETE` | `/security/devices/:deviceId` | Revoke device |
| `DELETE` | `/security/devices` | Revoke all devices |
| `GET` | `/security/login-history` | Login history |
| `DELETE` | `/security/sessions/:sessionId` | Revoke session |
| `GET`/`PUT` | `/localization` | Language, region, location sharing |
| `GET`/`PUT` | `/accessibility` | Accessibility settings |
| `GET`/`PUT` | `/media` | Media settings |
| `GET`/`PUT` | `/ai` | AI/recommendation settings |

### Notifications

Base path: `/api/v1/notifications`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Notification list |
| `GET` | `/unread-count` | Unread count |
| `POST` | `/device-tokens` | Register push token |
| `POST` | `/device-tokens/revoke` | Revoke push token |
| `POST` | `/:id/read` | Mark one notification read |
| `POST` | `/read-all` | Mark all read |

### Subscriptions, Payments, and Referrals

Base paths: `/api/v1/subscriptions`, `/api/v1/payments`, `/api/v1/referrals`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/subscriptions/plans` | Public plan list |
| `GET` | `/subscriptions/current` | Current subscription |
| `GET` | `/subscriptions/billing` | Billing summary/history |
| `POST` | `/subscriptions/trial` | Start free trial |
| `GET` | `/subscriptions/boosts` | Profile boost status/options |
| `POST` | `/payments/order` | Create payment order |
| `POST` | `/payments/verify` | Verify web payment |
| `POST` | `/payments/store/verify-subscription` | Verify mobile store subscription |
| `POST` | `/payments/coupons/validate` | Validate coupon |
| `POST` | `/payments/fail` | Record failed payment |
| `POST` | `/payments/webhook` | Payment webhook |
| `GET` | `/payments/my-payments` | Payment history |
| `GET` | `/payments/:orderId` | Payment detail |
| `GET` | `/payments/:orderId/invoice` | Invoice download |
| `GET` | `/referrals/me` | Referral summary |
| `GET` | `/referrals/wallet` | Referral wallet |
| `POST` | `/referrals/wallet/redeem` | Redeem referral earnings |
| `GET` | `/referrals/leaderboard` | Referral leaderboard |

### Admin Endpoints

Admin APIs live under `/api/v1/admin/*` and are separated from customer-facing routes.

| Area | Example paths |
|---|---|
| Dashboard and users | `/admin/dashboard`, `/admin/users`, `/admin/users/:userId`, `/admin/users/status` |
| Audit and broadcast | `/admin/audit-logs`, `/admin/broadcast` |
| RBAC | `/admin/rbac/permissions`, `/admin/rbac/roles`, `/admin/rbac/users/:userId/roles` |
| Plans | `/admin/plans`, `/admin/plans/full/all`, `/admin/plans/feature/all`, `/admin/plans/feature/assign` |
| Moderation | `/admin/moderation/queue`, `/admin/moderation/media`, `/admin/moderation/kyc` |
| Analytics | `/admin/analytics/track`, `/admin/analytics/stats`, `/admin/analytics/overview`, `/admin/analytics/funnel` |
| Payments | `/admin/payments`, `/admin/payments/reports/reconciliation`, `/admin/payments/reports/settlement`, `/admin/payments/reports/gst`, `/admin/payments/:orderId/refund` |
| Notifications | `/admin/notifications`, `/admin/notifications/templates`, `/admin/notifications/analytics`, `/admin/notifications/dlq` |

## Backend Module Map

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, social auth, OTP, 2FA, sessions, token rotation |
| `profiles` | Profile, onboarding, media, preferences, scoring |
| `matches` | Discovery feeds, filters, interests, shortlists, match lifecycle |
| `chat` | Conversations, messages, attachments, read receipts, socket events |
| `notifications` | In-app notifications, device tokens, push integration |
| `settings` | Account, privacy, notification, security, communication, media, AI, localization, accessibility settings |
| `subscriptions` | Plans, current subscription, billing summary, trial, boosts |
| `payments` | Orders, verification, webhooks, coupons, invoices, mobile store checks |
| `referrals` | Referral code, referred users, wallet, leaderboard |
| `safety` | KYC and eKYC verification workflows |
| `admin` | Admin users, RBAC, moderation, analytics, payments, plans, notifications |
| `analytics` | Event and stats support used by admin and product metrics |
| `storage` | Local/S3 storage abstraction |
| `seeder` | Plans, templates, settings, users, and dummy Indian profile seed data |

## Mobile App Map

### Navigation

The app has these high-level stacks:

- Auth: login, register, forgot password, reset password, magic login, 2FA challenge
- Onboarding: first-time profile setup
- Tabs: Home, Matches, Chats, Membership, Profile
- Settings stack: edit profile, preferences, account, linked accounts, verification, devices, login history, 2FA, billing, referrals, privacy, blocked users, communication, accessibility, AI, media, localization, security, legal/help screens

### API Service Files

RTK Query services are organized by domain:

```text
src/store/services/authApi.service.ts
src/store/services/profileApi.service.ts
src/store/services/preferenceApi.service.ts
src/store/services/matchApi.service.ts
src/store/services/chatApi.service.ts
src/store/services/notificationApi.service.ts
src/store/services/membershipApi.service.ts
src/store/services/referralApi.service.ts
src/store/services/kycApi.service.ts
src/store/services/accountSettingsApi.service.ts
src/store/services/privacySettingsApi.service.ts
src/store/services/notificationSettingsApi.service.ts
src/store/services/securitySettingsApi.service.ts
src/store/services/communicationSettingsApi.service.ts
src/store/services/localizationSettingsApi.service.ts
src/store/services/accessibilitySettingsApi.service.ts
src/store/services/mediaSettingsApi.service.ts
src/store/services/aiSettingsApi.service.ts
```

`baseApi.service.ts` handles auth headers, client/device headers, refresh-token retry, logout cleanup, and API base URL resolution.

## Important Product Flows

### Auth

- Configurable email/password, phone OTP, Google, Facebook, Apple, magic link, and biometric flows.
- JWT access token and refresh token rotation.
- Session tracking by device, platform, user agent, and IP.
- Concurrent session limit and suspicious login detection can be configured on the backend.
- 2FA supports authenticator setup, SMS OTP enablement, disable, and recovery codes.
- Social auth writes `authAccounts` so linked account settings can prevent disconnecting the only sign-in method.

### Onboarding and Profiles

- Onboarding creates the user profile, preferences, settings defaults, and completion state.
- Profile details are structured by personal, physical, education, family, location, preferences, verification, media, and personality badges.
- Media supports profile images, primary image selection, video intro upload, video thumbnails, and local/S3 storage.
- Profile completion and visibility/scoring are backend owned and exposed to the frontend.

### Discovery and Matches

- Home and Matches consume recommended, new, online, nearby, and my-match endpoints.
- Nearby location permission is requested when the user uses nearby discovery or enables location sharing.
- Interactions include profile views, interests, accept/reject, withdraw, shortlist, block, report, unmatch, and who-viewed-me.
- Discovery supports lazy loading/pagination patterns to avoid slow feeds.

### Chat

- Chat is restricted by match/block/report safety rules.
- REST handles conversations, history, attachments, read status, message deletion, and room settings.
- Socket.IO handles realtime messages, typing, delivered/read events, presence, and live notification updates.
- Chat list supports search, filters, pin/mute/archive settings, unread badges, typing preview, and last-message status.

### Settings

The settings architecture is split into focused screens and API services:

- Account settings
- Privacy settings
- Notification settings
- Communication settings
- Security settings
- Localization settings
- Accessibility settings
- Media settings
- AI/recommendation settings
- Subscription and billing
- Refer and rewards
- Help and support
- Legal policies

Settings screens should use translated labels and helper text, avoid duplicate toggle calls, and persist changes through their domain RTK Query services.

### Subscription and Monetization

- Plans support plan type, duration filters, current plan, billing summary, purchase history, mobile store verification, web payment order/verify, coupons, invoices, refunds, trials, reminders, boosts, and referral wallet.
- Web can use Razorpay-style payments.
- Mobile should use Apple App Store / Google Play subscriptions for digital plan purchases and then verify those purchases through backend store verification.

### Admin and Moderation

Admin APIs are grouped in `modules/admin` and cover:

- Dashboard metrics
- User management
- RBAC
- Plan and feature management
- Moderation and KYC queues
- Broadcast communications
- Audit logs
- Payment reports/refunds
- Notification templates, analytics, and DLQ replay

## Deep Links

Configured app scheme:

```text
matchmate://
```

Configured universal/app links:

```text
https://matchmate.webnza.com/reset-password
https://www.matchmate.webnza.com/reset-password
https://matchmate.webnza.com/magic-login
https://www.matchmate.webnza.com/magic-login
```

These links should route users into reset password or magic login screens when the app is installed.

## Static Uploads

Local uploads are served by the API server at:

```text
/uploads
```

The mobile app resolves local-dev upload URLs through `resolveApiUrl`, including cases where old URLs contain `localhost`, `127.0.0.1`, `192.168.*`, or `/api/v1/uploads`.

## Seeder

The backend includes a seeder module with seed data under:

```text
match-mate-api-server/src/modules/seeder/data
```

Run:

```bash
cd match-mate-api-server
npm run seed
```

Seed coverage includes plans, notification templates, settings defaults, admin/support data, and Indian dummy profiles depending on the current seeder configuration.

## Quality and Verification

Recommended checks before opening a pull request:

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

Known practical note: Expo package type definitions can occasionally cause typecheck noise depending on installed Expo SDK package versions. Keep SDK package versions aligned through `npx expo install` when upgrading.

## Production Notes

- Keep `.env.production` and EAS build environment values in sync.
- Do not rely on `.env.development` values in production builds.
- Configure `ALLOWED_ORIGINS` tightly for production.
- Use `CACHE_DRIVER=redis` for production sessions, queues, presence, and distributed WebSocket scaling.
- Use S3 or equivalent object storage for production media.
- Set up FCM/APNs for push notifications when `NOTIFICATION_PUSH_ENABLED=true`.
- Configure web payment webhook secrets and mobile store verification before enabling real purchases.
- Keep Google redirect URIs exact in Google Cloud Console, including scheme, host, port, and path.
- Use `/api/v1/live` for liveness and `/api/v1/ready` for readiness.
- Graceful shutdown marks readiness unavailable, waits for `SHUTDOWN_DRAIN_MS`, then closes HTTP, WebSocket, and Redis adapter resources.
- Use HTTPS in production for all mobile/web API traffic and OAuth redirects.

## API Documentation

Swagger is available outside production:

```text
http://localhost:3000/api/docs
```

The README endpoint tables provide a quick reference. Swagger should remain the source of truth for request/response DTOs, required auth, and schema details.

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
