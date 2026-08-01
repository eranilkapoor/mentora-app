# Scope Management Plan

Last reviewed: 2026-08-01

## Scope Statement

Mentora will deliver a four-application Education SaaS CRM and AI tutoring platform:

- `mentora-api-server`: backend API, security, data, integrations, and domain logic.
- `mentora-mobile-app`: student/parent learning app.
- `mentora-public-website`: public product, support, legal, plans, and lead capture website.
- `mentora-admin-crm`: multi-tenant education CRM for platform and tenant users.

## Product Scope

| Product area | Included capabilities |
| --- | --- |
| Identity | Login, sessions, roles, permissions, tenant memberships, context switching, MFA/SSO configuration surfaces. |
| Organization | Tenants, branches, departments, teams, campuses, domains, branding, channel settings. |
| CRM | Leads, applications, admissions, tasks, campaigns, communications, call center, WhatsApp, email, SMS, interviews, scholarships, events, field force, reports, analytics, workflows. |
| Learning | Students, parents, relationships, academic records, subjects, schedules, entitlements, AI tutor, classrooms, assessments, progress. |
| Finance | Payments, subscriptions, invoices, refunds, finance ledgers, reconciliation, accounting export metadata. |
| Security | Security policies, audit logs, access review, retention controls, token/session behavior, tenant isolation. |
| Public website | Brand, legal pages, plans, support, lead/demo capture. |
| Operations | Deployment, database runbook, monitoring, secrets, launch, production readiness. |

## Exclusions

| Exclusion | Reason |
| --- | --- |
| Full ERP replacement | Mentora CRM manages admissions and learning operations, not every ERP function. |
| Live provider automation without credentials | Provider workflows need vendor accounts, approvals, webhooks, and smoke tests. |
| Production legal approval by engineering | Legal/privacy/compliance acceptance requires business/legal review. |
| Mobile-first admin CRM | CRM target is desktop/tablet. |
| Proprietary competitor copying | Mentora may be functionally comparable, but must use Mentora-owned UX, code, content, and branding. |

## Scope Baseline

The scope baseline is made of:

- This document.
- [Project Plan](../planning/PROJECT-PLAN.md).
- [Task Roadmap](../planning/TASK-ROADMAP.md).
- [Education CRM Platform Plan](../planning/EDUCATION-CRM-PLATFORM-PLAN.md).
- [Production Readiness Audit](../launch/PRODUCTION-READINESS-AUDIT.md).

## Scope Validation

Scope is accepted when:

- Requirement is implemented in code or explicitly deferred.
- API and UI are connected where the requirement is user-facing.
- Tenant/security behavior is verified where applicable.
- Documentation and roadmap status are updated.
- Remaining external blockers are listed.

## Scope Control

Any change that affects module boundaries, launch scope, provider selection, legal obligations, pricing, tenant data model, security policy, or release timeline must follow [Change Control Plan](CHANGE-CONTROL-PLAN.md).
