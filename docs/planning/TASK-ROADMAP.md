# Match Mate Task Roadmap

Current home: `docs/planning/TASK-ROADMAP.md`

Last audited: 2026-07-09

This audit compares the roadmap against the current repository:

- Backend: `match-mate-api-server/src`
- Mobile: `match-mate-mobile-app/src`
- Admin CRM: `../juaaree-main-app/admin`
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

The product is much further along than an early roadmap: the repo contains real modules for auth, sessions, profiles, preferences, media, KYC, matches, chat, notifications, payments, subscriptions, referrals, settings, analytics, admin, Redis caching, Socket.IO, Swagger, rate limiting, and launch-readiness documentation. The separate Juaaree admin CRM also contains a Match Mate adapter and screens for API-backed operations.

The previous roadmap overstated completion for several enterprise items. Real provider-dependent or production-ops items such as Aadhaar/DigiLocker, external AI moderation, production notification delivery, Sentry/APM, CDN, Kubernetes, cloud backups, and Play/App Store acceptance evidence should be treated as `PARTIAL`, `TODO`, or `BLOCKED` until production evidence exists.

## Fix Or Implement Right Now

| Priority | Task                                                                                                           |  Status | Why Now                                                                                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Fix mojibake/corrupt characters in backend comments/log messages where visible in `main.ts` and this roadmap   |    DONE | Cleaned the roadmap and backend bootstrap log/comment text.                                                                                                                                                     |
| P0       | Run mobile and API typecheck/lint/build after the roadmap audit                                                |    DONE | API lint/typecheck and mobile lint/typecheck pass.                                                                                                                                                              |
| P0       | Wire real production notification provider secrets and verify one push end-to-end                              | BLOCKED | Code/env contract exists; real FCM credentials and device delivery proof are external.                                                                                                                          |
| P0       | Finish store billing licensed-track acceptance evidence                                                        | PARTIAL | `expo-iap`, product mapping, checkout, backend verification, acknowledgement, restore, and RTDN reconciliation code are implemented. A recorded licensed-track purchase/restore/renewal test is still required. |
| P1       | Configure production Sentry projects, DSNs, source maps, and alert rules                                       | PARTIAL | Sentry SDKs and global exception capture are wired in mobile and API; production projects and alerting remain external.                                                                                         |
| P1       | Add final release QA evidence: Android matrix, dark theme screenshots, token expiry, push taps, chat reconnect | PARTIAL | Play QA checklist and dark-theme audit docs exist; real device run evidence remains.                                                                                                                            |
| P1       | Tighten production CORS/env secrets review                                                                     |    DONE | Production CORS is restricted and a production secrets checklist exists.                                                                                                                                        |
| P2       | Implement OpenAPI-generated TS client or shared API contract                                                   |    DONE | `@matchmate/api-contract` now includes the complete generated Swagger route/schema contract plus curated domain types.                                                                                          |
| P2       | Add background job coverage for OTP cleanup, orphaned media cleanup, analytics aggregation                     |    DONE | OTP cleanup, deleted-media cleanup, and daily analytics aggregation jobs are implemented.                                                                                                                       |
| P2       | Audit Juaaree Match Mate admin CRM interface against backend admin APIs                                        |    DONE | `juaaree-main-app` includes a Match Mate API client, login/session refresh, shared list/form/action views, sidebar links, admin pages, and adapter tests for the CRM bridge.                                    |

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

| Status  | Task                                    | Evidence / Next Action                                                                                                                                                                     |
| ------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DONE    | Email/phone verification                | Auth verification and OTP flows exist.                                                                                                                                                     |
| PARTIAL | Profile KYC verification                | `Verification.status` is the canonical identity outcome; duplicate profile/settings/KYC booleans were removed. Operational workflow and provider setup still need production verification. |
| PARTIAL | Aadhaar/DigiLocker eKYC                 | `ekyc/initiate` route exists; real government provider integration/credentials are not launch-proven.                                                                                      |
| TODO    | Selfie-to-photo liveness check          | No real liveness provider integration found.                                                                                                                                               |
| DONE    | Document upload and manual review queue | KYC/media/admin moderation queues exist.                                                                                                                                                   |
| DONE    | Verification badge system               | Profile/account/list UI render verified state from verification/profile data.                                                                                                              |

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

