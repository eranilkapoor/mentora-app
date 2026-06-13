# Match Mate Task Roadmap

Current home: `docs/planning/TASK-ROADMAP.md`

Last audited: 2026-06-13

This audit compares the roadmap against the current repository:

- Backend: `match-mate-api-server/src`
- Mobile: `match-mate-mobile-app/src`
- Launch docs: `docs/launch`

## Status Legend

| Status      | Meaning                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| DONE        | Implemented in the app/API and represented in the current codebase.                                                  |
| PARTIAL     | Core code exists, but production launch still needs provider credentials, external setup, QA, or deeper integration. |
| TODO        | Not implemented or not visible in the current repository.                                                            |
| RECOMMENDED | Valuable addition, usually infrastructure, compliance, analytics, or scale work.                                     |
| BLOCKED     | Cannot be completed only in code; waiting on vendor, console, cloud, legal, or production credentials.               |

## Executive Audit Summary

The product is much further along than an early roadmap: the repo contains real modules for auth, sessions, profiles, preferences, media, KYC, matches, chat, notifications, payments, subscriptions, referrals, settings, analytics, admin, Redis caching, Socket.IO, Swagger, rate limiting, and launch-readiness documentation.

The previous roadmap overstated completion for several enterprise items. Real provider-dependent or production-ops items such as Aadhaar/DigiLocker, external AI moderation, payment gateways, production FCM credentials, Sentry/APM, CDN, Kubernetes, cloud backups, and native Play/App Store billing SDKs should be treated as `PARTIAL`, `TODO`, or `BLOCKED` until production evidence exists.

## Fix Or Implement Right Now

| Priority | Task                                                                                                           |  Status | Why Now                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------: | ----------------------------------------------------------------------------------------- |
| P0       | Fix mojibake/corrupt characters in backend comments/log messages where visible in `main.ts` and this roadmap   |    DONE | Cleaned the roadmap and backend bootstrap log/comment text.                               |
| P0       | Run mobile and API typecheck/lint/build after the roadmap audit                                                |    DONE | API lint/typecheck and mobile lint/typecheck pass.                                        |
| P0       | Wire real production notification provider secrets and verify one push end-to-end                              | BLOCKED | Code/env contract exists; real FCM credentials and device delivery proof are external.    |
| P0       | Finish store billing SDK/product mapping or keep purchase CTA guarded for release                              |    DONE | Native billing is guarded by `EXPO_PUBLIC_STORE_BILLING_ENABLED=false` until SDK mapping. |
| P1       | Add Sentry/Crashlytics SDKs and production DSNs                                                                | PARTIAL | Error reporter foundations exist; external SDK/provider wiring is not complete.           |
| P1       | Add final release QA evidence: Android matrix, dark theme screenshots, token expiry, push taps, chat reconnect | PARTIAL | Play QA checklist and dark-theme audit docs exist; real device run evidence remains.      |
| P1       | Tighten production CORS/env secrets review                                                                     |    DONE | Production CORS is restricted and a production secrets checklist exists.                  |
| P2       | Implement OpenAPI-generated TS client or shared API contract                                                   |    TODO | Reduces drift between NestJS DTOs and mobile RTK Query types.                             |
| P2       | Add background job coverage for OTP cleanup, orphaned media cleanup, analytics aggregation                     |    DONE | OTP cleanup, deleted-media cleanup, and daily analytics aggregation jobs are implemented. |

## 1. Core Platform

### 1.1 Application Boot And Health

| Status | Task                       | Evidence / Next Action                                                |
| ------ | -------------------------- | --------------------------------------------------------------------- |
| DONE   | Root URL check (`/`)       | `AppController` exposes root health-style response.                   |
| DONE   | Health/live check          | `AppController` and `AppService` include health and dependency state. |
| DONE   | Readiness probe (`/ready`) | Readiness checks Mongo/Redis and shutdown state.                      |
| DONE   | Graceful shutdown handler  | `main.ts` drains readiness and closes app/Socket.IO adapter.          |

