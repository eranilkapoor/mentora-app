# Resource Management Plan

Last reviewed: 2026-08-01

## Roles

| Role | Responsibilities |
| --- | --- |
| Sponsor/Product Owner | Scope, priority, budget, acceptance, go/no-go. |
| Project Manager | Planning, schedule, RAID, communication, change control, status reporting. |
| Technical Lead | Architecture, code standards, release quality, technical risk. |
| Backend Engineer | API modules, schemas, services, integrations, security, tests. |
| Frontend CRM Engineer | Admin CRM routes, state, forms, tables, actions, enterprise UI. |
| Mobile Engineer | Expo app, student/parent flows, themes, i18n, billing, push, device QA. |
| Website Engineer | Public website, legal pages, lead capture, SEO, deployment. |
| QA Engineer | Test plans, regression, UAT, device/browser matrix, defect management. |
| DevOps Engineer | Environments, CI/CD, secrets, monitoring, backups, rollback. |
| Security/Compliance Owner | Privacy, child/student safety, access control, audit, legal readiness. |
| Support/Operations Owner | Support workflow, incident response, launch support, customer onboarding. |

## RACI Matrix

| Deliverable | Sponsor | PM | Tech Lead | Engineering | QA | DevOps | Security |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Scope baseline | A | R | C | C | C | C | C |
| Architecture | C | C | A/R | R | C | C | C |
| Module implementation | C | C | A | R | C | C | C |
| QA sign-off | C | C | C | C | A/R | C | C |
| Production environment | C | C | C | C | C | A/R | C |
| Security/privacy sign-off | C | C | C | C | C | C | A/R |
| Launch approval | A | R | C | C | C | C | C |

Legend: R = Responsible, A = Accountable, C = Consulted.

## Staffing Assumptions

- Backend and CRM work are critical path for enterprise customer demos.
- Mobile release requires dedicated device QA and store-billing validation.
- Provider activation requires coordination between engineering, DevOps, vendor account owners, and operations.

## Team Operating Model

- Maintain one source of truth for roadmap and production readiness.
- Update docs with every major scope or readiness change.
- Keep provider credentials outside git.
- Use release gates before production.
