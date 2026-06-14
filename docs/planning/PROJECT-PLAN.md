# Project Plan

> Current home: `docs/planning/PROJECT-PLAN.md`
>
> Purpose: product scope, delivery plan, responsibilities, milestones, risks, and project-management notes.
>
> Source-of-truth rule: keep delivery and governance decisions here. Keep architecture in [Technical Plan](TECHNICAL-PLAN.md), user journeys in [Flow Plan](FLOW-PLAN.md), and backlog/status details in [Task Roadmap](TASK-ROADMAP.md).

## Project Summary

Match Mate is a matrimonial platform with a NestJS API server, an Expo React Native app for iOS, Android, and Web, and shared TypeScript API contract types. The current repository is focused on the customer mobile/web app experience, backend API, realtime chat, settings, membership, support, and admin APIs.

The project is past early concept planning and should now be managed as a launch-readiness and stabilization effort: keep the core flows reliable, reduce ambiguity between docs, verify production dependencies, and close launch-blocking gaps.

## Current Application Status

### Implemented Product Areas

- Auth: welcome, login, register, forgot password, reset password, magic login, social/phone feature flags, 2FA challenge/setup.
- Onboarding: first-time profile setup path.
- Profiles: profile display, edit profile sections, photo/video intro management, PDF/share support.
- Preferences: edit partner preferences and scoring weights.
- Discovery and matches: Home, Matches, match detail, recommended/new/nearby/online/curated concepts, interests, shortlist, block/report paths.
- Chat: chat list, conversation detail, realtime events, attachments, voice/media support, room settings concepts.
- Membership and billing: plan list, payment method sheet, billing/subscription screens, referrals and wallet concepts.
- Settings: account, linked accounts, privacy, notification, communication, security, localization, accessibility, AI, media, language, theme.
- Verification and safety: KYC screen, blocked users, report/block flows, moderation API support.
- Support: help center, FAQs, support tickets, ticket detail/replies.
- Backend admin/API support: admin, analytics, notifications, payments, plans, support queues, moderation, RBAC, audit logs.

### Current Delivery Focus

- Stabilize launch-critical flows end to end.
- Keep mobile, backend, and docs aligned.
- Verify production env, provider credentials, billing, push notifications, media storage, and monitoring.
- Reduce duplicated source-of-truth documents.
- Expand focused testing where flows cross auth, payments, chat, notifications, settings, and profile media.

## Project Objectives

- Deliver a secure matrimonial experience for discovery, preferences, interest requests, mutual matches, chat, subscriptions, privacy, and support.
- Preserve a modular backend architecture that can scale without prematurely splitting services.
- Keep the mobile app ergonomic for repeated daily use, not just first-time onboarding.
- Enable production readiness through clear environment, deployment, QA, billing, and monitoring checklists.
- Keep documentation maintainable by assigning one owner document per subject area.

## Scope

### In Scope

- NestJS backend API, Socket.IO realtime gateway, schedulers, storage integration, provider integrations, and admin APIs.
- Expo React Native app for iOS, Android, and Web.
- Shared TypeScript contract package for membership, billing, payment, and subscription surfaces.
- Auth, onboarding, profile, preferences, discovery, match interactions, chat, notifications, settings, billing, referrals, wallet, support, verification, moderation, and admin APIs.
- Production configuration for MongoDB, Redis, object storage, push notifications, email/SMS where enabled, payment providers, app links, and EAS builds.
- Launch readiness, QA, monitoring, deployment, and Play/App Store preparation.

### Out of Scope Until Explicitly Planned

- A separate public marketing website or customer web portal outside the Expo web build.
- A full admin frontend unless a dedicated admin app is added.
- Offline matchmaking operations.
- Physical event management.
- Third-party data resale.
- ML microservice extraction before stable matching and analytics data are available.
- Native video calling until chat, moderation, billing, and safety policies are production-stable.

## Delivery Phases

