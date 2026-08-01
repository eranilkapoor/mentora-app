# Quality Management Plan

Last reviewed: 2026-08-01

## Quality Objectives

| Objective | Measure |
| --- | --- |
| Build reliability | API, CRM, website, and mobile checks pass before release. |
| Tenant safety | Tenant-owned data cannot leak across tenants, branches, or unauthorized users. |
| Learning access control | AI/class access is denied without valid schedule, entitlement, subject, plan, device/session allowance, and parental control permission. |
| CRM usability | Lists support search, filters, sorting, pagination, empty states, actions, and error handling. |
| Production readiness | Provider smoke tests, monitoring, backups, legal/security, and QA evidence complete before live traffic. |

## Quality Gates

| Gate | Required checks |
| --- | --- |
| Development | Lint/typecheck/build for touched app, unit tests where available. |
| Integration | API and frontend connected, auth and tenant context verified, empty/error states checked. |
| Release candidate | Full build checks, smoke checks, migration/index audit, provider readiness, UAT. |
| Production | Monitoring, backups, rollback, legal/security sign-off, support readiness. |

## Current Verified Baseline

See [Production Readiness Audit](../launch/PRODUCTION-READINESS-AUDIT.md) for the latest verified commands and production verdict.

## Defect Severity

| Severity | Definition | Response |
| --- | --- | --- |
| Critical | Data leak, payment loss, auth bypass, student safety breach, production outage. | Stop release, immediate fix. |
| High | Major workflow broken, tenant context broken, provider callback failure, billing mismatch. | Fix before release. |
| Medium | Degraded UX, incomplete validation, report mismatch, slow operation. | Schedule in current or next release based on impact. |
| Low | Cosmetic issue, copy inconsistency, non-blocking polish. | Batch into maintenance. |

## Acceptance Evidence

Each release should record:

- Commands run and results.
- API smoke coverage.
- CRM module UAT coverage.
- Mobile device/browser coverage.
- Provider smoke test results.
- Known issues and accepted risks.
- Sign-off names and dates.
