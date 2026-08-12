# Mentora Verification Checklist

This file is the implemented verification checklist for the Mentora Education SaaS CRM and AI tutoring platform. The broader target operating model lives in [ENTERPRISE-OPERATIONS-SPEC.md](planning/ENTERPRISE-OPERATIONS-SPEC.md).

## Current Architecture

Mentora uses two API faces:

- Customer/student/mobile/public APIs: `/api/v1/...`
- Admin CRM APIs: `/api/v1/admin/...`

The platform scope is:

```text
Mentora Platform
|-- Platform Super Admin
|-- Platform Admin / Support / Billing / Compliance
`-- Organizations
    |-- Branches
    |-- Departments
    |-- Teams
    `-- Organization users
```

Mentora uses **organizations**, not tenants. Mentora uses **branches**, not campuses or business units.

## Authorization Verification

Implemented direction:

- Platform roles can operate across organizations when the endpoint permits platform scope.
- Organization users are scoped by organization membership.
- Branch/team/department visibility is derived from membership and role scope.
- Provider configuration status exposes required environment keys and readiness, not raw provider secrets.
- Platform pricing, platform-wide billing, global security, and super-admin administration are platform-only concerns.

Required tests before production launch:

- Super admin can list all organizations and branches.
- Organization admin cannot list or update another organization's users.
- Organization admin cannot modify platform plans or global billing.
- Organization admin cannot modify platform super-admin users.
- Organization admin cannot view raw provider secrets.
- Token expiry returns the user to sign-in without rendering broken protected screens.

## Implemented Module Surface

The API currently exposes dedicated admin modules for:

- Authentication, users, roles, permissions, security policies
- Organizations, branches, departments, teams, branding, channel settings
- Leads, lead sources, lead stages, activities, notes, tasks, follow-ups, meetings, assignments, tags, contacts, custom fields, imports/exports
- Students, academic sessions, programs, courses, specializations, applications, admissions, enrollment, fees, documents, interviews, scholarships, learning operations
- Campaigns, communications, WhatsApp, call center, workflows, events, field force, support, reports, integrations, payments, subscriptions, finance ledgers

## Verification Commands

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm run build
```

Run API-focused checks:

```bash
npm --prefix mentora-api-server run lint:check
npm --prefix mentora-api-server run typecheck
npm --prefix mentora-api-server run test
```

Run admin CRM checks:

```bash
npm --prefix mentora-admin-crm run lint
npm --prefix mentora-admin-crm run build
```

Run public website checks:

```bash
npm --prefix mentora-public-website run lint
npm --prefix mentora-public-website run build
```

Run mobile checks:

```bash
npm --prefix mentora-mobile-app run typecheck
npm --prefix mentora-mobile-app run lint
npm --prefix mentora-mobile-app run i18n:check
```

## Demo Readiness

Ready for controlled demo after local/staging validation:

- Admin CRM core flows
- Organization and branch context switching
- IAM/RBAC management
- Lead capture, scoring, dedupe, assignment, nurture, import/export
- Applications, admissions, documents, interviews, scholarships
- Campaigns, communications, workflows
- Payments, subscriptions, finance ledgers
- Student/parent AI tutoring flows in the mobile app
- Public website lead capture and product/legal pages

Not production-live until these external gates are complete:

- Production infrastructure and secrets
- Live provider credentials and callback validation
- Payment settlement and invoice PDF storage validation
- Backup/restore drill
- Monitoring/APM alert verification
- Legal/security/privacy review
- Staging E2E and mobile device QA

## Remaining Engineering Watchlist

Code-side items that should stay visible in roadmap reviews:

- Add route-level authorization tests for all platform-only endpoints.
- Add workflow/domain-event coverage tests for high-value CRM actions.
- Keep all organization-scoped list APIs on pagination, search, filter, and sorting contracts.
- Continue replacing generic module-record usage with dedicated modules when a module needs complex domain rules.
- Keep admin CRM forms module-specific; avoid generic lead-like forms for organization, education, finance, and security modules.
