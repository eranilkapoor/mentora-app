# MatchMate Engineering Audit And Next Work

Last reviewed: 2026-06-29

## Audit Scope

This tracker was reconciled against the current API, Expo mobile/web app, shared API contract, CI workflow, feature packaging policy, and `TASK-ROADMAP.md`. It is the short execution queue; `TASK-ROADMAP.md` remains the full product ledger.

## Verified Current State

### API

- [x] All 25 API controllers have unit-level contract specs.
- [x] API unit suite passes: 61 suites and 218 tests.
- [x] Controller, socket, payment, notification, admin, analytics, migration, feature-gate, media, privacy, and fraud-detection coverage exists.
- [x] OpenAPI snapshot and generated TypeScript contracts are checked by repository verification.
- [x] Ordered/checksummed Mongo migrations and index drift auditing exist.
- [x] API Dockerfile, provider smoke scripts, release checks, health/readiness endpoints, and graceful shutdown exist.
- [x] Rule-based fraud batch scanning and its scheduled task exist.
- [~] API E2E foundation exists with 1 suite/4 HTTP tests; database-backed business journeys and authenticated sockets remain.
- [~] Coverage is ratcheted in CI at the measured baseline; the final 95% target is not yet met.

Current honest API coverage from `npm run test:cov -- --runInBand`:

| Metric     | Current | Target |
| ---------- | ------: | -----: |
| Statements |  35.93% |    95% |
| Branches   |  15.02% |    95% |
| Functions  |  26.80% |    95% |
| Lines      |  34.90% |    95% |

### Mobile And Web

- [x] Mobile suite passes: 6 suites and 32 tests.
- [x] Existing tests cover realtime auth classification, sibling normalization, settings persistence, plan access, and upgrade prompts.
- [x] Shared API contracts, secure token bootstrap, settings synchronization, feature prompts, localization, and error reporting foundations exist.
- [ ] High-traffic screens, RTK Query services, navigation flows, accessibility behavior, and web-specific rendering have little or no automated coverage.
- [x] Mobile coverage is collected and ratcheted in CI against the complete eligible source set.
- [x] Upgrade navigation uses `CommonActions`; its generic/named prompts and navigator readiness branches have 100% statements, branches, functions, and lines coverage.

Current honest mobile/web coverage from `npm run test:cov`:

| Metric     | Current | Target |
| ---------- | ------: | -----: |
| Statements |   2.29% |    95% |
| Branches   |   1.59% |    95% |
| Functions  |   1.67% |    95% |
| Lines      |   2.24% |    95% |

### CI And Release

- [x] GitHub Actions installs all workspaces and runs lint, typecheck, contract generation checks, migration validation, API build, API/mobile tests, and i18n validation.
- [x] CI runs ratcheted API and mobile coverage and uploads JSON/LCOV reports as a retained artifact.
- [~] The deterministic HTTP E2E foundation now runs in the root CI command. Database-backed API journeys, mobile device E2E, load tests, and provider sandbox tests remain.
- [ ] Production provider credentials and operational evidence remain external launch work.

## Roadmap Reconciliation

The following stale roadmap statements were corrected during this audit:

- Fraud detection batch scanning is implemented, not TODO.
- API Docker containerization exists, so the remaining task is image build/deploy verification rather than initial implementation.
- Automated regression totals now reflect 61 API unit suites/218 tests, 1 API E2E suite/4 tests, and 6 mobile suites/32 tests.

The following roadmap items remain correctly classified as external or provider-dependent: production FCM/MSG91/SES delivery, social provider approval, payment/store credentials, Apple/Google receipt validation, Aadhaar/DigiLocker, Sentry dashboards and source maps, CDN, backups, and multi-region recovery.

## Next Code Work

### P0 - Correctness And Release Confidence

1. [x] **Make plan and feature packaging machine-verifiable.**
   - Added seed invariants for complete/unique `FeatureKey` coverage and Enterprise feature mappings.
   - Added `ENTERPRISE_CUSTOM` with custom price, term, limits, integrations, governance, and support; payment/trial/coupon/store flows reject it.
   - Added API-driven Enterprise Membership UI and Contact Sales routing.
   - Consolidated profile identity verification to canonical `Verification.status`; removed profile/settings/KYC mirror booleans and overlapping verification feature keys.
   - Added exported role-permission policies, privileged-boundary tests, fixed-plan numeric limit policies, and lifecycle invariants.

2. [~] **Create a real API E2E test harness.**
   - Completed foundation: `test/jest-e2e.json`, real Nest HTTP adapter tests for root/live/ready/static/404 behavior, deterministic infrastructure substitutes, and root CI wiring.
   - Next: add isolated Mongo state plus deterministic Redis/provider substitutes for business-flow E2E tests.
   - Cover register/login/refresh/logout, profile and preference updates, interest-to-match flow, chat authorization, subscription access, payment webhook idempotency, privacy/export/deletion, support tickets, and admin authorization.
   - Add authenticated Socket.IO tests for connect, room isolation, message delivery, read state, typing, reconnect, and revoked-token rejection.