### 1.2 Config, Environment And Feature System

| Status      | Task                                  | Evidence / Next Action                                                                                             |
| ----------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DONE        | Central config system with validation | `@nestjs/config`, Joi validation, and config files exist.                                                          |
| DONE        | Environment separation                | Dev/staging/prod scripts and environment config are present.                                                       |
| PARTIAL     | Feature flag system                   | Auth/social/store billing/media/monitoring flags exist via env; no LaunchDarkly/Unleash-style remote flag service. |
| PARTIAL     | Remote config                         | Mobile/API env switches exist; no dynamic remote config service.                                                   |
| RECOMMENDED | Secrets Manager integration           | Move production secrets from env-file workflow to AWS Secrets Manager/Vault/GCP Secret Manager.                    |

## 2. Authentication And Session System

### 2.1 Authentication Flows

| Status  | Task                         | Evidence / Next Action                                                                                 |
| ------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| DONE    | Email registration/login     | Backend auth controller and mobile login/register screens exist.                                       |
| DONE    | Phone OTP registration/login | OTP API and mobile phone form exist. Production SMS provider still needs verification.                 |
| PARTIAL | Google/Facebook social login | Backend strategies/config and mobile OAuth flow exist; production provider app setup must be verified. |
| PARTIAL | Apple Sign-In                | Expo Apple dependency and backend config exist; production Apple credentials/review remain external.   |
| DONE    | Forgot/reset password        | Backend endpoints and mobile screens exist.                                                            |
| DONE    | Magic link login             | Backend endpoints and mobile MagicLogin screen exist.                                                  |
| PARTIAL | Biometric auth               | Expo local authentication dependency/settings exist; final device QA and UX verification needed.       |

### 2.2 Token And Session Management

| Status | Task                       | Evidence / Next Action                                                                                |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| DONE   | Access and refresh JWTs    | Auth token service and refresh strategy exist.                                                        |
| DONE   | Refresh token rotation     | Session-backed refresh flow exists.                                                                   |
| DONE   | Logout current/all devices | Auth/session endpoints and security settings screens exist.                                           |
| DONE   | Device tracking            | Session schema and device management/login history screens exist.                                     |
| DONE   | Concurrent session limit   | Config and auth security enforcement exist.                                                           |
| DONE   | Suspicious login detection | Detects new device/IP-network changes, records activity, and sends alerts based on security settings. |
| DONE   | Session activity timeline  | Login history and device management are implemented.                                                  |

### 2.3 Verification And KYC

| Status  | Task                                    | Evidence / Next Action                                                                                |
| ------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| DONE    | Email/phone verification                | Auth verification and OTP flows exist.                                                                |
| PARTIAL | Profile KYC verification                | Safety/KYC module and mobile KYC screen exist; operational workflow needs production setup.           |
| PARTIAL | Aadhaar/DigiLocker eKYC                 | `ekyc/initiate` route exists; real government provider integration/credentials are not launch-proven. |
| TODO    | Selfie-to-photo liveness check          | No real liveness provider integration found.                                                          |
| DONE    | Document upload and manual review queue | KYC/media/admin moderation queues exist.                                                              |
| DONE    | Verification badge system               | Profile/account/list UI render verified state from verification/profile data.                         |

### 2.4 Two-Factor Authentication

| Status | Task           | Evidence / Next Action                                                       |
| ------ | -------------- | ---------------------------------------------------------------------------- |
| DONE   | TOTP 2FA       | Backend TOTP setup/enable/verify and mobile setup screens exist.             |
| DONE   | SMS 2FA toggle | Backend SMS 2FA endpoints exist. SMS provider needs production verification. |
| DONE   | Recovery codes | Backend recovery-code generation/regeneration exists.                        |

## 3. User And Profile System

### 3.1 Profile Management

