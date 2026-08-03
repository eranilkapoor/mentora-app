# Mentora

Mentora is a multi-oraganization Education CRM, Admissions, ERP, Student Engagement, and AI Learning SaaS platform for educational organizations, students, parents, counselors, administrators, mentors, and academic teams.

The platform combines institution-facing CRM and operational capabilities similar to modern enrollment platforms with direct-to-consumer student and parent learning applications.

Mentora supports both:

* **B2B and B2B2C education organizations**, including schools, colleges, universities, coaching institutes, EdTech companies, training centers, study-abroad consultants, and franchise education networks.
* **B2C students and families**, including independent students, parent-managed children, AI tutoring, assessments, subscriptions, academic profiles, and learning progress.

This repository is the primary Mentora product workspace and uses Mentora branding, environments, modules, data models, API contracts, and dedicated databases.

---

## Product Vision

Mentora is designed as an all-round education operating platform covering the complete lifecycle from enquiry to learning and long-term student engagement.

```text
Marketing and Lead Generation
        ↓
Education CRM
        ↓
Counseling and Follow-ups
        ↓
Application and Admission
        ↓
Payments and Enrollment
        ↓
Student and Parent Portal
        ↓
Academic and Learning Operations
        ↓
AI Tutor and Assessments
        ↓
Progress, Retention, and Engagement
```

The platform is not limited to a CRM, ERP, LMS, or AI tutor. It combines these capabilities through configurable modules that organizations can enable according to their requirements and subscription plan.

---

## Primary Product Areas

Mentora consists of the following major product areas:

1. Platform Administration
2. Multi-Organization SaaS Management
3. Education CRM
4. Marketing and Lead Management
5. Application and Admission Management
6. Student Information and Academic Management
7. Parent and Student Applications
8. AI Tutoring and Learning
9. Assessments and Progress Tracking
10. Payments, Fees, and Subscriptions
11. Communication and Campaigns
12. Workflow Automation
13. Reports and Analytics
14. Integrations and Developer APIs
15. Security, Audit, and Compliance

---

## Supported Organization Types

Mentora is intended to support:

* Universities
* Colleges
* Schools
* Coaching institutes
* Training centers
* EdTech companies
* Study-abroad consultants
* Competitive exam institutes
* Skill-development organizations
* Franchise education networks
* Online academies
* Independent mentors and learning providers

Each organization operates as an isolated oraganization with its own users, branches, teams, courses, leads, students, applications, workflows, branding, integrations, settings, and reports.

---

## Multi-Oraganization Architecture

Mentora uses a multi-organization SaaS model.

```text
Mentora Platform
├── Organization A
│   ├── Branches
│   ├── Departments
│   ├── Teams
│   ├── CRM Users
│   ├── Leads
│   ├── Applications
│   └── Students
│
├── Organization B
│   ├── Branches
│   ├── Departments
│   ├── Teams
│   ├── CRM Users
│   ├── Leads
│   ├── Applications
│   └── Students
│
└── Direct B2C Students and Parents
```

Oraganization-owned data must always be isolated by organization context.

Typical oraganization-aware entities include:

```text
organizationId
branchId
departmentId
teamId
ownerId
createdBy
updatedBy
```

Every oraganization-aware database query must enforce `organizationId` and the current user’s authorized data scope.

---

## User Types

Mentora supports platform, organization, operational, student, parent, partner, and mentor users.

### Platform Users

* Platform Super Admin
* Platform Admin
* Platform Support Agent
* Platform Billing Admin
* Platform Operations Admin
* Platform Content Admin
* Platform Compliance Admin

### Organization Users

* Organization Owner
* Organization Admin
* Branch Admin
* Department Admin
* Team Manager
* Admission Manager
* Admission Counselor
* Telecaller
* Marketing Executive
* Field Executive
* Application Reviewer
* Document Verifier
* Finance Executive
* Accountant
* Academic Administrator
* Support Executive
* Data Entry Operator
* Content Manager

### External and Learning Users

* Student
* Parent
* Guardian
* Mentor
* Teacher
* Admission Partner
* Referral Partner
* Franchise Partner
* Vendor

Access is controlled using role-based permissions and record-level data scopes.

```text
RBAC
Determines which actions a user may perform.

Data Scope
Determines which organization, branch, team, or assigned records the user may access.
```

