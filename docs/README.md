# Mentora Documentation

This directory contains the product, architecture, delivery, operations, integration, launch, and engineering standards for Mentora.

Mentora is a B2C AI tutoring and mentorship platform for students and parents. It reuses the proven platform foundation from the copied Match Mate codebase, but all product docs in this repository should describe Mentora behavior, data, and launch needs.

## Planning

- [Technical Plan](planning/TECHNICAL-PLAN.md): architecture, reusable modules, new Mentora modules, API surfaces, and AI tutor access model.
- [Database Plan](planning/DATABASE-PLAN.md): MongoDB collection groups, required MVP collections, relationships, and indexing direction.
- [Project Plan](planning/PROJECT-PLAN.md): scope, MVP audience, delivery phases, non-goals, and success criteria.
- [Task Roadmap](planning/TASK-ROADMAP.md): implementation checklist from copied foundation to Mentora learning platform.
- [Flow Plan](planning/FLOW-PLAN.md): student, parent, registration, scheduling, AI tutor, subscription, and admin journeys.
- [Color Palette](planning/COLOR-PLATE.md): visual direction for the mobile and public web experience.

## Operations

- [Commands](operations/COMMANDS.md): local, CI, migration, smoke, and deployment commands.
- [Deployment Plan](operations/DEPLOYMENT-PLAN.md): deployment and release operations.
- [Database Runbook](operations/DATABASE-RUNBOOK.md): migration, index, and database safety checklist.

## Integrations

- [Integrations Index](integrations/README.md): email, SMS, push, storage, payments, auth, monitoring, Redis, and queue setup.

## Launch

Launch files remain as working templates. They must be reviewed before production release because some text was inherited from the copied source application.

## Standards

- [Coding Standard](standards/CODING-STANDARD.md): naming, folder, file, class, function, and NestJS conventions.
- [Pre-Launch Security Checklist](standards/pre-launch-security-checklist.md): security checks for auth, data, payments, infrastructure, and release.
