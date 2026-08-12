# Mentora Production Readiness Audit

Last reviewed: 2026-08-12

## Verdict

Mentora is not ready for live production traffic yet.

The current repository is build-clean and suitable for an MVP/customer demo environment when seeded data and controlled credentials are used. The main remaining launch blockers are not ordinary compile errors; they are production environment activation, live provider credentials, callback verification, security/compliance sign-off, device/browser QA evidence, and operational runbooks.

## Verified Locally

These checks passed on 2026-07-29:

| Area                           | Command                                                                                            | Result                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| API server lint                | `npm --prefix mentora-api-server run lint:check`                                                   | Passed                                               |
| API server build               | `npm --prefix mentora-api-server run build`                                                        | Passed                                               |
| Admin CRM typecheck/build      | `npm --prefix mentora-admin-crm run lint` and `npm --prefix mentora-admin-crm run build`           | Passed                                               |
| Public website typecheck/build | `npm --prefix mentora-public-website run lint` and `npm --prefix mentora-public-website run build` | Passed                                               |
| Mobile typecheck               | `npm --prefix mentora-mobile-app run typecheck`                                                    | Passed                                               |
| Mobile lint                    | `npm --prefix mentora-mobile-app run lint`                                                         | Passed                                               |
| Mobile i18n                    | `npm --prefix mentora-mobile-app run i18n:check`                                                   | Passed for 1183 static keys across English and Hindi |

Additional CRM hardening checks passed on 2026-08-01:

| Area                | Command                                          | Result |
| ------------------- | ------------------------------------------------ | ------ |
| API server lint     | `npm --prefix mentora-api-server run lint:check` | Passed |
| API server build    | `npm --prefix mentora-api-server run build`      | Passed |
| Admin CRM typecheck | `npm --prefix mentora-admin-crm run lint`        | Passed |
| Admin CRM build     | `npm --prefix mentora-admin-crm run build`       | Passed |

CRM CRUD correctness and mobile learning-flow fixes verified on 2026-08-07:

| Area                | Command                                                                     | Result                      |
| ------------------- | --------------------------------------------------------------------------- | --------------------------- |
| API server lint     | `npm --prefix mentora-api-server run lint:check`                            | Passed                      |
| API server build    | `npm --prefix mentora-api-server run build`                                 | Passed                      |
| API server tests    | `npx jest` (leads, applications, organizations, module-records, common/crm) | Passed                      |
| Admin CRM typecheck | `npm --prefix mentora-admin-crm run lint`                                   | Passed                      |
| Admin CRM build     | `npm --prefix mentora-admin-crm run build`                                  | Passed                      |
| Mobile typecheck    | `npm --prefix mentora-mobile-app run typecheck`                             | Passed                      |
| Mobile lint         | `npm --prefix mentora-mobile-app run lint`                                  | Passed                      |
| Mobile i18n         | `npm --prefix mentora-mobile-app run i18n:check`                            | Passed for 1183 static keys |

Current completion review verified on 2026-08-12:

| Area                     | Command                  | Result                      |
| ------------------------ | ------------------------ | --------------------------- |
| API server lint          | `npm.cmd run lint:check` | Passed                      |
| API server build         | `npm.cmd run build`      | Passed                      |
| Admin CRM typecheck      | `npm.cmd run lint`       | Passed                      |
| Admin CRM build          | `npm.cmd run build`      | Passed                      |
| Public website typecheck | `npm.cmd run lint`       | Passed                      |
| Public website build     | `npm.cmd run build`      | Passed                      |
| Mobile typecheck         | `npm.cmd run typecheck`  | Passed                      |
| Mobile lint              | `npm.cmd run lint`       | Passed                      |
| Mobile i18n              | `npm.cmd run i18n:check` | Passed for 1183 static keys |

The API server, admin CRM, public website, and mobile app are suitable for a controlled customer MVP demo using seeded organizations, users, roles, permissions, and representative CRM/student data. They are not cleared for unmanaged live production traffic until the P0 production gates below are completed.

## Admin CRM CRUD Correctness Fixes (2026-08-07)

A full audit of the admin CRM's CRUD wiring found that most modules genuinely call the live API (not mock data), but several specific defects made real functionality behave incorrectly or invisibly. All of the following were fixed and verified:

- **Export mismatch**: 20 of 21 dedicated CRM modules (admissions, applications, assignments, automation, call-center, campaigns, communications, documents, emails, events, field-force, finance, interviews, lead-sources, lead-stages, reports, scholarships, sms, support, tasks, whatsapp) had an "Export" button that called the generic `/module-records/operations/export` endpoint instead of their own collection, so exports silently returned the wrong (usually empty) dataset. `leads` was the only module with a correct dedicated export. Every dedicated module now has its own `operations/export` endpoint (backed by a shared `buildCsvExportFile` utility), and the CRM frontend routes exports through a new `exportDedicatedCrmRecords` thunk for dedicated modules. Organizations/branches/departments/teams had the identical bug and were fixed the same way.
- **Integrations and Security split-brain**: clicking "Configure Provider" or "Update Policy" made a real, successful API call, but the visible grid read from a different, unrelated state slice and never reflected the result. Both modules now render from the state their own save actions actually populate, and both auto-load on navigation.
- **Cosmetic toolbar buttons**: Payments (Reconciliation), Notifications (Failed Queue, Replay, Analytics), Calendar (Interview Slot, Event Calendar), and mobile-app (Lead Update, Geo Check-in) toolbar actions previously wrote a generic log entry regardless of which button was clicked. They now call the real backend endpoints that already existed for these actions (payment reconciliation report, notification dead-letter queue/replay/analytics, interviews/events/leads/field-force record counts) and surface real numbers in the toast.
- **Dead code**: an unused `defaultCrmUsers` demo-seed array and its imports were removed.
- **New dedicated module (proof of concept)**: "Programs" (organization-owned admissions programs/courses — name, code, level, duration, credits, eligibility, intake capacity, seats, fee) now has a real Mongoose schema, NestJS module (`admin/programs`), and full CRUD/export in the CRM, mirroring the `campaigns` module pattern.

**Explicitly still not launch-complete** (documented rather than silently left inconsistent):

- Some long-tail CRM concepts can still be represented through configurable records where a dedicated domain engine is not required for the current demo scope. Live production should only enable those modules after final workflow, reporting, and provider acceptance criteria are approved.
- `students` and `learning` now have code-side coverage for B2C/mobile learning and organization-facing learning operations. Live LMS/SIS/admission sync remains an external provider/integration task.
- Mobile offline sync, provider-backed voice storage, payment-gateway settlement callbacks, and external report/file workers remain launch-gated integration tasks.
- Sidebar modules now use registered module ids/routes; any future navigation additions must be added to the module registry, RBAC catalogue, API contract, and docs in the same change.

## Application Readiness

