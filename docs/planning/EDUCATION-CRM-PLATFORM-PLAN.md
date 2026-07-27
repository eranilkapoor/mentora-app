# Mentora Education CRM Platform Plan

Last reviewed: 2026-07-26

## Positioning

Mentora should become a multi-tenant education CRM and learning platform, inspired by education enrollment platforms such as Meritto but implemented with Mentora branding, data model, UX, and workflows.

Do not copy Meritto visual design, text, trademarks, or proprietary implementation. Build a functionally comparable platform for coaching institutes, schools, colleges, universities, study-abroad consultants, EdTech businesses, and franchise education teams.

## Four Applications

```text
mentora-api-server       NestJS modular-monolith backend
mentora-mobile-app       Expo mobile app for students, parents, counselors, and field staff
mentora-public-website   Next.js public website for product, plans, legal, and lead capture
mentora-admin-crm        Next.js admin CRM portal for organizations and platform admins
```

## Meritto-Like Feature Coverage

| Feature family         | Mentora module direction                                                      |
| ---------------------- | ----------------------------------------------------------------------------- |
| Lead centralization    | Leads, sources, widgets, landing pages, imports, duplicate blocking           |
| Lead nurturing         | One-view lead profile, timeline, notes, tasks, follow-ups, scoring            |
| Sales automation       | Assignment, stages, counselor queues, reminders, escalations                  |
| User management        | Tenants, branches, departments, teams, roles, permissions, hierarchy          |
| Marketing automation   | Campaigns, UTM tracking, drip workflows, email/SMS/WhatsApp                   |
| WhatsApp CRM           | Templates, conversations, delivery reports, automation                        |
| Call center/mobile app | Counselor dashboard, calls, notes, tasks, geo check-ins later                 |
| Admissions             | Forms, applications, document verification, interviews, offers, enrollment    |
| Payments               | Application fee, admission fee, course fee, receipts, refunds, reconciliation |
| Reports and analytics  | Funnel, campaign ROI, counselor productivity, revenue dashboards              |
| AI                     | Lead scoring, chatbot, summaries, follow-up suggestions, tutor assistance     |
| Learning operations    | Student profile, plans, schedules, AI/online tutors, tests, parent progress   |

## Backend Module Status

Implemented starter backend modules. These are top-level reusable API modules, not admin-CRM-only modules, so the admin portal, public website, mobile app, and future integrations can reuse the same APIs.

```text
src/modules/tenants
src/modules/leads
src/modules/applications
src/modules/tasks
src/modules/campaigns
src/modules/communications
src/modules/module-records
src/modules/contexts
src/modules/dashboard
```

Initial collections:

- `tenants`
- `tenants`
- `branches`
- `lead_sources`
- `lead_stages`
- `leads`
- `lead_activities`
- `lead_assignments`
- `applications`
- `tasks`
- `campaigns`
- `communications`
- `module_records`
- `user_memberships`

Initial APIs:

```text
POST /api/v1/tenants
GET  /api/v1/tenants
POST /api/v1/leads
POST /api/v1/leads/public
GET  /api/v1/leads?tenantId=:tenantId
GET  /api/v1/leads/:leadId?tenantId=:tenantId
POST /api/v1/leads/:leadId/assign
POST /api/v1/leads/:leadId/change-stage
POST /api/v1/leads/:leadId/activities
GET  /api/v1/leads/:leadId/timeline?tenantId=:tenantId
POST /api/v1/applications
POST /api/v1/tasks
GET  /api/v1/dashboard?tenantId=:tenantId
GET  /api/v1/module-records/coverage
```

`POST /api/v1/leads/public` is implemented in the `leads` module as a public lead-capture controller because it creates the same `Lead` domain object. There is no separate `public-leads` module.

## MVP Build Order

1. Tenant management, branches, teams, RBAC, and audit.
2. Lead CRM: sources, stages, lead list/detail, notes, timeline, tasks, assignment.
3. Application/admission workflow: forms, applications, documents, stages, review.
4. Communication: templates, email, SMS, WhatsApp, campaign logs.
5. Payments: application fee, receipts, refunds, reconciliation.
6. Reporting: counselor dashboard, manager dashboard, marketing ROI, admission funnel.
7. Automation: assignment rules, reminders, escalations, drip communication.
8. Learning bridge: convert enrolled CRM students into Mentora student profiles and learning plans.

## Critical Architecture Rule

Every tenant-owned CRM query must include `tenantId`. The initial service methods already require `tenantId` for list/detail/dashboard reads. Expand this into a shared tenant-aware repository or guard before production.

## Admin CRM UI Status

Implemented starter Next.js CRM portal:

```text
mentora-admin-crm
```

The admin portal now follows the existing Juaaree/Match Mate admin interaction model:

- fixed left navigation groups
- top welcome/logout bar
- module action strip for search, add, reset, and export actions
- filter block with labeled inputs
- list manager wrapper
- sortable-style table headers
- row checkboxes and row actions
- pagination/page-size controls

Current CRM sections:

- dashboard
- leads
- applications
- admissions
- tasks
- campaigns
- communications
- automation
- payments
- reports
- learning operations
- tenants and users
- settings

Next step: connect these sections to authenticated API clients and replace the fixture rows with tenant-scoped backend data.
