# Mentora CRM And App Role Operations

Last reviewed: 2026-08-08

This document defines what each user category can do across the Mentora CRM and apps. It is the product/technical reference for UI visibility, API authorization, RBAC configuration, and QA acceptance.

## Access Model

Mentora uses one `users` collection for all login identities.

CRM access is controlled by:

- System role on `users.roles` for platform users.
- Organization membership in `user_memberships` for organization users.
- Permission names on `users.permissions`.
- Data scope from the role catalog: `PLATFORM`, `ORGANIZATION`, `BRANCH`, `DEPARTMENT`, `TEAM`, or `SELF`.
- Active topbar context: organization and optional branch.

App access is controlled by:

- Student, parent, guardian, mentor, teacher, partner, or vendor role.
- Linked student/parent/guardian profile records.
- Learning entitlement, subscription, schedule, device/session, and parental-control checks.

## Platform Super Admin

Default context after login:

- Organization: `All organizations`
- Branch: `All branches`

The super admin can see all platform-wide modules immediately. Organization-owned work requires selecting a specific organization when creating or changing records. This prevents accidental writes into an undefined organization context.

| Module                               | Super admin operations                                                                                                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard                            | See platform KPIs, organization coverage, module readiness, scoped metrics, and system health metadata.                                                                                                               |
| Organizations                        | List, search, filter, sort, create, view, edit, activate, suspend/inactivate, export, configure domain metadata, configure branding metadata, configure channel settings, and audit setup.                            |
| Branches                             | Visible to super admin. Requires selecting an organization to list/create/edit/archive/restore/export.                                                                                                                |
| Departments                          | Visible to super admin. Requires selecting an organization to list/create/edit/archive/restore/export and optionally attach to branch.                                                                                |
| Teams                                | Visible to super admin. Requires selecting an organization to list/create/edit/archive/restore/export and optionally attach to department.                                                                            |
| Users                                | List all platform/organization users, search/filter/sort, create platform or organization users, view profile/access, edit role/scope/status, suspend/activate, revoke sessions, export access review.                |
| Roles                                | List/search/filter active/inactive roles, create, view permission mapping, edit, activate/inactivate. API delete is soft-disable, not physical delete.                                                                |
| Permissions                          | List/search/filter active/inactive permissions, create, view, edit, activate/inactivate. API delete is soft-disable, not physical delete.                                                                             |
| Security                             | Configure/review security policies, SSO/MFA/IP/masking/session/retention metadata, audit/security exports, provider readiness.                                                                                        |
| Integrations                         | List provider catalogue, configure sandbox/live metadata, run health checks, view missing credentials, distinguish demo-ready from live-ready.                                                                        |
| Leads                                | With selected organization: list/search/filter/sort/paginate, create, capture/import/export, deduplicate, merge, score, assign/transfer, change stage/status, tag, attach documents/voice metadata, timeline/actions. |
| Lead Sources                         | With selected organization: list/create/edit/archive/restore/export sources and assignment defaults.                                                                                                                  |
| Lead Stages                          | With selected organization: list/create/edit/archive/restore/export stages, order, SLA, mandatory fields, allowed transitions, conversion/lost flags.                                                                 |
| Applications                         | With selected organization: create/list/filter/edit/stage/review/decision/interview/offer/admission confirmation metadata/export/archive/restore.                                                                     |
| Admissions                           | With selected organization: create/list/edit/complete, allocate batch, fee/onboarding/LMS handoff metadata, archive/restore/export.                                                                                   |
| Scholarships                         | With selected organization: create/list/edit/evaluate/approve/reject, award amount/payment impact metadata, archive/restore/export.                                                                                   |
| Interviews                           | With selected organization: create/list/edit/schedule/complete, panel/result/score/offer recommendation, archive/restore/export.                                                                                      |
| Campaigns                            | With selected organization: create/list/edit, UTM/ROI/drip/audience metadata, metrics update, archive/restore/export.                                                                                                 |
| Communications, Email, SMS, WhatsApp | With selected organization: create/list/filter/edit, template/status/opt-in/provider metadata, complete/send-action metadata, archive/restore/export. Live delivery still requires provider credentials.              |
| Call Center                          | With selected organization: create/list/edit/complete calls, disposition, recording reference, queue/follow-up metadata, archive/restore/export.                                                                      |
| Tasks                                | With selected organization: create/list/board/filter/edit/comment/workflow/SLA/reassign/complete/archive/restore/export.                                                                                              |
| Documents                            | With selected organization: create/list/filter/edit/request/load/verify/OCR metadata/archive/restore/export.                                                                                                          |
| Programs                             | With selected organization: create/list/filter/edit/archive/restore/export programs used by admissions/course offerings.                                                                                              |
| Events                               | With selected organization: create/list/edit/attendance/QR/webinar metadata/complete/archive/restore/export.                                                                                                          |
| Field Force                          | With selected organization: create/list/edit/check-in/out/route/geo/mileage metadata/complete/archive/restore/export.                                                                                                 |
| Payments                             | View payment/admin payment metadata, refunds/reconciliation/payment-link actions where scoped API supports it; live gateway requires credentials/callback QA.                                                         |
| Finance                              | With selected organization: create/list/edit/reconcile/export finance ledger entries, tax/accounting metadata, archive/restore.                                                                                       |
| Reports                              | With selected organization: create/list/edit report definitions, run/export jobs, saved/scheduled/role-dashboard metadata.                                                                                            |
| Analytics                            | See platform and selected-organization analytics/funnels/ROI/productivity metadata.                                                                                                                                   |
| Workflows/Automation                 | With selected organization: create/list/edit/test/execute/retry workflow rules and executions; live provider actions require credentials.                                                                             |
| Notifications                        | View delivery logs/templates/analytics/dead-letter queue and replay metadata; live delivery requires provider credentials.                                                                                            |
| Support                              | List/filter/view/update support tickets across platform or selected organization depending API face.                                                                                                                  |
| Learning/Students                    | Can review learning/student APIs and records. Full institutional CRM student directory and admission-to-student timeline remain the main product-depth follow-up.                                                     |

