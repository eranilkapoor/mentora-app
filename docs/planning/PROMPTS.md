# Mentora Prompt And Implementation Notes

This file stores reusable implementation prompts and product constraints for Mentora. It should not contain copied product backlog text from any other app.

## Core Product Prompt

Mentora is a B2C AI tutoring and mentorship app for students and parents. Build features around:

- independent student registration when age policy allows;
- parent-managed multiple child/student profiles;
- complete student profile sections;
- academic catalogue, subjects, schedules, AI tutor sessions, entitlements, and progress;
- parent controls, device/session controls, billing controls, and safety controls;
- English/Hindi localization and light/dark themes.

## Student Profile Prompt

When implementing profile work, treat onboarding as minimal required setup only. After onboarding, show profile completion percentage and guide users to complete:

- Personal
- Academic
- Parents
- Address
- Previous Education
- Exam Scores
- Course Preference
- Documents
- Payments
- Communication History
- Activity Timeline

## AI Tutor Access Prompt

Before opening an AI tutor session, validate all of:

- student identity and profile status;
- schedule window;
- subject entitlement;
- subscription/payment state;
- parental controls;
- device/session concurrency;
- safety/moderation status.

Do not let a parent account consume student tutor access unless the session is explicitly created for a student profile and within plan rules.

## Mobile UX Prompt

Mobile screens should feel like an enterprise learning app:

- Student mode: Home, Learn, Schedule, Progress, Profile.
- Parent mode: Dashboard, Children, Schedule, Payments, Settings.
- Avoid marketplace or swipe patterns.
- Use learning progress, subjects, upcoming sessions, and completion prompts as the primary surface.
- Keep static copy consistent with the current theme and localization system.

## Documentation Sync Prompt

When code changes, update:

- `README.md`
- `docs/README.md`
- `docs/planning/TASK-ROADMAP.md`
- `docs/planning/STUDENT-PROFILE-MODEL.md`
- related launch/legal docs if the change affects data, safety, subscriptions, or app-store declarations.
