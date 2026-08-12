# Mentora Task Roadmap

## 2026-08-08 Completion Review

Current local validation passed for the two active CRM delivery surfaces:

| Area                     | Command                  | Result                      |
| ------------------------ | ------------------------ | --------------------------- |
| API server lint          | `npm.cmd run lint:check` | Passed                      |
| API server build         | `npm.cmd run build`      | Passed                      |
| Admin CRM typecheck      | `npm.cmd run lint`       | Passed                      |
| Admin CRM build          | `npm.cmd run build`      | Passed                      |
| Public website typecheck | `npm.cmd run lint`       | Passed                      |
| Public website build     | `npm.cmd run build`      | Passed                      |
| Mobile typecheck         | `npm.cmd run typecheck`  | Passed                      |
| Mobile lint              | `npm.cmd run lint`       | Passed                      |
| Mobile i18n              | `npm.cmd run i18n:check` | Passed for 1183 static keys |

Client-demo status:

| Scope                  | Demo readiness                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Admin CRM              | Ready for controlled desktop/tablet MVP demos with seeded data and local/staging API credentials.                |
| API server             | Ready for controlled MVP demos for admin CRM, learning, CRM, admissions, payments, workflows, and integrations.  |
| Public website         | Ready for controlled MVP demos after fresh typecheck/build verification.                                         |
| Mobile app             | Ready for controlled MVP demos after fresh typecheck/lint/i18n verification; device smoke QA is still required.  |
| Live production launch | Not ready until P0 environment, provider, legal/security, backup, monitoring, and staging QA gates are complete. |

Demo module count:

| Category                                           | Count |
| -------------------------------------------------- | ----- |
| CRM roadmap modules visible and interactive        | 30    |
| Code-side Product Ready modules in the CRM roadmap | 30    |
| Live-production modules with no external gate      | 1     |
| Modules blocked only by provider/infrastructure QA | 29    |
| Modules with remaining CRM product depth           | 0     |

All 30 roadmap modules now have code-side Product Ready coverage for controlled demos. Live production remains gated by external credentials, deployment infrastructure, legal/security sign-off, provider callback verification, and release-mode QA.

## 2026-07-29 Production Audit Update

The repository currently passes the local code quality checks recorded in [Production Readiness Audit](../launch/PRODUCTION-READINESS-AUDIT.md): API lint/build, CRM build/typecheck, public website build/typecheck, and mobile lint/typecheck/i18n.

Roadmap status uses **Product Ready** for code-side readiness: module ownership, DTOs/schemas/services/controllers, organization guards, permissions, frontend routes, list/action surfaces, and audit-aware operations where applicable. Production launch still requires external activation: provider credentials, callback verification, live infrastructure, E2E/device QA, legal/security sign-off, monitoring, backups, and release runbooks.

| Priority | Production gate                                                                                                                                    | Status                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P0       | Production environment, secrets, MongoDB/Redis/S3/queue workers, strict CORS, seeder policy                                                        | Pending environment setup       |
| P0       | Provider smoke tests for AI, email, SMS, WhatsApp, push, payments, storage, monitoring, calendar, OCR, dialer, geo, webinar, and accounting export | Pending live credentials        |
| P0       | Organization, branch, role, permission, token-expiry, and audit-export QA                                                                          | Pending staging QA              |
| P0       | CRM desktop/tablet, public website, and mobile Android/iOS release-mode QA                                                                         | Pending staging/device QA       |
| P0       | Child/student legal, subscription, privacy, account deletion, and AI tutoring disclosure review                                                    | Pending legal/security sign-off |

### 2026-08-01 CRM CRUD Hardening

| Status   | Item                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Done     | Added shared CRM-domain `GET by id`, restore, and bulk status update operations for dedicated operational modules.                                     |
| Done     | Applied detail/restore/bulk-status endpoints to admissions, call center, WhatsApp, events, interviews, field force, finance ledgers, and scholarships. |
| Done     | Added archive support to field-force records so field visits match the same CRUD lifecycle as other CRM modules.                                       |
| Done     | Added `GET by id`, restore, and bulk status update to shared `module-records` fallback APIs.                                                           |
| Done     | Fixed completion/execution updates so `payload.completion` and `payload.execution` no longer overwrite the full payload object.                        |
| Done     | Added admin CRM Redux operations and UI controls for restore and selected-record bulk status updates.                                                  |
| Verified | API lint/build and admin CRM typecheck/build pass after the hardening pass.                                                                            |

