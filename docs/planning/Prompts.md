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

- Core API domain modules are implemented: auth, profiles, preferences, media, matches, chat, notifications, payments, subscriptions, referrals, settings, support, success stories, admin, analytics, safety.
- Admin APIs and services have broad unit coverage and currently pass lint/typecheck/tests.
- P0-3 branch-heavy RBAC/admin hardening tests are complete (RBAC inactive/conflict/not-found paths and admin repository filter/pagination/status edge coverage).
- Socket.IO E2E now covers authenticated room isolation and deterministic join/rejoin message-fetch ordering paths.
- DB-backed E2E journeys cover profiles, interest/match lifecycle, user/admin support tickets, and admin audit logs. MongoDB test binaries use a workspace-local cache and failed setup has resilient teardown.
- CI caches the MongoDB E2E binary and executes the full E2E suite through the repository `ci` script.
- Notification orchestration and queue paths have dedicated unit tests.
- Membership upgrade prompting and support-ticket draft validation/normalization have dedicated mobile tests.
- Onboarding required-field validation, media permission denial, global large-text/high-contrast/reduced-motion behavior, and accessibility optimistic rollback are tested.
- Profile media saves use an ordered, retryable transaction; failed uploads preserve staged changes and primary assignment waits for successful upload.
- Success stories now include consent-backed submission/history UI, published-only public API, admin moderation, audit logging, shared contracts, seed examples, and lifecycle tests.
- Store verification preserves active/grace and auto-renew state; terminal payment webhook replays are suppressed before subscription, boost, wallet, referral, and invoice side effects.
- Dockerfile and dockerignore exist for API containerization.
- CI quality checks exist for lint, typecheck, tests, and coverage reporting.

## Remaining Work (Code)

### In Progress

1. P0 mobile automated coverage expansion.
   - Completed: auth bootstrap/login-refresh/logout, root-entry routing, onboarding validation, media permission denial, discovery range validation, interest/shortlist actions, chat send/read utilities, list states, membership prompts, support tickets, accessibility variants, and accessibility rollback.
   - Next focus: remaining settings-service mutation integration tests.

### P0 - Highest Priority

1. Raise mobile automated coverage for critical product journeys.
   - Add remaining settings mutation integration tests across notification, privacy, communication, security, localization, and media services.

### P1 - Important

3. Harden storage/media contract behavior with tests.
   - Add tests for MIME spoofing rejection, object-missing fallback, upload rollback, signed URL/proxy access expectations, and cleanup idempotency.

4. Finish list/cache normalization after the shared pagination foundation.
   - Matches, chat, notifications, support, admin, and success stories use the shared page metadata contract; align wallet/analytics where applicable.
   - Add RTK Query invalidation and optimistic-update integration tests for paginated mutations.

5. Make OpenAPI snapshots independent of a running database-backed API.
   - `contracts:snapshot` currently requires a live server on port 3000; generate Swagger from an application context or a dedicated contract bootstrap so CI can detect newly added routes deterministically.

### P2 - Product Depth

6. Expand analytics taxonomy coverage and dashboards.
   - Add end-to-end event assertions for high-traffic flows and complete dashboard aggregates for conversion, retention, revenue, churn, and referral attribution.

7. Add component-level UI quality infrastructure.
   - Introduce Storybook (or equivalent) and accessibility checks for shared components.

## Remaining Work (External / Blocked But Required For Launch)

1. Production provider credentials and verification evidence.
   - FCM/APNs, SMS/email provider production credentials, payment/store console setup and webhook configuration, social auth app approvals.

2. Monitoring and incident readiness.
   - Production Sentry projects, DSNs, source maps, dashboard alerts, uptime checks, on-call notification routing.

3. Deployment hardening.
   - Container image CI build/publish, runtime health verification, backup/restore drills, and disaster recovery rehearsal.

## Next Task To Execute First

1. Complete RTK Query settings rollback and paginated-cache integration coverage.

## Definition Of Done For This Queue

- Each completed task has passing lint, typecheck, and relevant tests.
- E2E additions are deterministic and CI-friendly.
- No completed items remain in this file; they should be moved to roadmap status history if needed.
