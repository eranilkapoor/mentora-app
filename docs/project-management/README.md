# Mentora Project Management Pack

Last reviewed: 2026-08-01

This folder contains PMP-style project-management documents for Mentora as an Education SaaS CRM and AI tutoring platform.

These documents are delivery governance artifacts. They do not replace product, technical, launch, or operations documents; they connect those documents into a controlled project plan with scope, schedule, quality, risk, stakeholder, communication, change, procurement, and acceptance controls.

## Document Register

| Document | Purpose |
| --- | --- |
| [Project Charter](PROJECT-CHARTER.md) | Authorizes the Mentora project and records objectives, scope, assumptions, constraints, success criteria, and approval authority. |
| [Scope Management Plan](SCOPE-MANAGEMENT-PLAN.md) | Defines in-scope and out-of-scope delivery for API, mobile, public website, and admin CRM. |
| [Requirements Management Plan](REQUIREMENTS-MANAGEMENT-PLAN.md) | Defines how requirements are captured, traced, approved, and validated. |
| [Work Breakdown Structure](WBS.md) | Breaks Mentora into manageable project work packages. |
| [Schedule Management Plan](SCHEDULE-MANAGEMENT-PLAN.md) | Defines milestone planning, sequencing, estimation, tracking, and release cadence. |
| [Cost Management Plan](COST-MANAGEMENT-PLAN.md) | Defines budget categories, estimation approach, cost controls, and recurring SaaS costs. |
| [Quality Management Plan](QUALITY-MANAGEMENT-PLAN.md) | Defines quality standards, validation gates, defect severity, and acceptance evidence. |
| [Resource Management Plan](RESOURCE-MANAGEMENT-PLAN.md) | Defines roles, responsibilities, RACI, staffing assumptions, and team operating model. |
| [Communications Management Plan](COMMUNICATIONS-MANAGEMENT-PLAN.md) | Defines communication cadence, reporting, channels, escalation, and stakeholder updates. |
| [Risk Management Plan](RISK-MANAGEMENT-PLAN.md) | Defines risk categories, scoring, ownership, response strategy, and review cadence. |
| [RAID Log](RAID-LOG.md) | Tracks risks, assumptions, issues, and dependencies. |
| [Stakeholder Engagement Plan](STAKEHOLDER-ENGAGEMENT-PLAN.md) | Identifies stakeholder groups, expectations, engagement needs, and influence strategy. |
| [Procurement Management Plan](PROCUREMENT-MANAGEMENT-PLAN.md) | Defines third-party provider selection, contracts, credentials, SLAs, and vendor readiness. |
| [Change Control Plan](CHANGE-CONTROL-PLAN.md) | Defines how scope, schedule, architecture, cost, and launch changes are proposed and approved. |
| [Release And Acceptance Plan](RELEASE-AND-ACCEPTANCE-PLAN.md) | Defines release gates, UAT, production readiness, rollback, and sign-off. |

## Project Baseline

| Area | Current baseline |
| --- | --- |
| Product | Multi-tenant education CRM plus B2C parent/student AI tutoring platform. |
| Applications | `mentora-api-server`, `mentora-mobile-app`, `mentora-public-website`, `mentora-admin-crm`. |
| Technology | NestJS API, MongoDB, Redis/queues, Expo React Native, Next.js public website, Next.js admin CRM. |
| Current readiness | Build-clean and MVP/customer-demo ready; not production-live until production gates are complete. |
| Production source of truth | [Production Readiness Audit](../launch/PRODUCTION-READINESS-AUDIT.md). |

## Governance Rule

A feature is considered project-complete only when it has:

- Approved requirement and scope entry.
- Backend and frontend implementation where applicable.
- Tenant/security behavior where applicable.
- Validation evidence.
- Documentation update.
- Production blocker status recorded.