## P0 Foundation

| Status | Task                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------- |
| Done   | Establish Mentora API and mobile source inside `mentora-app`.                                      |
| Done   | Rename top-level folders to `mentora-api-server` and `mentora-mobile-app`.                         |
| Done   | Update root package scripts to use Mentora folders.                                                |
| Done   | Update package and mobile app metadata to Mentora naming.                                          |
| Done   | Replace main planning docs with Mentora-specific product and architecture direction.               |
| Done   | Update package locks after dependency install.                                                     |
| Done   | Create `.env.development` examples for local Mentora database and API/mobile URLs.                 |
| Done   | Audit source modules for non-learning product strings and classify them as keep, adapt, or delete. |
| Done   | Remove or quarantine remaining non-learning modules once mobile/backend no longer import them.     |

## P1 Identity And Family

| Status | Task                                                                                                                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done   | Extend user roles for `student`, `parent`, `mentor`, `teacher`, `content_manager`, `support`, `admin`, `super_admin`.                                                                               |
| Done   | Create `student_profiles` module with independent and parent-managed registration modes.                                                                                                            |
| Done   | Add complete student profile sections: personal, academic, parents, address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline. |
| Done   | Create `parent_profiles` module.                                                                                                                                                                    |
| Done   | Create `parent_student_relationships` with permissions and consent.                                                                                                                                 |
| Done   | Create `student_invitations` and optional guardian invitation flow.                                                                                                                                 |
| Done   | Create `parental_controls` module.                                                                                                                                                                  |
| Done   | Add age policy service and tests.                                                                                                                                                                   |

## P2 Academic Catalogue

| Status | Task                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| Done   | Add boards, universities, institutions, academic levels, grades, streams, courses, subjects, topics, and curriculums. |
| Done   | Add seed data for Classes 6-10, one board, Mathematics, Science, and English.                                         |
| Done   | Add student academic records and subject enrollment.                                                                  |
| Done   | Add previous education, exam scores, course preferences, and document upload/review APIs.                             |
| Done   | Replace mobile onboarding preference steps with academic onboarding.                                                  |

## P3 Scheduling And Entitlements

| Status | Task                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------- |
| Done   | Create learning schedules and reminders.                                                                |
| Done   | Adapt plans/subscriptions into learning plans and subscriptions.                                        |
| Done   | Create explicit learning entitlements.                                                                  |
| Done   | Build centralized AI access guard.                                                                      |
| Done   | Add tests for outside schedule, expired entitlement, subject not included, and parental control denial. |

## P4 AI Tutor

| Status | Task                                                                          |
| ------ | ----------------------------------------------------------------------------- |
| Done   | Create AI tutor sessions and messages modules.                                |
| Done   | Add session context builder with only required student/subject/schedule data. |
| Done   | Add safety moderation and safety event logging.                               |
| Done   | Add session summary generation and parent/student history endpoints.          |
| Done   | Adapt realtime chat UI to AI tutor message UI.                                |

## P5 Assessment And Progress

| Status | Task                                                                        |
| ------ | --------------------------------------------------------------------------- |
| Done   | Add question banks, questions, assessments, attempts, answers, and results. |
| Done   | Add student topic and subject progress.                                     |
| Done   | Add recommendations and parent progress dashboard.                          |

## P6 Mobile And Public Website

| Status | Task                                                                               |
| ------ | ---------------------------------------------------------------------------------- |
| Done   | Replace mobile tabs with student mode: Home, Learn, Schedule, Progress, Profile.   |
| Done   | Add parent mode: Dashboard, Children, Schedule, Payments, Settings.                |
| Done   | Add account switcher for parent and child profiles.                                |
| Done   | Build complete student profile detail/edit screens with section-level permissions. |
| Done   | Build public website for brand, plans, privacy, support, and app links.            |

## Code Cleanup Backlog From Audit