| Status | Task                    | Evidence / Next Action                                                                                            |
| ------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| DONE   | Privacy settings        | Privacy settings APIs and mobile screen exist.                                                                    |
| DONE   | Notification settings   | Granular settings API/UI and the schema-compatible master enable/disable behavior are implemented.                |
| DONE   | Hide/block/report users | Settings/safety APIs and mobile flows exist.                                                                      |
| DONE   | Incognito browse mode   | Privacy settings, match profile-view suppression, visible locked controls, and upgrade prompting are implemented. |
| DONE   | Data download           | Account data export endpoint exists.                                                                              |
| DONE   | Consent management      | Consent schema/service/API exist.                                                                                 |

## 4. Matching Engine

### 4.1 Discovery And Feed

| Status  | Task                            | Evidence / Next Action                                                                                                                                                                                                                   |
| ------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Recommended matches API         | `matches/recommended` and discovery service exist.                                                                                                                                                                                       |
| DONE    | Filters API                     | Match query/filter DTOs and mobile filter modal exist.                                                                                                                                                                                   |
| PARTIAL | ML-based ranking engine         | Rule/scoring logic exists; no true ML pipeline found.                                                                                                                                                                                    |
| DONE    | Compatibility score engine      | Compatibility service and match score UI exist.                                                                                                                                                                                          |
| DONE    | Mutual preference scoring       | Preference weights and match discovery logic exist.                                                                                                                                                                                      |
| DONE    | Nearby matches                  | `matches/nearby` and location support exist.                                                                                                                                                                                             |
| DONE    | Premium match curator           | Admins can assign/expire curated matches, users can view/dismiss curated recommendations, and mobile exposes a Curated feed with curator notes.                                                                                          |
| PARTIAL | Daily matches push notification | Code path is complete: cron digest, dry-run/limit controls, run summaries, template send, mobile device-token registration, and FCM provider exist. Remaining work is physical-device FCM delivery evidence with production credentials. |

### 4.2 Interactions

| Status | Task                                    | Evidence / Next Action                                                           |
| ------ | --------------------------------------- | -------------------------------------------------------------------------------- |
| DONE   | Tracked profile views                   | Match profile/view APIs and analytics schemas exist.                             |
| DONE   | Send/accept/reject interest             | Interest endpoints and mobile actions exist.                                     |
| DONE   | Shortlist/save profile                  | Shortlist endpoints and mobile action exist.                                     |
| DONE   | Block/report user/content               | Settings/safety/admin moderation routes exist.                                   |
| DONE   | Who viewed me                           | Endpoint and feature gate exist.                                                 |
| DONE   | Who liked me                            | Received-interest API and mobile Requests tab show users who expressed interest. |
| DONE   | Interaction limits by subscription tier | Feature guard and subscription feature system exist.                             |

### 4.3 Match Lifecycle

| Status | Task                              | Evidence / Next Action                                                                             |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| DONE   | Match creation on mutual interest | Match service handles interest response/match creation.                                            |
| DONE   | Match expiry logic                | Matches can receive `expiresAt`, and a scheduled task expires overdue active matches when enabled. |
| DONE   | Match quality score               | Compatibility service returns match scores and mobile match detail renders score UI.               |
| DONE   | Unmatch                           | `unmatch` endpoint and mobile flow exist.                                                          |
| DONE   | Match statistics per user         | `matches/stats` endpoint exists.                                                                   |

## 5. Chat System

### Backend

