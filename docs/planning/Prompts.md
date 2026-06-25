# MatchMate Prompt Audit Tracker

Last reviewed: 2026-06-24

## Completed In This Batch

### API
- [x] Fixed stale API Jest coverage paths in `match-mate-api-server/package.json`.
- [x] Raised API coverage gate to 95% across statements/branches/functions/lines.
- [x] Added controller/socket contract tests across payments, matches, chat, notifications, support, profiles/preferences, referrals/wallet, subscriptions, and KYC.
- [x] Added service-level coverage for export sanitization, profile quality/visibility scoring, media moderation, thumbnail skip behavior, and realtime emit services.
- [x] API test suite passes with 35 suites and 105 tests.
- [x] Hardened `payments.gateway.ts` typing by removing `any` and introducing strict request/response contracts.
- [x] Added missing controller contract tests for auth, settings, and profile media controllers.
- [x] Added provider smoke scripts for API health and provider configuration checks (`smoke-api.mjs`, `smoke-providers.mjs`).
- [x] Added API deployment Docker artifacts (`Dockerfile`, `.dockerignore`).
- [x] Added backend `release:check` automation script with migration/env validation, provider checks, lint/typecheck/tests/build, OpenAPI drift checks, and i18n checks.
- [x] Added first rule-based backend fraud detection batch scan (service + daily cron task + runner + tests).
- [x] Improved analytics completeness end-to-end:
   - Backend taxonomy + daily summary endpoints.
   - Authenticated mobile analytics tracking endpoint (`POST /analytics/track`).
   - Mobile lifecycle/auth event wiring for `APP_OPENED`, `APP_BACKGROUND`, `USER_LOGGED_IN`, and `USER_LOGGED_OUT`.
- [x] Expanded service-level test coverage for settings privacy/export and profile media behavior.
- [~] Continued API coverage expansion with analytics service and scheduled-task unit tests (analytics aggregation + fraud scan).
- [~] Continued API coverage expansion with auth service/task tests (`AuthPasswordService`, `OtpCleanupTask`).
- [~] Continued API coverage expansion with payments service tests (create/verify/webhook/refund branch coverage).
- [~] Continued API coverage expansion with notifications service tests (dedupe, queue-enabled dispatch path, DLQ admin gating, and channel-failure propagation).
- [~] Continued API coverage expansion with notification queue service tests (enablement, enqueue defaults, DLQ listing, replay metadata update, and purge partial-failure handling).
- [~] Continued API coverage expansion with admin module tests across controllers and services (admin, analytics, moderation, plans, payments, notifications, curated matches, RBAC, and audit flows).

### FE (Mobile Hardening)
- [x] Removed web `localStorage` refresh-token persistence and switched web refresh token to in-memory session storage in `baseApi.service.ts`.
- [x] Stopped persisting `accessToken` in Redux persist (`auth` slice now persists `user` only).
- [x] Added startup refresh bootstrap in `AppInitializer.tsx` to restore access token without persisting it.
- [x] Removed redundant refresh token payload duplication (no refresh token in request body for refresh/logout; header-only path).
- [x] Added explicit `refresh` auth mutation endpoint in `authApi.service.ts`.
- [x] Enabled production telemetry flags in EAS profiles:
  - `EXPO_PUBLIC_ERROR_REPORTING_ENABLED=true`
  - `EXPO_PUBLIC_ERROR_REPORTING_PROVIDER=sentry`
  (preview + production)
- [x] Replaced key runtime `console.error`/`console.warn` paths with `reportError(...)` in:
  - `src/store/services/baseApi.service.ts`
  - `src/core/utils/storage.ts`
  - `src/i18n/index.ts`
  - `src/features/Settings/Settings.screen.tsx`
- [x] Added reset-password code exchange scaffold (API + mobile):
   - API now issues one-time `code` links for forgot-password and supports `POST /auth/reset-password/exchange-code`.
   - Mobile reset screen now accepts deep-link `code`, exchanges it for a short-lived token, and then performs password reset.
   - Legacy token-based reset requests were removed from mobile and backend reset flow.