| Status | Task                                   | Evidence / Next Action                                                                                |
| ------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| DONE   | Multi-step onboarding profile          | Mobile onboarding and backend profile onboarding endpoint exist.                                      |
| DONE   | View/edit my profile                   | Profile, EditProfile, profile APIs, and services exist.                                               |
| DONE   | Partner preferences                    | Preference APIs and EditPreference screen exist.                                                      |
| DONE   | Profile completeness score             | Completion/progress UI and backend profile data exist.                                                |
| DONE   | Profile visibility/searchability score | Backend calculates profile/visibility scores and match discovery indexes, sorts, and filters by them. |
| DONE   | Deactivate account                     | Settings account deactivate endpoint exists.                                                          |
| DONE   | Account deletion/right to erasure      | Account deletion request/task and data export/consent services exist.                                 |
| DONE   | Profile boost                          | Subscription profile boost service/tasks exist.                                                       |

### 3.2 Matrimonial Bio Fields

| Status | Task                             | Evidence / Next Action                                  |
| ------ | -------------------------------- | ------------------------------------------------------- |
| DONE   | Horoscope/Kundli details         | Astro edit section and backend profile schemas exist.   |
| DONE   | Family background                | Family edit section/schema exists.                      |
| DONE   | Lifestyle preferences            | Lifestyle fields and preference matching exist.         |
| DONE   | Career and education details     | Education/career sections and schemas exist.            |
| DONE   | Community/caste/sub-caste fields | Enums/profile fields exist.                             |
| DONE   | NRI flag and abroad location     | Profile personal fields include NRI/visa/location data. |

### 3.3 Media System

| Status  | Task                            | Evidence / Next Action                                                                                        |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| DONE    | Image upload                    | Media controller and mobile photo upload UI exist.                                                            |
| DONE    | Video intro upload              | Video upload, thumbnail utility, and UI exist.                                                                |
| DONE    | Set primary photo/video         | Backend primary endpoints and mobile actions exist.                                                           |
| PARTIAL | AI image/video moderation       | Moderation hooks/config exist; external provider credentials not proven.                                      |
| DONE    | Manual review queue             | Admin media review queue exists.                                                                              |
| DONE    | Photo privacy                   | Media/privacy settings and match-based access exist.                                                          |
| DONE    | Watermarking exported photos    | Profile PDF export now applies document and profile-photo watermarks.                                         |
| DONE    | Video thumbnail auto-generation | Upload flow generates and stores FFmpeg thumbnails when none are supplied; runtime needs `MEDIA_FFMPEG_PATH`. |

### 3.4 Privacy, Consent And Settings

| Status | Task                    | Evidence / Next Action                                                               |
| ------ | ----------------------- | ------------------------------------------------------------------------------------ |
| DONE   | Privacy settings        | Privacy settings APIs and mobile screen exist.                                       |
| DONE   | Notification settings   | Granular notification settings API/UI exist.                                         |
| DONE   | Hide/block/report users | Settings/safety APIs and mobile flows exist.                                         |
| DONE   | Incognito browse mode   | Privacy settings and match profile view suppression exist; confirm paywall behavior. |
| DONE   | Data download           | Account data export endpoint exists.                                                 |
| DONE   | Consent management      | Consent schema/service/API exist.                                                    |

## 4. Matching Engine

### 4.1 Discovery And Feed

| Status  | Task                            | Evidence / Next Action                                                                   |
| ------- | ------------------------------- | ---------------------------------------------------------------------------------------- |
| DONE    | Recommended matches API         | `matches/recommended` and discovery service exist.                                       |
| DONE    | Filters API                     | Match query/filter DTOs and mobile filter modal exist.                                   |
| PARTIAL | ML-based ranking engine         | Rule/scoring logic exists; no true ML pipeline found.                                    |
| DONE    | Compatibility score engine      | Compatibility service and match score UI exist.                                          |
| DONE    | Mutual preference scoring       | Preference weights and match discovery logic exist.                                      |
| DONE    | Nearby matches                  | `matches/nearby` and location support exist.                                             |
| TODO    | Premium match curator           | No human/AI curator workflow found.                                                      |
| PARTIAL | Daily matches push notification | Scheduled digest task and notification service exist; campaign QA/provider setup needed. |