| Status | Task                        | Evidence / Next Action                                                                                                                          |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE   | Chat list/conversations API | Chat controller exposes conversations/contacts.                                                                                                 |
| DONE   | REST and Socket.IO messages | Chat controller and gateway exist.                                                                                                              |
| DONE   | Read receipts               | Mark-room-read endpoint and realtime events exist.                                                                                              |
| DONE   | Typing indicators           | Gateway typing DTO/events exist.                                                                                                                |
| DONE   | Media sharing               | Chat attachments endpoint exists.                                                                                                               |
| DONE   | Chat moderation             | Chat messages store moderation status/reasons, configurable review words queue messages, and admin review endpoints approve/remove messages.    |
| DONE   | Message deletion            | Delete message endpoint exists.                                                                                                                 |
| DONE   | Message reactions           | Backend now stores per-user reactions, exposes `PATCH /chats/rooms/:roomId/messages/:messageId/reaction`, and emits `message:reaction` updates. |
| DONE   | Voice messages              | Chat now supports audio attachment uploads plus mobile recording, sending, and playback UI.                                                     |
| DONE   | Chat request/pre-match DM   | Unmatched users can create pending chat requests with an opening message; recipients can accept/reject before normal chat activates.            |
| TODO   | Chat translation            | No translation provider/API found.                                                                                                              |
| DONE   | Profanity filter            | Configurable blocked-word guard rejects unsafe chat messages before saving.                                                                     |
| DONE   | Chat archiving              | Room settings, archived filters, and mobile archive UI exist.                                                                                   |

### Frontend

| Status | Task                           | Evidence / Next Action                                                                                        |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| DONE   | Chat list screen               | `ChatList` feature exists.                                                                                    |
| DONE   | Chat screen realtime messaging | `Chat` feature and realtime service exist.                                                                    |
| DONE   | Typing indicator UI            | Chat UI/realtime integration exists.                                                                          |
| DONE   | Media sharing UI               | Chat screen uploads image attachments and sends image messages through the attachment API.                    |
| DONE   | Chat request accept/reject UI  | Match request cards now expose accept and reject actions backed by the interest response API.                 |
| DONE   | Voice message recording UI     | Chat composer has microphone permission handling, recording timer/cancel, voice upload, and playback bubbles. |
| DONE   | Message reactions UI           | Chat bubbles now show reaction summaries and quick reaction controls backed by the new API mutation.          |
| TODO   | Translated message toggle      | No translation toggle/provider found.                                                                         |

## 6. Notifications

### Backend

| Status  | Task                               | Evidence / Next Action                                                                                                                                                                                                  |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PARTIAL | Push notification service          | Firebase Admin provider, token storage, direct/queued dispatch, multicast sends, and mobile FCM token registration exist. Remaining work is production FCM credential/device acceptance evidence.                       |
| DONE    | In-app notifications               | Notification schema/API/realtime gateway exist.                                                                                                                                                                         |
| PARTIAL | Email notification templates       | Template CRUD/dispatch, seeded lifecycle templates, audit logging, SES config, and SMTP config/provider support exist. Remaining work is live SES/SMTP delivery evidence with production sender credentials.            |
| PARTIAL | SMS notifications                  | MSG91 Flow API provider, OTP variables, timeout/error handling, environment validation, and tests exist. Remaining work is approved DLT template mapping and production delivery evidence.                              |
| TODO    | WhatsApp notifications             | No Meta WABA provider found.                                                                                                                                                                                            |
| DONE    | Notification preference management | Settings and notification preference APIs exist.                                                                                                                                                                        |
| DONE    | Notification deduplication         | Dedupe key/window logic exists.                                                                                                                                                                                         |
| PARTIAL | Scheduled/drip notifications       | BullMQ dispatch/DLQ/replay, scheduled daily digest, expiry reminders, and reminder templates exist. Remaining code work is a campaign builder with audience rules, throttling, schedule windows, and approval workflow. |
| DONE    | Deep link support                  | Notification action navigation exists in mobile.                                                                                                                                                                        |

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

