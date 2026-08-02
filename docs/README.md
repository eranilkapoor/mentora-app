# Mentora Documentation

This directory contains the product, architecture, delivery, operations, integration, launch, and engineering standards for Mentora.

Mentora is a B2C AI tutoring and mentorship platform for students and parents. All product docs in this repository should describe Mentora behavior, data, launch needs, child/student safety, AI tutoring access, subscriptions, and parent-managed learning workflows.

## Project Management

- [Project Management Pack](project-management/README.md): PMP-style document register and governance baseline for the Education SaaS CRM and AI tutoring platform.
- [Project Charter](project-management/PROJECT-CHARTER.md): objectives, scope, assumptions, constraints, milestones, and approval authority.
- [Scope Management Plan](project-management/SCOPE-MANAGEMENT-PLAN.md): in-scope/out-of-scope work and scope control.
- [Requirements Management Plan](project-management/REQUIREMENTS-MANAGEMENT-PLAN.md): requirement sources, lifecycle, traceability, and acceptance criteria.
- [Work Breakdown Structure](project-management/WBS.md): project work packages and WBS dictionary.
- [Schedule Management Plan](project-management/SCHEDULE-MANAGEMENT-PLAN.md): milestones, cadence, and schedule control.
- [Cost Management Plan](project-management/COST-MANAGEMENT-PLAN.md): cost categories, controls, and budget risks.
- [Quality Management Plan](project-management/QUALITY-MANAGEMENT-PLAN.md): quality gates, defect severity, and acceptance evidence.
- [Resource Management Plan](project-management/RESOURCE-MANAGEMENT-PLAN.md): roles, RACI, staffing assumptions, and operating model.
- [Communications Management Plan](project-management/COMMUNICATIONS-MANAGEMENT-PLAN.md): stakeholder reports, cadence, escalation, and messaging rules.
- [Risk Management Plan](project-management/RISK-MANAGEMENT-PLAN.md): scoring model, categories, and response strategy.
- [RAID Log](project-management/RAID-LOG.md): active risks, assumptions, issues, and dependencies.
- [Stakeholder Engagement Plan](project-management/STAKEHOLDER-ENGAGEMENT-PLAN.md): stakeholder groups, expectations, and engagement strategy.
- [Procurement Management Plan](project-management/PROCUREMENT-MANAGEMENT-PLAN.md): third-party provider selection, contracts, credentials, and readiness.
- [Change Control Plan](project-management/CHANGE-CONTROL-PLAN.md): change categories, approval flow, and emergency change rules.
- [Release And Acceptance Plan](project-management/RELEASE-AND-ACCEPTANCE-PLAN.md): release gates, UAT scenarios, go/no-go, and rollback criteria.

## Planning

- [Technical Plan](planning/TECHNICAL-PLAN.md): architecture, reusable modules, new Mentora modules, API surfaces, and AI tutor access model.
- [Database Plan](planning/DATABASE-PLAN.md): MongoDB collection groups, required MVP collections, relationships, and indexing direction.
- [Project Plan](planning/PROJECT-PLAN.md): scope, MVP audience, delivery phases, non-goals, and success criteria.
- [Product Goal Validation](planning/PRODUCT-GOAL-VALIDATION.md): current product-goal fit, implemented foundations, and remaining high-priority gaps.
- [Education CRM Platform Plan](planning/EDUCATION-CRM-PLATFORM-PLAN.md): multi-organization CRM feature map, backend module direction, app split, and MVP build order.
- [Task Roadmap](planning/TASK-ROADMAP.md): implementation checklist from copied foundation to Mentora learning platform.
- [Mobile App Flow Plan](planning/FLOW-PLAN.md): student, parent, registration, scheduling, AI tutor, subscription, and learning journeys.
- [CRM Flow Plan](planning/CRM-FLOW-PLAN.md): admin CRM, organization, lead, application, admission, communication, operations, reporting, security, and CRM API journeys.
- [Student Profile Model](planning/STUDENT-PROFILE-MODEL.md): complete student profile sections, why they are needed, API direction, and mobile screen direction.
- [Color Palette](planning/COLOR-PLATE.md): visual direction for the mobile and public web experience.
- `../mentora-public-website`: Next.js public website source for brand, plans, lead capture, support, privacy, terms, account deletion, and community guidelines.
- `../mentora-admin-crm`: Next.js admin CRM portal for organizations, admissions teams, counselors, campaigns, payments, and reports.

## Operations

- [Commands](operations/COMMANDS.md): local, CI, migration, smoke, and deployment commands.
- [Deployment Plan](operations/DEPLOYMENT-PLAN.md): deployment and release operations.
- [Database Runbook](operations/DATABASE-RUNBOOK.md): migration, index, and database safety checklist.

## Integrations

- [Integrations Index](integrations/README.md): email, SMS, push, storage, payments, auth, monitoring, Redis, and queue setup.

## Launch

Launch files are Mentora working templates. They must be reviewed before production release for child/student AI tutoring disclosures, hosted public legal URLs, app-store safety requirements, subscription claims, model-provider moderation, and support operations.

- [Production Readiness Audit](launch/PRODUCTION-READINESS-AUDIT.md): current production verdict, local verification status, application readiness, module-readiness interpretation, and production gates.
- [Launch Plan](launch/LAUNCH-PLAN.md): mobile/web/API launch checklist and release sequencing.
- [Production Secrets Checklist](launch/PRODUCTION-SECRETS-CHECKLIST.md): secret groups that must be configured outside git before launch.

## Standards

- [Coding Standard](standards/CODING-STANDARD.md): naming, folder, file, class, function, and NestJS conventions.
- [Pre-Launch Security Checklist](standards/PRE-LAUNCH-SECURITY-CHECKLIST.md): security checks for auth, data, payments, infrastructure, and release.