Supported data scopes include:

```text
SELF
TEAM
DEPARTMENT
BRANCH
ORGANIZATION
PLATFORM
```

---

## Repository Layout

```text
mentora-app/
  mentora-api-server/
    NestJS API server for platform, CRM, ERP, learning, AI, billing, and integrations

  mentora-mobile-app/
    Expo React Native application for students, parents, counselors, mentors, and field users

  mentora-public-website/
    Next.js public website for branding, product pages, plans, support, legal pages, and lead capture

  mentora-admin-crm/
    Next.js CRM and administration portal for platform admins and education organizations

  packages/
    api-contract/
      Shared TypeScript API contracts, request models, response models, and enums

  docs/
    Product, technical, database, architecture, project management, launch, operations, and standards documentation

  README.md
    Repository entry point
```

Additional applications may be introduced later:

```text
mentora-student-web/
mentora-parent-web/
mentora-partner-portal/
mentora-super-admin/
mentora-analytics/
```

---

## Application Surfaces

### Mentora Admin CRM

The admin CRM serves platform and organization users.

Primary areas include:

* Dashboard
* Organizations
* Plans and subscriptions
* Users and access
* Branches
* Departments and teams
* Leads and contacts
* Tasks and follow-ups
* Applications
* Documents
* Interviews
* Offers
* Admissions
* Students
* Academic masters
* Courses and course offerings
* Campaigns
* Communications
* Payments and fees
* Workflows
* Reports
* Integrations
* Audit and security settings

### Mentora Mobile App

The mobile application supports role-based navigation.

Student navigation:

```text
Home
Learn
Schedule
Assessments
Progress
Profile
```

Parent navigation:

```text
Dashboard
Children
Schedules
Progress
Payments
Settings
```

Counselor navigation:

```text
Dashboard
My Leads
Follow-ups
Applications
Tasks
Notifications
```

Mentor navigation:

```text
Dashboard
Sessions
Students
Availability
Earnings
Profile
```

### Mentora Public Website

The public website includes:

* Product overview
* CRM and admissions pages
* AI tutor and learning pages
* Organization plans
* Student and family plans
* Demo and enquiry forms
* Contact and support
* Privacy policy
* Terms and conditions
* Child safety policies
* Community guidelines
* Account deletion
* Partner onboarding

---

## Core Platform Modules

### 1. Oraganization and Organization Management

* Organization registration
* Oraganization onboarding
* Organization profile
* Branding
* Subdomains and custom domains
* Subscription plan assignment
* Module enablement
* Usage limits
* Trial management
* Oraganization suspension and activation
* Multi-branch support
* Organization-level settings
* Oraganization-specific integrations
* Oraganization audit logs

### 2. Identity and Access Management

* Email and password login
* Phone and OTP login
* Google login
* Apple login
* Microsoft login
* Password reset
* Refresh token rotation
* Device sessions
* Multi-factor authentication
* Role-based access control
* Permission management
* Data-scope enforcement
* Field-level access
* User invitations
* Session revocation
* IP restrictions
* Login history
* Account lock and suspension

### 3. Organization Structure

* Branches
* Departments
* Teams
* Designations
* Reporting hierarchy
* User-manager relationships
* Team capacities
* Branch working hours
* Holiday calendars
* Geographic territories

---

## Education CRM Modules

### Leads

* Manual lead creation
* Website lead capture
* Landing-page forms
* Meta and Google lead integrations
* API lead creation
* Excel and CSV imports
* Duplicate detection
* Lead source tracking
* Campaign attribution
* UTM tracking
* Course and campus interest
* Lead stages
* Lead statuses
* Lead priorities
* Lead scoring
* Assignment and transfer
* Round-robin assignment
* Team and location-based assignment
* Counselor capacity rules
* Notes
* Tags
* Attachments
* Tasks
* Follow-ups
* Meetings
* Communication history
* Activity timeline
* Lost and disqualification reasons
* Lead conversion

### Contacts

A contact is a normalized person record that may have multiple enquiries, applications, or student records.

* Personal details
* Contact details
* Address
* Guardian information
* Communication preferences
* Enquiry history
* Application history
* Student links
* Tags
* Notes
* Custom fields