| Status  | Task                                 | Evidence / Next Action                                                                                                                                                                                                                           |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DONE    | Plan system                          | Plans/features schemas, seed data, admin APIs, and mobile membership UI exist.                                                                                                                                                                   |
| DONE    | Custom assisted plan                 | `ASSISTED_CUSTOM` maps every capability to custom terms, adds configurable governance/integrations/SLA/data-residency, routes to sales, and is blocked from checkout/trial/coupon/store flows.                                                   |
| DONE    | Feature access control               | Feature guard/decorator/service exist.                                                                                                                                                                                                           |
| PARTIAL | Upgrade/downgrade/plan lifecycle     | Initial activation, plan assignment/cancel APIs, billing screens, Google receipt verification/acknowledgement, restore, and RTDN reconciliation exist. Remaining work is Apple Server Notifications V2 plus live renewal/cancel/refund evidence. |
| PARTIAL | Upgrade plan API/payment integration | Membership CTA opens a payment-method sheet before order creation; backend signature/webhook hardening, invoice/report/refund flows, and store verification exist. Remaining work is real Razorpay/Stripe/store credential QA.                   |
| DONE    | Purchase history                     | Billing summary/payment history APIs and UI exist.                                                                                                                                                                                               |
| DONE    | Plan expiry reminders                | Subscription expiry task includes reminders.                                                                                                                                                                                                     |
| DONE    | Coupons/discount codes               | Coupon schemas/validate flow exist.                                                                                                                                                                                                              |
| PARTIAL | Auto-renewal/subscription lifecycle  | Receipt verification, acknowledgement, active/grace/cancel status, expiry, replay protection, cancellation UI/API, and Google RTDN handling are implemented. Apple Server Notifications V2 and live renewal/cancel/refund evidence remain.       |
| DONE    | Free trial                           | Trial endpoint/service exists.                                                                                                                                                                                                                   |
| DONE    | Coin/credit wallet                   | General wallet endpoints, spend ledger, coin-pack payment crediting, and mobile wallet summary are implemented.                                                                                                                                  |

### 7.2 Payments

| Status  | Task                               | Evidence / Next Action                                                                                                                                                    |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PARTIAL | Razorpay/Stripe/web gateway        | Payment gateway abstraction/schema exists; real gateway SDK/credentials need production verification.                                                                     |
| DONE    | Payment webhook handling/signature | Webhook endpoint and HMAC verification exist.                                                                                                                             |
| DONE    | Refund system                      | Admin refund endpoint/service exists.                                                                                                                                     |
| PARTIAL | UPI support                        | UPI payment method enum exists; real UPI gateway flow needs verification.                                                                                                 |
| DONE    | Invoice/receipt generation         | Invoice model/API exists, invoices are generated on successful payments, user/admin PDF export payload endpoints exist, and CRM exposes an invoice PDF payment action.    |
| DONE    | GST report/export                  | Admin GST report endpoint exists.                                                                                                                                         |
| DONE    | Failed payment retry/maintenance   | Payment maintenance task exists.                                                                                                                                          |
| DONE    | Payment analytics dashboard        | Admin dashboard returns revenue KPIs, MRR/ARR estimates, churn rate, payment totals, reconciliation, settlement, and GST reports; CRM exposes the payment report screens. |

### 7.3 Referral And Growth

| Status | Task                           | Evidence / Next Action                                                                                                                                                                                 |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DONE   | Referral code generation       | Referral service generates unique codes.                                                                                                                                                               |
| DONE   | Referral earnings/wallet       | Referral wallet schema/API/mobile screen exist.                                                                                                                                                        |
| DONE   | Referral campaign tracking/UTM | Registration accepts UTM/campaign fields for email, phone OTP, and social signup; referral rewards store source/medium/campaign attribution and analytics events include the same campaign dimensions. |
| DONE   | Referral leaderboard           | API exists.                                                                                                                                                                                            |

