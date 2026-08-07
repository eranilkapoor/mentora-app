# Mentora Product Goal Validation

Last reviewed: 2026-08-07

## Goal

Mentora should work like a parent-managed and legally eligible student learning platform:

- Parents create accounts, add one or more children, manage complete student profiles, settings, plans, schedules, payments, and progress.
- Legally eligible students create self-managed accounts after age/document validation and can manage their own learning plan.
- Students can study subjects, future exam goals, and courses such as JEE, NEET, UPSC, NDA, school classes, and other academic tracks.
- Classes/events can be daily, weekly, monthly, or plan-driven, and can be taught by AI tutors or online human tutors.
- Each class board should support Q&A, chat, notes, tests/quizzes, assignments, attendance, and progress reporting.
- Parent-visible reporting must include attendance, ongoing/completed classes, quiz/test results, tutor summaries, safety events, and usage.

## Current Fit

The app is moving in the right direction.

Implemented foundations:

- Parent and student roles.
- Independent and parent-managed student profiles.
- Age policy service for self-registration.
- Complete student profile sections.
- Academic catalogue, subjects, topics, curriculums, and study/course preference sections.
- Learning schedules, reminders, subject enrolment, and entitlements.
- AI tutor session guard for schedule, entitlement, subject, parental controls, and parallel session leakage.
- AI tutor context, messages, safety events, summaries, and history.
- Assessments, attempts, answers, results, topic progress, recommendations, and parent progress dashboard APIs.
- Mobile Learn, Schedule, Progress tabs with account switcher, plus a dedicated AI tutor session screen (message thread, send/receive, safety-flag display).
- Learning plans, billing summary, membership purchase screen, and subscription billing screen.
- Multi-organization admin CRM foundation for organizations, users/RBAC, leads, applications, admissions, communications, payments, reports, workflows, integrations, and security policies.
- Public website foundation for product pages, legal/support surfaces, and lead/demo capture.

## Production Reality

The product goal is still valid and the architecture is aligned with it. The codebase is now build-clean across API, CRM, website, and mobile, but Mentora should be treated as **MVP/customer-demo ready**, not live-production ready.

Production launch still depends on:

- Live AI provider, moderation, usage metering, and safety escalation.
- Production payment/store billing credentials and callback verification.
- Email, SMS, WhatsApp, push, calendar, OCR, storage, monitoring, dialer, geo, webinar, and accounting provider activation as selected.
- Legal/security review for child/student consent, self-managed student age/document validation, subscriptions, data retention, account deletion, and AI tutoring disclosures.
- End-to-end QA across CRM organization/branch/role context, mobile release builds, public website lead capture, token expiry, offline/slow network states, and production backups.

## Gaps To Close

Resolved since the 2026-07-29 review:

- Entitlement usage metering is real: `sendAiTutorMessage` now increments `entitlement.usedQuantity` per exchange and rejects once a plan's quota is exhausted, instead of only checking quota at session start.
- AI tutor replies now run through the same moderation check as student input (previously input-only), with a safe fallback message and a logged safety event when flagged.
- `LearningSchedule.recurrenceRule` is no longer a dead field: `createSchedule` accepts `recurrenceFrequency`/`recurrenceCount` and expands daily/weekly/monthly occurrences.
- `StudyPlan.maxConcurrentSessions` and `sessionsPerWeek` are now enforced in `createSchedule` via a new `LearningEntitlement.studyPlanId` link (previously stored but never read by anything).
- The mobile "class board" buttons (Q&A, Chat, Start AI tutor) now navigate to a real `AiTutorSession` screen with working message send/receive, instead of doing nothing on press.

Still open, highest priority:

- Replace the AI tutor's hardcoded placeholder reply with a real model provider call, provider-side moderation, and lesson memory fed back into generation. No LLM SDK is wired in yet.
- Add document verification flow for self-managed student age/legal eligibility, not only DOB policy.
- Notes and Tests on the mobile class board are explicit "coming soon" states now (previously silent no-ops) — no backend or screen exists for either yet.
- Enforce plan-specific subjects, tutor type, minutes, and concurrent-device limits (`StudyPlan.maxDevicesPerStudent`) — concurrent-session and per-week limits are enforced, but there is no device-session model to check device count against.
- Add parent-only purchase approval controls and student self-purchase eligibility rules.
- Add richer parent dashboard cards for attendance, ongoing class, test results, safety alerts, and payment usage.

## Product Decision

Continue with the current architecture. The backend domain is correctly centered on `StudentProfile`, `ParentStudentRelationship`, `LearningSchedule`, `LearningEntitlement`, `AiTutorSession`, and assessment/progress records. The next work should be product-depth screens and plan enforcement, not another architecture rewrite.
