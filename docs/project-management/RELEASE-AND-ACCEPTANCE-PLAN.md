# Release And Acceptance Plan

Last reviewed: 2026-08-01

## Release Types

| Release | Purpose | Acceptance level |
| --- | --- | --- |
| Local/dev | Developer validation | Build/lint/typecheck for touched app. |
| Demo | Customer or stakeholder walkthrough | Stable seeded data, clear limitations, no production claims. |
| Staging | Production-like validation | Full environment, provider smoke tests, UAT, monitoring, backup test. |
| Production | Live users/customers | All production gates signed off. |

## Release Entry Criteria

- Scope frozen for the release.
- Critical defects closed or accepted.
- Environment variables documented.
- Database migrations/indexes reviewed.
- Seed/demo data policy confirmed.
- Test accounts available.

## Acceptance Gates

| Gate | Required acceptance |
| --- | --- |
| Product | User journeys match approved scope. |
| Technical | Build, lint, typecheck, smoke checks, and key tests pass. |
| Security | Tenant isolation, RBAC, secrets, CORS, sessions, audit, retention reviewed. |
| Compliance | Legal pages, child/student consent, age/document policy, subscription disclosures reviewed. |
| Provider | Selected provider credentials and callbacks pass smoke tests. |
| QA | CRM desktop/tablet, mobile release builds, public website, and API flows tested. |
| Operations | Monitoring, backup/restore, rollback, incident contacts, support workflow ready. |

## CRM Module CRUD Acceptance

For a CRM SaaS module to be accepted as code-side production ready, it must support:

- Create record.
- List records with pagination, search, filters, sorting, and tenant scope.
- View record detail by id.
- Update record.
- Archive record.
- Restore archived record.
- Bulk status update for selected records where the operation is business-safe.
- Module-specific actions such as complete, execute, reconcile, allocate, verify, export, or provider test where applicable.
- Audit logging for create/update/archive/restore/bulk/action operations where applicable.

## UAT Scenarios

| Scenario | Expected result |
| --- | --- |
| Super admin creates tenant, branches, users, roles, and context. | Tenant users can access only authorized scope. |
| Website captures demo enquiry. | Lead is created in CRM with source and timeline. |
| Counselor manages lead to application. | Lead, tasks, notes, status, and audit update correctly. |
| Admissions confirms enrollment. | Admission, payment metadata, learning plan handoff, and student profile link are recorded. |
| Parent creates child profile and buys plan. | Entitlement is created and parent can view schedule/progress. |
| Student starts AI tutor session. | Access guard validates schedule, entitlement, subject, device/session, parental control, and safety. |
| Communications campaign sends message. | Provider status, opt-in, delivery metadata, and audit are recorded. |
| Finance reconciles payment. | Ledger, receipt/refund/reconciliation export path is valid. |

## Go/No-Go Checklist

- [ ] Production readiness audit has no open P0 blockers.
- [ ] Legal/security sign-off complete.
- [ ] Provider smoke tests complete.
- [ ] UAT complete.
- [ ] Monitoring and alerts active.
- [ ] Backup and restore tested.
- [ ] Rollback plan tested.
- [ ] Support team briefed.
- [ ] Sponsor approval recorded.

## Rollback Criteria

Rollback or disable affected module when:

- Tenant data exposure is detected.
- Payment settlement or entitlement enforcement fails.
- AI safety controls fail.
- Login/session security fails.
- Provider callback causes duplicate or corrupt records.
- Critical workflow blocks live operations.