## 8. Admin Panel And Moderation

| Status | Task                             | Evidence / Next Action                                                                                                                                                                                      |
| ------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE   | Admin APIs                       | Admin controllers cover dashboard, users, plans, payments, notifications, moderation, analytics, curated matches, success stories, support, audit logs, and RBAC.                                           |
| DONE   | Role-based admin access          | Roles/permissions guards and RBAC controller exist.                                                                                                                                                         |
| DONE   | User management                  | Admin user list/detail/status routes exist.                                                                                                                                                                 |
| DONE   | KYC/media moderation queue       | Admin moderation controller exists.                                                                                                                                                                         |
| DONE   | Bulk communication               | Admin broadcast/notification dispatch routes exist.                                                                                                                                                         |
| DONE   | Admin audit logs                 | Admin audit schema/service/controller exist.                                                                                                                                                                |
| DONE   | Dashboard metrics                | Admin dashboard/analytics endpoints exist.                                                                                                                                                                  |
| DONE   | Success story/CMS                | Consent-backed schema/API, public published feed, user history, role-guarded moderation, reviewer audit logs, shared contract, and seed sample are implemented.                                             |
| DONE   | Support ticket/helpdesk          | Full support module now exists with user ticket CRUD/replies, support-staff admin endpoints, notifications, and mobile Help & Support integration.                                                          |
| DONE   | Fake profile detection dashboard | Admin dashboard exposes rule-based fake-profile risk signals from pending media, KYC, and report queues; fraud scan tasks/services cover batch detection. External ML scoring remains optional future work. |

### 8.1 Juaaree Admin CRM Interface

| Status  | Task                                    | Evidence / Next Action                                                                                                                                                                                                     |
| ------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Match Mate API configuration bridge     | `include/configuration.php` exposes `MATCH_MATE_API_BASE_URL`, API key, timeout, login endpoint, and refresh endpoint settings.                                                                                            |
| DONE    | CRM login and token refresh             | `MatchMateApiClient` stores Match Mate access/refresh/session data in the admin session and refreshes expired JWTs before protected calls.                                                                                 |
| DONE    | Match Mate CRM navigation               | `admin/include/template.php` lists Match Mate dashboard, members, audit logs, RBAC, plans, moderation, payments, notifications, analytics, curated matches, support, and stories.                                          |
| DONE    | Shared admin list/form/action interface | `admin/view/match-mate/*` renders reusable dashboard, list, form, action, and login views for Match Mate resources.                                                                                                        |
| DONE    | User/profile operations                 | CRM pages exist for members and profiles; admin API/CRM actions now support admin-created users, profile creation/section updates, status changes, detail, role view, role assignment/removal, and broadcast entry points. |
| DONE    | Admin on-behalf preference/settings     | Admin user routes and CRM row actions support preference updates and settings updates by category with admin audit logs.                                                                                                   |
| DONE    | Admin subscription attach/change/cancel | Admin user routes and CRM row actions can assign, upgrade/downgrade by replacing the active plan, and cancel subscriptions while syncing user membership and writing audit logs.                                           |
| DONE    | Moderation operations                   | CRM pages exist for moderation queue, media moderation, chat moderation, KYC review, reports, and success-story review.                                                                                                    |
| DONE    | Plan and entitlement management         | CRM pages exist for plans, plan features, full plan entitlements, feature assignment/removal, subscriptions alias, and curated matches.                                                                                    |
| DONE    | Payment operations and reports          | CRM pages exist for payments, refund action, reconciliation, settlement, and GST reports.                                                                                                                                  |
| DONE    | Notification operations                 | CRM pages exist for notification analytics, direct send, template dispatch/upsert, failed-job DLQ, replay-all, replay-job, and purge actions.                                                                              |
| DONE    | Analytics operations                    | CRM pages exist for overview, stats, funnel, daily summary, taxonomy, and manual event tracking.                                                                                                                           |
| DONE    | Adapter smoke coverage                  | `tools/test-matchmate-admin-module.php` covers query filtering, analytics row rendering, selectable aggregate rows, and operator-friendly API error messages.                                                              |
| PARTIAL | End-to-end CRM acceptance evidence      | Needs a running Match Mate API and seeded admin account to record login, list, action, pagination, and error-state screenshots for all high-risk admin pages.                                                              |
| PARTIAL | Legacy CRM permission mapping           | Match Mate pages currently depend on Match Mate API RBAC and the adapter's local permission defaults; map them to Juaaree module-level permissions if legacy admin roles must hide links/actions.                          |