| Priority | Task                                                                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done     | Remove remaining generated contract routes for copied non-learning marketplace APIs after OpenAPI snapshot is regenerated from active controllers. |
| Done     | Replace old analytics metrics with learning funnel metrics: schedule starts, join rate, AI minutes, assessment completion, retention.              |
| Done     | Replace generic story/CMS fields with learning outcome/testimonial fields or retire the module.                                                    |
| Done     | Confirm removed copied non-learning mobile screens and services stay unreferenced after contract regeneration.                                     |
| Done     | Rename notification preference contract keys away from inherited request/ready labels after API/mobile migration.                                  |
| Done     | Rewrite Hindi locale files after English Mentora flows stabilize.                                                                                  |
| Done     | Replace copied launch/store docs with child/student AI tutoring disclosures.                                                                       |

## P7 Launch

| Status   | Task                                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Done     | Rewrite launch, Play Store, billing, privacy, and reviewer docs for children/student AI tutoring.                                                                                                                                                            |
| Partial  | Host public legal pages from `mentora-public-website` and update app-store URLs. Legal pages exist in the Next.js website; deployment URL and store-console URL updates are release-environment tasks.                                                       |
| External | Verify app store safety disclosures and child-data policy with legal/product review.                                                                                                                                                                         |
| Done     | Replace AI tutor placeholder response with provider integration, provider moderation, and usage metering. Sandbox AI tutor provider now reads configured provider/model, returns metered usage metadata, and still passes through Mentora safety moderation. |
| Partial  | Run lint, typecheck, tests, migration validation, build, and smoke checks. Local lint/typecheck checks are repeatable; migration/device smoke checks still require the full runtime environment.                                                             |

## P8 Product Depth

| Status | Task                                                                                                                                                                                                                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Done   | Validate product goal against current architecture and document remaining gaps.                                                                                                                                                                                                                                                            |
| Done   | Surface learning plan purchase and billing entry points for parents and eligible students.                                                                                                                                                                                                                                                 |
| Done   | Add class-board actions on the schedule surface for Q&A, chat, notes, and tests/quizzes.                                                                                                                                                                                                                                                   |
| Done   | Add document verification workflow for legally eligible self-managed students. Student API accepts adult self-managed eligibility documents, admin Documents exposes verification/OCR metadata workflow, and live OCR remains an external provider switch.                                                                                 |
| Done   | Add explicit study-plan entities for JEE, NEET, UPSC, NDA, Olympiad, board exams, and skill courses.                                                                                                                                                                                                                                       |
| Done   | Build full class board screen with attendance, Q&A, chat, notes, assignments, tests/quizzes, tutor actions, and parent-visible session summary. Backend class-board APIs cover join, chat messages, files, attendance summary, tutor notes, and parent-visible summary; mobile board actions open tutor, notes, and practice entry points. |
| Done   | Enforce plan-specific subjects, tutor type, delivery mode, schedule frequency, concurrent session, entitlement usage, and session/minute limits.                                                                                                                                                                                           |

## P9 Multi-Organization Education CRM

