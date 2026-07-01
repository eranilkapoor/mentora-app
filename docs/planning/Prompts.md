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
- DB-backed E2E journeys cover profiles, interest/match lifecycle, user/admin support tickets, and admin audit logs. MongoDB test binaries use a workspace-local cache and failed setup has resilient teardown.
- CI caches the MongoDB E2E binary and executes the full E2E suite through the repository `ci` script.
- Notification orchestration and queue paths have dedicated unit tests.
- Membership upgrade prompting and support-ticket draft validation/normalization have dedicated mobile tests.
- Dockerfile and dockerignore exist for API containerization.
- CI quality checks exist for lint, typecheck, tests, and coverage reporting.

## Remaining Work (Code)

### In Progress

1. P0 mobile automated coverage expansion.
   - Completed: auth bootstrap/login-refresh/logout, root-entry routing, discovery range validation, interest/shortlist actions, chat send/read utilities, list loading/empty/error/offline states, membership prompts, and support-ticket validation/normalization.
   - Next focus: onboarding/profile-edit submission, settings mutation failure/retry, and accessibility variants (large text/reduced motion).

### P0 - Highest Priority

1. Raise mobile automated coverage for critical product journeys.
   - Add workflow tests for onboarding/profile edit and settings mutation failure/retry paths.
   - Add state tests for permission-denied and accessibility variants (large text/reduced motion).

### P1 - Important

3. Harden storage/media contract behavior with tests.
   - Add tests for MIME spoofing rejection, object-missing fallback, upload rollback, signed URL/proxy access expectations, and cleanup idempotency.

4. Normalize list API pagination contracts and client cache updates.
   - Standardize page/limit/meta shape across matches, chat, notifications, support, admin, wallet, analytics.
   - Validate RTK Query cache invalidation and optimistic update behavior across these list endpoints.

5. Complete payment and subscription sandbox evidence in code/tests.
   - Add stricter tests for store verification transitions (renewal, grace, expiry, cancellation) and payment notification replay/idempotency.

### P2 - Product Depth

6. Expand analytics taxonomy coverage and dashboards.
   - Add end-to-end event assertions for high-traffic flows and complete dashboard aggregates for conversion, retention, revenue, churn, and referral attribution.

7. Implement the success-story workflow.
   - Repository review found no success-story API or mobile feature. Add submission, moderation, and publish/reject lifecycle.

8. Add component-level UI quality infrastructure.
   - Introduce Storybook (or equivalent) and accessibility checks for shared components.

## Remaining Work (External / Blocked But Required For Launch)

1. Production provider credentials and verification evidence.
   - FCM/APNs, SMS/email provider production credentials, payment/store console setup and webhook configuration, social auth app approvals.

2. Monitoring and incident readiness.
   - Production Sentry projects, DSNs, source maps, dashboard alerts, uptime checks, on-call notification routing.

3. Deployment hardening.
   - Container image CI build/publish, runtime health verification, backup/restore drills, and disaster recovery rehearsal.

## Next Task To Execute First

1. Execute P0 mobile journey/state test expansion for onboarding/profile edit, settings mutation failure/retry, permission-denied behavior, and large-text/reduced-motion variants.

## Definition Of Done For This Queue

- Each completed task has passing lint, typecheck, and relevant tests.
- E2E additions are deterministic and CI-friendly.
- No completed items remain in this file; they should be moved to roadmap status history if needed.
