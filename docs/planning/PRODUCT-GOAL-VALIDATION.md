# Mentora Product Goal Validation

Last reviewed: 2026-07-26

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
- Mobile Learn, Schedule, Progress tabs with account switcher.
- Learning plans, billing summary, membership purchase screen, and subscription billing screen.

## Gaps To Close

Highest priority:

- Replace AI tutor placeholder response with the selected model provider, provider moderation, usage metering, and lesson memory.
- Add document verification flow for self-managed student age/legal eligibility, not only DOB policy.
- Add explicit study-plan entities for goals such as JEE, NEET, UPSC, NDA, Olympiad, board exams, and skill courses.
- Build the full class board screen with Q&A, chat, notes, assignments, tests/quizzes, attendance, tutor actions, and parent-visible summary.
- Add recurrence rules for daily, weekly, and monthly classes beyond simple schedule rows.
- Enforce plan-specific schedule frequency, subjects, tutor type, minutes, concurrent devices, and session limits.
- Add parent-only purchase approval controls and student self-purchase eligibility rules.
- Add richer parent dashboard cards for attendance, ongoing class, test results, safety alerts, and payment usage.

## Product Decision

Continue with the current architecture. The backend domain is correctly centered on `StudentProfile`, `ParentStudentRelationship`, `LearningSchedule`, `LearningEntitlement`, `AiTutorSession`, and assessment/progress records. The next work should be product-depth screens and plan enforcement, not another architecture rewrite.
