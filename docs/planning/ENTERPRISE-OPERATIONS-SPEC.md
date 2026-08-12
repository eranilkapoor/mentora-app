# Mentora Enterprise Operations Spec

This document describes the target operating model for the Education SaaS CRM. It is a product specification, not a statement that every item is already live in production.

## User Model

Platform users:

- Platform Super Admin
- Platform Admin
- Platform Operations Admin
- Platform Support Admin
- Platform Billing Admin
- Platform Compliance Admin

Organization users:

- Organization Owner
- Organization Admin
- Branch Admin
- Department Admin
- Team Manager
- Admission Manager
- Counselor
- Telecaller
- Marketing Executive
- Application Reviewer
- Document Verifier
- Finance User
- Academic User
- Support User
- Data Entry User

External users:

- Student
- Parent / Guardian
- Admission Partner
- Referral Partner
- Mentor / Teacher
- Vendor

## Access Model

Mentora separates:

- Permission: what the user can do.
- Data scope: which records the user can act on.

Data scopes:

- Self
- Team
- Child teams
- Department
- Branch
- Organization
- Platform

## Platform Foundation

Platform Super Admins manage:

- Organizations
- Platform plans
- Organization subscriptions
- Platform billing
- Global provider configuration readiness
- Feature availability
- Global security policies
- Audit logs
- Support escalation
- Platform dashboard and health

Organization admins must never be able to:

- View another organization's data
- Modify another organization's users
- Change platform plan pricing
- Modify platform super admins
- Disable global security
- View raw global provider secrets
- Access platform-wide billing

## Organization Operations

Each organization can manage:

- Branches
- Departments
- Teams
- Organization users
- Roles and permission assignments
- Branding
- Domains
- Channel settings
- CRM settings
- Admissions settings
- Security settings within organization scope
- Organization audit history

## Generic CRM

Target CRM functions:

- Leads
- Contacts
- Lead sources
- Lead stages
- Activities
- Notes
- Tasks
- Follow-ups
- Meetings
- Assignments
- Tags
- Custom fields
- Duplicate detection
- Imports and exports
- Communication timeline

## Education-Specific Modules

Target education functions:

- Students
- Academic sessions
- Programs
- Courses
- Specializations
- Application forms
- Student applications
- Document verification
- Admission workflows
- Interviews
- Offers
- Scholarships
- Enrollment
- Fees
- Learning plans
- Student portal

## Growth And Automation

Target growth functions:

- Email campaigns
- SMS campaigns
- WhatsApp campaigns
- Landing pages
- Workflow automation
- Lead scoring
- Marketing attribution
- Telephony
- Chatbots
- Analytics
- AI assistance

## Standard Module Behavior

Every production module should support:

- List with pagination, search, filters, and sorting
- Create
- View
- Edit
- Status change with confirmation
- Archive/restore where applicable
- Export where applicable
- Organization/branch scope enforcement
- Audit history for important changes
- Module-specific form fields and display labels
- Empty state with clear message
- No raw database IDs in user-facing tables when a display name is available

## Production Gate

Mentora is production-live only after:

- Code validation passes
- Staging smoke tests pass
- Provider callbacks are verified
- Secrets are configured outside source control
- Monitoring and backup drills are complete
- Legal/privacy/security review is signed off
