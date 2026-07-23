# Mentora Launch Readiness Audit

Last reviewed: 2026-06-12

Status legend:

- **Done**: Implemented in code and represented in both product/backend where applicable.
- **Partly Done**: Core flow exists, but production launch needs configuration, QA evidence, provider credentials, or policy hardening.
- **Pending**: Not present or not launch-ready from the current repo review.

## 1. Production Android Build Readiness

| Task | Status | Evidence / Notes |
|---|---:|---|
| Final Android package id | Done | `app.json` uses `com.webnza.mentora`. |
| App name, icon, adaptive icon, splash | Done | `app.json` has app name, icon, adaptive icon, splash icon/background. |
| Versioning | Partly Done | App version is `1.0.0`; confirm EAS `versionCode` policy before Play upload. |
| Production API URL only in release | Partly Done | Env/config structure exists; release build must be verified against production `.env` and EAS env. |
| Dev logs/debug flags disabled | Partly Done | App has production envs; still needs final release smoke test for console/dev flags. |
| Mock/seed data disabled in production | Partly Done | Seeder module exists; ensure production env has seeder disabled and no dummy assets exposed. |
| Android permissions minimal | Partly Done | Location permission is declared; camera/media/upload flows should be checked against Android permission requirements. |
| Deep links configured | Done | `app.json` and `linkingConfig` include reset password/magic login links and scheme. |
| Tablet/iPad support | Partly Done | iOS `supportsTablet: true`; responsive style work started. Needs physical/emulator QA evidence. |

## 2. Google Play Console Compliance

| Task | Status | Evidence / Notes |
|---|---:|---|
| Privacy Policy screen/content | Done | `PrivacyPolicy` feature and translations exist. Needs hosted public URL for Play Console. |
| Terms & Conditions screen/content | Done | `TermsConditions` feature and translations exist. Needs hosted public URL if linked externally. |
| Data Safety form mapping | Pending | Must be completed manually in Play Console based on actual data collection. |
| Content rating | Pending | Play Console task, not code. |
| App access/reviewer credentials | Partly Done | Private reviewer credential template added at `docs/launch/REVIEWER-CREDENTIALS.template.md`; real reviewer account must be created outside git. |
| Account deletion flow | Partly Done | FE delete request exists; BE scheduled deletion/anonymization task exists. Needs final policy QA and public deletion instructions. |
| Consent management | Done | BE `ConsentService`, consent schema, and FE account consent API exist. |

## 3. Auth & Account Safety

| Task | Status | Evidence / Notes |
|---|---:|---|
| Email/password auth | Done | Auth module and FE login/register flows exist. |
| Phone OTP auth | Done | Configurable via env; FE/BE OTP flows exist. Provider credentials still need production verification. |
| Social auth toggles | Done | FE/BE configurable social auth flags exist. |
| Google auth | Partly Done | Flow exists and was tested locally; production OAuth redirect/package/SHA config must be verified. |
| Facebook auth | Partly Done | Flow/config exists; production provider app review and credentials still need verification. |
| Apple auth | Partly Done | FE plugin and BE config exist; Apple production credentials/sign-in review must be verified. |
| Linked account protection | Done | Auth accounts model/linked settings flow exist; only-login-method disconnect protection was implemented. |
| Refresh token/session rotation | Done | Session/token flow exists with refresh handling and logout cleanup. |
| Logout all devices/device list/login history | Done | Security settings, devices, and login history screens/services exist. |
| Rate limiting for sensitive APIs | Done | Global throttler and custom rate-limit guard exist. |
| 2FA | Partly Done | TOTP/SMS/recovery flows exist; final UX/provider verification required. |

## 4. Privacy & Safety

