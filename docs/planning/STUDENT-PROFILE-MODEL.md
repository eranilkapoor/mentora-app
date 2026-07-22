# Mentora Student Profile Model

Mentora should treat the student profile as the complete learning CRM record for one learner. A `User` is only the login identity. A `StudentProfile` is the academic, family, billing, communication, document, and activity context used by AI tutor access, parent dashboards, support, admin, and reporting.

## Why This Is Required

This model helps Mentora because:

- Parents can manage multiple children without mixing learning history, payments, or restrictions.
- Independent students can own the same profile shape without requiring a parent.
- AI tutor sessions can load accurate academic context without exposing unnecessary billing or parent data.
- Support/admin teams can see the full student lifecycle in one place.
- Revenue leakage controls can be enforced per student profile, entitlement, schedule, and device.
- Compliance, child safety, audit, refunds, and account deletion have clear data boundaries.

## Profile Sections

| Section | Purpose | MVP Requirement |
| --- | --- | --- |
| Personal | Legal/display identity, DOB, age policy, language, accessibility basics, profile status | Required |
| Academic | Current board, grade/class, stream, institution, subjects, goals, learning level | Required |
| Parents | Parent/guardian links, permissions, relationship, consent, emergency/support contact | Required for parent-managed minors |
| Address | Country, state, city, timezone, optional full address for offline/in-person classes | Partial required |
| Previous Education | Previous schools, boards, grades, transitions, gaps, achievements | Optional for MVP, important for personalization |
| Exam Scores | Past exams, school tests, entrance tests, assessment attempts, marks, rank, percentile | Optional for MVP, required for progress analytics |
| Course Preference | Preferred subjects, courses, tutor mode, delivery mode, schedule preference, learning pace | Required |
| Documents | ID/KYC, parent consent, report cards, certificates, assignments, uploaded homework | Optional at signup, required when compliance or tutor review needs it |
| Payments | Plans, subscriptions, entitlements, invoices, receipts, refunds, usage counters | Required before paid access |
| Communication History | Notifications, emails, SMS, support messages, tutor messages, parent alerts | Required for audit/support |
| Activity Timeline | Registration, profile edits, schedule events, joins, AI sessions, assessments, payments, safety events | Required for audit/support |

## Section Details

### Personal

Recommended fields:

- `studentProfileId`
- `userId`, optional for parent-managed children without login
- `ownershipType`: `self_managed`, `parent_managed`, `jointly_managed`
- first name, last name, display name
- date of birth, age policy result, country
- gender, preferred language, timezone
- religion and caste, kept for future optional segmentation and localization needs
- accessibility needs and learning accommodations
- status: `draft`, `active`, `restricted`, `archived`, `deleted`

### Academic

Recommended fields:

- current education board
- current institution/school/college/university
- affiliation or accreditation
- academic level, class/grade, stream, course, specialization
- current academic session/year
- subjects and topics
- learning goals and target outcomes
- proficiency level and diagnostic level
- preferred curriculum

### Parents

Recommended fields:

- linked parent/guardian users
- relationship type: father, mother, guardian, sponsor, mentor
- primary guardian flag
- permission set: view progress, manage schedule, manage payments, manage controls, receive alerts
- consent status and consent version
- emergency/support contact details
- student login credential status when parent creates child login

### Address

Recommended fields:

- country, state, city
- timezone
- postal code
- optional street address
- address type: home, hostel, school, billing
- required only for offline/in-person classes, invoices, tax, or support operations

### Previous Education

Recommended fields:

- institution name
- board/university
- grade/class/course
- start and end dates
- result summary
- reason for transfer/change, optional
- achievements, certificates, awards

### Exam Scores

Recommended fields:

- exam name and exam type
- subject/topic
- date
- score, maximum score, percentage, grade, percentile, rank
- uploaded proof/report card reference
- source: manual, parent, tutor, school, assessment engine

### Course Preference

Recommended fields:

- preferred subjects/courses
- tutor type: AI, human, hybrid
- delivery mode: chat, audio, video, offline, in-person
- preferred days and time windows
- learning pace: guided, balanced, accelerated
- target exams or outcomes
- parent approval requirement

### Documents

Recommended fields:

- document type: ID, consent, report card, certificate, homework, assignment, disability/accommodation note
- file metadata and storage key
- owner student profile
- uploaded by user
- verification/review status
- retention policy and access logs

### Payments

Recommended fields:

- active plan and subscription
- student-specific entitlement
- AI tutor minutes, classroom sessions, subjects, device/session limits
- payment orders, transactions, receipts, invoices
- refund requests and refund status
- payer user and student beneficiary

### Communication History

Recommended fields:

- notification history
- email/SMS/push delivery logs
- support tickets and replies
- tutor messages and classroom messages
- parent alerts and safety notices
- communication preferences and quiet hours

### Activity Timeline

Recommended events:

- profile created/updated
- parent linked/unlinked
- consent accepted/revoked
- document uploaded/reviewed
- subject enrolled/removed
- schedule created/rescheduled/cancelled/joined/missed
- AI session started/completed/blocked
- assessment attempted/completed
- payment created/verified/refunded
- entitlement granted/expired/exhausted
- safety alert/report/admin action

## API Direction

Use section-based APIs so mobile screens can load and save independently:

```text
GET    /api/v1/students/:studentId/profile
PATCH  /api/v1/students/:studentId/profile/personal
PATCH  /api/v1/students/:studentId/profile/academic
GET    /api/v1/students/:studentId/parents
POST   /api/v1/students/:studentId/parents
PATCH  /api/v1/students/:studentId/address
GET    /api/v1/students/:studentId/previous-education
POST   /api/v1/students/:studentId/previous-education
GET    /api/v1/students/:studentId/exam-scores
POST   /api/v1/students/:studentId/exam-scores
GET    /api/v1/students/:studentId/course-preferences
PATCH  /api/v1/students/:studentId/course-preferences
GET    /api/v1/students/:studentId/documents
POST   /api/v1/students/:studentId/documents
GET    /api/v1/students/:studentId/payments
GET    /api/v1/students/:studentId/communications
GET    /api/v1/students/:studentId/activity-timeline
```

## Mobile Direction

Student profile should be a tabbed/detail experience:

```text
Overview
Personal
Academic
Parents
Address
Previous Education
Exam Scores
Course Preference
Documents
Payments
Communication History
Activity Timeline
```

Parent mode should show the same profile sections per child, but write access must follow relationship permissions and parental control policy.