### Tasks and Follow-ups

* User-assigned tasks
* Team tasks
* Call follow-ups
* Counseling follow-ups
* Payment follow-ups
* Document reviews
* Meetings
* Recurring tasks
* Reminders
* Escalations
* Due and overdue tracking
* Task checklists
* Attachments
* Completion history

### Activities and Timeline

* Calls
* Emails
* SMS
* WhatsApp
* Meetings
* Notes
* Assignments
* Stage changes
* Documents
* Payments
* Application events
* Admission events
* Workflow events
* System-generated events

---

## Marketing and Communication Modules

### Lead Sources and Attribution

* Website
* Landing pages
* Organic
* Google Ads
* Meta Ads
* Social media
* Referral
* Partner
* Walk-in
* Call center
* Education fairs
* Imports
* APIs
* Offline campaigns

### Campaigns

* Email campaigns
* SMS campaigns
* WhatsApp campaigns
* Push campaigns
* Audience segments
* Saved filters
* Campaign scheduling
* Recurring campaigns
* Delivery tracking
* Open and click tracking
* Conversion tracking
* UTM generation
* Exclusion lists
* Unsubscribe management
* Campaign performance reports

### Communication Templates

* Email templates
* SMS templates
* WhatsApp templates
* Push notification templates
* In-app templates
* Multilingual templates
* Template variables
* Provider template mapping
* Approval status
* Versioning

### Telephony

Planned capabilities include:

* Incoming calls
* Outgoing calls
* Click-to-call
* Call recording
* Call dispositions
* Call notes
* Missed-call handling
* Agent analytics
* Telephony provider integrations

---

## Admissions Modules

### Academic Sessions

* Academic years
* Admission cycles
* Application windows
* Enrollment windows
* Session status

### Programs and Courses

* Programs
* Courses
* Specializations
* Academic levels
* Streams
* Departments
* Duration
* Credits
* Eligibility
* Course offerings
* Intake capacity
* Seat availability
* Fee structure linkage

### Application Form Builder

* Dynamic sections
* Dynamic fields
* Conditional fields
* Validation rules
* File uploads
* Parent information
* Academic history
* Declarations
* Signatures
* Payment fields
* Draft saving
* Form versioning
* Course-specific forms
* Application fees
* Submission windows
* Edit-after-submission rules

### Applications

* Draft applications
* Submitted applications
* Completion tracking
* Application numbers
* Course and campus selection
* Assigned counselor
* Assigned reviewer
* Stage management
* Correction requests
* Internal notes
* Document status
* Payment status
* Application history
* Approval
* Rejection
* Withdrawal
* Conversion to admission

### Documents

* Identity documents
* Address proof
* Mark sheets
* Certificates
* Entrance exam scores
* Photographs
* Signatures
* Transfer certificates
* Migration certificates
* Category certificates
* Custom document types
* Verification
* Rejection and re-upload
* Expiry tracking
* Signed storage URLs
* Access controls
* Audit history

### Interviews and Evaluations

* Interview scheduling
* Interview panels
* Online or offline mode
* Meeting links
* Evaluation templates
* Scoring criteria
* Weighted scores
* Recommendations
* Results
* Reminders
* Interview history

### Offers

* Offer generation
* Offer templates
* Offer letters
* Conditions
* Scholarships
* Discounts
* Acceptance deadlines
* Acceptance or rejection
* Offer expiry
* Payment linkage

### Admissions and Enrollment

* Admission numbers
* Admission confirmation
* Course allocation
* Batch and section
* Enrollment numbers
* Enrollment status
* Fee-plan assignment
* Scholarship assignment
* Student-profile generation

---

## Student and Parent Platform

Mentora supports direct student registration, parent-managed children, and organization-linked students.

### Account Models

```text
Independent Student
User account → Student profile

Parent-Managed Child
Parent user → One or more student profiles

Student with Separate Login
Parent relationship ↔ Student user → Student profile

Adult Student with Optional Guardian
Student user → Student profile → Optional guardian relationship
```

A parent is not mandatory for independent students.

Age policy, consent, and applicable legal rules determine whether parental approval is required.

### Student Profiles