| Status | Task                                                                                                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done   | Review public Meritto-like education CRM feature families and map them to Mentora-owned modules.                                                                                                                                                        |
| Done   | Convert the public website into a Next.js application for product, legal, plans, and lead-capture expansion.                                                                                                                                            |
| Done   | Add `mentora-admin-crm` as a Next.js starter application for organization admins, counselors, managers, and platform admins.                                                                                                                            |
| Done   | Rework `mentora-admin-crm` to follow an enterprise admin layout pattern: left menu, top context bar, action strip, filters, listing tables, row actions, and pagination.                                                                                |
| Done   | Add working admin CRM sections for leads, applications, admissions, tasks, campaigns, communications, automation, payments, reports, learning operations, organizations, and settings.                                                                  |
| Done   | Expand `mentora-admin-crm` so all 30 CRM reference modules are visible and interactive in the frontend MVP.                                                                                                                                             |
| Done   | Upgrade `mentora-admin-crm` from a basic demo shell to an enterprise-style SaaS console with icons, status chips, insight cards, stronger actions, improved dark/light themes, and consistent module detail drawers.                                    |
| Done   | Add Bootstrap, Font Awesome React icons, Redux Toolkit, and React Redux to the admin CRM so UI components, icons, and shell state use standard frontend libraries.                                                                                      |
| Done   | Add server-backed admin CRM state. The shell now uses authenticated dashboard bootstrap for contexts, organization scope, dashboard metrics, module coverage, and organization-scoped `module_records` rows through Redux async state.                  |
| Done   | Make the admin CRM desktop/tablet-first responsive, including sidebar collapse, menu group collapse, stable tablet breakpoints, and list/grid module record views.                                                                                      |
| Done   | Split backend platform modules into top-level Nest modules: organizations (`organizations` API/storage), leads, applications, tasks, campaigns, communications, contexts, module-records, and dashboard.                                                |
| Done   | Keep root lint focused on installed API/mobile apps and expose separate frontend lint commands for the new Next.js apps.                                                                                                                                |
| Done   | Add organization-aware auth context, guards, and repository helpers so CRM queries are scoped by `organizationId`; CRM controllers now validate organization access against active user memberships before organization-scoped reads/writes run.        |
| Done   | Build admin CRM lead list/detail, application pipeline, task board, campaign center, communication center, and reports. Frontend MVP has interactive lists, filters, actions, detail drawers, server bootstrap, and organization-scoped module records. |
| Done   | Add public website lead-capture and demo-request forms connected to the CRM leads API.                                                                                                                                                                  |
| Done   | Add CRM seed data for a demo organization, lead stages, sources, sample leads, applications, tasks, campaigns, and communications.                                                                                                                      |
| Done   | Add shared `module_records` MVP backend foundation for the partial CRM modules so each can create/list/update organization-scoped operating records.                                                                                                    |
| Done   | Extend shared `module_records` MVP backend foundation to the remaining missing CRM modules: call center, WhatsApp, scholarship, interview, events, field force, and other uncovered modules.                                                            |

## P10 Meritto-Like CRM Module Coverage

Coverage reviewed against the 30-module reference in the attached Meritto analysis.

The backend `GET /api/v1/admin/module-records/coverage` endpoint is now the source of truth for module readiness. It returns backend status, frontend status, storage ownership, API surface, production blockers, and `productionReady` for every CRM module. The admin CRM header consumes this coverage data after API sync and shows BE/FE readiness plus blockers per selected module.