| Phase | Goal | Primary Outputs |
| ----- | ---- | --------------- |
| 1. Stabilization | Confirm core app/API flows work reliably in development and staging | Auth, onboarding, profile, matches, chat, membership, settings, support smoke coverage |
| 2. Production Readiness | Prepare production infrastructure and provider credentials | Production env, storage, Redis, push, payments, app links, monitoring, secrets checklist |
| 3. Store and Launch QA | Validate mobile build quality and release requirements | EAS builds, Play/App Store metadata, screenshots, reviewer credentials, device matrix |
| 4. Controlled Launch | Release to a limited audience and monitor real behavior | Monitoring dashboards, support workflow, crash/error tracking, feedback loop |
| 5. Post-Launch Iteration | Improve conversion, safety, engagement, and reliability | Roadmap prioritization, analytics review, UX refinements, provider hardening |

## Milestone Checklist

### Stabilization

- Auth and token refresh verified.
- Onboarding completion and resume behavior verified.
- Profile edit, image upload, video intro, and profile PDF/share verified.
- Match lists, filters, match detail, interest, shortlist, block, and report verified.
- Chat list, conversation, attachments, voice/media, read receipts, and socket reconnect verified.
- Settings toggles and domain settings save without duplicate calls.
- Support ticket create/list/detail/reply/close verified.

### Production Readiness

- `.env.production` and EAS variables reviewed.
- MongoDB production connection configured.
- Redis configured for production sessions, queues, presence, and WebSocket scaling where required.
- S3 or equivalent production media storage configured.
- FCM/APNs push setup verified.
- Email/SMS providers verified where enabled.
- Payment webhook secrets and mobile store verification configured before real purchases.
- Deep links and app links verified for reset password and magic login.
- Liveness and readiness probes connected to deployment.
- Logging, correlation IDs, error monitoring, and alert thresholds configured.

### Store and Launch QA

- Android and iOS production builds generated from clean EAS profiles.
- Play/App Store billing products mapped if native subscriptions are enabled.
- Store screenshots and metadata prepared.
- Reviewer credentials prepared in private/local docs.
- Privacy policy, terms, community guidelines, account deletion, and data export paths checked.
- Device QA matrix completed.
- Dark theme and accessibility checks completed.

## Roles and Responsibilities

| Area | Responsible Owner | Notes |
| ---- | ----------------- | ----- |
| Product scope and release decisions | Product/Project owner | Owns priorities, launch gate, and tradeoffs |
| Backend API and infrastructure | Backend/Tech lead | Owns NestJS modules, providers, env, deployment readiness |
| Mobile app | Mobile lead | Owns Expo app, navigation, UI flows, EAS builds |
| UX and content | Product/UX owner | Owns flow clarity, empty states, localization, trust/safety copy |
| QA | QA owner | Owns test matrix, regression checklist, release signoff |
| DevOps/Operations | DevOps owner | Owns production deployment, monitoring, secrets, rollback |
| Support/Moderation | Operations/Admin owner | Owns support queues, reports, KYC/media moderation readiness |

## Risk Register

| Risk | Probability | Impact | Mitigation |
| ---- | ----------- | ------ | ---------- |
| Provider credentials not ready for launch | Medium | High | Track secrets in production checklist and verify each provider in staging |
| Store billing mismatch | Medium | High | Keep native billing disabled until product IDs and backend verification are tested |
| Chat realtime instability | Medium | High | Test reconnect, presence, Redis adapter, and fallback REST behavior |
| Media upload/storage issues | Medium | High | Verify local/S3 paths, file size limits, thumbnails, moderation, and old URL resolution |
| Notification fatigue | Medium | Medium | Use category/channel controls, quiet hours, and sane defaults |
| Duplicate settings/API calls | Medium | Medium | Test toggle flows and debounce/optimistic update behavior where needed |
| App Store / Play Store rejection | Low-Medium | High | Complete account deletion, privacy policy, permissions copy, billing compliance, reviewer credentials |
| Documentation drift | Medium | Medium | Enforce doc ownership rules and update the relevant source-of-truth doc only |
| Incomplete localization | Medium | Medium | Audit all visible copy and API response code translations |
| Payment/refund support gaps | Medium | High | Ensure billing history, invoice, failed payment, refund/support paths are clear |

