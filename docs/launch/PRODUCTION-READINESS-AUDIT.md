# Mentora Production Readiness Audit

Last reviewed: 2026-07-29

## Verdict

Mentora is not ready for live production traffic yet.

The current repository is build-clean and suitable for an MVP/customer demo environment when seeded data and controlled credentials are used. The main remaining launch blockers are not ordinary compile errors; they are production environment activation, live provider credentials, callback verification, security/compliance sign-off, device/browser QA evidence, and operational runbooks.

## Verified Locally

These checks passed on 2026-07-29:

| Area | Command | Result |
| --- | --- | --- |
| API server lint | `npm --prefix mentora-api-server run lint:check` | Passed |
| API server build | `npm --prefix mentora-api-server run build` | Passed |
| Admin CRM typecheck/build | `npm --prefix mentora-admin-crm run lint` and `npm --prefix mentora-admin-crm run build` | Passed |
| Public website typecheck/build | `npm --prefix mentora-public-website run lint` and `npm --prefix mentora-public-website run build` | Passed |
| Mobile typecheck | `npm --prefix mentora-mobile-app run typecheck` | Passed |
| Mobile lint | `npm --prefix mentora-mobile-app run lint` | Passed |
| Mobile i18n | `npm --prefix mentora-mobile-app run i18n:check` | Passed for 1183 static keys across English and Hindi |

## Application Readiness

| Application | Current state | Production blockers |
| --- | --- | --- |
| `mentora-api-server` | NestJS API builds and lints. Core student, parent, learning, payments, admin CRM, tenant, security, integrations, and operations modules exist. | Production `.env`, MongoDB/Redis/S3/queue infrastructure, provider credentials, webhook callback verification, load testing, security testing, and backup evidence. |
| `mentora-admin-crm` | Next.js CRM builds and typechecks. Multi-tenant shell, tenant context, module routes, server-backed lists/actions, themes, icons, pagination, and enterprise navigation are implemented. | Production auth policy validation, role/permission QA, real provider smoke tests, desktop/tablet screenshot QA, and removal of any demo-only operational assumptions before customer rollout. |
| `mentora-mobile-app` | Expo mobile app typechecks, lints, and passes i18n key validation. Student/parent learning flows, themes, Hindi/English support, billing and learning surfaces exist. | Native Android/iOS release builds, device matrix QA, push notification credentials, store billing sandbox evidence, app-store safety disclosures, and legal URL hosting. |
| `mentora-public-website` | Next.js website builds and typechecks. Public pages and lead/demo capture foundations exist. | Production domain, SSL, SEO metadata review, analytics consent setup, CRM lead capture smoke test against production API, and legal URL publication. |

## Module Readiness Interpretation

The roadmap uses **Product Ready** to mean the repository has dedicated code-side module ownership, tenant guards, API surfaces, frontend entry points, and audit-aware operations where applicable. It does not mean the module is live-production enabled.

For production launch, every externally connected module must pass provider activation:

| Module group | Code-side state | Live-production requirement |
| --- | --- | --- |
| Authentication, users, RBAC, security | Code-side complete for CRM foundation, sessions, permissions, tenant context, policies, audit exports, MFA/SSO configuration surfaces. | Real MFA/SSO provider setup, callback URLs, tenant policy enforcement tests, recovery process, and admin access review. |
| Tenants and organization | Code-side complete for tenants, branches, departments, teams, campuses, domains, branding, and channel settings. | DNS/domain verification, production branding assets, payment/channel secrets, and tenant onboarding checklist. |
| Leads, applications, admissions, scholarships, interviews | Code-side complete for core lifecycle and CRM operations. | Import mapping QA, duplicate merge QA, document review SOP, offer/admission approvals, ERP/LMS/payment handoff credentials if used. |
| Communications, WhatsApp, email, SMS, call center | Code-side complete for records, templates, statuses, provider configuration, and action metadata. | Approved sender domains, WhatsApp templates, SMS DLT/templates, dialer/recording provider, callback verification, unsubscribe/bounce handling. |
| Payments and finance | Code-side complete for payments, subscriptions, entitlements, invoices, ledgers, refunds, reconciliation/export surfaces. | Gateway credentials, settlement callbacks, tax/accounting export validation, finance reconciliation sign-off. |
| Learning, AI tutor, assessments, progress | Code-side complete for schedules, entitlements, AI guard, tutor messages, assessments, progress, recommendations. | Live AI provider, moderation policy, usage metering, child/student safety review, model fallback policy, and human escalation workflow. |
| Reports, analytics, workflows, integrations | Code-side complete for definitions, exports, executions, provider health/configuration surfaces. | Background workers, scheduled jobs, external file generation, provider callbacks, APM dashboards, and alert rules. |

## Production Gates

Mentora should not be marked production-live until all P0 gates below are complete:

| Gate | Required evidence |
| --- | --- |
| Environment | Production `.env` validated with no local/demo secrets, strict CORS, production MongoDB/Redis/S3, and seeder disabled except controlled bootstrap. |
| Provider smoke tests | Email, SMS, WhatsApp, push, payments, AI, storage, monitoring, calendar, OCR, dialer, geo, webinar, and accounting providers either pass live smoke tests or are explicitly disabled. |
| Auth and tenant safety | Super admin, tenant admin, branch manager, counselor, finance, support, parent, and student access verified with tenant/branch restrictions and token-expiry redirects. |
| Data safety | Backup/restore tested, retention/anonymization verified, audit export reviewed, legal pages hosted, child/student consent and age-document flows approved. |
| QA | API smoke, CRM desktop/tablet QA, public website smoke, mobile Android/iOS release builds, push deep links, store billing sandbox, slow/offline states, and error states verified. |
| Performance | Slow-query audit reviewed in target database, indexes synced, API load test baseline captured, frontend bundle/performance checked. |
| Release operations | Monitoring/APM alerts, incident contacts, rollback steps, deployment plan, database runbook, reviewer accounts, and launch checklist complete. |

## Immediate Next Actions

1. Create a staging deployment using production-like MongoDB, Redis, S3, queue workers, and strict environment variables.
2. Configure provider credentials in the secret store and run provider smoke tests.
3. Run end-to-end CRM flows for tenants, users/RBAC, leads, applications, admissions, communications, payments, workflows, and reports.
4. Run mobile release builds and device QA for student, parent, billing, AI tutor, schedule, progress, notification, and token-expiry flows.
5. Complete legal/security review for children, self-managed students, AI tutoring disclosures, subscriptions, and account deletion.

## Related Project Management Controls

- [Project Management Pack](../project-management/README.md)
- [RAID Log](../project-management/RAID-LOG.md)
- [Release And Acceptance Plan](../project-management/RELEASE-AND-ACCEPTANCE-PLAN.md)
- [Change Control Plan](../project-management/CHANGE-CONTROL-PLAN.md)