3. [x] **Turn coverage into a ratcheted CI gate.**
   - API floors now enforce 35% statements, 15% branches, 26% functions, and 34% lines.
   - Mobile floors now enforce 2% statements, 1% branches, 1% functions, and 2% lines across the complete eligible source set.
   - CI replaces duplicate plain unit runs with coverage runs and uploads JSON/LCOV artifacts for both applications.
   - The final 95% application target remains the upward ratchet objective; completed critical modules can enforce stronger per-file thresholds immediately.

4. [ ] **Cover the largest high-risk API services.**
   - First: `auth.service.ts`, `chat.service.ts`, `profiles.service.ts`, `settings.service.ts`, and `storage.service.ts`.
   - Next: match discovery/lifecycle, two-factor auth, referrals/wallet, account deletion, subscription plans/boosts, KYC, support tickets, OTP, and social token verification.
   - Test denial, idempotency, concurrency, retry, rollback, malformed-provider-response, and not-found branches, not only happy paths.

5. [ ] **Build mobile/web workflow tests.**
   - Cover login and token refresh, onboarding/edit profile, discovery filters, interest/shortlist feedback, match details privacy, chat media/presence, membership checkout, settings synchronization, static pages, and account deletion.
   - Verify loading, empty, offline, permission-denied, feature-locked, provider-failure, dark theme, large text, reduced motion, and web layout states.
   - Completed: upgrade routing uses `CommonActions`, with all prompt and navigator-readiness branches held at 100% coverage.

### P1 - Provider And Data Integrity

6. [ ] **Harden storage and media with contract tests.**
   - Test IAM-role S3 access, private/public object policies, signed URLs or proxy reads, missing objects, range requests for video, thumbnail cleanup, upload rollback, MIME spoofing, size limits, and orphan cleanup.

7. [ ] **Complete payment and subscription integration evidence.**
   - Add Razorpay/store sandbox flows, webhook replay tests, signature failures, duplicate transactions, refund reconciliation, trial cancellation, renewal/grace/expiry transitions, invoice generation, and current-plan refresh on success/failure.

8. [ ] **Complete notification delivery testing.**
   - Add queue-worker integration tests for FCM, SES, and MSG91 substitutes; verify retries, deduplication, DLQ replay, opt-outs, quiet hours, invalid token cleanup, and daily-match digest eligibility.

9. [ ] **Test common security and infrastructure code.**
   - Cover membership/rate-limit guards, exception filter, logging interceptor, correlation middleware, local/Redis cache behavior, Socket.IO Redis adapter fallback, readiness degradation, and graceful shutdown.

10. [ ] **Normalize list APIs and client cache behavior.**
    - Adopt one pagination contract for matches, chat, notifications, support, admin, wallet, and analytics.
    - Verify cache tags, optimistic updates, deduplication, stale data invalidation, and reconnect refetch behavior.

### P2 - Product Depth

11. [ ] Expand analytics taxonomy and dashboards for funnels, match success, profile quality, referrals/UTM, revenue, churn, and payment failures.
12. [ ] Add success-story submission/moderation/CMS workflow.
13. [ ] Add remote feature configuration and experiment assignment with audit history and safe defaults.
14. [ ] Add chat translation only after selecting a privacy-reviewed provider and retention policy.
15. [ ] Add Storybook or an equivalent component catalog with accessibility checks.
16. [ ] Add offline/retry strategy for selected read flows; do not promise full offline chat without a conflict model.

## Recommended Implementation Order

1. Plan-feature invariant tests and Membership API-driven rendering.
2. API E2E harness plus auth/profile/interest/chat happy-path tests.
3. CI coverage ratchet and coverage reporting artifacts.
4. High-risk service branch tests: auth, profiles, settings, storage, chat.
5. Mobile workflow/component coverage and navigation warning fix.
6. Payment, subscription, notification, and S3 sandbox integration tests.
7. Load, device, accessibility, and release-candidate QA suites.

## Definition Of Production Ready

- Unit, integration, E2E, contract, migration, and provider sandbox suites pass in CI.
- Coverage cannot regress and reaches the agreed 95% target for critical business/security modules.
- No plan feature is granted only by client-side UI logic; backend guards remain authoritative.
- Payment, subscription, storage, notification, and social-auth flows have sandbox or staging evidence.
- Mobile and web critical journeys pass with light/dark themes, accessibility settings, poor networks, expired sessions, and denied permissions.
- Production monitoring, alerts, backups, restore drills, key rotation, and rollback procedures have recorded evidence.