* Personal details
* Contact details
* Address
* Date of birth
* Age category
* Current education
* Previous education
* Institution
* Board
* University
* Affiliation
* Course
* Grade
* Stream
* Specialization
* Subjects
* Learning goals
* Career goals
* Documents
* Assessments
* Learning history
* Payments
* Subscription
* Progress
* Recommendations

### Parent and Guardian Relationships

* Multiple children per parent
* Multiple guardians per student
* Primary guardian
* Billing guardian
* Emergency contact
* View permissions
* Edit permissions
* Schedule permissions
* Subscription permissions
* Payment permissions
* Progress visibility
* AI chat visibility
* Notification preferences
* Consent tracking
* Relationship revocation

### Parental Controls

* AI tutor access
* Live mentor access
* Community access
* External links
* Voice and image interaction
* Allowed subjects
* Blocked subjects
* Daily learning limit
* Weekly learning limit
* Allowed days
* Allowed hours
* Purchase approval
* Schedule approval
* Parent notifications
* Safety alerts
* Age-appropriate content rules

---

## AI Learning and Tutoring Modules

### Learning Schedules

Students and parents can schedule:

* AI tutoring
* Revision
* Practice sessions
* Assessments
* Homework
* Mentor sessions
* Live classes
* Academic events

A scheduled session may enforce:

* Start and end time
* Timezone
* Early-entry window
* Late-entry window
* Subject entitlement
* Active subscription
* Payment confirmation
* Parental approval
* Daily usage limit
* Safety policy

### AI Tutor Sessions

An AI tutor session is controlled by:

* Student profile
* Academic level
* Grade
* Board or university
* Curriculum
* Subject
* Topic
* Learning objective
* Proficiency
* Scheduled time
* Access entitlement
* Parental controls
* Safety context
* Subscription usage

Supported modes may include:

* Text tutoring
* Voice tutoring
* Mixed text and voice
* Doubt clearing
* Homework assistance
* Revision
* Exam preparation
* Guided assessment

### Knowledge and Curriculum

* Education boards
* Universities
* Institutions
* Academic levels
* Grades
* Streams
* Courses
* Subjects
* Chapters
* Topics
* Curriculums
* Learning units
* Study materials
* Question banks
* Approved knowledge sources
* Knowledge documents
* Searchable knowledge chunks
* Prompt templates
* Content review and publishing

### AI Safety

* Age-appropriate responses
* Input moderation
* Output moderation
* Unsafe-content blocking
* Prompt-injection detection
* Personal-data protection
* External-link restrictions
* Session termination rules
* Parent safety alerts
* Admin review queues
* Content reporting
* Safety-event history

---

## Assessments and Progress

### Assessments

* Diagnostic tests
* Topic quizzes
* Practice tests
* Homework
* Mock exams
* Revision tests
* Final assessments
* Fixed questions
* Random questions
* Adaptive questions
* Automatic evaluation
* AI-assisted evaluation
* Manual evaluation
* Time limits
* Attempts
* Marks
* Negative marking
* Result publishing

### Progress Tracking

* Subject progress
* Topic progress
* Proficiency score
* Mastery level
* Assessment averages
* Learning time
* Questions attempted
* Correct and incorrect answers
* Learning streaks
* Weak areas
* Strong areas
* Next-review dates
* Recommendations
* Study plans
* Daily and weekly metrics

### Parent Reports

* Learning time
* Attendance
* Completed sessions
* Session summaries
* Assessment results
* Strengths
* Weaknesses
* Recommendations
* Subscription usage
* Missed sessions
* Safety alerts

---

## ERP and Academic Operations

Mentora’s CRM and admissions foundation is being designed to extend into broader ERP capabilities.

Current and planned ERP modules include:

* Student information system
* Academic sessions
* Programs and courses
* Batches and sections
* Enrollment
* Attendance
* Timetables
* Examinations
* Grade books
* Assignments
* Certificates
* Fee management
* Scholarships
* Refunds
* Hostel
* Transport
* Library
* Inventory
* Procurement
* Staff management
* Payroll integrations
* Alumni management

The initial production scope prioritizes CRM, admissions, student management, payments, and learning before full institutional ERP expansion.

---

## Payments, Fees, and Subscriptions

Mentora contains separate billing domains.

### Platform SaaS Billing

Used by educational organizations.