## 9. Analytics And Tracking

### Backend

| Status | Task                           | Evidence / Next Action                                                                                                                                                                        |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE   | Activity/interaction logs      | Analytics and activity log schemas/services exist.                                                                                                                                            |
| DONE   | Profile analytics              | Match/profile analytics endpoints exist.                                                                                                                                                      |
| DONE   | Funnel tracking                | Analytics taxonomy, event tracking, funnel endpoint, daily aggregation, admin APIs, and CRM funnel screen exist.                                                                              |
| DONE   | Admin dashboard metrics        | Admin analytics/dashboard endpoints exist.                                                                                                                                                    |
| DONE   | Event tracking system          | First-party analytics event schema, track endpoint, admin track action, taxonomy, stats, overview, funnel, and daily summary are implemented. External Mixpanel/Amplitude export is optional. |
| TODO   | A/B testing infrastructure     | Env flags exist, but no experiment platform.                                                                                                                                                  |
| DONE   | Match success rate tracking    | Admin dashboard exposes match-success conversion KPIs from first-party analytics: impression-to-view, view-to-interest, interest-to-match, and match-to-chat.                                 |
| DONE   | Revenue analytics              | Admin dashboard exposes revenue by currency, MRR/ARR estimates, active/cancelled subscription counts, churn rate, and CRM payment report screens.                                             |
| DONE   | Profile quality score tracking | Profile scores, completion, visibility scores, discovery sorting, and admin dashboard quality buckets are implemented.                                                                        |

### Frontend

| Status  | Task                              | Evidence / Next Action                                                                                                                                                        |
| ------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Profile analytics UI              | Who-viewed/profile analytics UI exists.                                                                                                                                       |
| PARTIAL | User insights/stats dashboard     | User match stats and who-viewed-me APIs exist, and Home shows lightweight stats. A dedicated mobile insights dashboard with trends/conversion cards is still not implemented. |
| DONE    | Success story submission UI       | Help & Support links to a themed submission/history screen with validation, explicit publication consent, status tracking, errors, and English/Hindi content.                 |
| DONE    | Account activity/login history UI | Security login history screen exists.                                                                                                                                         |

## 10. Security