## Platform Admin And Platform Operators

| Role                              | Scope    | Typical allowed operations                                                                                                                                                              |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform Admin                    | Platform | Same operational surface as super admin except owner-only destructive/platform policy actions if configured.                                                                            |
| Platform Support                  | Platform | View users, organizations, support tickets, security/session info, notifications, student safety records; update support/status notes; no billing/security policy ownership by default. |
| Platform Finance                  | Platform | View organizations, subscriptions, payments, finance ledgers, refunds, reconciliation, reports; update finance/payment statuses; no RBAC ownership by default.                          |
| KYC/Safety Reviewer               | Platform | View verification, documents, safety events, student/parent records; approve/reject verification/safety records; no organization setup by default.                                      |
| Content Moderator/Content Manager | Platform | View/moderate AI tutor content, learning catalog, safety queues, reports; manage academic/content records if permissions are granted.                                                   |
| Marketing Admin                   | Platform | View organizations, leads/campaign analytics, campaigns, communications, reports; configure marketing templates/providers if permissions are granted.                                   |

## Organization Users

Organization users are scoped through `user_memberships`. They cannot see other organizations.

| Role                                 | Default data scope | CRM modules                                                                                                                                                                                                             | Allowed operations                                                                                                                                                            |
| ------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization Admin                   | Organization       | Organization dashboard, users, branches, departments, teams, leads, sources/stages, applications, admissions, tasks, campaigns, communications, documents, programs, reports, workflows, integrations/security metadata | List/search/filter/sort/create/view/edit/archive/restore/export within their organization. Cannot create other organizations or platform-wide RBAC unless explicitly granted. |
| Branch Admin                         | Branch             | Branch dashboard, leads, applications, tasks, communications, documents, reports, programs                                                                                                                              | List/search/filter/create/view/edit/archive/restore/export within assigned branches. Cannot see unassigned branches.                                                          |
| Department Admin / Admission Manager | Department         | Leads view, applications, admissions, documents, interviews, scholarships, tasks, reports                                                                                                                               | Manage admission pipeline for assigned departments; limited lead update/assignment depending permissions.                                                                     |
| Team Manager / Sales Executive       | Team               | Leads, assignments, tasks, communications, reports                                                                                                                                                                      | Manage assigned/team leads, follow-ups, tasks, communication history, assignment queues.                                                                                      |
| Admission Counselor                  | Self               | Leads, tasks, applications view, documents view, communications                                                                                                                                                         | Create/update own leads, follow-ups, activities, calls/messages, start applications, view assigned applications/documents.                                                    |
| Marketing Executive                  | Department         | Campaigns, communications, lead view/export, reports/analytics                                                                                                                                                          | Create/edit campaigns, UTM metadata, audiences, templates and view lead/campaign performance within scope.                                                                    |
| Call Center Agent                    | Team               | Call center, leads view/update, communications, tasks                                                                                                                                                                   | Create/update calls, dispositions, notes, follow-ups, communication records for assigned queue/team.                                                                          |
| Finance User                         | Branch             | Payments, finance, reports, subscriptions view                                                                                                                                                                          | View/update scoped payments/ledger/reconciliation/refund metadata and finance reports.                                                                                        |
| Field Agent                          | Self               | Field force, leads view/update, tasks, communications                                                                                                                                                                   | Update own visits, check-ins, lead updates, tasks, call/message metadata.                                                                                                     |
| Mentor                               | Self               | Students view, schedules view, tasks, communications                                                                                                                                                                    | View assigned student/session data and update tutor notes/tasks where enabled.                                                                                                |

