# Mentora Task Roadmap

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
| P1       | Rewrite Hindi locale files after English Mentora flows stabilize.                                                                                  |
| Done     | Replace copied launch/store docs with child/student AI tutoring disclosures.                                                                       |

## P7 Launch

| Status  | Task                                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done    | Rewrite launch, Play Store, billing, privacy, and reviewer docs for children/student AI tutoring.                                                                                                                                      |
| Todo    | Host public legal pages from `mentora-public-website` and update app-store URLs.                                                                                                                                                       |
| Todo    | Verify app store safety disclosures and child-data policy with legal/product review.                                                                                                                                                   |
| Todo    | Replace AI tutor placeholder response with provider integration, provider moderation, and usage metering.                                                                                                                              |
| Partial | Run lint, typecheck, tests, migration validation, build, and smoke checks. Lint, typecheck, contract check, and focused AI access tests are automated; migration/build/device smoke checks still require the full runtime environment. |

## P8 Product Depth

| Status | Task                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Done   | Validate product goal against current architecture and document remaining gaps.                                                                 |
| Done   | Surface learning plan purchase and billing entry points for parents and eligible students.                                                      |
| Done   | Add class-board actions on the schedule surface for Q&A, chat, notes, and tests/quizzes.                                                        |
| Todo   | Add document verification workflow for legally eligible self-managed students.                                                                  |
| Todo   | Add explicit study-plan entities for JEE, NEET, UPSC, NDA, Olympiad, board exams, and skill courses.                                            |
| Todo   | Build full class board screen with attendance, Q&A, chat, notes, assignments, tests/quizzes, tutor actions, and parent-visible session summary. |
| Todo   | Enforce plan-specific subjects, tutor type, schedule frequency, concurrent device, and session/minute limits.                                   |

## P9 Multi-Tenant Education CRM

| Status | Task                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done   | Review public Meritto-like education CRM feature families and map them to Mentora-owned modules.                                                                                             |
| Done   | Convert the public website into a Next.js application for product, legal, plans, and lead-capture expansion.                                                                                 |
| Done   | Add `mentora-admin-crm` as a Next.js starter application for organization admins, counselors, managers, and platform admins.                                                                 |
| Done   | Rework `mentora-admin-crm` to follow the existing Juaaree/Match Mate admin layout pattern: left menu, top welcome bar, action strip, filters, listing tables, row actions, and pagination.   |
| Done   | Add working admin CRM sections for leads, applications, admissions, tasks, campaigns, communications, automation, payments, reports, learning operations, tenants, and settings.             |
| Done   | Expand `mentora-admin-crm` so all 30 CRM reference modules are visible and interactive in the frontend MVP.                                                                                  |
| Done   | Split backend platform modules into top-level Nest modules: tenants, leads, applications, tasks, campaigns, communications, contexts, module-records, and dashboard.                         |
| Done   | Keep root lint focused on installed API/mobile apps and expose separate frontend lint commands for the new Next.js apps.                                                                     |
| Todo   | Add tenant-aware auth context, guards, and repository helpers so every CRM query is scoped by `tenantId`.                                                                                    |
| Todo   | Build admin CRM lead list/detail, application pipeline, task board, campaign center, communication center, and reports.                                                                      |
| Todo   | Add public website lead-capture and demo-request forms connected to the CRM leads API.                                                                                                       |
| Todo   | Add CRM seed data for a demo tenant, lead stages, sources, sample leads, applications, tasks, campaigns, and communications.                                                                 |
| Done   | Add shared `module_records` MVP backend foundation for the partial CRM modules so each can create/list/update tenant-scoped operating records.                                               |
| Done   | Extend shared `module_records` MVP backend foundation to the remaining missing CRM modules: call center, WhatsApp, scholarship, interview, events, field force, and other uncovered modules. |

## P10 Meritto-Like CRM Module Coverage

Coverage reviewed against the 30-module reference in the attached Meritto analysis.