| Status  | Task                          | Evidence / Next Action                                                                                                                                           |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | Rate limiting per IP/user     | Nest throttler and custom rate-limit guard exist.                                                                                                                |
| DONE    | Brute-force protection        | Rate limits and auth protections exist; lockout policy should be tested.                                                                                         |
| DONE    | Input validation/sanitization | Global validation pipe with whitelist and DTO validators exists.                                                                                                 |
| PARTIAL | Data encryption at rest       | Password hashing exists; field-level PII encryption is not clearly implemented.                                                                                  |
| DONE    | Audit logs                    | Admin/activity logs exist.                                                                                                                                       |
| DONE    | Internal API key system       | `@RequireInternalApiKey()` and `InternalApiKeyGuard` enforce configured `INTERNAL_API_KEYS` with constant-time comparison and focused tests.                     |
| BLOCKED | HTTPS/HSTS                    | Needs production reverse proxy/load balancer configuration.                                                                                                      |
| DONE    | Strict CORS policy support    | CORS config supports allowed origins; production env must be reviewed.                                                                                           |
| DONE    | Helmet/security headers       | Helmet is wired in `main.ts`.                                                                                                                                    |
| DONE    | OWASP checklist review        | Formal pre-launch security checklist added under `docs/standards/pre-launch-security-checklist.md`; independent review remains a separate external task.         |
| BLOCKED | Penetration testing           | External vendor/process task.                                                                                                                                    |
| PARTIAL | GDPR/PDPB compliance layer    | Consent, deletion, export, privacy policy, terms, account deletion, and community-guideline pages exist; legal review and final policy approval remain external. |
| DONE    | Data masking for logs         | Logging/error handling redacts sensitive fields.                                                                                                                 |
| DONE    | Vulnerability scanning        | Dependabot monitors all npm lockfiles, CodeQL scans JavaScript/TypeScript, and CI builds/scans the API image with Trivy for high/critical vulnerabilities.       |

## 11. Logging And Monitoring

| Status      | Task                            | Evidence / Next Action                                                                                                   |
| ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| DONE        | Central logger                  | Winston-backed `AppLogger` exists.                                                                                       |
| DONE        | Correlation/request tracing     | Correlation middleware/interceptor exist.                                                                                |
| PARTIAL     | Error monitoring                | Mobile/API Sentry SDK capture is wired; production DSNs, source maps, dashboards, and alert rules need deployment setup. |
| BLOCKED     | Log storage                     | Needs ELK/CloudWatch/Datadog setup.                                                                                      |
| RECOMMENDED | APM                             | Add Datadog/New Relic/OpenTelemetry.                                                                                     |
| RECOMMENDED | Uptime monitoring               | Add external uptime checks.                                                                                              |
| RECOMMENDED | Alerting rules                  | Add PagerDuty/OpsGenie/Slack alerts.                                                                                     |
| RECOMMENDED | Custom product metrics          | Track match rate, notification delivery, chat latency.                                                                   |
| RECOMMENDED | DB query performance monitoring | Add Mongo slow-query monitoring/APM.                                                                                     |
| RECOMMENDED | Socket.IO metrics               | Add connection/reconnect/room metrics.                                                                                   |

## 12. Performance And Scaling

### Backend

| Status      | Task                           | Evidence / Next Action                                                                                                                        |
| ----------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE        | Redis caching                  | Redis/local cache module exists.                                                                                                              |
| PARTIAL     | CDN for media                  | S3/storage support exists; CDN production setup not proven.                                                                                   |
| DONE        | DB indexes                     | Schemas define indexes across key collections.                                                                                                |
| PARTIAL     | Queue system                   | BullMQ notification queue exists; queue coverage is not universal.                                                                            |
| RECOMMENDED | Read replica/sharding strategy | Needed for scale, not repo code.                                                                                                              |
| DONE        | Connection pooling             | Mongo driver config exposes validated pool and timeout knobs (`MONGO_MAX_POOL_SIZE`, `MONGO_MIN_POOL_SIZE`, server-selection/socket/idle/wait-queue timeouts) and rejects invalid min/max pool combinations at boot. |
| DONE        | Pagination                     | Pagination audit and paged APIs/screens exist.                                                                                                |
| DONE        | Response compression           | `compression` middleware exists.                                                                                                              |
| RECOMMENDED | Horizontal scaling strategy    | Needs deployment/Kubernetes plan.                                                                                                             |
| PARTIAL     | Load testing                   | A k6 smoke/load script exists for liveness/readiness thresholds; realistic authenticated journey, chat, payment, and media load tests remain. |

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
| DONE    | Fraud detection batch scan     | Rule-based fraud scanning, a daily scheduled task, a manual runner, and service/task tests are implemented.                    |

## 14. Frontend Contract And API Standards

