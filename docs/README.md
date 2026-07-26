# Mentora Documentation

This directory contains the product, architecture, delivery, operations, integration, launch, and engineering standards for Mentora.

Mentora is a B2C AI tutoring and mentorship platform for students and parents. All product docs in this repository should describe Mentora behavior, data, launch needs, child/student safety, AI tutoring access, subscriptions, and parent-managed learning workflows.

## Planning

- [Technical Plan](planning/TECHNICAL-PLAN.md): architecture, reusable modules, new Mentora modules, API surfaces, and AI tutor access model.
- [Database Plan](planning/DATABASE-PLAN.md): MongoDB collection groups, required MVP collections, relationships, and indexing direction.
- [Project Plan](planning/PROJECT-PLAN.md): scope, MVP audience, delivery phases, non-goals, and success criteria.
- [Product Goal Validation](planning/PRODUCT-GOAL-VALIDATION.md): current product-goal fit, implemented foundations, and remaining high-priority gaps.
- [Task Roadmap](planning/TASK-ROADMAP.md): implementation checklist from copied foundation to Mentora learning platform.
- [Flow Plan](planning/FLOW-PLAN.md): student, parent, registration, scheduling, AI tutor, subscription, and admin journeys.
- [Student Profile Model](planning/STUDENT-PROFILE-MODEL.md): complete student profile sections, why they are needed, API direction, and mobile screen direction.
- [Color Palette](planning/COLOR-PLATE.md): visual direction for the mobile and public web experience.
- `../mentora-public-website`: public website source for brand, plans, support, privacy, terms, account deletion, and community guidelines.

## Operations

- [Commands](operations/COMMANDS.md): local, CI, migration, smoke, and deployment commands.
- [Deployment Plan](operations/DEPLOYMENT-PLAN.md): deployment and release operations.
- [Database Runbook](operations/DATABASE-RUNBOOK.md): migration, index, and database safety checklist.

## Integrations

- [Integrations Index](integrations/README.md): email, SMS, push, storage, payments, auth, monitoring, Redis, and queue setup.

## Launch

Launch files are Mentora working templates. They must be reviewed before production release for child/student AI tutoring disclosures, hosted public legal URLs, app-store safety requirements, subscription claims, model-provider moderation, and support operations.

## Standards

- [Coding Standard](standards/CODING-STANDARD.md): naming, folder, file, class, function, and NestJS conventions.
- [Pre-Launch Security Checklist](standards/pre-launch-security-checklist.md): security checks for auth, data, payments, infrastructure, and release.
