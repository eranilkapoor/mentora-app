# Match Mate Documentation

This directory contains product planning, technical architecture, launch readiness, operations, and engineering standards for the Match Mate platform.

## Planning

- [Project Plan](planning/PROJECT-PLAN.md): product vision, scope, milestones, teams, and delivery model.
- [Technical Plan](planning/TECHNICAL-PLAN.md): platform architecture, module structure, API strategy, infrastructure direction, and technical priorities.
- [Database Plan](planning/DATABASE-PLAN.md): MongoDB collections, entity relationships, Redis/cache behavior, indexes, lifecycle, and database operations.
- [Task Roadmap](planning/TASK-ROADMAP.md): enterprise feature roadmap across auth, profiles, matching, chat, notifications, monetization, admin, analytics, compliance, and launch.
- [Flow Plan](planning/FLOW-PLAN.md): UI/UX flow blueprint for onboarding, discovery, profile, settings, chat, and monetization journeys.
- [Plan Feature Packaging](planning/PLAN-FEATURE-PACKAGING.md): free vs paid packaging policy, limits by tier, and plan-feature mapping model.

## Launch

- [Launch Plan](launch/LAUNCH-PLAN.md): current launch-readiness audit and fix-now status.
- [Play Store QA Checklist](launch/PLAY-STORE-QA-CHECKLIST.md): screenshots, device matrix, and release-blocker checklist.
- [EAS Production Checklist](launch/EAS-PRODUCTION-CHECKLIST.md): EAS build, versioning, and signing checks.
- [Production Secrets Checklist](launch/PRODUCTION-SECRETS-CHECKLIST.md): required secrets and provider credentials.
- [Reviewer Credentials Template](launch/REVIEWER-CREDENTIALS.template.md): private reviewer-account note template.
- [Store Billing Integration](launch/STORE-BILLING-INTEGRATION.md): Play/App Store billing enablement notes.
- [Monitoring and APM Checklist](launch/MONITORING-APM-CHECKLIST.md): observability setup and alert thresholds.
- [Pagination Audit](launch/PAGINATION-AUDIT.md): long-list paging status.
- [Dark Theme Screenshot Audit](launch/DARK-THEME-SCREENSHOT-AUDIT.md): final dark-mode QA checklist.

## Operations

- [Deployment Plan](operations/DEPLOYMENT-PLAN.md): AWS-oriented deployment approach, infrastructure, scaling, and release operations.
- [Commands](operations/COMMANDS.md): common backend/mobile commands for development, verification, seeding, and builds.

## Standards

- [Coding Standard](standards/CODING-STANDARD.md): naming, folder, file, class, function, and NestJS conventions.

## Documentation Rules

- Keep `README.md` in the repository root as the high-level entry point.
- Keep detailed plans and checklists under `docs/`.
- Keep real credentials out of docs. Use `*.private.md` or `*.local.md` files for local-only notes.
- Update the relevant doc when a launch-critical flow, environment variable, or provider integration changes.
