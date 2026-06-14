# Technical Plan

> Current home: `docs/planning/TECHNICAL-PLAN.md`
>
> Purpose: technical architecture, module boundaries, API strategy, infrastructure direction, and production-readiness priorities.
>
> Source-of-truth rule: keep detailed architecture, API, module, and product-flow details here. Keep the repository root `README.md` focused on orientation and local setup.

## Architecture Overview

Match Mate is a full-stack matrimonial platform with:

- `match-mate-api-server`: a modular NestJS API server.
- `match-mate-mobile-app`: an Expo React Native app for iOS, Android, and Web.
- `packages/api-contract`: shared TypeScript contracts for high-change membership, billing, payment, and subscription API shapes.

The backend is a modular NestJS monolith. Domain modules own their schemas, repositories, services, controllers, tasks, and DTOs. This keeps the MVP deployable as one server while preserving future extraction paths for auth, chat, notifications, payments, matching, and admin.

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
  |-- Payments, subscriptions, referrals, wallet
  |-- Support tickets and helpdesk
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
| ---- | ---------- |
| Runtime | Node.js, TypeScript |
| Framework | NestJS 11 |
| Database | MongoDB with Mongoose |
| Cache / queue | Redis with ioredis and BullMQ, with local fallbacks where configured |
| Realtime | Socket.IO with optional Redis adapter |
| Auth | JWT, refresh token rotation, Passport, OAuth providers |
| Validation | class-validator, class-transformer, Joi env validation |
| Storage | Local upload folder or AWS S3 |
| Notifications | In-app DB notifications, Socket.IO, optional FCM, email, SMS |
| Payments | Razorpay/Stripe order flows, guarded mobile store verification, invoices, refunds, admin reporting, reconciliation, and renewal lifecycle APIs |
| Support | User helpdesk tickets, replies, status updates, and admin support queues |
| Logging | Custom `AppLogger`, global logging interceptor, correlation IDs |
| API docs | Swagger in non-production environments |

### Frontend

| Area | Technology |
| ---- | ---------- |
| App | Expo 54, React Native 0.81, React 19 |
| Platforms | iOS, Android, Web |
| Navigation | React Navigation native stack and bottom tabs |
| State | Redux Toolkit, RTK Query, redux-persist |
| Storage | expo-secure-store, AsyncStorage for persisted non-secret state |
| Realtime | socket.io-client |
| Media | expo-image-picker, expo-video, expo-video-thumbnails |
| Audio | expo-av for chat voice message recording and playback |
| Localization | i18next, react-i18next, expo-localization |
| Native features | Apple auth, biometric auth, location, push notifications, sharing, print |
| API contracts | Shared TypeScript types from `packages/api-contract` |

## Backend Module Map

| Module | Responsibility |
| ------ | -------------- |
| `auth` | Registration, login, social auth, OTP, 2FA, sessions, token rotation |
| `profiles` | Profile, onboarding, media, preferences, scoring |
| `matches` | Discovery feeds, filters, interests, shortlists, match lifecycle |
| `chat` | Conversations, messages, attachments, read receipts, socket events |
| `notifications` | In-app notifications, device tokens, push integration |
| `settings` | Account, privacy, notification, security, communication, media, AI, localization, accessibility settings |
| `subscriptions` | Plans, current subscription, billing summary, trial, boosts, auto-renew cancellation |
| `payments` | Orders, verification, webhooks, coupons, invoices, mobile store checks, reconciliation reports |
| `referrals` | Referral code, referred users, campaign rewards, leaderboard |
| `support` | User helpdesk tickets, replies, close flow, admin support queue |
| `safety` | KYC and eKYC verification workflows |
| `admin` | Admin users, RBAC, moderation, analytics, payments, plans, notifications |
| `analytics` | Event and stats support used by admin and product metrics |
| `storage` | Local/S3 storage abstraction |
| `seeder` | Plans, templates, settings, users, and dummy Indian profile seed data |

## Mobile App Map

### Navigation

The app has these high-level stacks:

- Auth: login, register, forgot password, reset password, magic login, 2FA challenge.
- Onboarding: first-time profile setup.
- Tabs: Home, Matches, Chats, Membership, Profile.
- Settings stack: edit profile, preferences, account, linked accounts, verification, devices, login history, 2FA, billing, referrals, privacy, blocked users, communication, accessibility, AI, media, localization, security, legal/help screens.

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
src/store/services/walletApi.service.ts
src/store/services/supportApi.service.ts
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

`baseApi.service.ts` handles auth headers, client/device headers, refresh-token retry, logout cleanup, and API base URL resolution. Membership and payment-facing types are re-exported from `membershipApi.service.ts` and backed by the shared `@matchmate/api-contract` package.

## API Strategy

The API uses versioned REST under `/api/v1` plus Socket.IO for realtime chat, presence, typing, delivery/read status, reactions, and live notification updates.

Swagger is available outside production at:

```text
http://localhost:3000/api/docs
```

Swagger should remain the source of truth for request/response DTOs, required auth, and schema details. Endpoint tables below are a human-readable planning reference.

### Response Envelope

Successful responses use:

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

### Common Request Headers

| Header | Purpose |
| ------ | ------- |
| `Authorization: Bearer <token>` | Access token |
| `X-Refresh-Token` | Refresh token for token rotation |
| `X-Correlation-ID` | Request trace correlation |
| `X-Request-ID` | Request ID |
| `X-Client-Version` | Client app version |
| `X-Platform` | `ios`, `android`, `web`, etc. |
| `X-Device-ID` | Device/session tracking |
| `X-API-Key` | API key where configured |

## Endpoint Reference

### Auth and Session

Base path: `/api/v1/auth`

| Method | Path | Purpose |
| ------ | ---- | ------- |
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
| ------ | ---- | ------- |
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

### Matches and Interactions

Base path: `/api/v1/matches`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/recommended` | Recommended matches |
| `GET` | `/new` | New profiles |
| `GET` | `/nearby` | Nearby matches |
| `GET` | `/online` | Online matches |
| `GET` | `/curated` | Premium curator recommendations |
| `DELETE` | `/curated/:curatedMatchId` | Dismiss curated match recommendation |
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

### Chat

Base path: `/api/v1/chats`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/health` | Chat module health |
| `GET` | `/conversations` | Conversation list |
| `GET` | `/contacts` | Available chat contacts |
| `POST` | `/rooms/direct` | Create/get direct room |
| `GET` | `/rooms/:roomId` | Get room detail |
| `GET` | `/rooms/:roomId/messages` | Paginated message history |
| `POST` | `/rooms/:roomId/request/respond` | Accept or reject a pre-match chat request |
| `POST` | `/rooms/:roomId/messages` | Send message |
| `POST` | `/attachments` | Upload chat attachment, including images and audio |
| `DELETE` | `/rooms/:roomId/messages/:messageId` | Delete own message |
| `PATCH` | `/rooms/:roomId/messages/:messageId/reaction` | Add, update, or remove a message reaction |
| `POST` | `/rooms/:roomId/read` | Mark room read |
| `PATCH` | `/rooms/:roomId/settings` | Pin, mute, archive, or update room settings |

### Settings

Base path: `/api/v1/settings`

| Method | Path | Purpose |
| ------ | ---- | ------- |
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
| ------ | ---- | ------- |
| `GET` | `/` | Notification list |
| `GET` | `/unread-count` | Unread count |
| `POST` | `/device-tokens` | Register push token |
| `POST` | `/device-tokens/revoke` | Revoke push token |
| `POST` | `/:id/read` | Mark one notification read |
| `POST` | `/read-all` | Mark all read |

### Subscriptions, Payments, Referrals, and Wallet

