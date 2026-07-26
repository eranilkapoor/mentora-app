# Mentora Flow Plan

## Account Flows

Independent student:

```text
Register
  -> verify email/phone
  -> calculate age and policy
  -> create User with student role
  -> create StudentProfile with ownershipType self_managed
  -> accept terms, privacy, AI tutoring consent
  -> add academic record
  -> select subjects
  -> purchase plan or use free entitlement
  -> schedule AI session
```

Parent-managed child:

```text
Parent registers
  -> create ParentProfile
  -> add child StudentProfile
  -> optionally set studentEmail and studentPassword for child login
  -> create ParentStudentRelationship
  -> create ParentalControl
  -> add academic record and subjects
  -> purchase family/student plan
  -> schedule AI session
```

Child login later:

```text
Parent creates credentials during child profile creation
  -> child logs in with student credentials
  -> child can learn only as that StudentProfile
  -> parent retains controls, payments, schedule, history, and progress visibility

Parent also may send guardian invitation
  -> invited guardian accepts
  -> relationship permissions decide visibility and edit authority
```

Guardian link:

```text
Student or parent invites guardian
  -> guardian accepts
  -> create ParentStudentRelationship
  -> apply requested permissions and consent requirements
```

## Parent Navigation

```text
Dashboard
  -> child summary cards
  -> upcoming sessions
  -> progress summary
  -> pending approvals
  -> subscription usage
  -> recent activity

Children
  -> child profile
  -> personal details
  -> academic records
  -> parents and permissions
  -> address
  -> previous education
  -> exam scores
  -> course preference
  -> documents
  -> payments
  -> communication history
  -> activity timeline
  -> subjects
  -> schedule
  -> progress
  -> assessments
  -> parental controls

Payments
  -> plans
  -> subscriptions
  -> transactions
  -> receipts
  -> usage

Settings
  -> parent profile
  -> notifications
  -> security
  -> linked students
  -> privacy
```

## Student Navigation

```text
Home
  -> next class
  -> continue learning
  -> daily goal
  -> recommended topics

Learn
  -> my subjects
  -> AI tutor
  -> guarded start action
  -> practice
  -> assessments
  -> study materials

Schedule
  -> upcoming sessions
  -> calendar
  -> create session
  -> session history

Progress
  -> subject progress
  -> topic mastery
  -> assessment scores
  -> learning time
  -> recommendations

Profile
  -> personal details
  -> academic profile
  -> parents/guardians
  -> address
  -> education history
  -> exam scores
  -> course preference
  -> documents
  -> payments
  -> communication history
  -> activity timeline
  -> current institution
  -> settings
```

## AI Tutor Session

```text
Student opens schedule
  -> backend verifies active student
  -> backend verifies requesting user permission
  -> backend verifies scheduled time window
  -> backend verifies subscription/payment entitlement
  -> backend verifies subject enrollment
  -> backend verifies parental controls and daily limits
  -> backend blocks parallel active session for the same student
  -> backend builds minimal context: student age/profile goals, subject, schedule, entitlement, safety level
  -> AI tutor session starts
  -> messages are moderated and recorded
  -> unsafe messages create safety events or are blocked
  -> completion generates a parent-visible summary
  -> history, progress, and recommendations update downstream
```

## Assessment Flow

```text
Student opens Progress or Learn
  -> fetch available assessments
  -> start assessment attempt
  -> submit answers per question
  -> complete attempt
  -> result calculates score, pass/fail, strengths, and improvement areas
  -> topic progress and recommendations inform next learning action
```

## Scheduled Access Conditions

A scheduled AI session can start only when:

- Current time is inside the allowed session window.
- Student has an active entitlement.
- Subject is included in the entitlement.
- Parental controls permit access.
- Student account/profile is active.
- Session has not been cancelled.
- Usage limit is not exhausted.

## Parent Visibility

Parents should see:

- Session attendance.
- Learning summary.
- Topics covered.
- Assessment results.
- Usage and payment activity.
- Safety alerts.

Detailed AI chat visibility should depend on student age, consent, and relationship permissions.