| Task | Status | Evidence / Notes |
|---|---:|---|
| Block/report users | Done | Safety/report/block collections and FE screens exist. |
| Block affects chat/discovery/profile | Partly Done | Flow has been improved; needs regression QA with both users active in chat. |
| Photo privacy | Done | Match/profile media privacy handling exists. Needs QA across free/premium/matched states. |
| Video intro privacy/rendering | Partly Done | Upload, thumbnail, and profile display were implemented; needs Android/iOS media QA. |
| Location only requested when needed | Done | Flow moved toward Nearby/setting-triggered location usage. Needs final device permission QA. |
| KYC/profile verification | Partly Done | Safety/KYC module exists; provider/manual review workflow needs production operation setup. |
| AI/manual media moderation | Partly Done | Media moderation hooks/config exist; provider credentials and admin review process need launch decision. |
| Data download/export | Done | BE `DataExportService` exists. FE visibility should be confirmed in account/privacy settings. |

## 5. Payments & Subscriptions

| Task | Status | Evidence / Notes |
|---|---:|---|
| Plan system | Done | Plans, features, seeder data, membership UI exist. |
| Subscription & billing screen | Done | `SubscriptionBilling` feature exists and is API-driven. |
| Purchase history | Done | Billing details/history APIs and UI exist. |
| Razorpay/Stripe/web gateway | Partly Done | Payment module and gateway enum exist; production credentials/webhook verification required. |
| Google Play Billing support | Partly Done | `expo-iap`, seeded product/base-plan mapping, live store prices, purchase/restore, API mapping enforcement, and strict Play API verification are implemented. Console setup, RTDN, and sandbox release evidence remain. |
| Apple IAP support | Partly Done | `expo-iap`, seeded product/group mapping, live store prices, purchase/restore, API mapping enforcement, and strict App Store Server API verification are implemented. Console setup, Notifications V2, and sandbox release evidence remain. |
| Webhook signature verification | Done | Payment webhook signature handling exists. |
| Refund system | Done | Admin refund API/service exists. |
| Plan expiry reminders | Done | Subscription expiry task/reminder logic exists. |
| Downgrade/expiry behavior | Partly Done | Expiry task exists; final UX and feature-access regression testing needed. |

## 6. Chat & Notifications

| Task | Status | Evidence / Notes |
|---|---:|---|
| Realtime chat via socket | Done | Socket gateways and FE socket client usage exist. Needs background/reconnect QA. |
| Read receipts/typing indicators | Done | Chat roadmap items were implemented. Needs device QA. |
| Chat list search/filter/archive/pin/mute | Done | Chat list improvements exist. Needs QA with real conversations. |
| Notification list/history | Done | Notifications feature exists. |
| Notification tap/deep link handling | Done | Notification detail/action handling was added. Needs push deep-link QA. |
| Push notification provider | Partly Done | Push provider and FCM env keys exist; production FCM credentials are disabled/empty in env files. |
| Push permission prompt/token registration | Done | Mobile registers device tokens and revokes the current device token on logout; final push delivery still depends on FCM credentials. |
| Badge counts clear after read | Partly Done | Implemented in chat/notifications flows; needs regression QA. |

## 7. Performance & QA

| Task | Status | Evidence / Notes |
|---|---:|---|
| Pagination/infinite scroll | Done | Home, matches, chat list, and notifications use paged loading. See `docs/launch/PAGINATION-AUDIT.md`. |
| Dark theme coverage | Partly Done | Many screens were fixed; final screenshot pass needed across auth, settings, profile, match, chat, billing. |
| Android device matrix QA | Pending | Needs emulator/real-device test evidence: Pixel, Samsung, Redmi/Xiaomi, low-end Android. |
| Tablet/foldable/iPad QA | Pending | Responsive work exists; needs real screenshot/device pass. |
| Offline/slow network QA | Pending | Needs test matrix and user-facing error-state verification. |
| Token expiry/app kill/reopen QA | Pending | Auth logic exists; needs release-mode regression evidence. |
| Crash reporting | Partly Done | Mobile `errorReporter` foundation is wired to the global error boundary; Sentry/Crashlytics SDK and DSN still need production setup. |
| Analytics/event tracking | Partly Done | Backend analytics/admin modules exist; mobile event SDK not evident. |

