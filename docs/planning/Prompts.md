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

### In Progress

1. P0 business-flow E2E expansion has started.
   - Added `test/business-journeys.e2e-spec.ts` covering auth register/login/refresh/logout, profile personal update, interest send/respond, and support ticket create/reply/close.
   - Added `test/chat-socket-auth-flows.e2e-spec.ts` covering authenticated socket connect readiness, typing/read handling for authenticated sockets, reconnect, and revoked-token rejection.
   - Added `test/admin-rbac-authorization.e2e-spec.ts` covering admin permission boundary behavior (403 when denied, success path when authorized).
   - Added `test/payments-webhook-idempotency.e2e-spec.ts` covering webhook replay handling and idempotency response semantics.
   - Added `test/admin-role-access-boundaries.e2e-spec.ts` covering role-based access denials and approvals for admin dashboard and audit routes.
   - Added `test/support-ticket-feature-access.e2e-spec.ts` covering support ticket feature-guard denial and allow paths.
   - Added `test/payments-verify-access-and-failure.e2e-spec.ts` covering JWT access denial and invalid-signature failure/success handling for payment verification.
   - Added `test/payments-store-subscription-access.e2e-spec.ts` covering JWT access denial, DTO validation failure, and authorized success for native store subscription verification.
   - Added `test/chat-feature-and-access-boundaries.e2e-spec.ts` covering JWT/feature guard denials, validation failure, and authorized success for chat routes.
   - Added `test/notifications-access-and-validation.e2e-spec.ts` covering JWT denial, DTO validation failure, and authorized success for notification endpoints.
   - Added `test/profiles-access-boundaries.e2e-spec.ts` covering JWT denial, personal-profile DTO validation failure, and authorized success for profiles endpoints.
   - Added `test/matches-access-and-validation.e2e-spec.ts` covering JWT denial, interest DTO validation failure, and authorized success for matches endpoints.
   - Added `test/support-ticket-lifecycle-db.e2e-spec.ts` covering the real support ticket create/list/get/reply/close lifecycle against in-memory Mongo with the actual schema, repository, and service.
   - Added `test/profile-journey-db.e2e-spec.ts` covering real profile create/update/get flow against in-memory Mongo with the actual profile repository and service.
   - Added `test/matches-interest-lifecycle-db.e2e-spec.ts` covering real interest send/accept and match listing flow against in-memory Mongo with the actual match repository and service.
   - Added `test/admin-support-ticket-flow-db.e2e-spec.ts` covering real admin support list/reply/status-update flow against in-memory Mongo with the actual repository and service.
   - Verified with: targeted `npm run test:e2e -- test/business-journeys.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/chat-socket-auth-flows.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/admin-rbac-authorization.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/payments-webhook-idempotency.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/admin-role-access-boundaries.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/support-ticket-feature-access.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/payments-verify-access-and-failure.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/payments-store-subscription-access.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/chat-feature-and-access-boundaries.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/notifications-access-and-validation.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: consolidated run of all current boundary suites (12 suites / 34 tests), then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/support-ticket-lifecycle-db.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Verified with: targeted `npm run test:e2e -- test/profile-journey-db.e2e-spec.ts test/matches-interest-lifecycle-db.e2e-spec.ts test/admin-support-ticket-flow-db.e2e-spec.ts`, then `npm run lint:check`, and `npm run typecheck`.
   - Remaining in this stream: move from controller-level flow verification to DB-backed journeys and extend to chat/payment/admin boundaries.

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
