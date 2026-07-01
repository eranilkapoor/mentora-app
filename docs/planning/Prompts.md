# MatchMate Pending Execution Queue

Last reviewed: 2026-07-01

## Review Basis

This queue is derived from:
- `docs/planning/TASK-ROADMAP.md`
- `docs/planning/PROJECT-PLAN.md`
- `docs/planning/TECHNICAL-PLAN.md`
- Current repository implementation and test state

Completed items were intentionally removed from this file to keep it execution-focused.

## Already Implemented (Kept Out Of Queue)

- Core API domain modules are implemented: auth, profiles, preferences, media, matches, chat, notifications, payments, subscriptions, referrals, settings, support, admin, analytics, safety.
- Admin APIs and services have broad unit coverage and currently pass lint/typecheck/tests.
- P0-3 branch-heavy RBAC/admin hardening tests are complete (RBAC inactive/conflict/not-found paths and admin repository filter/pagination/status edge coverage).
- Socket.IO E2E now covers authenticated room isolation and deterministic join/rejoin message-fetch ordering paths.
- Notification orchestration and queue paths have dedicated unit tests.
- Dockerfile and dockerignore exist for API containerization.
- CI quality checks exist for lint, typecheck, tests, and coverage reporting.

## Remaining Work (Code)

### In Progress

1. P0 mobile automated coverage expansion.
   - Completed in this pass: auth bootstrap/login-refresh/logout reducer workflow tests, root-entry route selection tests for auth/onboarding/app handoff, discovery filter-range normalization/incomplete-range validation utility tests, interest/shortlist action workflow hook tests, chat send/read workflow utility tests, and loading/empty/error/offline list-state utility tests.
   - Next focus: workflow/state tests for settings save, membership prompts, support tickets, and additional accessibility variants (large text/reduced motion).

### P0 - Highest Priority

1. Expand API E2E coverage from infrastructure checks to business journeys.
   - Socket.IO room isolation and deterministic join/rejoin message ordering coverage is implemented.

2. Raise mobile automated coverage for critical product journeys.
   - Add workflow tests for onboarding/profile edit, settings save flows, membership upgrade prompts, support ticket paths.
   - Add state tests for permission-denied and accessibility variants (large text/reduced motion).

### P1 - Important

4. Harden storage/media contract behavior with tests.
   - Add tests for MIME spoofing rejection, object-missing fallback, upload rollback, signed URL/proxy access expectations, and cleanup idempotency.

5. Complete notification provider worker integration tests.
   - Add queue-worker integration tests for FCM/email/SMS substitutes with retry, DLQ replay, invalid-token cleanup, quiet hours, and opt-out behavior.

6. Normalize list API pagination contracts and client cache updates.
   - Standardize page/limit/meta shape across matches, chat, notifications, support, admin, wallet, analytics.
   - Validate RTK Query cache invalidation and optimistic update behavior across these list endpoints.

7. Complete payment and subscription sandbox evidence in code/tests.
   - Add stricter tests for store verification transitions (renewal, grace, expiry, cancellation) and payment notification replay/idempotency.

### P2 - Product Depth

8. Expand analytics taxonomy coverage and dashboards.
   - Add end-to-end event assertions for high-traffic flows and complete dashboard aggregates for conversion, retention, revenue, churn, and referral attribution.

9. Add success-story workflow implementation verification.
   - Confirm API routes/services/UI exist; if missing, implement submission, moderation, and publish/reject lifecycle.

10. Add component-level UI quality infrastructure.
   - Introduce Storybook (or equivalent) and accessibility checks for shared components.

## Remaining Work (External / Blocked But Required For Launch)

1. Production provider credentials and verification evidence.
   - FCM/APNs, SMS/email provider production credentials, payment/store console setup and webhook configuration, social auth app approvals.

2. Monitoring and incident readiness.
   - Production Sentry projects, DSNs, source maps, dashboard alerts, uptime checks, on-call notification routing.

3. Deployment hardening.
   - Container image CI build/publish, runtime health verification, backup/restore drills, and disaster recovery rehearsal.

## Next Task To Execute First

1. Execute P0 mobile journey/state test expansion by:
   - adding workflow tests for onboarding/profile edit, settings save, membership upgrade prompts, support ticket paths
   - adding state-path tests for permission-denied and accessibility variants (large text/reduced motion)

## Definition Of Done For This Queue

- Each completed task has passing lint, typecheck, and relevant tests.
- E2E additions are deterministic and CI-friendly.
- No completed items remain in this file; they should be moved to roadmap status history if needed.