## 8. Backend Production Hardening

| Task | Status | Evidence / Notes |
|---|---:|---|
| Liveness/readiness endpoints | Done | `/live` and `/ready` exist. |
| Graceful shutdown | Done | Shutdown drain and app readiness state exist. |
| Production CORS | Done | Production env now uses `https://mentora.webnza.com` only for allowed origins. |
| Rate limiting/throttling | Done | Throttler and custom rate-limit guard exist. |
| Structured app logger | Done | Custom `AppLogger` and logging interceptor/filter exist. |
| Sensitive log redaction | Done | Logging interceptor redacts passwords/tokens and sensitive keys. |
| DB backups | Pending | Operational task, not visible in repo. |
| Redis/cache production config | Partly Done | Cache/Redis envs exist; production credentials/infra need setup. |
| Monitoring/APM/error alerting | Partly Done | Backend monitoring adapter is connected to the global exception filter; external Sentry/APM project and alerts still need setup. |
| Static uploads/CDN strategy | Partly Done | Local/static uploads exist; production CDN/S3 decision should be finalized. |

## 9. High-Value Post-Launch Improvements

| Task | Status | Notes |
|---|---:|---|
| Profile visibility/searchability score | Done | Scoring/visibility work exists. QA display and ranking behavior. |
| Daily match digest notifications | Partly Done | Notification/scheduler foundation exists; final campaign rules need validation. |
| Who viewed me / who shortlisted me | Done | Interaction/analytics work exists. Confirm paywall and UI behavior. |
| Admin dashboard APIs | Done | Admin module exists with user/payment/moderation/report routes. |
| Revenue analytics | Partly Done | Payment/admin analytics exist; business dashboard/export should be verified. |
| Referral campaign tracking | Done | Referral module and frontend exist. |
| Learning outcomes/CMS | Todo | Replace any generic story/CMS capability with learning outcome, testimonial, and content-review workflows. |

## Tasks We Can Fix Right Now

These are code/config tasks that can be completed immediately without waiting for Play Console review:

1. Done - Remove localhost origins from `.env.production` before final deployment.
2. Partly Done - Add production crash reporting: app foundation is wired; Sentry/Crashlytics SDK and DSN are still external setup.
3. Done - Add/verify push token registration from mobile app to backend, including current-device revoke on logout.
4. Partly Done - Wire production FCM credentials: env contract and checklist exist; real FCM credentials must be added in deployment secrets before enabling.
5. Partly Done - Add a reviewer test account: private template exists; real credentials must be created outside git.
6. Done - Add a Play Store release QA checklist file with required screenshots/device matrix.
7. Done - Verify/document EAS production build profile, Android `versionCode`, and signing setup.
8. Partly Done - App Store/Play client purchase, restore, catalog mapping, and strict server verification are implemented; console products, provider notifications, and sandbox evidence remain.
9. Done - Add a public web page or route for account deletion instructions: `GET /api/v1/account-deletion`.
10. Partly Done - Add monitoring/APM for backend errors, latency, and uptime: adapter/checklist exist; external APM project and alert rules still required.
11. Done - Add final dark-theme screenshot audit for auth, home, matches, profile, chat, settings, billing.
12. Done - Verify all long lists use pagination/infinite scroll: notifications, chat list, home, matches, admin lists.

## Suggested Launch Sequence

1. Freeze new feature development.
2. Complete the "Tasks We Can Fix Right Now" list.
3. Run release-mode Android build through internal testing.
4. Complete Play Console app content: Data Safety, Content Rating, Privacy Policy, App Access.
5. Run device QA on Android phone, low-end Android, tablet/foldable, and web.
6. Submit closed testing build.
7. Fix Play review feedback.
8. Start staged production rollout.