- [x] Updated OTA/runtime release controls in `app.json`:
  - `runtimeVersion` -> `{ "policy": "appVersion" }`
  - `updates.checkAutomatically` -> `ON_LOAD`

## Current Coverage Baseline (API)

- `npm run test:cov -- --runInBand` runs and fails the 95% gate intentionally until further coverage is added.
- Current honest API baseline:
  - Statements: 21.39%
  - Branches: 7.73%
  - Functions: 14.74%
  - Lines: 20.35%
- Biggest uncovered areas remain service/repository/task modules: auth, profiles/media, settings/privacy/export, payments, notification providers/queues, admin/RBAC, analytics, storage, migrations branch paths, and scheduled jobs.
- Biggest uncovered areas remain service/repository/task modules: auth, profiles/media, settings/privacy/export, payments, notification providers/queues, analytics, storage, migrations branch paths, and scheduled jobs.

## FE Task Status

1. [x] High: Session token persistence hardening
   - Completed: no persisted access token, no web localStorage refresh token.
   - Remaining: if web is a core production target, move to strict httpOnly cookie-only refresh strategy end-to-end.

2. [x] High: Reset-password deep-link token exposure
   - Completed. Deep-link reset now uses one-time `code` exchange flow.
   - Legacy direct token acceptance removed from mobile deep-link parsing and API reset fallback logic.

3. [x] High: Production observability disabled
   - Completed for preview/production EAS env flags.
   - Remaining: Sentry release health dashboards, alerts, and sourcemap verification in CI.

4. [~] High: Transport hardening (pinning + integrity)
   - In progress.
   - Completed now: production API base URL is enforced to HTTPS in mobile config resolution.
   - Remaining: certificate pinning strategy (API + socket) and device integrity attestation path.

5. [x] Medium: Refresh token sent redundantly in header + body
   - Completed: header-only transport path in mobile client refresh/logout calls.

6. [~] Medium: Runtime console logging
   - In progress.
   - Completed for core/high-risk files listed above.
   - Remaining: replace/route remaining feature-level console logs.

7. [x] Medium: OTA/runtime strategy too static
   - Completed: runtime policy + load-time update check.

8. [ ] Low: Permission minimization
   - Pending review with product/feature ownership (voice/location requirements).

## Next Task Need TODO

Best next code-side improvements:

1. [Done] Add privacy/export and profile/media service-level tests (high-risk policy behavior).
2. [Done] Harden payment gateway typing in `payments.gateway.ts` (remove `any`, add strict request/response contracts and tests).
3. [Done] Add provider smoke-test scripts for staging (FCM, SES/MSG91, payments, S3, social login).
4. [Done] Complete remaining controller contract tests for auth/profiles/settings. Admin/RBAC/wallet can be expanded further if route coverage is increased.
5. [Done] Add first rule-based fraud detection batch scan (without ML dependency).
6. [Done] Improve analytics completeness (event taxonomy + summary endpoints + mobile event wiring).
   - Completed for high-traffic lifecycle/auth events.
   - Optional follow-up: expand taxonomy adoption to additional feature-specific events.
7. [Done] Add API Dockerfile + deployment-safe `.dockerignore`.
8. Broaden loading/error/empty states for high-traffic FE screens.
9. [Done] Add automated `release:check` script (CI, migrations, env validation, OpenAPI drift, i18n checks).

## Next Tasks

1. Implement reset-password one-time code exchange flow across API + mobile deep links.
2. Add certificate pinning and device integrity attestation strategy.
3. Finish replacing remaining runtime `console.*` logging with centralized reporting.
4. Configure production Sentry dashboards, alerting, and sourcemap verification checks.
5. Continue API coverage expansion toward the 95% gate.
   - Increment completed: analytics service + task coverage additions.
   - Increment completed: auth password-reset/change-password and OTP cleanup task coverage additions.
   - Increment completed: payments verification/webhook/refund guard-path coverage additions.
   - Increment completed: notifications service dedupe/queue orchestration and delivery-failure branch coverage additions.
   - Increment completed: notification queue service list/replay/purge branch coverage additions.
   - Increment completed: admin module API and service-level coverage additions (controllers + admin/rbac/audit services).
   - Remaining: large uncovered domains still include auth, payments services, storage, and migration branches.
