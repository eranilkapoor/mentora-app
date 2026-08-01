# Work Breakdown Structure

Last reviewed: 2026-08-01

## Level 1 Work Packages

```text
1. Project Governance
2. Product And Requirements
3. Backend Platform
4. Mobile Application
5. Public Website
6. Admin CRM
7. Data And Integrations
8. Security And Compliance
9. Quality Assurance
10. Deployment And Launch
11. Operations And Support
```

## WBS Dictionary

| WBS | Work package | Deliverables |
| --- | --- | --- |
| 1.1 | Project charter and governance | Charter, PMP document pack, change control, RAID log. |
| 1.2 | Status and reporting | Weekly status, milestone report, release readiness report. |
| 2.1 | Product scope | Project plan, CRM plan, AI tutor plan, flow plans. |
| 2.2 | Requirements traceability | Requirements plan, acceptance criteria, roadmap sync. |
| 3.1 | API foundation | Auth, config, logging, health, RBAC, tenant context, audit. |
| 3.2 | Learning backend | Students, parents, academic catalogue, schedules, entitlements, AI tutor, assessments, progress. |
| 3.3 | CRM backend | Tenants, leads, applications, admissions, tasks, campaigns, communications, reports, workflows, operations modules. |
| 3.4 | Finance backend | Payments, subscriptions, invoices, refunds, ledgers, reconciliation. |
| 4.1 | Mobile identity and onboarding | Login, register, account switcher, student/parent onboarding. |
| 4.2 | Mobile learning | Home, Learn, Schedule, Progress, Profile, AI tutor, billing, settings. |
| 4.3 | Mobile release readiness | i18n, themes, native builds, device QA, push, store billing. |
| 5.1 | Public website | Product pages, plans, support, legal, lead/demo capture. |
| 5.2 | Website launch | Domain, SEO, analytics consent, API smoke, legal URLs. |
| 6.1 | CRM shell | Navigation, themes, context, dashboard, module routes, pagination. |
| 6.2 | CRM module operations | CRUD, search, filter, sorting, actions, empty/error states. |
| 6.3 | CRM enterprise controls | RBAC, audit views, security policies, integrations, exports. |
| 7.1 | Database | Schemas, indexes, seed data, migrations, slow-query audit. |
| 7.2 | Provider integrations | AI, email, SMS, WhatsApp, push, payments, storage, calendar, OCR, dialer, geo, monitoring. |
| 8.1 | Security | Secrets, CORS, session policy, tenant isolation, masking, retention, access review. |
| 8.2 | Compliance | Child/student data, consent, legal pages, account deletion, subscription disclosures. |
| 9.1 | Automated checks | Lint, typecheck, build, tests, i18n, contracts. |
| 9.2 | Manual QA | CRM desktop/tablet, mobile device matrix, public website smoke, provider smoke. |
| 10.1 | Staging | Production-like infrastructure, seed/bootstrap, deployment validation. |
| 10.2 | Production launch | Release gate, rollback, app-store submission, monitoring, support readiness. |
| 11.1 | Operations | Runbooks, incident response, backup/restore, support workflow. |

## Work Package Acceptance

A work package is complete when its deliverables are implemented, reviewed, validated, documented, and linked to release readiness.
