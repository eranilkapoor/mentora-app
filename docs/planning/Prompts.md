# MatchMate Prompt Audit Tracker

Last reviewed: 2026-06-22

## Completed In This Batch

- [x] Repository hygiene: ignore/remove TypeScript build metadata and stop tracking the local mobile `.env.development` while retaining `.env.example`.
- [x] Generate the complete TypeScript route/schema contract from a committed Swagger snapshot through `contracts:snapshot`, `contracts:generate`, and `contracts:check`.
- [x] Reconcile conflicting OpenAPI, Sentry, privacy-paywall, testing, vulnerability scanning, and CI statuses in `TASK-ROADMAP.md`.
- [x] Add API regression tests for sibling normalization and subscription feature quotas (2 suites, 6 tests).
- [x] Add mobile regression tests for membership feature interpretation (1 suite, 15 tests).
- [x] Expand API regression coverage to auth token claims, constant-time payment signatures, store-subscription reconciliation, privacy self-protection, chat authorization, feature guards, migration manifests, sibling backfill, and admin status validation (11 suites, 34 tests).
- [x] Expand mobile regression coverage to premium upgrade dialogs/navigation, settings synchronization, profile sibling normalization, and realtime authentication error handling (5 suites, 27 tests).
- [x] Add ordered/checksummed MongoDB migration tooling with durable history, lease locking, status/up/down commands, CI manifest validation, and compiled production release commands.
- [x] Add the first data migration to repair historical profile sibling counts/details in batches.
- [x] Add GitHub Actions verification for lint, API/mobile typechecks, generated-contract drift, API build, tests, and translation validation.
- [x] Add Dependabot monitoring for root, API, and mobile npm dependencies.
- [x] Repair malformed Hindi settings JSON and missing English/Hindi keys found by the new CI translation gate.
- [x] Repair API startup after clean builds by keeping incremental TypeScript metadata inside `dist`, and remove the Swagger circular-reflection failure from admin status validation.
- [x] Add realtime socket authentication recovery through the existing refresh-token flow so an expired persisted access token does not reconnect forever.
- [x] Remove overlapping template-literal paths from the generated OpenAPI contract while retaining exact immutable route and schema types.
- [x] Add read-only Mongo index drift auditing across all registered models with JSON/strict modes and production-safe `autoIndex` defaults.
- [x] Audit the configured database (46 collections, 189 expected indexes) and add an immutable migration for the one missing payment store-transaction index.
- [x] Remove MongoDB-driver types from public settings unblock/unhide responses and repair stricter dependency-driven ESLint findings.
- [x] Replace Twilio SMS delivery with the MSG91 Flow API, approved-template variables, OTP overrides, normalized recipients, timeout/error handling, environment validation, and provider contract tests.

## Verification

- API TypeScript, ESLint, build, and Jest: passed (14 suites, 42 tests).
- Mobile TypeScript, ESLint, and Jest: passed (5 suites, 27 tests).
- OpenAPI generated-contract check: passed.
- i18n parity: passed for 1,346 static keys across English and Hindi.
- Runtime smoke test: API booted against MongoDB and `/api/v1/ready` returned HTTP 200.

## Next Tasks

1. Add provider-backed staging tests for FCM, SES/MSG91, Razorpay/Stripe, social login, KYC, and media moderation once staging credentials are available.
2. Configure production Sentry projects/source maps, uptime checks, alert rules, and operational dashboards.
3. Add deployment automation after the target AWS/container architecture and deployment credentials are finalized.
4. Continue coverage for full refresh-token rotation, payment webhook integration, profile editing components, and end-to-end realtime reconnect behavior.
5. Run explain-plan checks for discovery, chat history, notification lists, payment history, and admin queues against production-like data volumes.