| #   | Module                  | Backend status | Current Mentora coverage                                                                                                                                                                                                                                                                                | Roadmap action                                                                                                                          |
| --- | ----------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Authentication          | Product Ready  | `auth`, sessions, roles, permissions, CRM context bootstrap, organization-context guards, security policy APIs, session/device review actions, SSO/MFA provider setup actions, and audit exports are wired.                                                                                             | Remaining external only: live SSO/MFA provider credentials, Microsoft/Google/OIDC app registration, and production callback validation. |
| 2   | User Management         | Product Ready  | `admin/rbac`, roles, permissions, users, user memberships, organization-user create/list, branch/department/team scope, CRM access review, refresh, export actions, and server-backed IAM hierarchy dropdowns are wired.                                                                                | Remaining external only: email invite delivery provider and external HR/identity directory sync if selected.                            |
| 3   | Organization Management | Product Ready  | Organizations are backed by the `organizations` API/storage and now have separate CRM pages/API-backed workflows for Branches, Departments, and Teams with create, archive, restore, hierarchy refresh, branding, channel settings, lead sources/stages, dashboard scope, and CRM setup/export actions. | Remaining external only: live DNS/domain verification and payment gateway secret validation.                                            |
| 4   | Lead Management         | Product Ready  | `leads` captures enquiries from website/API/import channels and supports duplicate lookup, deterministic scoring, assignment, nurture actions, tags, attachments, voice-note metadata, stage movement, imports/exports, timeline, and organization guards.                                              | Remaining external only: ad/WhatsApp callback ingestion and provider-backed voice-note storage.                                         |
| 5   | Student Profile         | Product Ready  | `learning` and `students` APIs cover student profile sections, academic details, documents, progress, organization-facing student records, and admission-to-student handoff metadata.                                                                                                                   | Remaining external only: live LMS/SIS/admission sync providers.                                                                         |
| 6   | Application Management  | Product Ready  | `applications` supports student application forms, application numbers, document requirements, reviewer notes, stage/review movement, interview scheduling action, offer/decision APIs, admission confirmation action, and audit-aware CRM wiring.                                                      | Remaining external only: optional external form embed/provider integration.                                                             |
| 7   | Admission Management    | Product Ready  | Dedicated `admissions` supports offer-to-enrollment workflow actions, fee-collection metadata, batch allocation, onboarding handoff, learning-plan provisioning metadata, ERP/LMS handoff queue metadata, and admin CRM action wiring.                                                                  | Remaining external only: live ERP/LMS adapter execution and payment-gateway settlement callbacks.                                       |
| 8   | Marketing Automation    | Product Ready  | `campaigns` supports campaign inventory, UTM metadata, landing-page metadata, lead-ad/remarketing audience metadata, A/B variants, drip journeys, scheduled campaigns, source ROI, conversion tags, and CRM action wiring.                                                                              | Remaining external only: live ad/provider callbacks and external landing-page hosting.                                                  |
| 9   | Communication Module    | Product Ready  | `communications`, notifications, templates, logs, channel settings, and provider configs support email, SMS, WhatsApp, call, push, and in-app history with templates, delivery status metadata, scheduling actions, and opt-in controls.                                                                | Remaining external only: live provider callbacks and final provider credentials.                                                        |
| 10  | Call Center             | Product Ready  | Dedicated `call-center` supports incoming/outgoing call records, dialer queue metadata, recording references, disposition, notes, follow-ups, analytics provider hooks, guarded lifecycle APIs, and audit writes.                                                                                       | Remaining external only: live dialer and recording storage provider.                                                                    |
| 11  | WhatsApp CRM            | Product Ready  | Dedicated `whatsapp` plus communications/integrations supports templates, media metadata, buttons, flows, bulk-send metadata, automation hooks, delivery-report metadata, conversation history, guarded APIs, and audit writes.                                                                         | Remaining external only: WhatsApp Business approval, provider template approval, and delivery callbacks.                                |
| 12  | Email CRM               | Product Ready  | Communications, notifications, templates, logs, and provider config support email templates, bulk mail metadata, drip campaigns, open/click tracking metadata, bounces, unsubscribe state, and approval actions.                                                                                        | Remaining external only: live email provider callbacks and domain reputation/warmup.                                                    |
| 13  | SMS Module              | Product Ready  | Communications, notifications, templates, logs, and provider config support OTP, transactional, promotional, bulk SMS, templates, callback metadata, delivery reports, and compliance status actions.                                                                                                   | Remaining external only: live SMS callbacks and DLT/template approvals.                                                                 |
| 14  | Mobile App CRM          | Product Ready  | Mobile app, reusable CRM APIs, and admin CRM actions support counselor dashboard, lead updates, notes/voice-note metadata, geo check-ins, tasks, calls, WhatsApp, payments, reports, and offline-sync metadata.                                                                                         | Remaining external only: production offline sync engine tuning and app store release.                                                   |
| 15  | Calendar                | Product Ready  | Learning schedules, task due dates, interviews, event records, reminders, recurring schedule metadata, classroom APIs, and calendar sync provider hooks provide calendar operations.                                                                                                                    | Remaining external only: live Google/Microsoft calendar sync.                                                                           |
| 16  | Task Management         | Product Ready  | `tasks` supports create/list, board view, SLA state, recurrence/reminder metadata, comments, escalations, reassignment, workflow updates, completion, and CRM action wiring.                                                                                                                            | Remaining external only: live calendar/reminder provider.                                                                               |
| 17  | Workflow Automation     | Product Ready  | Dedicated `workflows` supports no-code assignment, reminder, drip communication, escalation, score update, stale-lead recycling, webhook metadata rules, active execution, logs, retry/SLA/test policies, retry endpoint, audit writes, and admin CRM action wiring.                                    | Remaining external only: live provider action execution/webhooks.                                                                       |
| 18  | Document Management     | Product Ready  | Dedicated `documents` supports organization-scoped documents, entity links, categories, statuses, versions, OCR/verification metadata, request/load/verify actions, and audit-aware APIs.                                                                                                               | Remaining external only: live OCR provider.                                                                                             |
| 19  | Payment Module          | Product Ready  | `payments`, subscriptions, invoices, admin payments, learning entitlements, application/admission/installment/payment-link/refund/reconciliation action metadata, and CRM payment actions exist.                                                                                                        | Remaining external only: live payment gateway settlement callbacks.                                                                     |
| 20  | Finance Module          | Product Ready  | Dedicated `finance-ledgers` supports invoices, receipts, refunds, tax ledger metadata, collections, pending payments, finance reports, reconciliation endpoint, export endpoint, guarded actions, and CRM wiring.                                                                                       | Remaining external only: live tax engine and accounting export.                                                                         |
| 21  | Scholarship             | Product Ready  | Dedicated `scholarships` supports rules/criteria metadata, eligibility scoring, verification metadata, approval/rejection, award amount, payment-plan impact metadata, audit trail, and CRM action wiring.                                                                                              | Remaining external only: live finance-plan discount sync.                                                                               |
| 22  | Interview Module        | Product Ready  | Dedicated `interviews` supports schedule metadata, interviewer/panel payload, result, remarks, score, offer recommendation, admission handoff, guarded create/list/update/complete APIs, and audit writes.                                                                                              | Remaining external only: external calendar/provider sync.                                                                               |
| 23  | Event Management        | Product Ready  | Dedicated `events` supports registration-form metadata, attendance, QR check-in metadata, webinar/branch visit metadata, event lead capture, guarded lifecycle APIs, and audit writes.                                                                                                                  | Remaining external only: external form hosting, scanner hardware, and webinar provider sync.                                            |
| 24  | Field Force Automation  | Product Ready  | Dedicated `field-force` supports geo tracking metadata, route plans, attendance, mileage, check-in/out, visit history, lead/application links, guarded lifecycle APIs, and audit writes.                                                                                                                | Remaining external only: live geo telemetry and map routing providers.                                                                  |
| 25  | Reports                 | Product Ready  | Dedicated `reports` supports report definitions, saved/dashboard/role/scheduled/export report actions, export jobs, organization guards, permissions, audit writes, and CRM action wiring.                                                                                                              | Remaining external only: external XLSX/PDF/file generation worker.                                                                      |
| 26  | Dashboard               | Product Ready  | CRM dashboard API, authenticated bootstrap, organization membership enforcement, role dashboard action metadata, scoped KPIs, and admin UI dashboard exist.                                                                                                                                             | Code-side complete.                                                                                                                     |
| 27  | Analytics               | Product Ready  | `analytics`, admin analytics, dashboard metrics, lead/admission funnels, revenue/ROI/counselor productivity action metadata, forecasting metadata, and CRM analytics actions exist.                                                                                                                     | Remaining external only: predictive model provider.                                                                                     |
| 28  | AI Features             | Product Ready  | Learning AI tutor, AI settings, module records, CRM lead scoring/prediction/chatbot/conversation-summary/auto-reply/follow-up action metadata, and provider metering hooks exist.                                                                                                                       | Remaining external only: external CRM AI model metering/provider configuration.                                                         |
| 29  | Integrations            | Product Ready  | Dedicated `integrations` exposes organization-scoped provider catalogue/configuration APIs, webhook/callback/health-check metadata, provider health metadata, audit writes, and admin CRM provider actions.                                                                                             | Remaining external only: live provider credentials, vendor approvals, callback verification, and provider-specific adapters.            |
| 30  | Security                | Product Ready  | Dedicated `security-policies` exposes organization-scoped MFA/SSO/IP/masking/session/retention policy APIs, audit writes, provider configuration hooks, security report setup, and admin CRM policy/audit actions.                                                                                      | Remaining external only: live MFA/SSO provider enforcement and external backup evidence automation.                                     |

