# Schedule Management Plan

Last reviewed: 2026-08-01

## Schedule Approach

Mentora should use milestone-based planning with short execution cycles. The project is too broad for a single fixed-date plan without staged acceptance, so each release should define:

- Scope.
- Entry criteria.
- Exit criteria.
- Dependencies.
- Validation evidence.
- Production blockers.

## Milestones

| Milestone | Description | Current status |
| --- | --- | --- |
| M1 Foundation | Mentora branding, repo structure, environment, core docs. | Complete |
| M2 Learning MVP | Parent/student profiles, schedules, entitlements, AI tutor guard, assessments, progress. | Code-side complete for MVP foundations |
| M3 CRM MVP | Multi-tenant CRM shell and 30-module code-side coverage. | Code-side complete |
| M4 Build-clean baseline | API, CRM, website, mobile checks pass. | Complete as of 2026-07-29 |
| M5 Staging readiness | Production-like deployment, seed policy, provider config placeholders, smoke checks. | Pending |
| M6 UAT | Tenant/user/CRM/mobile/website/provider UAT. | Pending |
| M7 Production launch | Production credentials, monitoring, legal, security, rollback, support. | Pending |

## Release Cadence

| Release type | Cadence | Purpose |
| --- | --- | --- |
| Internal build | On demand | Validate code and integration changes. |
| Demo build | Weekly or milestone-based | Customer and stakeholder walkthroughs. |
| Staging release | Before production gates | Production-like validation. |
| Production release | Approved only after gates | Customer/live user rollout. |

## Schedule Control

Schedule changes require review when:

- Production date changes.
- Provider dependency slips.
- Legal/security approval blocks launch.
- A critical defect affects tenant isolation, payments, student safety, or data loss.

## Reporting

Weekly schedule report should include:

- Completed work packages.
- In-progress work packages.
- Blocked dependencies.
- Critical path changes.
- Open risks and issues.
- Next milestone confidence.