## External And App Users

These users use the mobile app/public website, not the admin CRM.

| Role                              | App operations                                                                                                                                                                                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student                           | Register/login if age/legal policy allows, complete onboarding, manage own profile, schedules, learning sessions, assessments, progress, documents, payments/subscriptions if eligible, AI tutor under entitlement and device limits.                          |
| Parent/Guardian                   | Register/login, add/manage children, set child credentials, parental controls, schedules, payments/subscriptions, view history/progress/safety alerts, approve restricted actions. Parents cannot consume a child learning session in parallel as the student. |
| Teacher/Learning Mentor           | Mobile companion access for assigned sessions, availability, notes, students, communications where enabled.                                                                                                                                                    |
| Admission Applicant               | Public/mobile application flows, documents, payment, status tracking where enabled.                                                                                                                                                                            |
| Partner/Referral/Franchise/Vendor | Modeled as external roles; onboarding/portal depth is future work unless a module is explicitly enabled.                                                                                                                                                       |

## Production Readiness Of Roles And Permissions

Roles and permissions are code-side ready for controlled MVP demos:

- Backend has create/list/get/update/soft-disable APIs.
- CRM has list/search/filter, one create action per module, view, edit, active/inactive status actions, and permission mapping for roles.
- Role updates validate permission IDs.
- Permission deletion now soft-disables records and blocks removal while assigned to active roles.
- Role deletion now soft-disables records and blocks removal while assigned to users.

Remaining production-hardening items:

- Add audit-log writes for RBAC create/update/disable actions.
- Add immutable/system-role protection for seeded core roles if product wants non-editable platform defaults.
- Add field-level permission policy screens if required for enterprise customers.
- Add E2E tests for super admin, organization admin, branch admin, counselor, finance, and support access.

## QA Rules

- Super admin must see Organizations, Users, Roles, Permissions, Security, Integrations, and hierarchy modules in all-organization context.
- Super admin must select a specific organization before creating or changing Branches, Departments, Teams, Leads, Applications, and other organization-owned records.
- Organization Admin must default to their assigned organization and `All branches`.
- Branch users must not see unassigned branches or records outside branch scope.
- Self-scoped users must only see records assigned to themselves.
- Every list must support server-backed pagination/search/filter/sort where the backend module supports it; fallback modules may provide generic CRUD only until promoted to dedicated modules.