### 4.2 Interactions

| Status  | Task                                    | Evidence / Next Action                                                        |
| ------- | --------------------------------------- | ----------------------------------------------------------------------------- |
| DONE    | Tracked profile views                   | Match profile/view APIs and analytics schemas exist.                          |
| DONE    | Send/accept/reject interest             | Interest endpoints and mobile actions exist.                                  |
| DONE    | Shortlist/save profile                  | Shortlist endpoints and mobile action exist.                                  |
| DONE    | Block/report user/content               | Settings/safety/admin moderation routes exist.                                |
| DONE    | Who viewed me                           | Endpoint and feature gate exist.                                              |
| PARTIAL | Who liked me                            | Interest received/sent flows exist; dedicated premium UI should be confirmed. |
| DONE    | Interaction limits by subscription tier | Feature guard and subscription feature system exist.                          |

### 4.3 Match Lifecycle

| Status  | Task                              | Evidence / Next Action                                                                 |
| ------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| DONE    | Match creation on mutual interest | Match service handles interest response/match creation.                                |
| PARTIAL | Match expiry logic                | Subscription/profile boost expiry tasks exist; match expiry policy needs verification. |
| PARTIAL | Match quality score               | Compatibility/statistics exist; post-match health scoring is not clearly separate.     |
| DONE    | Unmatch                           | `unmatch` endpoint and mobile flow exist.                                              |
| DONE    | Match statistics per user         | `matches/stats` endpoint exists.                                                       |

## 5. Chat System

### Backend

| Status  | Task                        | Evidence / Next Action                                                                                                                          |
| ------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Chat list/conversations API | Chat controller exposes conversations/contacts.                                                                                                 |
| DONE    | REST and Socket.IO messages | Chat controller and gateway exist.                                                                                                              |
| DONE    | Read receipts               | Mark-room-read endpoint and realtime events exist.                                                                                              |
| DONE    | Typing indicators           | Gateway typing DTO/events exist.                                                                                                                |
| DONE    | Media sharing               | Chat attachments endpoint exists.                                                                                                               |
| PARTIAL | Chat moderation             | Permissions/admin moderation foundation exists; AI/manual chat moderation workflow needs proof.                                                 |
| DONE    | Message deletion            | Delete message endpoint exists.                                                                                                                 |
| DONE    | Message reactions           | Backend now stores per-user reactions, exposes `PATCH /chats/rooms/:roomId/messages/:messageId/reaction`, and emits `message:reaction` updates. |
| PARTIAL | Voice messages              | Backend supports audio attachment messaging; mobile recorder UX is not complete.                                                                |
| PARTIAL | Chat request/pre-match DM   | Direct room/access service exists; final premium gating/UX should be confirmed.                                                                 |
| TODO    | Chat translation            | No translation provider/API found.                                                                                                              |
| PARTIAL | Profanity filter            | Configurable blocked-word filter exists; no advanced NLP/provider moderation found.                                                             |
| DONE    | Chat archiving              | Room settings, archived filters, and mobile archive UI exist.                                                                                   |

### Frontend

| Status  | Task                           | Evidence / Next Action                                                                               |
| ------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| DONE    | Chat list screen               | `ChatList` feature exists.                                                                           |
| DONE    | Chat screen realtime messaging | `Chat` feature and realtime service exist.                                                           |
| DONE    | Typing indicator UI            | Chat UI/realtime integration exists.                                                                 |
| PARTIAL | Media sharing UI               | Attachment backend exists; UI should be tested on Android/iOS.                                       |
| PARTIAL | Chat request accept/reject UI  | Access/room flow exists; dedicated pre-match request UX should be verified.                          |
| TODO    | Voice message recording UI     | No recorder UI found.                                                                                |
| DONE    | Message reactions UI           | Chat bubbles now show reaction summaries and quick reaction controls backed by the new API mutation. |
| TODO    | Translated message toggle      | No translation toggle/provider found.                                                                |