* SaaS plans
* Monthly and annual billing
* User limits
* Lead limits
* Application limits
* Storage limits
* Communication limits
* Automation limits
* Trial periods
* Plan upgrades
* Plan downgrades
* Overage billing
* Oraganization invoices
* Subscription status

### Student and Family Billing

Used by students and parents.

* Individual learning plans
* Family plans
* Subject plans
* AI-minute plans
* Pay-per-session
* Assessment packages
* Mentor sessions
* Course purchases
* Coupons
* Promotional grants
* Usage counters
* Learning entitlements

### Institutional Fee Management

* Application fees
* Registration fees
* Admission fees
* Tuition fees
* Installments
* Scholarships
* Discounts
* Receipts
* Refunds
* Reconciliation
* Pending payments
* Payment reminders

---

## Workflow Automation

Mentora supports configurable workflows with:

```text
Trigger
Conditions
Actions
Delays
Branches
Approvals
Retries
Execution Logs
```

Example triggers:

* Lead created
* Lead stage changed
* Application submitted
* Document uploaded
* Document rejected
* Payment received
* Follow-up overdue
* Offer accepted
* Admission confirmed
* Subscription expiring
* Assessment completed

Example actions:

* Assign user
* Assign team
* Change stage
* Update field
* Add tag
* Create task
* Send email
* Send SMS
* Send WhatsApp
* Send push notification
* Request approval
* Delay execution
* Call webhook
* Escalate to manager

---

## Reports and Analytics

### Platform Reports

* Organizations
* Active subscriptions
* Trials
* SaaS revenue
* Oraganization usage
* User growth
* Storage usage
* API usage
* Failed integrations
* Support tickets

### Organization Reports

* Leads
* Lead sources
* Campaigns
* Conversion funnels
* Counselor performance
* Applications
* Offers
* Admissions
* Student enrollment
* Payments
* Fee collection
* Branch performance
* Course performance
* Team productivity

### Learning Reports

* AI sessions
* AI usage
* Learning minutes
* Subject progress
* Topic mastery
* Assessment scores
* Student retention
* Learning streaks
* Parent engagement
* Subscription usage

---

## Integrations

Mentora is designed to support integrations for:

* Meta Lead Ads
* Google Ads
* Google Analytics
* WhatsApp Cloud API
* SMS providers
* Email providers
* Cloud telephony
* Razorpay
* Cashfree
* Stripe
* Google Play Billing
* Apple In-App Purchases
* Google Calendar
* Microsoft Calendar
* Zoom
* Google Meet
* LMS platforms
* ERP platforms
* Student information systems
* Webhooks
* Public APIs
* SSO providers

Integration credentials must be encrypted and scoped to the owning organization.

---

## Core Domain Model

```text
Organization
  Oraganization that owns branches, users, CRM data, academic configuration, integrations, and reporting.

User
  Login identity for platform staff, organization staff, students, parents, mentors, partners, or support users.

Role
  Collection of permissions assigned to users.

DataScope
  Defines which records a user may access within the platform or organization.

Lead
  Education enquiry tracked through source, assignment, communication, follow-ups, and conversion.

Contact
  Normalized person record that may have multiple enquiries or applications.

Application
  Versioned admission application connected to a course offering, applicant, documents, payments, and workflow.

Admission
  Confirmed enrollment created after successful application and payment processing.

StudentProfile
  Academic and learning identity for an independent student or parent-managed child.

ParentStudentRelationship
  Optional parent or guardian relationship with granular permissions and consent.

CourseOffering
  Combination of academic session, campus, course, intake, seats, eligibility, fees, and application form.

LearningSchedule
  Scheduled AI tutoring, revision, assessment, mentor session, live class, or event.

LearningEntitlement
  Explicit permission to access a subject, AI minutes, session, assessment, course, or learning material.

AiTutorSession
  Controlled AI teaching session linked to student, subject, curriculum, schedule, entitlement, usage, and safety.

Assessment
  Diagnostic, practice, quiz, homework, mock exam, or final evaluation.

Workflow
  Configurable automation consisting of triggers, conditions, actions, delays, and execution logs.
```

---

## Backend Module Map

The NestJS API is organized as a modular monolith.