| Status  | Task                              | Evidence / Next Action                                                                                                                                                                                                                                                                  |
| ------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DONE    | API versioning (`/api/v1`)        | Global prefix/versioning exist.                                                                                                                                                                                                                                                         |
| DONE    | Standard response envelope        | `successResponse`, API response DTO, and error codes exist.                                                                                                                                                                                                                             |
| DONE    | Mobile token handling             | Secure storage/base API refresh flow exists.                                                                                                                                                                                                                                            |
| DONE    | Swagger/OpenAPI docs              | Swagger setup exists in non-production.                                                                                                                                                                                                                                                 |
| DONE    | API error code registry           | Error/success code constants exist.                                                                                                                                                                                                                                                     |
| PARTIAL | Cursor/offset pagination standard | A shared offset metadata builder/contract now standardizes matches, chat, notifications, support, admin, success stories, and wallet transaction summaries. Analytics applicability and paginated RTK cache integration tests remain.                                                   |
| DONE    | OpenAPI to TS SDK generation      | Swagger is snapshotted into `packages/api-contract/openapi.json`; complete immutable route/schema types are generated and checked through root scripts.                                                                                                                                 |
| PARTIAL | Automated regression tests        | Current local evidence includes focused API guard/wallet tests, mobile type/lint, and mobile suites at 79 Jest suites/208 tests with 40%+ coverage gates. CI preserves the MongoDB binary cache and enforces coverage; broader device, visual, and RTK cache integration suites remain. |
| TODO    | Storybook component library       | Not implemented.                                                                                                                                                                                                                                                                        |
| PARTIAL | Internationalization              | English/Hindi implemented; more Indian languages remain future work.                                                                                                                                                                                                                    |

## 15. DevOps And Infrastructure

| Status  | Task                          | Evidence / Next Action                                                                                                                                                                                                                        |
| ------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PARTIAL | Docker containerization       | API `Dockerfile` and `.dockerignore` exist; runtime runs as non-root with a healthcheck, and CI builds/scans the image. Registry publishing and deployment verification remain.                                                               |
| TODO    | Kubernetes deployment         | No manifests/Helm charts found.                                                                                                                                                                                                               |
| PARTIAL | CI/CD pipeline                | GitHub Actions installs all workspaces and runs lint, typechecks, contract/migration checks, API build, API/mobile coverage, E2E, and i18n validation. Coverage and RTDN-related E2E drift were repaired; deployment automation remains TODO. |
| TODO    | Infrastructure as Code        | No Terraform/IaC found.                                                                                                                                                                                                                       |
| TODO    | Blue-green/canary deployments | Not implemented.                                                                                                                                                                                                                              |
| DONE    | Database migration strategy   | Database-wide ordered/checksummed runner, durable history, lease locking, the required payment index migration, read-only index drift auditing, production-safe `autoIndex`, and build/migrate/audit release commands are implemented.        |
| BLOCKED | Disaster recovery/RTO/RPO     | Operational cloud task.                                                                                                                                                                                                                       |
| BLOCKED | Multi-region failover         | Operational cloud task.                                                                                                                                                                                                                       |
| BLOCKED | Automated backup verification | Operational cloud task.                                                                                                                                                                                                                       |

## Updated Build Order

1. Complete and record a licensed-track Google Play purchase, acknowledgement, entitlement, restore, and RTDN acceptance test.
2. Run full API/mobile verification: lint, typecheck, build, smoke tests, Android release QA.
3. Complete Play Console compliance: privacy URL, data safety, app access, content rating, account deletion instructions.
4. Harden production operations: secrets manager, monitoring/APM, backups, uptime alerts.
5. Finish monetization polish: native billing SDK, receipt verification, refund/invoice QA.
6. Expand post-launch product depth: voice messages, translation, cohort analytics, and success stories.
7. Add scale infrastructure: container build/deploy automation, load tests, CDN, broader queue coverage, and production-data explain-plan checks.