| #   | Module                  | Backend status | Current Mentora coverage                                                                                   | Roadmap action                                                                                                                 |
| --- | ----------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Authentication          | Partial        | `auth` module supports login/session foundations.                                                          | Add CRM admin SSO, MFA, Microsoft login, device/session console, and tenant-aware auth policies.                               |
| 2   | User Management         | Partial        | `admin/rbac`, roles, permissions, users exist.                                                             | Add organization roles: counselor, marketing, finance, branch manager, call center, field agent, tenant admin.                 |
| 3   | Organization Management | Partial        | `tenants` has tenants, branches, lead sources, and stages.                                                 | Add departments, teams, campuses, tenant branding, domains, channel settings, payment gateway settings, workflow settings.     |
| 4   | Lead Management         | Partial        | `leads` has leads, sources, stages, activities, assignments, and public capture at `/api/v1/leads/public`. | Add duplicate merge, tags, attachments, voice notes, capacity rules, transfer, advanced scoring, and lead import APIs.         |
| 5   | Student Profile         | Done/Partial   | `learning` and `students` APIs cover student profile sections and academic details.                        | Connect CRM admissions to student profile creation and add CRM-facing profile timeline.                                        |
| 6   | Application Management  | Partial        | `applications` has application create/list and application numbers.                                        | Add form builder, conditional fields, review stages, locks, history, document requirements, approvals.                         |
| 7   | Admission Management    | Partial        | Admin CRM UI models inquiry-to-enrollment pipeline; backend has applications and payments separately.      | Add explicit admission pipeline collection, stage rules, offer, enrollment, batch allocation, and ERP/LMS handoff.             |
| 8   | Marketing Automation    | Partial        | `campaigns` has campaign create/list APIs; admin UI has campaign surface.                                  | Add landing pages/forms, UTM inventory, conversion tags, A/B tests, drip workflows, ROI attribution.                           |
| 9   | Communication Module    | Partial        | `communications` has communication records; notifications module exists.                                   | Add channel-specific delivery providers, scheduling, bulk sends, conversation inbox, call/video records.                       |
| 10  | Call Center             | Missing        | No dedicated call center backend module.                                                                   | Add calls, dialer hooks, recordings, dispositions, call notes, call analytics, counselor call queue.                           |
| 11  | WhatsApp CRM            | Missing        | Communications can store WhatsApp channel records only.                                                    | Add WhatsApp templates, opt-ins, media, buttons, flows, delivery reports, and conversation history APIs.                       |
| 12  | Email CRM               | Partial        | Notifications/templates exist; communications can store email records.                                     | Add email campaigns, drip campaigns, open/click tracking, bounce, unsubscribe, template approval.                              |
| 13  | SMS Module              | Partial        | Notifications exist; communications can store SMS records.                                                 | Add OTP/transactional/promotional SMS templates, provider callbacks, delivery reports, bulk SMS.                               |
| 14  | Mobile App CRM          | Partial        | Mobile app exists for Mentora students/parents, not full counselor CRM.                                    | Add counselor mobile mode: lead list, notes, tasks, calls, WhatsApp, payments, reports, offline sync, geo features.            |
| 15  | Calendar                | Partial        | Learning schedules exist.                                                                                  | Add CRM calendar for counseling, interviews, events, tasks, reminders, Google Calendar sync.                                   |
| 16  | Task Management         | Partial        | `tasks` has task create/list APIs.                                                                         | Add recurring tasks, SLA, escalation, reminders, task comments, task board APIs.                                               |
| 17  | Workflow Automation     | Missing        | Admin UI has automation surface only.                                                                      | Add workflow rules, triggers, conditions, action engine, logs, retries, assignment automation.                                 |
| 18  | Document Management     | Partial        | Storage/profile document flows exist; CRM applications do not yet own document review workflow.            | Add CRM document requirements, upload, preview, OCR, versioning, verification, approvals.                                      |
| 19  | Payment Module          | Partial        | `payments`, subscriptions, admin payments exist.                                                           | Add CRM fee plans, application/admission/token fees, installments, payment links, reconciliation mapped to admission records.  |
| 20  | Finance Module          | Partial        | Payments/invoices/referrals wallet foundations exist.                                                      | Add ledger, tax/GST, pending collections, finance reports, refunds approvals, collection dashboards.                           |
| 21  | Scholarship             | Missing        | No scholarship backend module.                                                                             | Add scholarship rules, eligibility, approval, discount amount, payment-plan impact, audit trail.                               |
| 22  | Interview Module        | Missing        | No dedicated interview backend module.                                                                     | Add interview schedule, panel, interviewer assignment, result, remarks, offer recommendation.                                  |
| 23  | Event Management        | Missing        | Learning schedules exist, but no CRM events.                                                               | Add education fair, seminar, webinar, campus visit, registration, attendance, QR check-in, event lead capture.                 |
| 24  | Field Force Automation  | Missing        | No field force backend module.                                                                             | Add geo tracking, route planning, visits, attendance, mileage, check-in/out, location history.                                 |
| 25  | Reports                 | Partial        | `analytics` and admin analytics exist; CRM dashboard counts exist.                                         | Add CRM report builder, lead/campaign/admission/payment/branch/counselor reports and exports.                                  |
| 26  | Dashboard               | Partial        | CRM dashboard API and admin UI dashboard exist.                                                            | Add role-specific dashboards: CEO, management, marketing, finance, admission manager, counselor.                               |
| 27  | Analytics               | Partial        | `analytics` module exists; CRM-specific analytics are basic.                                               | Add lead/admission funnels, ROI, counselor productivity, forecasting, predictive analytics.                                    |
| 28  | AI Features             | Partial        | Learning AI tutor exists; CRM AI is not yet dedicated.                                                     | Add CRM AI lead scoring, prediction, chatbot, conversation summaries, auto replies, follow-up suggestions.                     |
| 29  | Integrations            | Partial        | Payments/storage/notifications foundations exist.                                                          | Add Facebook Lead Ads, Google Ads/Analytics, Meta Pixel, WhatsApp, Zoom/Meet, Salesforce, ERP/LMS/SIS, API keys, webhooks.     |
| 30  | Security                | Partial        | RBAC, audit logs, auth, settings, safety foundations exist.                                                | Add tenant data masking, IP restriction, 2FA/MFA, SSO enforcement, backup controls, encryption policy, admin activity exports. |

MVP update: all 30 CRM reference modules now share `module_records` APIs for tenant-scoped create/list/update operations and `GET /api/v1/module-records/coverage` for coverage discovery. They still need dedicated deep workflows listed above before they can be considered complete Meritto-level modules.

Summary: all 30 modules now have an MVP backend foundation. 1 module is mostly covered, 29 modules still require dedicated deep workflows to reach Meritto-level completeness.
