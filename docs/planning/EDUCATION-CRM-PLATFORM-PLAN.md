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

The public website posts demo requests to its same-origin Next.js route:

```text
POST /api/demo-request
```

That route validates the minimum lead payload and forwards to `POST /api/v1/leads/public` when `NEXT_PUBLIC_API_BASE_URL` is configured. Without the API URL, it returns an accepted local/demo response so public demos do not break on CORS or missing local backend setup.

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

Every tenant-owned CRM query must include `tenantId`. The MVP services use `src/common/utils/tenant-scope.util.ts` to convert and validate tenant IDs and user-provided ObjectIds before database access. Expand this into request-context enforcement after real CRM auth is wired, so tenant ID can be derived from the authenticated context rather than trusted from a query/body alone.

## Admin CRM UI Status

Implemented starter Next.js CRM portal:

```text
mentora-admin-crm
```

The admin portal now follows the existing Juaaree/Match Mate admin interaction model and has been upgraded into a more enterprise-style SaaS console:

- fixed left navigation groups
- top welcome/logout bar
- system, light, and dark theme selector
- Bootstrap-based control foundation for forms, buttons, tables, cards, alerts, and responsive behavior
- Font Awesome React icons for module navigation, actions, status, and dashboard surfaces
- Redux Toolkit state management for CRM login state, context selection, theme mode, active module, toast state, and server workspace loading
- compact module icons and stronger visual hierarchy
- role/context selector for multi-tenant demo users
- module status labels: Production MVP, Workflow MVP, and Foundation
- module insight cards for operational signals
- module action strip for search, add, reset, and export actions
- list/grid view switching for module records
- filter block with labeled inputs
- list manager wrapper
- sortable-style table headers
- row checkboxes and row actions
- pagination/page-size controls

Current CRM sections:

- dashboard
- authentication
- user management
- organization management
- leads
- student profile
- applications
- admissions
- scholarship
- interview
- tasks
- task management
- campaigns
- communications
- call center
- WhatsApp CRM
- email CRM
- SMS
- automation
- mobile CRM
- calendar
- document management
- event management
- field force automation
- payments
- finance
- reports
- analytics
- dashboard module
- AI features
- integrations
- learning operations
- tenants and users
- security
- settings

Backend status: core modules such as tenants, leads, applications, tasks, campaigns, communications, dashboard, contexts, and module-records are implemented as top-level reusable NestJS modules. Remaining long-tail CRM areas are demo-ready through the tenant-scoped `module_records` coverage API and should be promoted into dedicated controllers/services only when their deep workflows need separate business rules.

Frontend data status: the admin CRM starts in a clean demo workspace and does not call protected APIs before a CRM API session is available. The explicit Sync API action loads workspace metadata from `/api/v1/tenants` and `/api/v1/module-records/coverage` through Redux async state, then module tables can load rows from `/api/v1/module-records?tenantId=:tenantId&moduleKey=:moduleKey` when a tenant ID is available. If the API/auth session is unavailable, the UI shows an API-sync status and keeps create/edit actions in local MVP state instead of generating unauthenticated console errors.

Responsive target: the CRM is desktop/tablet-first. It should be fully usable on desktop and tablet widths, with dense navigation, tables, filters, side panels, and grid cards. Phone-size screens may show a compact advisory and horizontal workspace access, but the product is not optimized as a mobile CRM.

Enterprise UX backlog:

- Saved views with filter presets per role and tenant.
- Column chooser, sticky columns, table density controls, and export scope.
- Advanced filters with date ranges, owners, tags, SLA, source, branch, and status.
- Bulk actions with confirmation, permission checks, and audit trail.
- Kanban pipeline views for leads, applications, tasks, and admissions.
- Global command palette and cross-module search.
- Notification center with approvals, SLA alerts, failed syncs, and assigned work.
- User profile menu with account, role, active tenant, branch, and session controls.
- Activity timeline on every important record.
- Empty, loading, error, and permission-denied states per module.
- Keyboard-friendly navigation and accessible focus states.
- Configurable dashboards by role: CEO, branch manager, counselor, finance, marketing, support.

Next step: connect the admin CRM login to authenticated API clients and context selection, derive tenant scope from the authenticated membership, replace fixture rows with tenant-scoped backend data, and progressively promote high-traffic areas from `module_records` into dedicated modules.
