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

## MVP Collections

Identity:

```text
users
user_sessions
otp_requests
password_reset_tokens
login_attempts
device_tokens
```

Family and consent:

```text
student_profiles
parent_profiles
parent_student_relationships
student_invitations
guardian_invitations
consent_records
parental_controls
student_preferences
student_accessibility_profiles
student_addresses
student_documents
student_communication_history
student_activity_timeline
```

Geography and institutions:

```text
countries
states
cities
education_boards
universities
institutions
affiliations
accreditations
```

Academic:

```text
academic_levels
grades
streams
courses
specializations
academic_sessions
subjects
subject_topics
curriculums
curriculum_subjects
curriculum_topics
student_academic_records
student_previous_education
student_exam_scores
student_course_preferences
student_subject_enrollments
student_learning_goals
```

Scheduling:

```text
learning_schedules
schedule_recurrences
schedule_occurrences
session_attendance
session_reminders
```

AI tutor and learning content:

```text
ai_tutor_sessions
ai_tutor_messages
ai_session_contexts
ai_session_summaries
ai_usage_records
ai_model_configurations
knowledge_sources
knowledge_documents
knowledge_chunks
learning_units
learning_materials
prompt_templates
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
student_subject_progress
learning_activities
student_recommendations
student_daily_metrics
study_plans
```

Subscriptions and payments:

```text
learning_plans
learning_subscriptions
learning_entitlements
usage_counters
subscription_events
promotional_grants
coupons
coupon_redemptions
payment_orders
payment_transactions
payment_receipts
refunds
payment_webhook_events
```

Communication, safety, files, admin, and system:

```text
notifications
notification_preferences
communication_templates
communications
moderation_results
ai_safety_events
content_reports
age_policy_rules
documents
document_access_logs
support_tickets
support_messages
feedback
roles
permissions
role_permissions
user_roles
feature_flags
app_configurations
audit_logs
activity_logs
background_jobs
scheduled_jobs
webhook_events
system_errors
```

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
  -> ai_session_contexts
  -> ai_session_summaries
  -> ai_usage_records
  -> ai_safety_events

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
- `student_topic_progress.studentProfileId + subjectId + topicId` unique.

## Student Profile Data Shape

Use `student_profiles` for stable identity and status fields. Use child collections for repeating or sensitive sections:

```text
student_profiles
  personal identity, age policy, status, language, timezone, accessibility summary

student_academic_records
  current academic board, institution, grade/class, stream, course, session, subjects

parent_student_relationships
  parent/guardian links, permissions, consent, billing/safety authority

student_addresses
  country, state, city, timezone, optional street/postal details, address type

student_previous_education
  past institutions, board/university, grade/course, dates, result summary

student_exam_scores
  school exams, entrance exams, diagnostic assessments, marks, percentile, proof document

student_course_preferences
  subjects, courses, tutor mode, delivery mode, schedule windows, learning pace, target exams

student_documents
  identity, consent, report cards, certificates, assignments, homework, review status, access logs

payment_transactions + learning_entitlements
  payer, student beneficiary, plan, invoice, receipt, refund, usage counters

student_communication_history
  notifications, email/SMS/push logs, support messages, tutor messages, parent alerts

student_activity_timeline
  profile changes, schedule events, AI sessions, assessments, payments, safety events, admin actions
```

This separation keeps the profile complete without forcing every section into one large document, and it lets Mentora apply different retention, access, and audit rules per section.

## Age Policy

Do not infer adulthood from class or grade. Calculate age from date of birth and resolve policy by country:

```ts
const age = calculateAge(student.dateOfBirth);
const policy = await agePolicyService.resolve({ age, countryId: student.countryId });
```

Then decide whether independent registration, parent consent, payment approval, parental controls, and parent visibility are required.
