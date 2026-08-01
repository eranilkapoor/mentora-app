# Project Charter

Project: Mentora Education SaaS CRM and AI Tutoring Platform  
Last reviewed: 2026-08-01  
Status: Active, pre-production

## Business Need

Education organizations need a single platform to manage enquiries, admissions, communications, payments, reports, and learning operations. Parents and eligible students also need a controlled learning app where students can schedule classes, learn from AI or online tutors, complete assessments, and share progress with parents.

Mentora combines both needs:

- Multi-organization education CRM for institutes, colleges, universities, coaching brands, counselors, marketing teams, finance teams, and platform administrators.
- Parent/student AI tutoring and mentorship app with student profiles, schedules, entitlements, assessments, progress, safety controls, and subscriptions.

## Objectives

| Objective | Success measure |
| --- | --- |
| Deliver a working four-application platform | API, mobile app, public website, and admin CRM run from the same repository and share Mentora domain models. |
| Enable education CRM operations | Organizations can manage users, branches, leads, applications, admissions, tasks, communications, campaigns, payments, reports, workflows, integrations, and security policies. |
| Enable parent/student learning | Parents and eligible students can create student profiles, manage academic details, schedule learning, purchase plans, and view progress. |
| Protect revenue and access | AI tutor and class access are gated by schedule, entitlement, plan limits, device/session rules, parental controls, and safety checks. |
| Prepare for enterprise launch | Production gates are documented, tracked, and completed before live customer traffic. |

## High-Level Scope

In scope:

- NestJS backend modular-monolith.
- MongoDB schemas, indexes, seed data, and database runbooks.
- Expo mobile app for students, parents, counselors, and field staff where applicable.
- Next.js public website for brand, legal, support, plans, and lead capture.
- Next.js admin CRM for platform and organization users.
- Multi-theme and English/Hindi support where applicable.
- Security, audit, role, permission, organization, branch, and provider-readiness controls.
- Launch, operations, integrations, and project-management documentation.

Out of scope for initial production:

- Full ERP replacement.
- Provider automation without live credentials and callback validation.
- Native app-store release without device QA and store-console approval.
- Legal approval by documentation alone.

## Key Deliverables

| Deliverable | Description |
| --- | --- |
| API server | Domain APIs, auth, organization context, CRM modules, learning modules, payments, integrations, security policies, audit. |
| Mobile app | Student/parent learning app with onboarding, profile, learn, schedule, progress, settings, billing, notifications, themes, i18n. |
| Public website | Product pages, legal pages, support, plans, lead/demo capture. |
| Admin CRM | Enterprise CRM shell with module routes, organization/branch context, server-backed CRUD/action flows, themes, navigation, pagination. |
| Documentation | Product, technical, database, flow, launch, operations, integration, standards, and project-management packs. |

## Milestone Summary

| Milestone | Status |
| --- | --- |
| Mentora foundation and branding | Complete |
| Student/parent learning domain | Code-side complete for MVP foundations |
| CRM 30-module code-side foundation | Code-side complete for Product Ready coverage |
| Build and lint baseline | Complete as of 2026-07-29 |
| Staging deployment | Pending |
| Provider credential activation | Pending |
| UAT and production readiness sign-off | Pending |
| Production launch | Pending |

## Assumptions

- MongoDB remains the primary operational database for the current modular-monolith.
- Multi-organization enforcement is required for all organization-owned CRM records.
- Production launch will use real provider accounts for AI, email, SMS, WhatsApp, push, payments, storage, monitoring, and selected CRM integrations.
- Legal review is required for child/student data, subscriptions, account deletion, AI tutoring disclosures, and self-managed student eligibility.

## Constraints

- No real secrets can be committed to git.
- Production cannot rely on demo fallback data, local credentials, or unverified callbacks.
- CRM is desktop/tablet-first, not mobile-first.
- Mobile app must support English and Hindi static content.

## Approval Authority

| Role | Authority |
| --- | --- |
| Sponsor/Product Owner | Approves business scope, launch scope, budget, and acceptance. |
| Technical Lead | Approves architecture, release readiness, and technical risk decisions. |
| Security/Compliance Owner | Approves production security, privacy, and data protection readiness. |
| Operations Owner | Approves deployment, monitoring, backup, incident, and rollback readiness. |