```text
src/modules/
├── auth/
├── users/
├── sessions/
├── roles/
├── permissions/
├── organizations/
├── plans/
├── subscriptions/
├── branches/
├── departments/
├── teams/
├── leads/
├── contacts/
├── activities/
├── tasks/
├── follow-ups/
├── campaigns/
├── communications/
├── academic-sessions/
├── programs/
├── courses/
├── course-offerings/
├── application-forms/
├── applications/
├── documents/
├── interviews/
├── offers/
├── admissions/
├── students/
├── parents/
├── parental-controls/
├── learning-schedules/
├── subjects/
├── curriculums/
├── learning-content/
├── ai-tutor/
├── assessments/
├── progress/
├── payments/
├── fees/
├── workflows/
├── reports/
├── integrations/
├── notifications/
├── support/
├── safety/
├── audit/
└── settings/
```

The platform should remain a modular monolith until scale, deployment independence, or operational requirements justify extracting individual services.

---

## Data Storage

Mentora uses different infrastructure components according to workload.

### MongoDB

Used for:

* Organizations
* Users
* CRM
* Leads
* Applications
* Students
* Academic configuration
* Forms
* Workflows
* Communications
* AI sessions
* Assessments
* Progress
* Settings

### Redis

Used for:

* Sessions
* OTP
* Rate limiting
* Cache
* Distributed locks
* Assignment counters
* BullMQ queues
* Temporary workflow state
* Socket.IO scaling

### AWS S3 or Compatible Storage

Used for:

* Student documents
* Application documents
* Academic certificates
* Offer letters
* Receipts
* Learning materials
* AI-session attachments
* Import files
* Export files
* Organization branding

### Search and Analytics

Planned options include:

* OpenSearch for full-text and faceted search
* PostgreSQL or ClickHouse for analytical workloads
* CloudWatch and Sentry for monitoring and errors

---

## Shared Platform Capabilities

The following modules originated from reusable platform foundations and remain valid across Mentora products:

* Authentication
* Sessions
* RBAC
* User management
* Notifications
* File storage
* Payments
* Subscriptions
* Chat and real-time infrastructure
* Settings
* Audit logs
* API responses
* Error handling
* Logging
* Redis
* Queues
* Analytics foundations
* Support
* Mobile navigation
* Admin UI components

All reused code must follow Mentora terminology and must not retain unrelated product-specific assumptions.

---

## Documentation

* [Technical Plan](docs/planning/TECHNICAL-PLAN.md): architecture, module boundaries, API surfaces, tenancy, deployment, and migration strategy.
* [Database Plan](docs/planning/DATABASE-PLAN.md): MongoDB collections for platform, organizations, CRM, admissions, students, academics, AI learning, payments, safety, and reporting.
* [Project Plan](docs/planning/PROJECT-PLAN.md): product vision, scope, MVP, phases, assumptions, and non-goals.
* [Project Management Pack](docs/project-management/README.md): charter, scope, requirements, WBS, schedule, cost, quality, resources, communications, risks, procurement, changes, and release acceptance.
* [Production Readiness Audit](docs/launch/PRODUCTION-READINESS-AUDIT.md): verified checks, readiness status, launch gates, and production gaps.
* [Student Profile Model](docs/planning/STUDENT-PROFILE-MODEL.md): complete student, academic, parent, document, payment, communication, and learning profile model.
* [Education CRM Platform Plan](docs/planning/EDUCATION-CRM-PLATFORM-PLAN.md): oraganization administration, CRM, admissions, campaigns, payments, automation, analytics, and ERP expansion.
* [Task Roadmap](docs/planning/TASK-ROADMAP.md): phased implementation roadmap.
* [Flow Plan](docs/planning/FLOW-PLAN.md): platform admin, organization, counselor, parent, and student journeys.
* [Commands](docs/operations/COMMANDS.md): local development, validation, database, deployment, and maintenance commands.
* [Coding Standard](docs/standards/CODING-STANDARD.md): engineering conventions and review requirements.

---

## Current Verification Snapshot

Last checked locally on 2026-07-29:

* API server: lint and production build pass.
* Admin CRM: typecheck, lint, and production build pass.
* Public website: typecheck, lint, and production build pass.
* Mobile app: typecheck, lint, and English/Hindi i18n key validation pass.

Current production verdict:

