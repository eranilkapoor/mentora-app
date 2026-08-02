# Mentora CRM Flow Plan

This flow plan covers the multi-organization education CRM, admin portal, and CRM API flows. Student and parent mobile app flows remain in [Mobile App Flow Plan](FLOW-PLAN.md).

## CRM Entry Flow

```text
CRM user opens admin CRM
  -> login with seeded or created CRM credentials
  -> backend validates user, roles, permissions, active session
  -> frontend restores/persists session until logout or expiry
  -> frontend calls GET /api/v1/admin/dashboard/bootstrap
  -> backend returns allowed organization contexts, active organization, dashboard metrics, module coverage
  -> user lands on dashboard
  -> organization/branch switcher is shown only to users with the right scope
```

Required API behavior:

- JWT auth on protected CRM APIs.
- Organization-context guard on organization-scoped writes.
- Permission guard per module/action.
- Audit write for important create/update/complete/export/provider actions.
- Session is cleared on explicit logout.

## Organization And Organization Flow

```text
Super admin or organization admin opens Organization Management
  -> create organization for university, college, school, coaching brand, institute, franchise
  -> manage Branches, Departments, and Teams from their own CRM pages
  -> configure lead sources and stages
  -> configure branding and domains
  -> configure channel settings
  -> invite/create organization users
```

Primary APIs:

- `POST /api/v1/admin/organizations` (organization create API)
- `GET /api/v1/admin/organizations` (organization list API)
- `POST /api/v1/admin/branches`
- `DELETE /api/v1/admin/branches/:id`
- `POST /api/v1/admin/branches/:id/restore`
- `POST /api/v1/admin/departments`
- `DELETE /api/v1/admin/departments/:id`
- `POST /api/v1/admin/departments/:id/restore`
- `POST /api/v1/admin/teams`
- `DELETE /api/v1/admin/teams/:id`
- `POST /api/v1/admin/teams/:id/restore`
- `POST /api/v1/admin/organization-branding`
- `POST /api/v1/admin/channel-settings`
- `POST /api/v1/admin/organization-users/create`

External-only items:

- Live DNS verification.
- Payment gateway secret validation.

## Lead-To-Admission Flow

```text
Lead enters from website, ads, WhatsApp, walk-in, import, or API
  -> create lead
  -> dedupe against organization leads
  -> score and tag lead
  -> assign owner/team
  -> log activity and communications
  -> nurture with campaigns, WhatsApp, email, SMS, calls, tasks
  -> convert to application
  -> review documents and notes
  -> schedule interview if required
  -> issue offer
  -> confirm admission
  -> collect fee
  -> allocate batch
  -> provision learning plan
  -> handoff to LMS/Mentora learning
```

Primary APIs:

- `POST /api/v1/admin/leads`
- `POST /api/v1/admin/leads/operations/duplicates`
- `POST /api/v1/admin/leads/operations/import`
- `GET /api/v1/admin/leads/operations/export`
- `POST /api/v1/admin/leads/:id/score`
- `POST /api/v1/admin/leads/:id/tags`
- `POST /api/v1/admin/applications`
- `POST /api/v1/admin/applications/:id/review`
- `POST /api/v1/admin/applications/:id/decision`
- `POST /api/v1/admin/admissions`
- `POST /api/v1/admin/admissions/:id/allocate`
- `POST /api/v1/admin/admissions/:id/handoff`

## Engagement Flow

```text
Marketing/admin opens Campaigns or Communications
  -> create campaign inventory, UTM, audience, landing-page metadata
  -> configure lead ads, remarketing, drip journey, conversion tags
  -> send or schedule email/SMS/WhatsApp/push/in-app/call communication
  -> store templates, delivery metadata, opt-in state, history
  -> update ROI and conversion metrics
  -> review notification delivery logs, failed queue, templates, analytics
```

Primary APIs:

- `POST /api/v1/admin/campaigns`
- `POST /api/v1/admin/campaigns/:id/metrics`
- `POST /api/v1/communications`
- `POST /api/v1/admin/notifications`
- `GET /api/v1/admin/notifications/templates`
- `GET /api/v1/admin/notifications/analytics`
- `POST /api/v1/admin/integrations/providers/:providerKey`

External-only items:

- Live email/SMS/WhatsApp/push provider credentials.
- Provider callback verification.
- WhatsApp/template/DLT approvals.

## Call Center And WhatsApp Flow

```text
Counselor/call-center user opens Call Center or WhatsApp CRM
  -> create incoming/outgoing call or conversation record
  -> attach lead/application link
  -> record disposition, notes, follow-up, queue metadata
  -> save recording/media/template/button/flow metadata
  -> complete call/conversation outcome
  -> create follow-up task or workflow trigger
```

Primary APIs:

- `POST /api/v1/call-center`
- `POST /api/v1/call-center/:id`
- `POST /api/v1/call-center/:id/complete`
- `POST /api/v1/whatsapp`
- `POST /api/v1/whatsapp/:id`
- `POST /api/v1/whatsapp/:id/complete`

External-only items:

- Live dialer provider.
- Recording/media storage.
- WhatsApp Business delivery callbacks.

## Scholarship And Interview Flow

```text
Admissions user opens Scholarship or Interview
  -> create scholarship/interview record
  -> evaluate eligibility criteria
  -> verify documents
  -> approve/reject scholarship and award amount
  -> update payment-plan impact metadata
  -> schedule interview and assign panel
  -> record result, remarks, score
  -> recommend offer or handoff to admission
```

Primary APIs:

- `POST /api/v1/admin/scholarships`
- `POST /api/v1/admin/scholarships/:id/evaluate`
- `POST /api/v1/admin/scholarships/:id/decision`
- `POST /api/v1/interviews`
- `POST /api/v1/interviews/:id`
- `POST /api/v1/interviews/:id/complete`

External-only items:

- Live finance discount sync.
- Calendar provider sync.

## Operations Flow

```text
Operations/admin user opens tasks, calendar, documents, events, field force
  -> create or update task board item
  -> manage SLA, reminder, comment, escalation, reassignment, completion
  -> create calendar/interview/event schedule metadata
  -> upload/request/verify documents
  -> create event registration/attendance/QR/webinar/branch visit metadata
  -> create field visit, route, geo, mileage, check-in/out metadata
```

Primary APIs:

- `POST /api/v1/admin/tasks`
- `POST /api/v1/admin/tasks/:id/workflow`
- `POST /api/v1/admin/documents`
- `GET /api/v1/admin/documents`
- `POST /api/v1/admin/documents/:id/verify`
- `POST /api/v1/events`
- `POST /api/v1/events/:id`
- `POST /api/v1/events/:id/complete`
- `POST /api/v1/field-force`
- `POST /api/v1/field-force/:id`
- `POST /api/v1/field-force/:id/complete`

External-only items:

- OCR provider.
- Calendar sync.
- Webinar/QR integrations.
- Geo/map providers.

## Payments And Finance Flow

```text
Finance user opens Payments or Finance
  -> review application/admission/course/installment payment state
  -> create payment-link/receipt/refund/reconciliation action metadata
  -> manage finance ledger entry
  -> reconcile ledger entry
  -> export ledger/report
  -> audit refund and tax-sensitive changes
```

Primary APIs:

- `POST /api/v1/payments`
- `GET /api/v1/payments`
- `POST /api/v1/admin/finance-ledgers`
- `POST /api/v1/admin/finance-ledgers/:id/reconcile`
- `POST /api/v1/admin/finance-ledgers/:id/complete`

External-only items:

- Payment settlement callbacks.
- Tax engine.
- Accounting export.

## Reporting, Dashboard, Analytics, AI Flow

```text
Management user opens Dashboard, Reports, Analytics, or AI Features
  -> bootstrap scoped dashboard KPIs
  -> create saved/role/scheduled report definitions
  -> export module records
  -> review lead funnel, admission funnel, revenue, ROI, productivity
  -> store forecasting/predictive metadata
  -> run CRM AI actions: lead scoring, prediction, chatbot, conversation summary, auto reply, follow-up suggestion
```

Primary APIs:

- `GET /api/v1/admin/dashboard/bootstrap`
- `GET /api/v1/admin/dashboard`
- `POST /api/v1/admin/reports/definitions`
- `POST /api/v1/admin/reports/export-jobs`
- `GET /api/v1/admin/module-records/coverage`
- `GET /api/v1/admin/module-records/export`
- `POST /api/v1/admin/module-records`
- `POST /api/v1/analytics`

External-only items:

- XLSX/PDF/file generation worker.
- Predictive model provider.
- CRM AI model metering/provider config.

## Integrations And Security Flow

```text
Admin opens Integrations or Security
  -> review provider catalogue
  -> configure provider in sandbox or live mode
  -> verify webhook/callback/health metadata
  -> update organization security policy
  -> configure MFA/SSO/IP/session/masking/retention settings
  -> export audit/security records
```

Primary APIs:

- `GET /api/v1/admin/integrations/providers`
- `PUT /api/v1/admin/integrations/providers/:providerKey`
- `GET /api/v1/admin/security-policies`
- `PUT /api/v1/admin/security-policies`
- `GET /api/v1/admin/audit-logs`

External-only items:

- Live SSO/MFA provider setup.
- Vendor credentials/approvals.
- Backup evidence automation.

## CRM Frontend State Rules

- Reload should restore CRM session until logout or token/session expiry.
- Logout must clear persisted CRM session.
- Protected action buttons must require API auth and organization context.
- If organization context is missing after login, frontend should auto-run workspace bootstrap.
- Topbar notification button opens the Notifications module, not a generic action.
- Deep sidebar navigation should keep the selected module visible.
- Desktop and tablet are supported; phone layout is not the CRM target.

## CRM Guard Conditions

A CRM write can run only when:

- User has a valid API token/session.
- User has active organization context.
- User has required role/permission.
- Supplied organizationId belongs to allowed context.
- Module/action is permitted for the selected context.
- Required provider integration is configured for live external delivery, when applicable.
