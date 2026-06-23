# MatchMate Prompt Audit Tracker

Last reviewed: 2026-06-23

## Completed In This Batch

- [x] Fixed the stale API Jest coverage config in `match-mate-api-server/package.json`; coverage now scans current source paths instead of old `modules/match`, `modules/subscription`, and other removed paths.
- [x] Raised the API coverage gate to 95% for statements, branches, functions, and lines so `npm run test:cov` now fails honestly until enterprise-grade coverage is added.
- [x] Added public API/socket contract tests for payments, matches, chat REST, chat websocket gateway, notifications REST, notifications websocket gateway, static pages/root health, support ticket user/admin, profiles/preferences, referrals/wallet, subscriptions, and KYC controllers.
- [x] Added service-level coverage for data export sanitization, profile quality/visibility scoring, media moderation, video thumbnail skip behavior, and chat/notification realtime emit services.
- [x] API test suite now passes with 35 suites and 105 tests.

## Current Coverage Baseline

- `npm run test:cov -- --runInBand` runs successfully at the test level but fails the new 95% coverage gate, as intended.
- Current honest API baseline after controller/socket plus first service coverage batches:
  - Statements: 21.39%
  - Branches: 7.73%
  - Functions: 14.74%
  - Lines: 20.35%
- Strong controller/socket coverage now exists for chat, notifications, support, static pages, profiles/preferences, referrals/wallet, subscriptions, KYC, and key payments/matches routes.
- Biggest uncovered areas are service/repository/task modules: auth, profiles/media, settings/privacy/export, payments, notifications queue/providers, admin/RBAC, analytics, storage, migrations runner branches, and scheduled jobs.

## Next Task Need TODO

Best code-side improvements we can do next:

1. **Add service-level tests for privacy/export and profile/media**
   Since private photos, blur settings, match-detail visibility, and public profile export are high-risk, add tests proving profile export/download respects privacy, feature gates, blocked users, and private-media rules.

2. **Harden payment gateway typing**
   [payments.gateway.ts](D:/Projects/match-mate-app/match-mate-api-server/src/modules/payments/controllers/payments.gateway.ts:1) still uses `any`. We should replace it with typed Razorpay/store/payment verification contracts and add tests around failure/success payloads.

3. **Add provider smoke-test scripts**
   Code exists for FCM, SES/MSG91, payments, S3, social login, but enterprise release needs safe staging smoke commands. These should be opt-in scripts that validate credentials without touching production users.

4. **Complete remaining controller contract tests**
   Add direct tests for auth, profiles/media/preference, settings, admin, RBAC, referrals, wallet, subscriptions, and KYC controllers.

5. **Add rule-based fraud detection batch scan**
   Roadmap still has fraud batch scan as TODO. We can implement a first enterprise-safe version without ML: duplicate phone/email/device signals, suspicious profile completeness patterns, rapid outreach, report counts, and admin moderation queue.

6. **Improve analytics completeness**
   Backend analytics exists, but funnel/revenue/profile-quality dashboards are partial. We can add normalized event taxonomy, admin summary endpoints, and mobile event calls for upgrade, interest, shortlist, chat request, profile export, and payment checkout.

7. **Dockerize API for deployment**
   Docker/Kubernetes/IaC are still TODO. The most useful first step is an API `Dockerfile` plus deployment-safe `.dockerignore`, then later compose/IaC.

8. **Broaden skeleton/loading/error states**
   Chat list has skeletons; high-traffic screens like Home, Matches, Match Detail, Billing, Notifications, and Profile should have consistent loading/error/empty states.

9. **Add production release checklist automation**
   We have docs, but we can make a `release:check` script that runs CI, migration status, index audit, env validation, OpenAPI drift, and i18n before deployment.

My recommended next code task: **privacy/export and profile/media service tests**, then **payment typing hardening**, then **remaining controller contract tests**. These give the highest production confidence without needing external credentials.

## Next Tasks

1. Add provider-backed staging tests for FCM, SES/MSG91, Razorpay/Stripe, social login, KYC, and media moderation once staging credentials are available.
2. Configure production Sentry projects/source maps, uptime checks, alert rules, and operational dashboards.
3. Add deployment automation after the target AWS/container architecture and deployment credentials are finalized.
4. Continue coverage for full refresh-token rotation, payment webhook integration, profile/media privacy, settings privacy/export, profile editing components, and end-to-end realtime reconnect behavior.
5. Run explain-plan checks for discovery, chat history, notification lists, payment history, and admin queues against production-like data volumes.