### All-30 FE/BE Readiness Matrix

| #   | Module                  | BE readiness  | FE readiness  | Production ready now | Blocker type                     |
| --- | ----------------------- | ------------- | ------------- | -------------------- | -------------------------------- |
| 1   | Authentication          | Product Ready | Product Ready | External only        | Live SSO/MFA provider            |
| 2   | User Management         | Product Ready | Product Ready | External only        | Email invite/identity provider   |
| 3   | Organization Management | Product Ready | Product Ready | External only        | DNS/payment provider validation  |
| 4   | Lead Management         | Product Ready | Product Ready | External only        | Ad callbacks/voice storage       |
| 5   | Student Profile         | Product Ready | Product Ready | External only        | Admission/LMS sync providers     |
| 6   | Application Management  | Product Ready | Product Ready | External only        | Optional external form provider  |
| 7   | Admission Management    | Product Ready | Product Ready | External only        | ERP/LMS/payment callbacks        |
| 8   | Marketing Automation    | Product Ready | Product Ready | External only        | Ad callbacks/landing hosting     |
| 9   | Communication Module    | Product Ready | Product Ready | External only        | Delivery provider callbacks      |
| 10  | Call Center             | Product Ready | Product Ready | External only        | Dialer/recording provider        |
| 11  | WhatsApp CRM            | Product Ready | Product Ready | External only        | WhatsApp provider approval       |
| 12  | Email CRM               | Product Ready | Product Ready | External only        | Email callbacks/domain warmup    |
| 13  | SMS Module              | Product Ready | Product Ready | External only        | SMS callbacks/DLT approvals      |
| 14  | Mobile App CRM          | Product Ready | Product Ready | External only        | Offline sync/app store release   |
| 15  | Calendar                | Product Ready | Product Ready | External only        | Calendar provider sync           |
| 16  | Task Management         | Product Ready | Product Ready | External only        | Calendar/reminder provider       |
| 17  | Workflow Automation     | Product Ready | Product Ready | External only        | Live provider actions/webhooks   |
| 18  | Document Management     | Product Ready | Product Ready | External only        | Live OCR provider                |
| 19  | Payment Module          | Product Ready | Product Ready | External only        | Gateway settlement callbacks     |
| 20  | Finance Module          | Product Ready | Product Ready | External only        | Tax/accounting integrations      |
| 21  | Scholarship             | Product Ready | Product Ready | External only        | Finance discount sync            |
| 22  | Interview Module        | Product Ready | Product Ready | External only        | Calendar/provider sync           |
| 23  | Event Management        | Product Ready | Product Ready | External only        | Webinar/QR/form providers        |
| 24  | Field Force Automation  | Product Ready | Product Ready | External only        | Geo/map providers                |
| 25  | Reports                 | Product Ready | Product Ready | External only        | File generation worker           |
| 26  | Dashboard               | Product Ready | Product Ready | Yes                  | None                             |
| 27  | Analytics               | Product Ready | Product Ready | External only        | Predictive model provider        |
| 28  | AI Features             | Product Ready | Product Ready | External only        | CRM AI model metering            |
| 29  | Integrations            | Product Ready | Product Ready | External only        | External providers               |
| 30  | Security                | Product Ready | Product Ready | External only        | SSO/MFA/backup evidence provider |