Base paths: `/api/v1/subscriptions`, `/api/v1/payments`, `/api/v1/referrals`, `/api/v1/wallet`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/subscriptions/plans` | Public plan list |
| `GET` | `/subscriptions/current` | Current subscription |
| `GET` | `/subscriptions/billing` | Billing summary/history |
| `POST` | `/subscriptions/trial` | Start free trial |
| `POST` | `/subscriptions/cancel` | Cancel auto-renewal while retaining current access until expiry |
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
| `GET` | `/wallet` | Coin wallet summary and transactions |
| `POST` | `/wallet/spend` | Spend wallet coins for app actions |

### Support Tickets

Base path: `/api/v1/support/tickets`

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `POST` | `/` | Create a support ticket |
| `GET` | `/` | List my support tickets |
| `GET` | `/:ticketId` | Get ticket detail and conversation |
| `POST` | `/:ticketId/replies` | Add a ticket reply |
| `PATCH` | `/:ticketId/close` | Close my ticket |

### Admin

Admin APIs live under `/api/v1/admin/*` and are separated from customer-facing routes.

| Area | Example paths |
| ---- | ------------- |
| Dashboard and users | `/admin/dashboard`, `/admin/users`, `/admin/users/:userId`, `/admin/users/status` |
| Audit and broadcast | `/admin/audit-logs`, `/admin/broadcast` |
| RBAC | `/admin/rbac/permissions`, `/admin/rbac/roles`, `/admin/rbac/users/:userId/roles` |
| Plans | `/admin/plans`, `/admin/plans/full/all`, `/admin/plans/feature/all`, `/admin/plans/feature/assign` |
| Moderation | `/admin/moderation/queue`, `/admin/moderation/media`, `/admin/moderation/kyc` |
| Analytics | `/admin/analytics/track`, `/admin/analytics/stats`, `/admin/analytics/overview`, `/admin/analytics/funnel` |
| Payments | `/admin/payments`, `/admin/payments/reports/reconciliation`, `/admin/payments/reports/settlement`, `/admin/payments/reports/gst`, `/admin/payments/:orderId/refund` |
| Notifications | `/admin/notifications`, `/admin/notifications/templates`, `/admin/notifications/analytics`, `/admin/notifications/dlq` |
| Support | `/admin/support/tickets`, `/admin/support/tickets/:ticketId/replies`, `/admin/support/tickets/:ticketId/status` |

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
- Premium match curator recommendations are exposed through a Curated tab and can be dismissed by the user.
- Nearby location permission is requested when the user uses nearby discovery or enables location sharing.
- Interactions include profile views, interests, accept/reject, withdraw, shortlist, block, report, unmatch, and who-viewed-me.
- Discovery supports lazy loading/pagination patterns to avoid slow feeds.

### Chat

- Chat is restricted by match/block/report safety rules.
- REST handles conversations, history, attachments, read status, message deletion, and room settings.
- Socket.IO handles realtime messages, typing, delivered/read events, presence, and live notification updates.
- Pre-match direct messages create chat requests that recipients can accept or reject.
- Chat supports image/media attachments, voice message recording/playback, message reactions, moderation queues, and profanity review.
- Chat list supports search, filters, pin/mute/archive settings, unread badges, typing preview, request actions, and last-message status.

### Settings

The settings architecture is split into focused screens and API services:

- Account settings.
- Privacy settings.
- Notification settings.
- Communication settings.
- Security settings.
- Localization settings.
- Accessibility settings.
- Media settings.
- AI/recommendation settings.
- Subscription and billing.
- Refer and rewards.
- Coin wallet and referral rewards.
- Help and support with in-app support tickets.
- Legal policies styled consistently with community guidelines.

Settings screens should use translated labels and helper text, avoid duplicate toggle calls, and persist changes through their domain RTK Query services.

### Subscription and Monetization

- Plans support plan type, duration filters, current plan, billing summary, purchase history, mobile store verification, web payment order/verify, coupons, invoices, refunds, trials, reminders, boosts, and coin/referral wallet.
- The membership CTA opens a payment-method sheet before creating the provider order.
- Web can start Razorpay or Stripe-style checkout orders.
- Mobile digital subscriptions are guarded by `EXPO_PUBLIC_STORE_BILLING_ENABLED` until Apple App Store / Google Play product mapping is ready, then verified through backend store verification.
- Users can cancel auto-renewal without immediately losing the current paid access window.

### Admin and Moderation

Admin APIs are grouped in `modules/admin` and cover:

- Dashboard metrics.
- User management.
- RBAC.
- Plan and feature management.
- Moderation and KYC queues.
- Chat moderation and support-ticket queues.
- Broadcast communications.
- Audit logs.
- Payment reports/refunds.
- Notification templates, analytics, and DLQ replay.
- Analytics overview, funnel tracking, daily aggregation, and campaign/source dimensions.

## Data Model Direction

MongoDB collections are owned by their NestJS domain modules. Do not keep hand-written collection samples in this plan if they drift from Mongoose schemas. Use the actual schema files and Swagger DTOs for field-level truth.

Current core data areas:

- Users, auth accounts, sessions, OTPs, 2FA, and recovery flows.
- Profiles, preferences, media, verification, and profile scoring.
- Matches, interests, shortlists, blocks, reports, curated matches, and profile views.
- Chat rooms, messages, attachments, reactions, room settings, and moderation state.
- Notifications, device tokens, templates, delivery logs, and DLQ records.
- Plans, subscriptions, payments, invoices, coupons, refunds, referrals, and wallet transactions.
- Settings for account, privacy, notification, communication, security, localization, accessibility, media, and AI.
- Admin users, RBAC, audit logs, analytics events, support tickets, and support replies.

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

## Infrastructure Direction

| Layer | Direction |
| ----- | --------- |
| API ingress | HTTPS behind NGINX, load balancer, or API gateway |
| Runtime | Node.js process or container deployment for the compiled NestJS server |
| Database | MongoDB Atlas or managed MongoDB-compatible cluster |
| Cache / queue | Redis for sessions, queues, presence, Socket.IO adapter, and distributed scaling |
| File storage | S3 or equivalent object storage for production media |
| CDN | CloudFront or equivalent CDN for public static/media delivery where appropriate |
| Mobile builds | EAS build profiles and environment injection |
| Observability | App logs, request correlation IDs, health probes, APM/error monitoring, and provider dashboards |

Operational deployment details live in [Deployment Plan](../operations/DEPLOYMENT-PLAN.md). Launch checks live in [Launch Plan](../launch/LAUNCH-PLAN.md).

## Security Direction

- Hash passwords with a strong one-way algorithm and never log credentials, OTPs, refresh tokens, or provider secrets.
- Use short-lived access tokens with refresh-token rotation and session revocation.
- Keep auth, account, payment, webhook, upload, and admin endpoints rate-limited.
- Validate input with DTO validation and sanitize provider/webhook payload handling.
- Enforce RBAC on admin APIs and separate admin routes under `/api/v1/admin/*`.
- Keep CORS and allowed origins tight in production.
- Use HTTPS for all production mobile/web API traffic and OAuth redirects.
- Keep KYC, moderation, reports, blocks, and chat safety checks backend-owned.
- Keep `.env.production`, EAS variables, and provider dashboards aligned without committing real secrets.

## Production Notes

- Keep `.env.production` and EAS build environment values in sync.
- Do not rely on `.env.development` values in production builds.
- Use `CACHE_DRIVER=redis` for production sessions, queues, presence, and distributed WebSocket scaling.
- Use S3 or equivalent object storage for production media.
- Set up FCM/APNs for push notifications when `NOTIFICATION_PUSH_ENABLED=true`.
- Configure web payment webhook secrets and mobile store verification before enabling real purchases.
- Keep Google redirect URIs exact in Google Cloud Console, including scheme, host, port, and path.
- Use `/api/v1/live` for liveness and `/api/v1/ready` for readiness.
- Graceful shutdown marks readiness unavailable, waits for `SHUTDOWN_DRAIN_MS`, then closes HTTP, WebSocket, and Redis adapter resources.

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

## Documentation Ownership

- Root `README.md`: high-level repository entry point, docs map, quick start, local commands, and env pointers.
- `docs/planning/TECHNICAL-PLAN.md`: architecture, module map, API strategy, product-flow technical notes, production direction.
- `docs/planning/PROJECT-PLAN.md`: product scope, delivery plan, roles, and milestones.
- `docs/planning/TASK-ROADMAP.md`: enterprise feature backlog and roadmap status.
- `docs/planning/FLOW-PLAN.md`: UX flow blueprint.
- `docs/operations/COMMANDS.md`: command reference.
- `docs/operations/DEPLOYMENT-PLAN.md`: deployment operations.
- `docs/launch/*`: launch, QA, billing, EAS, monitoring, and release readiness.