## 6. Notifications

### Backend

| Status  | Task                               | Evidence / Next Action                                                                          |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| PARTIAL | Push notification service          | Firebase Admin/provider exists; production FCM credentials must be configured and tested.       |
| DONE    | In-app notifications               | Notification schema/API/realtime gateway exist.                                                 |
| PARTIAL | Email notification templates       | Template system/provider exists; SES/provider config needs production verification.             |
| PARTIAL | SMS notifications                  | SMS provider exists; Twilio/provider config needs production verification.                      |
| TODO    | WhatsApp notifications             | No Meta WABA provider found.                                                                    |
| DONE    | Notification preference management | Settings and notification preference APIs exist.                                                |
| DONE    | Notification deduplication         | Dedupe key/window logic exists.                                                                 |
| PARTIAL | Scheduled/drip notifications       | Queue and scheduled digest/reminder foundations exist; campaign builder/rules are not complete. |
| DONE    | Deep link support                  | Notification action navigation exists in mobile.                                                |

### Frontend

| Status | Task                                      | Evidence / Next Action                                                                  |
| ------ | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| DONE   | Notification list/history                 | `Notifications` and detail screens exist.                                               |
| DONE   | Unread count                              | API and UI support unread count.                                                        |
| DONE   | Notification settings                     | Granular settings screen exists.                                                        |
| DONE   | Push permission prompt/token registration | Mobile permission prompt, device push token registration, and logout revoke flow exist. |
| DONE   | In-app toast/banner notifications         | Toast host and realtime notification toast/cache update behavior are wired.             |

## 7. Subscription And Monetization

### 7.1 Plans And Access

| Status  | Task                                 | Evidence / Next Action                                                                            |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| DONE    | Plan system                          | Plans/features schemas, seed data, admin APIs, and mobile membership UI exist.                    |
| DONE    | Feature access control               | Feature guard/decorator/service exist.                                                            |
| DONE    | Upgrade/downgrade/plan lifecycle     | Subscription service and billing screens exist.                                                   |
| PARTIAL | Upgrade plan API/payment integration | Order/verify/store verification APIs exist; real gateway/store production flow still needs setup. |
| DONE    | Purchase history                     | Billing summary/payment history APIs and UI exist.                                                |
| DONE    | Plan expiry reminders                | Subscription expiry task includes reminders.                                                      |
| DONE    | Coupons/discount codes               | Coupon schemas/validate flow exist.                                                               |
| PARTIAL | Auto-renewal/subscription lifecycle  | Store transaction fields exist; actual store subscription reconciliation needs external setup.    |
| DONE    | Free trial                           | Trial endpoint/service exists.                                                                    |
| PARTIAL | Coin/credit wallet                   | Referral wallet exists; broader micro-purchase wallet not complete.                               |

### 7.2 Payments

| Status  | Task                               | Evidence / Next Action                                                                                |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| PARTIAL | Razorpay/Stripe/web gateway        | Payment gateway abstraction/schema exists; real gateway SDK/credentials need production verification. |
| DONE    | Payment webhook handling/signature | Webhook endpoint and HMAC verification exist.                                                         |
| DONE    | Refund system                      | Admin refund endpoint/service exists.                                                                 |
| PARTIAL | UPI support                        | UPI payment method enum exists; real UPI gateway flow needs verification.                             |
| PARTIAL | Invoice/receipt generation         | Invoice model/API exists; PDF generation/export should be verified.                                   |
| DONE    | GST report/export                  | Admin GST report endpoint exists.                                                                     |
| DONE    | Failed payment retry/maintenance   | Payment maintenance task exists.                                                                      |
| PARTIAL | Payment analytics dashboard        | Admin payment reports exist; full dashboard UI not visible.                                           |

### 7.3 Referral And Growth

