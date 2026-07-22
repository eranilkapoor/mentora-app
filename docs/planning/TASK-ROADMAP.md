# Mentora Task Roadmap

## P0 Foundation

| Status      | Task                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| Done        | Restore copied API and mobile source into `mentora-app`.                                     |
| Done        | Rename top-level folders to `mentora-api-server` and `mentora-mobile-app`.                   |
| Done        | Update root package scripts to use Mentora folders.                                          |
| Done        | Update package and mobile app metadata to Mentora naming.                                    |
| Done        | Replace main planning docs with Mentora-specific product and architecture direction.         |
| Done        | Update package locks after dependency install.                                               |
| Done        | Create `.env.development` examples for local Mentora database and API/mobile URLs.           |
| In Progress | Audit source modules for copied product strings and classify them as keep, adapt, or delete. |
| Next        | Remove or quarantine remaining Match Mate modules once mobile/backend no longer import them. |

## P1 Identity And Family

| Status  | Task                                                                                                                  |
| ------- | --------------------------------------------------------------------------------------------------------------------- |
| Done    | Extend user roles for `student`, `parent`, `mentor`, `teacher`, `content_manager`, `support`, `admin`, `super_admin`. |
| Partial | Create `student_profiles` module with independent and parent-managed registration modes.                              |
| Todo    | Add complete student profile sections: personal, academic, parents, address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline. |
| Partial | Create `parent_profiles` module.                                                                                      |
| Partial | Create `parent_student_relationships` with permissions and consent.                                                   |
| Todo    | Create `student_invitations` and optional guardian invitation flow.                                                   |
| Partial | Create `parental_controls` module.                                                                                    |
| Todo    | Add age policy service and tests.                                                                                     |

## P2 Academic Catalogue

| Status  | Task                                                                                                                  |
| ------- | --------------------------------------------------------------------------------------------------------------------- |
| Partial | Add boards, universities, institutions, academic levels, grades, streams, courses, subjects, topics, and curriculums. |
| Partial | Add seed data for Classes 6-10, one board, Mathematics, Science, and English.                                         |
| Partial | Add student academic records and subject enrollment.                                                                  |
| Todo    | Add previous education, exam scores, course preferences, and document upload/review APIs.                             |
| Partial | Replace mobile onboarding preference steps with academic onboarding.                                                  |

## P3 Scheduling And Entitlements

| Status  | Task                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------- |
| Partial | Create learning schedules and reminders.                                                                |
| Todo    | Adapt plans/subscriptions into learning plans and subscriptions.                                        |
| Partial | Create explicit learning entitlements.                                                                  |
| Partial | Build centralized AI access guard.                                                                      |
| Todo    | Add tests for outside schedule, expired entitlement, subject not included, and parental control denial. |

## P4 AI Tutor

| Status  | Task                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| Partial | Create AI tutor sessions and messages modules.                                |
| Todo    | Add session context builder with only required student/subject/schedule data. |
| Partial | Add safety moderation and safety event logging.                               |
| Todo    | Add session summary generation and parent/student history endpoints.          |
| Todo    | Adapt realtime chat UI to AI tutor message UI.                                |

## P5 Assessment And Progress

| Status | Task                                                                        |
| ------ | --------------------------------------------------------------------------- |
| Todo   | Add question banks, questions, assessments, attempts, answers, and results. |
| Todo   | Add student topic and subject progress.                                     |
| Todo   | Add recommendations and parent progress dashboard.                          |

## P6 Mobile And Public Website

| Status  | Task                                                                             |
| ------- | -------------------------------------------------------------------------------- |
| Done    | Replace mobile tabs with student mode: Home, Learn, Schedule, Progress, Profile. |
| Partial | Add parent mode: Dashboard, Children, Schedule, Payments, Settings.              |
| Todo    | Add account switcher for parent and child profiles.                              |
| Todo    | Build complete student profile detail/edit screens with section-level permissions. |
| Todo    | Build public website for brand, plans, privacy, support, and app links.          |

## Code Cleanup Backlog From Audit

| Priority | Task                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Remove old `MatchesModule` and admin curated-match routes after chat/admin no longer depend on them.                                         |
| P0       | Replace Match Mate analytics metrics with learning funnel metrics: schedule starts, join rate, AI minutes, assessment completion, retention. |
| P0       | Replace success stories schema/API fields with learning outcome fields or retire the module.                                                 |
| P0       | Replace mobile `matchApi.service`, `Matches`, `MatchDetail`, and old Home helper hooks/components with learning APIs/screens.                |
| P1       | Rename notification preference contract keys away from `interestReceived`, `interestAccepted`, and `matchFound` after API/mobile migration.  |
| P1       | Rewrite Hindi locale files after English Mentora flows stabilize.                                                                            |
| P1       | Replace copied launch/store docs with child/student AI tutoring disclosures.                                                                 |

## P7 Launch

| Status | Task                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------- |
| Todo   | Rewrite launch, Play Store, billing, privacy, and reviewer docs for children/student AI tutoring. |
| Todo   | Verify app store safety disclosures and child-data policy.                                        |
| Todo   | Run lint, typecheck, tests, migration validation, build, and smoke checks.                        |
