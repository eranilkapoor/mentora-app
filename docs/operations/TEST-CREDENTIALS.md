# Mentora Test Credentials

This document lists seeded credentials for local, staging, and controlled production-readiness testing.

Do not use these accounts for real customer production traffic. Production reviewer or customer-demo credentials should be created in the target environment, stored in the approved secret vault, and rotated after testing.

## Seed Password

All `@mentora.test` seeded email-password accounts use:

```text
Test@125#
```

Seeder source:

- `mentora-api-server/src/modules/seeder/services/master-seeder.service.ts`
- `SEED_PASSWORD = 'Test@125#'`

## Platform Users

These users are global platform accounts. Use them to test platform-wide access, organization switching, global billing, integrations readiness, security, audit, and support operations.

| Role              | Email                            | Password    | Expected Access                                                                                               |
| ----------------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| Super Admin       | `super_admin@mentora.test`       | `Test@125#` | All organizations, all branches, platform-only modules, plans, billing, users, security, integrations, audit. |
| Admin             | `admin@mentora.test`             | `Test@125#` | Platform admin operations except super-admin-only destructive controls where restricted by RBAC.              |
| Support           | `support@mentora.test`           | `Test@125#` | Support, tickets, diagnostics, limited user/account review.                                                   |
| Finance           | `finance@mentora.test`           | `Test@125#` | Platform finance, payments, subscriptions, invoices, reconciliation.                                          |
| KYC Reviewer      | `kyc_reviewer@mentora.test`      | `Test@125#` | Document/profile verification review flows.                                                                   |
| Content Moderator | `content_moderator@mentora.test` | `Test@125#` | Moderation, safety, content review flows.                                                                     |
| Marketing Admin   | `marketing_admin@mentora.test`   | `Test@125#` | Campaigns, analytics, communications, growth operations.                                                      |
| Content Manager   | `content_manager@mentora.test`   | `Test@125#` | Academic/content catalogue and AI tutor content controls.                                                     |
| Moderator         | `moderator@mentora.test`         | `Test@125#` | Moderation and support-style operational review.                                                              |

## Customer And Learning Users

These are direct customer/mobile/public users seeded by role.

| Role              | Email                            | Password    | Expected Access                                                        |
| ----------------- | -------------------------------- | ----------- | ---------------------------------------------------------------------- |
| Student           | `student@mentora.test`           | `Test@125#` | Mobile student mode, learning schedules, AI tutor, progress, profile.  |
| Parent            | `parent@mentora.test`            | `Test@125#` | Mobile parent mode, children, controls, schedules, payments, progress. |
| Teacher           | `teacher@mentora.test`           | `Test@125#` | Tutor/teacher learning support flows where enabled.                    |
| Mentor            | `mentor@mentora.test`            | `Test@125#` | Mentor learning support flows where enabled.                           |
| User              | `user@mentora.test`              | `Test@125#` | Base authenticated account with minimal permissions.                   |
| Guardian          | `guardian@mentora.test`          | `Test@125#` | External guardian/customer flows where enabled.                        |
| Admission Partner | `admission@mentora.test`         | `Test@125#` | External admission partner flows where enabled.                        |
| Partner           | `partner@mentora.test`           | `Test@125#` | Partner/referral-facing flows where enabled.                           |
| Referral Partner  | `referral_partner@mentora.test`  | `Test@125#` | Referral partner flows.                                                |
| Franchise Partner | `franchise_partner@mentora.test` | `Test@125#` | Franchise partner flows.                                               |
| Vendor            | `vendor@mentora.test`            | `Test@125#` | Vendor flows where enabled.                                            |

## Seeded Organizations

The CRM demo seeder creates three organizations.

| Organization             | Code               | Type     | Branches                                                             |
| ------------------------ | ------------------ | -------- | -------------------------------------------------------------------- |
| Mentora Academy          | `MENTORA-ACADEMY`  | EdTech   | Delhi Learning Hub, Noida Mentorship Center, Gurugram Success Center |
| Northstar School Network | `NORTHSTAR-SCHOOL` | School   | Pune Branch, Mumbai Branch                                           |
| FutureEdge College Prep  | `FUTUREEDGE-PREP`  | Coaching | Bengaluru Prep Center, Hyderabad Prep Center, Chennai Prep Center    |

## Organization Users

Each seeded organization gets one user for every organization role. Email format:

```text
{organizationSlug}.{role-with-dots}@mentora.test
```

Examples for Mentora Academy:

| Role                | Email                                      | Password    | Expected Scope                                     |
| ------------------- | ------------------------------------------ | ----------- | -------------------------------------------------- |
| Organization Admin  | `academy.organization.admin@mentora.test`  | `Test@125#` | Mentora Academy, all allowed branches.             |
| Branch Admin        | `academy.branch.admin@mentora.test`        | `Test@125#` | Mentora Academy branch scope.                      |
| Admission Manager   | `academy.admission.manager@mentora.test`   | `Test@125#` | Admissions, applications, leads, team work.        |
| Admission Counselor | `academy.admission.counselor@mentora.test` | `Test@125#` | Assigned leads, follow-ups, tasks, meetings.       |
| Marketing Executive | `academy.marketing.executive@mentora.test` | `Test@125#` | Campaigns, lead sources, communication actions.    |
| Sales Executive     | `academy.sales.executive@mentora.test`     | `Test@125#` | Leads, follow-ups, tasks, assignments.             |
| Call Center         | `academy.call-center@mentora.test`         | `Test@125#` | Calls, follow-ups, lead communication.             |
| Finance             | `academy.finance@mentora.test`             | `Test@125#` | Organization payments, fees, ledgers.              |
| Field Agent         | `academy.field.agent@mentora.test`         | `Test@125#` | Field-force visits and mobile companion workflows. |
| Mentor              | `academy.mentor@mentora.test`              | `Test@125#` | Learning/tutoring operations where assigned.       |
| Student             | `academy.student@mentora.test`             | `Test@125#` | Organization-linked learner test account.          |
| Parent              | `academy.parent@mentora.test`              | `Test@125#` | Organization-linked parent/guardian test account.  |

Repeat the same pattern for:

| Organization             | Slug         | Example Admin Email                          |
| ------------------------ | ------------ | -------------------------------------------- |
| Northstar School Network | `northstar`  | `northstar.organization.admin@mentora.test`  |
| FutureEdge College Prep  | `futureedge` | `futureedge.organization.admin@mentora.test` |

## Context Testing Matrix

Use this matrix before a production-ready launch sign-off.

| Test User                                  | Expected Default Context                  | Must Be Able To                                                                                              | Must Not Be Able To                                                                                         |
| ------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `super_admin@mentora.test`                 | All organizations / All branches          | Select any organization and branch, create organizations, manage platform plans, view platform billing.      | None of the organization restrictions should hide platform controls.                                        |
| `academy.organization.admin@mentora.test`  | Mentora Academy / All branches            | Manage Mentora Academy users, branches, departments, teams, leads, applications, admissions, communications. | View Northstar or FutureEdge data, change platform pricing, modify super admins, view raw provider secrets. |
| `academy.branch.admin@mentora.test`        | Mentora Academy / assigned branch         | Manage branch-scoped records and assigned teams.                                                             | See all-organization data if branch scope is restricted.                                                    |
| `academy.admission.counselor@mentora.test` | Mentora Academy / assigned branch or team | Work assigned leads, tasks, follow-ups, meetings, applications.                                              | Create organizations, edit billing plans, change RBAC/global security.                                      |
| `academy.finance@mentora.test`             | Mentora Academy / allowed branches        | Work fees, payments, invoices, ledgers, reconciliation metadata.                                             | Access platform-wide billing or unrelated organization finance records.                                     |
| `student@mentora.test`                     | Student app context                       | Learn, view schedule/progress/profile.                                                                       | Access admin CRM routes.                                                                                    |
| `parent@mentora.test`                      | Parent app context                        | Manage children, controls, payments, progress.                                                               | Consume child learning sessions in parallel or access admin CRM.                                            |

## Production Reviewer Credentials

For Google Play, Apple App Review, or client production UAT:

- Do not reuse `@mentora.test` seed accounts for public production.
- Create dedicated reviewer accounts in the target environment.
- Store final reviewer credentials outside git.
- Keep reviewer accounts active for the review window.
- Exempt reviewer accounts from forced OTP/MFA only when the store review requires email/password access.
- Rotate or disable reviewer accounts after review.

Private reviewer templates:

- `docs/launch/REVIEWER-CREDENTIALS-TEMPLATE.md`
- `docs/launch/REVIEWER-CREDENTIALS-PRIVATE.md`

## Seeder Commands

Run the seeder only in local/staging/demo environments unless production bootstrap is explicitly approved.

```bash
npm --prefix mentora-api-server run seed
```

Production protection:

```text
SEEDER_CONFIRM=MENTORA_PROD
```

Only use production seeding for controlled bootstrap data, never for demo/test credentials.