| Status  | Task                           | Evidence / Next Action                                    |
| ------- | ------------------------------ | --------------------------------------------------------- |
| DONE    | Referral code generation       | Referral service generates unique codes.                  |
| DONE    | Referral earnings/wallet       | Referral wallet schema/API/mobile screen exist.           |
| PARTIAL | Referral campaign tracking/UTM | Referral module exists; UTM analytics should be expanded. |
| DONE    | Referral leaderboard           | API exists.                                               |
| TODO    | Family/group plans             | No dedicated family plan workflow found.                  |

## 8. Admin Panel And Moderation

| Status  | Task                             | Evidence / Next Action                                                                                                                             |
| ------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Admin APIs                       | Admin controllers cover dashboard, users, plans, payments, notifications, moderation, RBAC.                                                        |
| DONE    | Role-based admin access          | Roles/permissions guards and RBAC controller exist.                                                                                                |
| DONE    | User management                  | Admin user list/detail/status routes exist.                                                                                                        |
| DONE    | KYC/media moderation queue       | Admin moderation controller exists.                                                                                                                |
| DONE    | Bulk communication               | Admin broadcast/notification dispatch routes exist.                                                                                                |
| DONE    | Admin audit logs                 | Admin audit schema/service/controller exist.                                                                                                       |
| DONE    | Dashboard metrics                | Admin dashboard/analytics endpoints exist.                                                                                                         |
| PARTIAL | Success story/CMS                | Feature is listed in seed/admin data; UI/workflow should be verified.                                                                              |
| DONE    | Support ticket/helpdesk          | Full support module now exists with user ticket CRUD/replies, support-staff admin endpoints, notifications, and mobile Help & Support integration. |
| PARTIAL | Fake profile detection dashboard | Moderation/analytics foundations exist; no ML fake-profile dashboard found.                                                                        |

## 9. Analytics And Tracking

### Backend

| Status  | Task                           | Evidence / Next Action                                                                                              |
| ------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| DONE    | Activity/interaction logs      | Analytics and activity log schemas/services exist.                                                                  |
| DONE    | Profile analytics              | Match/profile analytics endpoints exist.                                                                            |
| PARTIAL | Funnel tracking                | Analytics module exists; end-to-end event taxonomy needs expansion.                                                 |
| DONE    | Admin dashboard metrics        | Admin analytics/dashboard endpoints exist.                                                                          |
| PARTIAL | Event tracking system          | Backend event tracking exists; no Mixpanel/Amplitude integration found.                                             |
| TODO    | Cohort analysis                | No cohort pipeline found.                                                                                           |
| TODO    | A/B testing infrastructure     | Env flags exist, but no experiment platform.                                                                        |
| PARTIAL | Match success rate tracking    | Feature enum/analytics exist; KPI dashboard needs proof.                                                            |
| PARTIAL | Revenue analytics              | Payment/admin reports exist; MRR/ARR/churn dashboard not complete.                                                  |
| PARTIAL | Profile quality score tracking | Profile/match scoring and daily analytics aggregation exist; dedicated quality trend dashboard remains future work. |

### Frontend

| Status  | Task                              | Evidence / Next Action                                                   |
| ------- | --------------------------------- | ------------------------------------------------------------------------ |
| DONE    | Profile analytics UI              | Who-viewed/profile analytics UI exists.                                  |
| PARTIAL | User insights/stats dashboard     | Some stats are visible; dedicated insights dashboard should be verified. |
| PARTIAL | Success story submission UI       | Not clearly visible as a dedicated feature.                              |
| DONE    | Account activity/login history UI | Security login history screen exists.                                    |

## 10. Security

