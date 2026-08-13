# Mentora Database Plan

Mentora uses MongoDB as the durable system of record and Redis/local cache for short-lived operational data.

Use a separate Mentora database:

```text
mentora
```

## Core Rule

```text
User = login identity
StudentProfile = academic and learning identity
ParentStudentRelationship = optional relationship and permissions
```

Do not make a parent mandatory in `student_profiles`.

Canonical profile storage:

- `users` stores authentication, CRM/app identity, roles, and account status.
- `student_profiles` stores the complete learner profile: personal, academic, parents, address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline.
- `parent_profiles` stores guardian billing, communication, emergency-contact, and parent preference data.
- The old source-app `profiles` collection is removed from Mentora code. Do not recreate it; use `student_profiles`, `parent_profiles`, and `users` instead.

## Implemented Collections

Identity:

```text
users
user_sessions
otp_requests
password_reset_tokens
login_attempts
device_tokens
user_memberships
```

CRM organization and IAM hierarchy:

```text
organizations
branches
departments
teams
organization_branding
channel_settings
```

`user_memberships` links a user to one organization and can optionally scope access to one or more branches, departments, and teams.

Family and consent:

```text
student_profiles
parent_profiles
parent_student_relationships
student_invitations
parental_controls
```

Geography and institutions:

```text
academic_boards
universities
institutions
academic_levels
grades
streams
courses
```

Academic:

```text
subjects
topics
curriculums
student_academic_records
student_subject_enrollments
```

Scheduling:

```text
learning_schedules
```

AI tutor and learning content:

```text
ai_tutor_sessions
ai_tutor_messages
```

Assessments and progress:

```text
question_banks
questions
assessments
assessment_attempts
assessment_answers
assessment_results
student_topic_progress
learning_recommendations
```

Subscriptions and payments:

```text
learning_entitlements
plans
features
plan_features
subscriptions
payments
payment_invoices
wallet_transactions
promotion_coupons
referral_rewards
```

Communication, safety, files, admin, and system:

```text
notifications
notification_templates
notification_logs
notification_device_tokens
support_tickets
roles
permissions
feature_flags
account_settings
privacy_settings
notification_settings
communication_settings
security_settings
localization_settings
accessibility_settings
media_settings
ai_settings
user_consents
analytics_events
analytics_daily_summaries
safety_events
classrooms
classroom_messages
classroom_files
tutor_profiles
tutor_availability
tutor_session_notes
activity_logs
admin_audit_logs
```

Planned later collections include dedicated student address/document/activity child collections, knowledge-base storage, AI usage records, student subject progress, study plans, live whiteboards, tutor payouts, webhook event archives, and dedicated moderation review queues. The current code stores complete student profile sections such as address, previous education, exam scores, course preference, documents, payments, communication history, and activity timeline directly on `student_profiles` as structured section fields.

## Main Relationships

```text
users
  -> user_sessions
  -> device_tokens
  -> parent_profiles
  -> student_profiles, when user is a student
  -> learning_subscriptions

student_profiles
  -> parent_student_relationships
  -> parental_controls
  -> student_addresses
  -> student_academic_records
  -> student_previous_education
  -> student_exam_scores
  -> student_course_preferences
  -> student_subject_enrollments
  -> student_documents
  -> learning_schedules
  -> ai_tutor_sessions
  -> assessment_attempts
  -> student_topic_progress
  -> learning_entitlements
  -> student_communication_history
  -> student_activity_timeline

learning_schedules
  -> ai_tutor_sessions

ai_tutor_sessions
  -> ai_tutor_messages
  -> safety_events

learning_subscriptions
  -> learning_entitlements
  -> usage_counters
  -> subscription_events
  -> payment_transactions
```

## Required Index Direction

- Unique sparse indexes on normalized email and phone in `users`.
- Unique `userId` on `parent_profiles`.
- `student_profiles.userId` index for independent student lookup.
- `student_profiles.createdByUserId + status` for parent-managed child lists.
- Unique `parentUserId + studentProfileId` in `parent_student_relationships`.
- `student_addresses.studentProfileId + type + isPrimary`.
- `student_documents.studentProfileId + type + status + uploadedAt`.
- `student_previous_education.studentProfileId + endDate`.
- `student_exam_scores.studentProfileId + examDate + subjectId`.
- `student_course_preferences.studentProfileId + status`.
- `learning_schedules.studentProfileId + startAt + status` for calendars.
- `learning_entitlements.studentProfileId + status + expiresAt` for access checks.
- `payment_transactions.studentProfileId + status + createdAt` for student payment history.
- `student_communication_history.studentProfileId + createdAt` for support/admin timelines.
- `student_activity_timeline.studentProfileId + occurredAt + eventType`.
- `ai_tutor_messages.sessionId + createdAt` for chat history.
- `question_banks.subjectId + topicId + status`.
- `questions.questionBankId + difficulty + status`.
- `assessments.subjectId + status + assessmentType`.
- `assessment_attempts.studentProfileId + createdAt`.
- Unique `assessment_answers.attemptId + questionId`.
- Unique `assessment_results.attemptId`.
- `student_topic_progress.studentProfileId + subjectId + topicId` unique.
- `learning_recommendations.studentProfileId + status + priority`.

## Student Profile Data Shape

Use `student_profiles` for stable identity, age policy, completion, and current full-profile sections:

```text
student_profiles
  personal identity, age policy, status, learning goals, profile completion, personal, academic, parents, address, previousEducation, examScores, coursePreference, documents, payments, communicationHistory, activityTimeline

student_academic_records
  current academic board, institution, grade/class, stream, course, session, subjects

parent_student_relationships
  parent/guardian links, permissions, consent, billing/safety authority

payment_transactions + learning_entitlements
  payer, student beneficiary, plan, invoice, receipt, refund, usage counters
```

As volume grows, move repeated or sensitive profile sections into child collections using the same section names. The API already exposes section-level updates, so this migration can happen without changing the mobile profile editor contract.

## Age Policy

Do not infer adulthood from class or grade. Calculate age from date of birth and resolve policy by country:

```ts
const age = calculateAge(student.dateOfBirth);
const policy = await agePolicyService.resolve({
  age,
  countryId: student.countryId,
});
```

Then decide whether independent registration, parent consent, payment approval, parental controls, and parent visibility are required.