The codebase is build-clean and suitable for continued development, product demonstrations, and controlled MVP pilots. It is not production-live until production credentials, infrastructure, legal review, security review, end-to-end testing, device testing, monitoring, backups, disaster recovery, provider verification, and launch runbooks are completed.

See the [Production Readiness Audit](docs/launch/PRODUCTION-READINESS-AUDIT.md).

---

## Quick Start

### Prerequisites

* Node.js 20 or later
* npm 10 or later
* MongoDB
* Redis for production caching, queues, and Socket.IO scaling
* Expo tooling for mobile development
* Provider accounts as required for:

  * Google, Facebook, Apple, or Microsoft authentication
  * Firebase Cloud Messaging
  * Email
  * SMS
  * WhatsApp
  * Telephony
  * Razorpay, Cashfree, Stripe, Google Play, or Apple billing
  * AWS S3
  * Monitoring and logging
  * AI model providers

### Install Dependencies

```bash
cd mentora-api-server
npm install

cd ../mentora-mobile-app
npm install

cd ../mentora-public-website
npm install

cd ../mentora-admin-crm
npm install
```

---

## Backend Environment

The API server loads environment files in this order:

```text
.env.${NODE_ENV}
.env
```

Create or update:

```text
mentora-api-server/.env.development
mentora-api-server/.env.staging
mentora-api-server/.env.production
mentora-api-server/.env.example
```

Important values:

```text
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/mentora
REDIS_URL=redis://localhost:6379

JWT_ISSUER=mentora-api
JWT_AUDIENCE=mentora-clients

API_BASE_URL=http://localhost:3000
APP_WEB_URL=http://localhost:3000
ADMIN_WEB_URL=http://localhost:3001
PUBLIC_WEB_URL=http://localhost:3002
```

Use a dedicated Mentora database and do not mix Mentora data with unrelated product databases.

---

## Mobile Environment

The Expo app uses `EXPO_PUBLIC_*` variables.

```text
mentora-mobile-app/.env.development
mentora-mobile-app/.env.example
```

Important values:

```text
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_PATH=/api/v1
EXPO_PUBLIC_CLIENT_VERSION=1.0.0
```

Role-based mobile navigation is determined by the authenticated user’s roles, active organization, linked student profile, permissions, and feature entitlements.

---

## Running Locally

### API Server

```bash
cd mentora-api-server
npm run start:dev
```

Default local API:

```text
http://localhost:3000/api/v1
```

Swagger in non-production:

```text
http://localhost:3000/api/docs
```

### Mobile App

```bash
cd mentora-mobile-app
npm run start
```

Platform shortcuts:

```bash
npm run ios
npm run android
npm run web
```

### Admin CRM

```bash
cd mentora-admin-crm
npm run dev
```

### Public Website

```bash
cd mentora-public-website
npm run dev
```

---

## Repository Commands

Run from the repository root:

```bash
npm run lint
npm run typecheck:api
npm run typecheck:mobile
npm run build:api
npm run test:api
npm run test:mobile
```

Additional scripts should be added for:

```text
typecheck:admin
typecheck:website
build:admin
build:website
test:admin
test:e2e
test:contracts
openapi:generate
db:seed
db:migrate
```

---

## Current Implementation Status

### Completed Foundations

* Established the standalone Mentora repository.
* Renamed top-level applications to Mentora-specific names.
* Updated root package scripts and application metadata.
* Updated mobile bundle identifiers and environment naming.
* Added Mentora architecture, product, database, flow, launch, and roadmap documentation.
* Added multi-oraganization organization foundations.
* Added organization, branch, campus, department, and team concepts.
* Added user, role, permission, session, and audit foundations.
* Added CRM modules for leads, contacts, assignments, activities, tasks, and follow-ups.
* Added application, admission, document, interview, and offer foundations.
* Added academic master modules for sessions, programs, courses, subjects, and course offerings.
* Added communication, campaign, workflow, integration, payment, and reporting foundations.
* Added student, parent, relationship, parental-control, and consent foundations.
* Added learning schedules, entitlements, AI tutor sessions, classrooms, tutors, and safety events.
* Added AI tutor context, moderation logging, session summaries, AI history, and parent-visible progress.
* Added assessment and progress APIs for question banks, questions, assessments, attempts, answers, results, topic progress, recommendations, and parent dashboards.
* Updated mobile navigation toward role-based student and parent learning experiences.
* Added mobile account switching for parents and linked students.
* Added AI tutor start actions, recommendations, assessments, and progress service contracts.
* Updated onboarding and profile editing for students, parents, and organization-linked learners.
* Added `mentora-public-website` with product, plans, support, privacy, terms, account deletion, and community-guideline pages.
* Added `mentora-admin-crm` with platform administration, organizations, users, RBAC, leads, applications, admissions, communications, payments, reports, workflows, integrations, and security-policy foundations.