| Status      | Task                          | Evidence / Next Action                                                                 |
| ----------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| DONE        | Rate limiting per IP/user     | Nest throttler and custom rate-limit guard exist.                                      |
| DONE        | Brute-force protection        | Rate limits and auth protections exist; lockout policy should be tested.               |
| DONE        | Input validation/sanitization | Global validation pipe with whitelist and DTO validators exists.                       |
| PARTIAL     | Data encryption at rest       | Password hashing exists; field-level PII encryption is not clearly implemented.        |
| DONE        | Audit logs                    | Admin/activity logs exist.                                                             |
| PARTIAL     | Internal API key system       | Swagger and CORS allow `X-API-Key`; service-to-service enforcement should be verified. |
| BLOCKED     | HTTPS/HSTS                    | Needs production reverse proxy/load balancer configuration.                            |
| DONE        | Strict CORS policy support    | CORS config supports allowed origins; production env must be reviewed.                 |
| DONE        | Helmet/security headers       | Helmet is wired in `main.ts`.                                                          |
| RECOMMENDED | OWASP checklist review        | Add a formal pre-launch security checklist.                                            |
| BLOCKED     | Penetration testing           | External vendor/process task.                                                          |
| PARTIAL     | GDPR/PDPB compliance layer    | Consent, deletion, export exist; legal review and policy pages still required.         |
| DONE        | Data masking for logs         | Logging/error handling redacts sensitive fields.                                       |
| RECOMMENDED | Vulnerability scanning        | Add Dependabot/Snyk/GitHub Actions checks.                                             |

## 11. Logging And Monitoring

| Status      | Task                            | Evidence / Next Action                                 |
| ----------- | ------------------------------- | ------------------------------------------------------ |
| DONE        | Central logger                  | Winston-backed `AppLogger` exists.                     |
| DONE        | Correlation/request tracing     | Correlation middleware/interceptor exist.              |
| PARTIAL     | Error monitoring                | Adapter exists; Sentry SDK/DSN not fully wired.        |
| BLOCKED     | Log storage                     | Needs ELK/CloudWatch/Datadog setup.                    |
| RECOMMENDED | APM                             | Add Datadog/New Relic/OpenTelemetry.                   |
| RECOMMENDED | Uptime monitoring               | Add external uptime checks.                            |
| RECOMMENDED | Alerting rules                  | Add PagerDuty/OpsGenie/Slack alerts.                   |
| RECOMMENDED | Custom product metrics          | Track match rate, notification delivery, chat latency. |
| RECOMMENDED | DB query performance monitoring | Add Mongo slow-query monitoring/APM.                   |
| RECOMMENDED | Socket.IO metrics               | Add connection/reconnect/room metrics.                 |

## 12. Performance And Scaling

### Backend

| Status      | Task                           | Evidence / Next Action                                                 |
| ----------- | ------------------------------ | ---------------------------------------------------------------------- |
| DONE        | Redis caching                  | Redis/local cache module exists.                                       |
| PARTIAL     | CDN for media                  | S3/storage support exists; CDN production setup not proven.            |
| DONE        | DB indexes                     | Schemas define indexes across key collections.                         |
| PARTIAL     | Queue system                   | BullMQ notification queue exists; queue coverage is not universal.     |
| RECOMMENDED | Read replica/sharding strategy | Needed for scale, not repo code.                                       |
| PARTIAL     | Connection pooling             | Mongo driver config exists; production pool tuning should be reviewed. |
| DONE        | Pagination                     | Pagination audit and paged APIs/screens exist.                         |
| DONE        | Response compression           | `compression` middleware exists.                                       |
| RECOMMENDED | Horizontal scaling strategy    | Needs deployment/Kubernetes plan.                                      |
| RECOMMENDED | Load testing                   | Add k6/Artillery scripts.                                              |

### Frontend

| Status  | Task                       | Evidence / Next Action                                                        |
| ------- | -------------------------- | ----------------------------------------------------------------------------- |
| PARTIAL | Lazy loading/routes/images | Native navigation exists; image/video optimization needs QA.                  |
| PARTIAL | Image optimization         | Local placeholders and media handling exist; CDN/WebP pipeline not proven.    |
| PARTIAL | Skeleton loading screens   | Chat list has skeletons; broaden to high-traffic lists.                       |
| TODO    | Offline mode/PWA support   | No offline-first mode found.                                                  |
| PARTIAL | Prefetching match profiles | Match list/detail flow exists; explicit prefetch strategy should be verified. |