## Quality Strategy

- Run backend lint, typecheck, tests, and build before release candidates.
- Run mobile lint and typecheck before release candidates.
- Add smoke checks for auth, onboarding, profile, match discovery, chat, membership, settings, and support.
- Prefer focused regression tests for cross-module risks: token refresh, payments, chat, notifications, media, settings.
- Keep launch QA checklists in `docs/launch/*` updated as release gates.
- Treat production environment and provider verification as part of QA, not a separate afterthought.

Recommended verification commands:

```bash
cd match-mate-api-server
npm run lint:check
npm run typecheck
npm run test
npm run build

cd ../match-mate-mobile-app
npm run lint
npm run typecheck
```

## Communication and Reporting

| Audience | Frequency | Channel | Purpose |
| -------- | --------- | ------- | ------- |
| Product/project owner | Weekly during stabilization, daily near release | Standup or written update | Scope, blockers, launch readiness |
| Engineering | Daily during active development | Standup/chat | Implementation coordination |
| QA | Per release candidate | Checklist and issue tracker | Regression status and signoff |
| Operations/support | Weekly before launch, daily during launch week | Launch channel | Support, moderation, monitoring readiness |
| Stakeholders/investors | Milestone-based | Demo and summary | Progress, risk, go/no-go decisions |

## Change Management

- Small implementation changes should be tracked in the task roadmap or issue tracker.
- Scope changes that affect launch date, billing, compliance, provider setup, or architecture must be reviewed by the product/project owner and tech lead.
- Documentation changes should update the owner doc only:
  - Product/delivery: this file.
  - Architecture/API: [Technical Plan](TECHNICAL-PLAN.md).
  - UX flows: [Flow Plan](FLOW-PLAN.md).
  - Roadmap/backlog: [Task Roadmap](TASK-ROADMAP.md).
  - Launch gates: `docs/launch/*`.

## Recommended Next Actions

1. Create a launch go/no-go checklist that references the existing launch, EAS, billing, monitoring, and production secrets docs.
2. Add a concise status field to roadmap items: `not started`, `in progress`, `blocked`, `ready for QA`, `done`.
3. Add release-candidate smoke tests for auth, onboarding, matches, chat, membership, settings, support, and notifications.
4. Verify all production provider flags and disable incomplete providers in production builds.
5. Create a private reviewer-credentials file from `docs/launch/REVIEWER-CREDENTIALS.template.md`.
6. Audit localization coverage for settings, API response codes, membership, support, and security flows.
7. Add owner and due date columns to launch-critical tasks.

## Success Metrics

### Launch Readiness

- Zero known critical blockers in auth, onboarding, profile, matching, chat, payments, support, or settings.
- Production env and EAS variables verified.
- Store review requirements complete.
- Monitoring and support workflow ready before public release.

### Product Health After Launch

- Registration to onboarding completion rate.
- Profile completion rate.
- Daily match-card engagement.
- Interest sent/accepted ratio.
- Chat activation after mutual match.
- Subscription conversion and cancellation rate.
- Support ticket volume and first-response time.
- Crash-free sessions and API error rate.

## Appendices

- [Technical Plan](TECHNICAL-PLAN.md)
- [Database Plan](DATABASE-PLAN.md)
- [Flow Plan](FLOW-PLAN.md)
- [Task Roadmap](TASK-ROADMAP.md)
- [Launch Plan](../launch/LAUNCH-PLAN.md)
- [EAS Production Checklist](../launch/EAS-PRODUCTION-CHECKLIST.md)
- [Production Secrets Checklist](../launch/PRODUCTION-SECRETS-CHECKLIST.md)
- [Store Billing Integration](../launch/STORE-BILLING-INTEGRATION.md)
- [Monitoring and APM Checklist](../launch/MONITORING-APM-CHECKLIST.md)
- [Deployment Plan](../operations/DEPLOYMENT-PLAN.md)
- [Commands](../operations/COMMANDS.md)