### Current Priorities

* Complete oraganization isolation and data-scope enforcement across all oraganization-owned repositories and services.
* Complete platform Super Admin and organization Admin user journeys.
* Complete lead assignment, follow-up, activity timeline, and application conversion flows.
* Complete configurable academic masters, application forms, stages, and workflows.
* Complete student, parent, counselor, and reviewer role-based navigation.
* Regenerate and review the OpenAPI contract from a running API.
* Connect AI tutor placeholders to the selected model provider.
* Add provider-level moderation and curriculum-based retrieval.
* Complete organization SaaS billing and student/family learning billing.
* Complete production communication providers for email, SMS, WhatsApp, and push.
* Add comprehensive seed data for organizations, roles, permissions, lead stages, academic levels, courses, subjects, and workflows.
* Complete API, CRM, mobile, and public-website end-to-end testing.
* Complete production monitoring, backups, restore testing, security review, legal review, and deployment runbooks.

### Planned Expansion

* Telephony and call-center operations
* Advanced campaign attribution
* Visual workflow builder
* Full student information system
* Attendance
* Timetables
* Examinations
* Grade books
* Certificates
* Hostel
* Transport
* Library
* Inventory
* Procurement
* Partner and commission management
* Data warehouse
* Predictive analytics
* Advanced AI recommendations
* Voice tutor
* Live mentor marketplace
* Multi-board and multi-country curriculum support

---

## Development Principles

### Oraganization Isolation

Every oraganization-owned record must contain `organizationId`, and all reads and writes must validate organization access.

### Permission-Based Authorization

Use permissions instead of hardcoded role-name checks.

```text
lead.read
lead.assign
application.review
application.approve
payment.refund
student.update
report.export
organization.manage
```

### Configurable Organization Data

Do not hardcode organization-specific values into enums where organizations may require customization.

Configurable entities include:

* Lead stages
* Application stages
* Admission stages
* Lead sources
* Lost reasons
* Courses
* Custom fields
* Document requirements
* Communication templates
* Assignment rules
* Approval workflows
* Number formats

### Auditability

Important business and security actions must be recorded with:

```text
actor
organization
action
entity
previous value
new value
request ID
IP address
device
timestamp
```

### Modular Architecture

Business modules must remain independently testable and avoid hidden circular dependencies.

### Privacy and Safety

Student, parent, applicant, and payment data must follow least-privilege access, secure file handling, data masking, consent management, and audit requirements.

---

## Product Scope Strategy

Mentora is being developed in phases.

### Phase 1: SaaS and CRM Foundation

* Organizations
* Users
* Roles and permissions
* Branches
* Teams
* Leads
* Tasks
* Follow-ups
* Applications
* Documents
* Payments
* Reports

### Phase 2: Admissions and Communication

* Form builder
* Application workflow
* Interviews
* Offers
* Admissions
* Email
* SMS
* WhatsApp
* Campaigns
* Automation

### Phase 3: Student, Parent, and Learning

* Student profiles
* Parent relationships
* Academic history
* Subjects
* Schedules
* Subscriptions
* AI tutoring
* Assessments
* Progress

### Phase 4: ERP and Enterprise

* Attendance
* Timetables
* Examinations
* Fees
* Hostel
* Transport
* Library
* SSO
* Data warehouse
* Advanced integrations
* Enterprise compliance

---

## License

This project is proprietary and confidential.

All source code, product documentation, designs, schemas, workflows, prompts, business logic, and associated intellectual property are owned by Mentora and Webnza! Infotech unless otherwise stated.

Unauthorized copying, distribution, modification, publication, sublicensing, or commercial use is prohibited.

Copyright © 2026 Mentora. All rights reserved.