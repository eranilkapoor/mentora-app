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
- Notification orchestration and queue paths have dedicated unit tests.
- Dockerfile and dockerignore exist for API containerization.
- CI quality checks exist for lint, typecheck, tests, and coverage reporting.

## Remaining Work (Code)

### P0 - Highest Priority

1. Expand API E2E coverage from infrastructure checks to business journeys.
   - Add DB-backed E2E for register/login/refresh/logout, profile update, interest-to-match, chat authorization, payment webhook idempotency, support lifecycle, and admin authorization boundaries.
   - Add authenticated Socket.IO E2E for connect, room isolation, read receipts, typing, reconnect, and revoked-token rejection.

2. Raise mobile automated coverage for critical product journeys.
   - Add workflow tests for auth bootstrap/refresh, onboarding/profile edit, discovery + filters, interest/shortlist, chat open/send/read, settings save flows, membership upgrade prompts, support ticket paths.
   - Add state tests for loading/empty/error/offline/permission-denied and accessibility variants (large text/reduced motion).

3. Finish branch-heavy RBAC and admin hardening tests.
   - Increase branch coverage in `src/modules/admin/services/rbac.service.ts` and related permission conflict/not-found/inactive-role branches.
   - Add repository-level branch tests for admin filters and status transitions.

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

1. Implement API business-flow E2E suite expansion (P0-1) starting with:
   - auth register/login/refresh/logout
   - profile update
   - interest -> match creation
   - support ticket create/reply/close

## Definition Of Done For This Queue

- Each completed task has passing lint, typecheck, and relevant tests.
- E2E additions are deterministic and CI-friendly.
- No completed items remain in this file; they should be moved to roadmap status history if needed.
