# MatchMate Execution Prompts

Last reviewed: 2026-07-09

This file contains only the next executable work. Completed capabilities and
long-term status belong in `TASK-ROADMAP.md`; launch-console instructions belong
under `docs/launch`.

## P0 - Launch Evidence

### 1. Google Play licensed-track acceptance test

Verify one complete purchase lifecycle using a Play licensed tester and a build
installed from the testing track:

- purchase an active base plan;
- verify the token through the backend;
- confirm acknowledgement and entitlement activation;
- confirm Membership and Subscription & Billing refresh correctly;
- restart/login again and confirm the entitlement persists;
- restore the purchase on a clean installation;
- send an RTDN test message and capture the correlated backend result.

Record the build version, product/base-plan IDs, order ID with sensitive parts
masked, API correlation ID, and screenshots in the launch evidence folder.

### 2. Production notification acceptance test

Using a physical Android device and production-like build:

- register and refresh the FCM token;
- send one direct push and one queued/template notification;
- verify foreground, background, terminated-app, and notification-tap behavior;
- confirm the notification master switch disables/enables all channel settings;
- verify individual channel settings and quiet hours after re-login.

Also run provider-specific delivery checks:

- send one SMTP email through Hostinger or the selected production sender;
- send one template email through the admin template dispatch flow;
- send one MSG91 OTP SMS and one template/Flow SMS using approved DLT IDs;
- capture provider message IDs, API correlation IDs, and masked recipient
  evidence.

APNs remains a separate provider acceptance test.

### 3. Release regression matrix

Run and retain evidence for:

- `npm run ci` from the repository root;
- Android release build/install and cold start;
- access-token expiry and refresh-token persistence;
- Google login, chat reconnect, purchase/restore, push tap, profile PDF export;
- light/dark theme and large-text checks on launch-critical screens.

## P1 - Code Work

### 4. Settings mutation integration coverage

Add RTK Query integration tests for notification, privacy, communication,
security, localization, media, and linked-account mutations. Cover optimistic
updates, successful reconciliation, rollback, and visible error behavior.

### 5. Storage and media failure contracts

Add tests for MIME spoofing rejection, missing-object fallback, upload rollback,
signed/proxied access, thumbnail cleanup, and cleanup idempotency.

### 6. Deterministic OpenAPI snapshot generation

Replace the live `http://localhost:3000/api/docs-json` dependency in
`contracts:snapshot` with a dedicated contract bootstrap that does not require
MongoDB, Redis, or an already running API. Keep generated contract drift checked
in CI.

### 7. Paginated RTK cache behavior

Add invalidation and optimistic-update tests for paginated matches, chat,
notifications, support, admin, and success-story mutations. Align wallet and
analytics only where pagination applies.

### 8. Juaaree Match Mate CRM acceptance pass

No inline `TODO` or `FIXME` markers were found in the scoped admin/application
source audit. The next executable TODO from the code is to run the existing
Juaaree CRM adapter against a live seeded Match Mate API and capture evidence
for:

- Match Mate CRM login, expired access-token refresh, and logout;
- dashboard, members, profiles, roles, permissions, audit logs, and pagination;
- admin-created user flow, profile creation, profile section edit, preference
  edit, settings category edit, plan assign/upgrade/downgrade, and plan cancel;
- status changes, role assignment/removal, KYC review, media review, chat review,
  support-ticket reply/status, success-story review, and curated-match create;
- plan create/update, plan feature assignment/removal, plan entitlement listing,
  payment detail/refund, reconciliation, settlement, and GST report screens;
- notification send, template dispatch/upsert, DLQ detail, replay, replay-all,
  purge, and disabled-queue error messaging;
- analytics overview, stats, funnel, daily summary, taxonomy, and manual event
  tracking screens.

Keep failed or blocked cases in the evidence notes with the API correlation ID
and the CRM URL that produced the result.

### 9. Juaaree CRM permission mapping

Decide whether Match Mate CRM pages should be hidden by legacy Juaaree admin
module permissions or only by Match Mate API RBAC. If legacy visibility is
required, add module-permission records and gate sidebar links, row actions, and
global actions accordingly.

### 10. Scheduled notification campaign builder

Build the missing campaign/rules layer on top of the existing notification
queue, templates, DLQ, and digest foundations:

- campaign CRUD with draft/approved/paused/archived states;
- audience rules for onboarding status, subscription tier, location,
  inactivity, profile completion, and notification preferences;
- schedule windows, quiet-hours enforcement, throttling, and dedupe keys;
- preview counts, test-send, approval audit trail, and delivery analytics;
- Juaaree CRM forms/lists for campaign management.

### 11. Apple subscription server notifications

Add App Store Server Notifications V2 handling to match the Google RTDN path:

- endpoint that accepts and verifies signed notification payloads;
- transaction renewal, cancellation, grace, billing retry, refund, and revoke
  reconciliation;
- idempotency/replay protection and audit logging;
- unit/e2e coverage with Apple sandbox fixtures;
- launch evidence from sandbox/live subscription renewal and cancellation.

### 12. Mobile user insights dashboard

Create the dedicated user-facing insights dashboard that consumes existing match
stats and viewer APIs, then extend analytics where trend data is missing:

- cards for matches, sent/received/accepted interests, shortlist count, profile
  views, and viewer list entry points;
- weekly/monthly trend API if the current aggregate endpoint is not enough;
- empty/loading/error states and English/Hindi translations;
- mobile component tests and API cache invalidation coverage.

## P2 - Product and Operations

- Expand conversion, retention, revenue, churn, and referral analytics.
- Add shared-component visual/accessibility infrastructure such as Storybook.
- Add container build/publish, runtime smoke verification, and deployment
  automation.
- Add container image scanning, uptime monitoring, alert routing, and a tested
  backup/restore procedure.

## External or Blocked

- Play Console licensed-track evidence and live RTDN delivery.
- APNs, SMS, email, and social-provider production approvals/credentials.
- Production Sentry projects, source-map upload, alerts, and on-call routing.
- Legal review, penetration testing, backup drills, and disaster recovery.

## Completion Rule

Move an item out of this file only when its code checks pass and any required
device/provider evidence is recorded. Do not mark console-dependent work done
from configuration values alone.