## 13. Background Jobs

| Status  | Task                           | Evidence / Next Action                                                                                                         |
| ------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| PARTIAL | Email queue                    | Notification queue exists; email delivery provider/worker needs production verification.                                       |
| DONE    | Notification queue             | BullMQ notification queue/worker/DLQ exists.                                                                                   |
| PARTIAL | Match recalculation/digest job | Daily match digest task exists; recalculation policy needs expansion.                                                          |
| DONE    | Profile expiry/archive job     | Scheduled profile archive task now moves stale active profiles to inactive using configurable inactivity days and batch limit. |
| DONE    | Subscription expiry cron job   | Subscription expiry task exists.                                                                                               |
| DONE    | OTP cleanup job                | Scheduled in-memory expired OTP cleanup now runs every 5 minutes.                                                              |
| DONE    | Analytics aggregation job      | Daily analytics summary job materializes overview and funnel data.                                                             |
| DONE    | Media cleanup job              | Scheduled deleted-media cleanup removes old files/thumbnails and hard-deletes cleaned records.                                 |
| TODO    | Fraud detection batch scan     | No batch fake-profile scanner found.                                                                                           |

## 14. Frontend Contract And API Standards

| Status  | Task                              | Evidence / Next Action                                                 |
| ------- | --------------------------------- | ---------------------------------------------------------------------- |
| DONE    | API versioning (`/api/v1`)        | Global prefix/versioning exist.                                        |
| DONE    | Standard response envelope        | `successResponse`, API response DTO, and error codes exist.            |
| DONE    | Mobile token handling             | Secure storage/base API refresh flow exists.                           |
| DONE    | Swagger/OpenAPI docs              | Swagger setup exists in non-production.                                |
| DONE    | API error code registry           | Error/success code constants exist.                                    |
| PARTIAL | Cursor/offset pagination standard | Pagination exists; contract should be normalized across all list APIs. |
| TODO    | OpenAPI to TS SDK generation      | Not implemented.                                                       |
| TODO    | Storybook component library       | Not implemented.                                                       |
| PARTIAL | Internationalization              | English/Hindi implemented; more Indian languages remain future work.   |

## 15. DevOps And Infrastructure

| Status  | Task                          | Evidence / Next Action                                              |
| ------- | ----------------------------- | ------------------------------------------------------------------- |
| TODO    | Docker containerization       | No complete Docker setup found in repo root/API/mobile.             |
| TODO    | Kubernetes deployment         | No manifests/Helm charts found.                                     |
| TODO    | CI/CD pipeline                | No GitHub Actions workflow found in current audit.                  |
| TODO    | Infrastructure as Code        | No Terraform/IaC found.                                             |
| TODO    | Blue-green/canary deployments | Not implemented.                                                    |
| TODO    | Database migration strategy   | Mongo schemas/seeders exist; no versioned migration workflow found. |
| BLOCKED | Disaster recovery/RTO/RPO     | Operational cloud task.                                             |
| BLOCKED | Multi-region failover         | Operational cloud task.                                             |
| BLOCKED | Automated backup verification | Operational cloud task.                                             |

## Updated Build Order

1. Stabilize launch-critical provider paths: push, SMS/email, payments/store billing, crash reporting.
2. Run full API/mobile verification: lint, typecheck, build, smoke tests, Android release QA.
3. Complete Play Console compliance: privacy URL, data safety, app access, content rating, account deletion instructions.
4. Harden production operations: secrets manager, monitoring/APM, backups, uptime alerts.
5. Finish monetization polish: native billing SDK, receipt verification, refund/invoice QA.
6. Expand post-launch product depth: voice messages, translation, fraud detection, cohort analytics, success stories.
7. Add scale infrastructure: Docker, CI/CD, load tests, CDN, broader queue coverage, migration workflow.