| Application              | Current state                                                                                                                                                                                                                                                                                                                                                                                                                                                | Production blockers                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mentora-api-server`     | NestJS API builds and lints. Core student, parent, learning, payments, admin CRM, organization, security, integrations, and operations modules exist.                                                                                                                                                                                                                                                                                                        | Production `.env`, MongoDB/Redis/S3/queue infrastructure, provider credentials, webhook callback verification, load testing, security testing, and backup evidence.                           |
| `mentora-admin-crm`      | Next.js CRM builds and typechecks. Multi-organization shell, organization context, module routes, server-backed lists/actions, themes, icons, pagination, and enterprise navigation are implemented. Export now returns the correct dataset for every dedicated module; Integrations and Security grids render the state their own actions write to; Payments/Notifications/Calendar/mobile-app toolbar actions call real endpoints instead of only logging. | Production auth policy validation, role/permission QA, real provider smoke tests, desktop/tablet screenshot QA, and removal of any demo-only operational assumptions before customer rollout. |
| `mentora-mobile-app`     | Expo mobile app typechecks, lints, and passes i18n key validation. Student/parent learning flows, themes, Hindi/English support, billing and learning surfaces exist.                                                                                                                                                                                                                                                                                        | Native Android/iOS release builds, device matrix QA, push notification credentials, store billing sandbox evidence, app-store safety disclosures, and legal URL hosting.                      |
| `mentora-public-website` | Next.js website builds and typechecks. Public pages and lead/demo capture foundations exist.                                                                                                                                                                                                                                                                                                                                                                 | Production domain, SSL, SEO metadata review, analytics consent setup, CRM lead capture smoke test against production API, and legal URL publication.                                          |

## Module Readiness Interpretation

The roadmap uses **Product Ready** to mean the repository has dedicated code-side module ownership, organization guards, API surfaces, frontend entry points, and audit-aware operations where applicable. It does not mean the module is live-production enabled.

As of 2026-08-01, the dedicated operational CRM modules and the shared module-record fallback support the expected CRM record lifecycle: create, list with pagination/search/filter/sort, get by id, update, archive, restore, complete/execute where applicable, and selected-record bulk status update from the admin CRM.

For production launch, every externally connected module must pass provider activation:

| Module group                                              | Code-side state                                                                                                                              | Live-production requirement                                                                                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Authentication, users, RBAC, security                     | Code-side complete for CRM foundation, sessions, permissions, organization context, policies, audit exports, MFA/SSO configuration surfaces. | Real MFA/SSO provider setup, callback URLs, organization policy enforcement tests, recovery process, and admin access review.                                |
| Organizations and organization                            | Code-side complete for organizations, branches, departments, teams, domains, branding, and channel settings.                                 | DNS/domain verification, production branding assets, payment/channel secrets, and organization onboarding checklist.                                         |
| Leads, applications, admissions, scholarships, interviews | Code-side complete for core lifecycle and CRM operations.                                                                                    | Import mapping QA, duplicate merge QA, document review SOP, offer/admission approvals, ERP/LMS/payment handoff credentials if used.                          |
| Communications, WhatsApp, email, SMS, call center         | Code-side complete for records, templates, statuses, provider configuration, and action metadata.                                            | Approved sender domains, WhatsApp templates, SMS DLT/templates, dialer/recording provider, callback verification, unsubscribe/bounce handling.               |
| Payments and finance                                      | Code-side complete for payments, subscriptions, entitlements, invoices, ledgers, refunds, reconciliation/export surfaces.                    | Gateway credentials, settlement callbacks, tax/accounting export validation, finance reconciliation sign-off.                                                |
| Learning, AI tutor, assessments, progress                 | Code-side complete for schedules, entitlements, AI guard, tutor messages, assessments, progress, recommendations.                            | Live AI provider credentials, moderation policy, usage metering evidence, child/student safety review, model fallback policy, and human escalation workflow. |
| Reports, analytics, workflows, integrations               | Code-side complete for definitions, exports, executions, provider health/configuration surfaces.                                             | Background workers, scheduled jobs, external file generation, provider callbacks, APM dashboards, and alert rules.                                           |

## Production Gates

Mentora should not be marked production-live until all P0 gates below are complete:

| Gate                         | Required evidence                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment                  | Production `.env` validated with no local/demo secrets, strict CORS, production MongoDB/Redis/S3, and seeder disabled except controlled bootstrap.                                    |
| Provider smoke tests         | Email, SMS, WhatsApp, push, payments, AI, storage, monitoring, calendar, OCR, dialer, geo, webinar, and accounting providers either pass live smoke tests or are explicitly disabled. |
| Auth and organization safety | Super admin, organization admin, branch manager, counselor, finance, support, parent, and student access verified with organization/branch restrictions and token-expiry redirects.   |
| Data safety                  | Backup/restore tested, retention/anonymization verified, audit export reviewed, legal pages hosted, child/student consent and age-document flows approved.                            |
| QA                           | API smoke, CRM desktop/tablet QA, public website smoke, mobile Android/iOS release builds, push deep links, store billing sandbox, slow/offline states, and error states verified.    |
| Performance                  | Slow-query audit reviewed in target database, indexes synced, API load test baseline captured, frontend bundle/performance checked.                                                   |
| Release operations           | Monitoring/APM alerts, incident contacts, rollback steps, deployment plan, database runbook, reviewer accounts, and launch checklist complete.                                        |

## Immediate Next Actions

1. Create a staging deployment using production-like MongoDB, Redis, S3, queue workers, and strict environment variables.
2. Configure provider credentials in the secret store and run provider smoke tests.
3. Run end-to-end CRM flows for organizations, users/RBAC, leads, applications, admissions, communications, payments, workflows, and reports.
4. Run mobile release builds and device QA for student, parent, billing, AI tutor, schedule, progress, notification, and token-expiry flows.
5. Complete legal/security review for children, self-managed students, AI tutoring disclosures, subscriptions, and account deletion.

## Related Project Management Controls

- [Project Management Pack](../project-management/README.md)
- [RAID Log](../project-management/RAID-LOG.md)
- [Release And Acceptance Plan](../project-management/RELEASE-AND-ACCEPTANCE-PLAN.md)
- [Change Control Plan](../project-management/CHANGE-CONTROL-PLAN.md)