Enterprise-readiness update: all 30 CRM reference modules now have an MVP surface, and the high-value P10 long-tail areas have been promoted from generic `module_records` into dedicated top-level Nest modules where they need independent lifecycle APIs. Organization-scoped CRM controllers validate active user membership before accepting a supplied `organizationId`; action-level permissions and audit writes are now applied across the promoted module surfaces.

Next production hardening tracks: activate real communication providers and delivery callbacks; expand workflow automation with live provider actions; add advanced report export workers; add provider-backed imports, calendar sync, geo telemetry, finance reconciliation jobs, and full release-mode E2E/device QA.

Completed production-readiness pass:

| Status | Item                                                                                                                                                                                                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done   | Added CRM-specific permissions for organizations, leads, applications, tasks, campaigns, communications, module records, reports, and workflows.                                                                                                                                |
| Done   | Applied action-level `PermissionsGuard` checks across CRM controllers in addition to JWT and organization-membership guards.                                                                                                                                                    |
| Done   | Added lead duplicate lookup, duplicate merge, JSON bulk import, and CSV export APIs under `/api/v1/admin/leads/operations/*`.                                                                                                                                                   |
| Done   | Added CRM audit-log writes for lead create, assign, stage change, merge, import, and export operations.                                                                                                                                                                         |
| Done   | Wired admin CRM Lead Management action buttons to real API calls for duplicate check, sample import, and export, with visible success/error toast state.                                                                                                                        |
| Done   | Added shared module-record export API for CRM reports/operations and wired generic admin CRM export/report actions to it.                                                                                                                                                       |
| Done   | Added module-record workflow execution endpoint with execution result metadata and audit logging for automation MVP records.                                                                                                                                                    |
| Done   | Added dedicated top-level `workflows` module with schemas, DTOs, controller, service, organization guard, permissions, execution logging, and audit writes.                                                                                                                     |
| Done   | Added dedicated top-level `reports` module with report definitions, export jobs, controller, service, organization guard, permissions, and audit writes.                                                                                                                        |
| Done   | Wired admin CRM Automation actions to dedicated workflow rule creation/execution APIs and Reports actions to report definition/export flows.                                                                                                                                    |
| Done   | Added dedicated `admissions`, `call-center`, `whatsapp`, `scholarships`, `interviews`, `events`, `field-force`, and `finance-ledgers` modules with collections, schemas, services, controllers, organization guards, permission guards, lifecycle APIs, and audit writes.       |
| Done   | Routed admin CRM load/save behavior for admissions, call center, WhatsApp, scholarships, interviews, events, field force, and finance modules to their dedicated APIs instead of `module_records`.                                                                              |
| Done   | Added dedicated `integrations` and `security-policies` modules with organization-scoped provider readiness, policy configuration APIs, permission guards, and audit writes.                                                                                                     |
| Done   | Wired admin CRM Integrations and Security actions to real backend APIs for provider checks/configuration and organization policy load/update flows.                                                                                                                             |
| Done   | Expanded User Management and Organization Management with organization users plus first-class Branches, Departments, and Teams pages backed by create/list/archive/restore APIs, hierarchy refresh, branding, and channel settings.                                             |
| Done   | Expanded Lead Management with tags, attachments, voice notes, deterministic scoring, transfer APIs, safer ObjectId route matching, and CRM enrichment actions.                                                                                                                  |
| Done   | Expanded Application, Admission, Marketing, Task, Workflow, Document, Finance, and Scholarship modules with dedicated lifecycle/depth APIs and CRM action wiring.                                                                                                               |
| Done   | Added module-specific admin form fields and payload mapping for Applications, Admissions, Documents, Scholarships, Interviews, and Learning Ops so create/edit/view no longer uses generic lead-like fields.                                                                    |
| Done   | Promoted Learning Ops to a dedicated `/api/v1/admin/learning` surface backed by the `learning_operations` collection, with create/list/update/archive/restore/bulk-status/export lifecycle support.                                                                             |
| Done   | Promoted Contacts, Notes, and Custom Fields to dedicated `/api/v1/admin/contacts`, `/api/v1/admin/notes`, and `/api/v1/admin/custom-fields` routes while reusing the shared organization-scoped record lifecycle engine safely.                                                 |
| Done   | Completed Documents lifecycle parity with restore and bulk-status APIs, while keeping storage in the `documents` collection and removing visible `CrmDocument` type naming from the Documents module.                                                                           |
| Done   | Promoted Growth & Automation admin UX status and forms to product-ready for Campaigns, Marketing Automation, Landing Pages, Email, SMS, WhatsApp, Telephony, Call Center, Lead Scoring, Marketing Attribution, Notifications, Automation, Analytics, Chatbots, and AI Features. |
| Done   | Promoted Operations admin UX/status/forms to product-ready for Mobile App, Calendar, Events, Field Force, Support, Finance, Reports, Integrations, and Settings; added Support restore and bulk status API parity for shared CRM row actions.                                   |

Remaining production hardening tracks:

| Priority | Track                  | Remaining work                                                                                                                                                                                                                                       |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P10-A    | Dedicated module depth | Continue deepening the new dedicated modules with provider adapters, scoring engines, calendars, geo telemetry, reconciliation jobs, and richer business-rule engines where live vendors are required.                                               |
| P10-B    | CRM workflow execution | Expand the dedicated workflow execution module with retry logs, SLA escalations, background triggers, assignment automation, provider actions, and a visual workflow builder/test mode.                                                              |
| P10-C    | Provider integrations  | Add live WhatsApp/SMS/email credentials, template approval webhooks, delivery callbacks, bounce/unsubscribe handling, and provider-specific adapter execution.                                                                                       |
| P10-D    | Reporting and exports  | Expand current CSV export foundations with report builder definitions, async export jobs, saved reports, role-specific dashboards, and XLSX/PDF exports.                                                                                             |
| P10-E    | Frontend operations    | Add dedicated forms for lead import mapping, merge review, application stage transitions, task comments, communication scheduling, and workflow builder validation.                                                                                  |
| P10-F    | Security depth         | Code-side organization policy, access review, audit export, provider configuration, and report setup are complete. Remaining work is live MFA/SSO provider enforcement and external backup evidence automation after credentials/storage are chosen. |
