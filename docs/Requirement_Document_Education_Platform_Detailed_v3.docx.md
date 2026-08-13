

Software Requirement Specification

**Global Education Mentor-ship & Consultancy Platform**

*A Centralized Digital Ecosystem for Academic Consultancy, Mentor-ship & Research Guidance*

**Detailed Project Requirement Document**

Prepared For  
Client / Stakeholder Review

Revised On:   
02/07/2026

Document Version  
1.2(Detailed Edition)

**Content**

[1\. Executive Summary	4](#1.-executive-summary)

[2\. Project Overview	4](#2.-project-overview)

[3\. Business Objectives	5](#3.-business-objectives)

[4\. Target User Roles & Permissions	5](#heading)

[5\. Complete Business Workflow	7](#5.-complete-business-workflow)

[6\. System Architecture Overview	8](#6.-system-architecture-overview)

[6.1 Architectural Layers	8](#6.1-architectural-layers)

[7\. Public Website Requirements	9](#7.-public-website-requirements)

[7.1 Core Pages	9](#7.1-core-pages)

[7.2 Homepage Sections	10](#7.2-homepage-sections)

[8\. Services Offered by the Platform	10](#8.-services-offered-by-the-platform)

[8.1 Service Configuration Attributes	11](#8.1-service-configuration-attributes)

[9\. Module \- Wise Functional Requirements	11](#9.-module---wise-functional-requirements)

[9.1 Lead & Enquiry Management (CRM)	12](#9.1-lead-&-enquiry-management-\(crm\))

[9.2 Student Management	13](#9.2-student-management)

[9.3 Mentor Management	13](#9.3-mentor-management)

[9.4 Admin Dashboard	14](#9.4-admin-dashboard)

[9.5 Service & Course Management	14](#9.5-service-&-course-management)

[9.6 University Partner Management	14](#9.6-university-partner-management)

[9.7 Country Management	14](#9.7-country-management)

[9.8 Channel Partner Management	15](#9.8-channel-partner-management)

[9.9 Finance & Payment Management	15](#9.9-finance-&-payment-management)

[9.10 Document Management	15](#9.10-document-management)

[9.11 Ticket & Communication System	16](#9.11-ticket-&-communication-system)

[9.12 Study Material Module	16](#9.12-study-material-module)

[9.13 Content Management System (CMS)	16](#9.13-content-management-system-\(cms\))

[9.14 Reports & Analytics	17](#9.14-reports-&-analytics)

[9.15 AI Recommendation System	17](#9.15-ai-recommendation-system)

[10\. Student Dashboard Requirements	17](#10.-student-dashboard-requirements)

[11\. Mentor Dashboard Requirements	18](#11.-mentor-dashboard-requirements)

[11A. Mobile App Scope ( Android & IOS both )	18](#a.-mobile-app-scope-\(-android-&-ios-both-\))

[12\. Security & Access Control	20](#12.-security-&-access-control)

[13\. Non Functional & Technical Requirements	21](#13.-non-functional-&-technical-requirements)

[14\. Future Enhancements (Phase 2 & Beyond) \-  \< Proposed Value Additions \>	21](#14.-future-enhancements-\(phase-2-&-beyond\)---\<-proposed-value-additions-\>-out-of-scope-for-current-shared-pricing)

[15\. Assumptions & Dependencies	22](#15.-assumptions-&-dependencies)

[16\. Expected Project Deliverables	22](#16.-expected-project-deliverables)

[17\. Project Timeline & Milestones	23](#17.-project-timeline-&-milestones)

[18\. Resource Planning	23](#month-4-warranty-support)

[19\. Project Pricing & Cost Structure	24](#19.-project-pricing-&-cost-structure)

[20\. SignOff	25](#20.-sign-off)

# **1\. Executive Summary** {#1.-executive-summary}

**The Global Education Mentorship & Consultancy Platform** is a centralized, enterprise-grade digital system delivering complete academic guidance to students across India and internationally — connecting them with expert mentors for PhD guidance, thesis writing, research support, book publication, UG/PG consultancy, study abroad assistance, and honorary doctorate advisory services.

Most academic consultancy organizations today manage enquiries, documents, payments, and mentor coordination through a fragmented mix of spreadsheets, calls, and WhatsApp threads — resulting in delayed follow-ups, lost leads, and a poor experience for students and mentors alike. This platform replaces that fragmentation with a single, structured digital system covering the public-facing website, student dashboard, mentor panel, admin back-office, and all supporting modules including CRM, finance, document management, communication, AI recommendations, and reporting. It serves as the single source of truth for design, development, QA, and client sign-off.

# **2\. Project Overview** {#2.-project-overview}

The Global Education Mentorship & Consultancy Platform is a centralized, web-based system providing end-to-end academic consultancy and mentorship services for students across India and internationally. It digitizes the complete student journey — from first inquiry to service completion — while enabling administrators, mentors, counselors, channel partners, and university partners to collaborate within a single ecosystem.

The platform is not a LMS or a college-discovery portal. It is a purpose-built consultancy and service management system, fully focused on managing consultancy services, student applications, mentor assignments, document workflows, payments, communication, and academic progress from enquiry to service completion. The system is scalable, secure, responsive, role-based, and built for enterprise-level operations — structured across three integrated layers: a public marketing website, a transactional student/mentor portal, and an administrative control layer, all connected to a secure backend infrastructure as illustrated below.

![][image1]

*Figure 1: High Level System Architecture of the Global Education Mentorship & Consultancy Platform*

# **3\. Business Objectives** {#3.-business-objectives}

The objective of this platform is to digitalize and automate all operations of an education consultancy organization by eliminating manual processes and providing a unified platform for managing the complete consultancy lifecycle. Specifically, the platform is built to achieve the following outcomes:

| Objective | Business Impact |
| :---- | :---- |
| Centralize enquiry capture | No lead is lost; every enquiry is logged, owned, and tracked to closure |
| Automate lead to student conversion | Reduces manual data entry and followup delays |
| Standardize service delivery | Every student follows a consistent, track-able- workflow regardless of service type |
| Centralize mentor coordination | Mentors get a clear queue of work; admins get full visibility on workload |
| Digitize documents & approvals | Removes email based document chaos; full audit trail of approvals |
| Automate payments & invoicing | Faster collections, fewer manual errors |
| Unify communication | Email, SMS, and WhatsApp triggers replace manual followup calls |
| Enable partner-driven growth | Channel and university partners can be on-boarded and tracked formally |
| Provide realtime analytics | Management can make decisions based on live data, not guesswork |
|   |  |

# 

# **4\. Target User Roles & Permissions**

A platform serving students, mentors, internal staff, and external partners must enforce strict separation of responsibility. Each role listed below will have its own dedicated dashboard, its own navigation structure, and a permission set restricted strictly to the actions relevant to that role. This separation is not just a UI convenience \- it is a core security and data integrity requirement, since the platform will hold sensitive academic, identity, and financial information.

| Role | Primary Responsibility |
| :---- | :---- |
| Public Visitor | Browses services, universities, mentors, blogs; submits enquiries |
| Student | Enrolls in services, tracks progress, uploads documents, makes payments |
| Counsellor | Manages leads, follows up with prospects, converts enquiries to enrollments |
| Mentor | Reviews documents, guides research/thesis work, communicates with students |
| Admin | Manages day to day platform operations across all modules |
| Super Admin | Full system access including settings, roles, and configuration |
| Finance Team | Manages payments, invoices, financial analytics |
| Channel Partner | Refers students, tracks commissions and payouts |
| University Partner (Future Phase) | Manages university profile, courses, and partnership data |

Every role must operate strictly within Role Based Access Control (RBAC), ensuring users can only access data, modules, and actions relevant to their function. For example, a counsellor should be able to view and manage leads but should not have access to finance reports, mentor payout data, or system configuration settings; a mentor should only see the students assigned to them, never the full student database.

![][image2]

*Figure 2: Illustrative distribution of platform users across roles, based on a mature consultancy operation*

# **5\. Complete Business Workflow** {#5.-complete-business-workflow}

At the heart of the platform is a single, continuous workflow that takes a prospective student from their very first interaction with the brand through to a fully delivered, paid consultancy service. Every module described later in this document exists to support one or more stages of this workflow. Designing the system around this single workflow \- rather than as a collection of disconnected features \- ensures that no enquiry, document, payment, or task falls through the cracks.

![][image3]

*Figure 3: End to End Business Workflow from First Enquiry to Service Completion*

The detailed step by step flow is as follows:

1. The visitor lands on the website.

2. Visitor explores services, universities, countries, mentors, blogs, testimonials, and success stories.

3. Visitor submits an enquiry through the website.

4. Admin or counsellor receives the enquiry in the CRM.

5. The counselor follows up with the prospective student.

6. Students purchase a consultancy package.

7. Students are enrolled into the system.

8. Login credentials are generated automatically.

9. A mentor is assigned to the student.

10. Students upload required documents.

11. Mentor reviews and approves/rejects documents.

12. Service progresses through predefined workflow stages.

13. Students and mentors communicate through ticket-based chat.

14. Payments are collected (full payment or installments).

15. Progress is continuously updated and visible to the student.

16. Service is marked as completed.

17. Students submit feedback and ratings.

18. Reports and analytics are generated for management review.

Each of these eighteen steps maps directly to a screen, notification, or database transaction within the platform, ensuring full traceability of every student's journey at any point in time.

# **6\. System Architecture Overview** {#6.-system-architecture-overview}

The platform follows a layered, modular architecture so that each major function \- public marketing, transactional student/mentor work, internal administration, and the underlying data/integration layer \- can be developed, scaled, and maintained independently. This separation also allows the platform to evolve over time (for example, adding a mobile app or AI chatbot) without requiring a rebuild of existing modules.

## **6.1 Architectural Layers** {#6.1-architectural-layers}

| Layer | Purpose | Key Components |
| :---- | :---- | :---- |
| Presentation Layer | Public-facing marketing and lead generation | Website, SEO pages, enquiry forms, blogs |
| Application Layer (Student/Mentor) | Where consultancy work actually happens | Student portal, mentor portal, ticketing, documents |
| Application Layer (Admin) | Internal operations and control | Admin panel, CRM, finance, CMS, reports |
| Integration Layer | Connects to external services | Payment gateway, Email/SMS/WhatsApp APIs, AI engine |
| Data & Infrastructure Layer | Secure storage and processing | Database, file storage, authentication, backups |

This architecture is API-based and modular by design, meaning each layer communicates through well-defined APIs rather than tight, hard-coded dependencies. This is what enables the platform's stated goal of being scalable, multi-country, multi-currency, and future ready for the enhancements listed in Section 14\.

# **7\. Public Website Requirements** {#7.-public-website-requirements}

The public website is the platform's primary lead generation surface and the first impression a prospective student forms of the brand. It must be modern, SEO friendly, fully responsive, and designed with navigation and user experience similar to established educational platforms such as Shiksha, while focusing on consultancy services rather than course discovery. Every page on the public site should ultimately drive the visitor toward one of two actions: submitting an enquiry or starting a chat/call with a counsellor.

## **7.1 Core Pages** {#7.1-core-pages}

The following pages form the structural backbone of the public website. Each page must be independently manageable through the CMS described in Section 9.13, so that content updates do not require developer involvement.

* Home

* About Us

* Services

* Countries

* Universities

* Mentors

* Research Services

* Study Abroad

* Testimonials

* Success Stories

* Blogs

* FAQs

* Contact Us

* Enquiry Form

* Login / Register

## **7.2 Homepage Sections** {#7.2-homepage-sections}

The homepage in particular must be designed to convert visitors quickly, combining trust building content (testimonials, success stories) with clear navigation into services. The recommended section layout is as follows:

* Hero banner with primary call to action

* Search consultancy services

* Featured services

* Why choose us

* Our process (step by step visual)

* Featured universities

* Popular countries

* Featured mentors

* Student success stories

* Testimonials

* Latest blogs

* FAQs

* Contact form

* Call to action sections throughout

# **8\. Services Offered by the Platform** {#8.-services-offered-by-the-platform}

The platform's commercial core is its catalog of consultancy services. Rather than hard-coding these services into the platform, the system must allow administrators to create, edit, price, and retire services entirely through the admin panel \- treating the service catalog as configurable data rather than fixed code. The initial catalog includes, but is not limited to, the following services:

* PhD Admission Guidance

* PhD Consultancy

* Thesis Writing Assistance

* Research Proposal Development

* Synopsis Preparation

* Research Paper Writing

* Journal Publication Support

* Scopus / SCI Publication Support

* Book Writing Consultancy

* Book Publication Support

* Patent Assistance

* Plagiarism Checking

* Academic Profile Development

* UG Admission Consultancy

* PG Admission Consultancy

* Study Abroad Consultancy

* University Admission Assistance

* Scholarship Guidance

* Honorary Doctorate Advisory

* Visa & Documentation Guidance

* Research Mentorship

* Career Counselling

## **8.1 Service Configuration Attributes** {#8.1-service-configuration-attributes}

Every service in the catalog \- regardless of category \- must support the following configurable attributes, ensuring consistency across the platform while still allowing each service to have its own pricing, timeline, and document requirements:

| Attribute | Description |
| :---- | :---- |
| Description | Detailed service description shown on the public site |
| Pricing | Separate pricing configuration for India and international clients |
| Timeline | Expected delivery timeline for the service |
| Required Documents | Configurable document checklist per service |
| Workflow Stages | Custom, configurable progress stages |
| Assigned Mentors | Mentors eligible/assigned to deliver the service |
| FAQs | Service specific frequently asked questions |
| Media | Images, banners, and supporting media |
| Status | Active / Inactive toggle |

# **9\. Module \- Wise Functional Requirements** {#9.-module---wise-functional-requirements}

This section defines the detailed functional requirements for every module of the Admin Panel and supporting system. Each module listed below must be fully configurable through the admin interface without requiring developer intervention for routine operations. Together, these fifteen modules form the operational backbone described in the architecture diagram in Section 6\.

![][image4]

*Figure 4: Indicative core feature count across the major admin modules, reflecting relative configuration depth*

## **9.1 Lead & Enquiry Management (CRM)** {#9.1-lead-&-enquiry-management-(crm)}

The CRM is the entry point of the entire business workflow. Every visitor who submits an enquiry whether through the website, a phone call, or a walk in  must be captured as a lead with full traceability of source, ownership, and outcome. The objective of this module is to ensure that no enquiry is ever lost or left unattended, and that management can measure exactly how many leads convert into paying students.

* Capture website enquiries automatically into the CRM

* Manual enquiry creation by admin/counsellor

* Lead source tracking (page, country, service)

* Counsellor assignment to each lead

* Followup reminder system with notifications

* Call notes and interaction history logging

* Lead status management across a defined pipeline

* Lead to student enrollment conversion

* Lost lead tracking with reasons

* Excel export of lead data

* Advanced filters and search across all lead fields

| Lead Status | Meaning |
| :---- | :---- |
| New | Enquiry received, not yet contacted |
| Contacted | Initial outreach completed |
| FollowUp | Ongoing nurturing in progress |
| Interested | Genuine intent expressed |
| Documents Pending | Awaiting documents to proceed |
| Payment Pending | Service selected, payment awaited |
| Enrolled | Successfully converted to a student |
| Lost | Did not convert |
| Closed | Enquiry resolved without conversion |

## **9.2 Student Management** {#9.2-student-management}

Once a lead converts, the platform must maintain a complete, single source of truth for that student covering their personal details, services, documents, payments, and progress. This module is the record that every other module (mentor, finance, documents, tickets) reads from and writes to, so data consistency here is critical.

* Personal profile and contact information

* Country and education details

* Service(s) enrolled and package details

* Assigned mentor and assigned counsellor

* Document repository per student

* Payment history and installment tracking

* Application progress and stage tracking

* Activity timeline (all actions logged)

* Internal notes visible to staff

* Automatic login credential generation

* Bulk export of student records

## **9.3 Mentor Management** {#9.3-mentor-management}

Mentors are the delivery engine of the consultancy \- the quality of their work directly determines student satisfaction and renewal/referral rates. This module gives administrators visibility into mentor capacity, specialization, and performance, ensuring students are matched with the right expert and that no mentor is overloaded.

* Mentor profile: qualification, experience, specialization, research expertise, languages

* Availability and capacity configuration

* Student assignment and reassignment

* Workload monitoring across active students

* Document review and approval workflow

* Task assignment and tracking for each student

* Performance reports and student ratings

* Earnings and payout tracking

## **9.4 Admin Dashboard** {#9.4-admin-dashboard}

The Admin Dashboard is the command center for the entire organization \- a single screen that summarizes business health at a glance, so that leadership does not need to dig through individual modules to understand how the business is performing.

* Total students enrolled across all services

* New enquiries received (daily/weekly/monthly)

* Active applications in progress

* Revenue tracking (daily, monthly, yearly)

* Mentor and channel partner statistics

* Country wise student distribution

* Service wise enrollment analytics

* Pending administrative actions and approvals

* Conversion rate and student growth trends

## **9.5 Service & Course Management** {#9.5-service-&-course-management}

This module treats the service catalog described in Section 8 as fully editable configuration, allowing the business to launch new offerings, adjust pricing, or retire under performing services without any code changes.

* Add, edit, enable, or disable services

* Separate pricing for India and international clients

* Define service timelines and workflow stages

* Configure required document checklists per service

* Manage service specific FAQs and media

## **9.6 University Partner Management** {#9.6-university-partner-management}

For services such as study abroad consultancy and admission assistance, the platform must maintain authoritative, structured data on partner universities, which mentors and counsellors can reference when advising students.

* University details, country, rankings, and accreditation

* Course and scholarship information

* Upload and store agreements and MOUs

* Track student enrollments linked to each university

* Activate or deactivate partner universities

## **9.7 Country Management** {#9.7-country-management}

Country level data underpins study abroad guidance, visa advisory, and scholarship counselling, and must be centrally maintained so that all mentors and counsellors give consistent, up to date advice.

* Study requirements per country

* Visa information

* Scholarship opportunities

* Living cost estimates

* Admission process overview

* List of popular universities per country

## **9.8 Channel Partner Management** {#9.8-channel-partner-management}

Channel partners extend the platform's reach beyond direct marketing. This module formalizes partner on-boarding, referral tracking, and commission payout so that partner-driven growth is measurable and trustworthy for both the business and the partner.

* Channel partner self registration with admin approval workflow

* Referral submission and tracking

* Configurable commission structure / slabs

* Commission and payout tracking

* Partner performance reporting

* Partner earnings statements (downloadable)

## **9.9 Finance & Payment Management** {#9.9-finance-&-payment-management}

This module governs every rupee that moves through the platform \- from the first installment a student pays to the commission paid out to a channel partner. Accuracy, audit-ability, and GST compliance are nonnegotiable requirements for this module.

* Fee plan and installment configuration

* Multi-currency pricing support

* Payment gateway integration

* Payment tracking \- received and pending

* Automated invoice generation

* Financial exports and revenue analytics dashboard

* Automated payment reminder triggers

## **9.10 Document Management** {#9.10-document-management}

Academic consultancy is document heavy by nature \- degrees, marksheets, research papers, and identity proofs must all be collected, verified, and version controlled. This module replaces insecure email attachments with a structured, auditable document workflow.

* Student document categories: ID Proof, Passport, Degree Certificates, Mark sheets, Research Papers, Thesis, Publications, Supporting Documents

* Mentor/Admin ability to approve, reject, or request corrections

* Remarks and revision history on each document

* Document status visible to the student in real time

## **9.11 Ticket & Communication System** {#9.11-ticket-&-communication-system}

Clear, structured communication between students, mentors, and staff is essential to service quality. This module combines a formal ticketing system for tracked issues with automated multichannel notifications for routine updates.

* Ticket creation with categories and priority levels

* Mentor and admin replies within the ticket thread

* File attachments within tickets

* Ticket history and status tracking

* Integrated Email, SMS, and WhatsApp communication (API integration)

* Automated triggers for: welcome messages, payment reminders, document requests, stage updates, and completion notifications

* Centralized email template management

| Ticket Priority | Expected Response |
| :---- | :---- |
| Urgent | Within 2 business hours |
| High | Within 6 business hours |
| Normal | Within 24 business hours |
| Low | Within 48 business hours |

## **9.12 Study Material Module** {#9.12-study-material-module}

Beyond one to one mentorship, students benefit from a self-served resources library. This module gives mentors and admins a simple way to publish reusable templates and references to relevant students or services.

* PDF resources

* Video links and embedded video iframes

* Research templates

* SOP templates

* Thesis samples

* Downloadable resource library

## **9.13 Content Management System (CMS)** {#9.13-content-management-system-(cms)}

The CMS ensures the marketing and operations team can keep the public website current \- publishing new testimonials, updating service descriptions, or running a banner campaign \- without ever needing a developer.

* Homepage, About Us, and Services page content editing

* Banner and slider management

* Blog and FAQ management

* Testimonials and success stories management

* Mentor profile management on the public site

* Scheduled publishing of content

* SEO management: meta tags, robots.txt, canonical URLs, Google Search Console integration

## **9.14 Reports & Analytics** {#9.14-reports-&-analytics}

Every module above generates data; this module turns that data into decisions. Reports must be exportable and filterable so that management, finance, and operations teams can each pull the views relevant to them.

* Lead and conversion reports

* Student growth and country wise analysis

* Servicewise enrollment trends

* Mentor performance reports

* Revenue and payment reports

* Channel partner and university partner performance reports

* Export to Excel/PDF for all reports

## **9.15 AI Recommendation System** {#9.15-ai-recommendation-system}

The AI layer is designed to improve both conversion and guidance quality by proactively suggesting the right path for each student, reducing reliance on manual counsellor judgment alone and giving students a sense of personalized guidance from their very first interaction.

* Suitable university recommendations based on student profile

* Recommended countries based on preferences and eligibility

* Appropriate consultancy service recommendations

* Required document checklist suggestions

* Estimated timeline predictions

* Scholarship suggestions

* Admission eligibility guidance 

**Please note \> all the training data, business logics, recommendations logics etc and other material to train the AI will be given by the client only.**  

# **10\. Student Dashboard Requirements** {#10.-student-dashboard-requirements}

The student dashboard is the primary interface through which an enrolled student experiences the service they have paid for. It must be simple, transparent, and reassuring \- giving the student a clear sense of progress at every stage, without requiring them to chase staff for updates.

* Profile management and updates

* Application progress tracking

* Assigned mentor details

* Ticket based communications with mentor

* Document upload and status tracking

* Payment and invoice management

* Access to study material assets (PDF, video links, etc.)

* Notifications system

* Feedback and review submission

* View certificates (future phase)

# **11\. Mentor Dashboard Requirements** {#11.-mentor-dashboard-requirements}

The mentor dashboard is the mentor's daily workspace. It must surface exactly what needs the mentor's attention \- pending document reviews, open tickets, upcoming tasks \- so mentors can manage a growing caseload of students efficiently without administrative overhead.

* Dashboard with assigned students overview

* Student management and filtering

* Application stage tracking

* Document review and approval

* Ticket based communication with students

* Thesis and research review system

* Task assignment and tracking

* Calendar and availability management

* Earnings and payout tracking

11) # **A. Mobile App Scope ( Android & IOS both )** {#a.-mobile-app-scope-(-android-&-ios-both-)}

In addition to the web-based Student and Mentor portals, the platform scope includes dedicated mobile applications for both Students and Mentors on iOS and Android. These apps mirror the core functionality of the web portals in a mobile-optimized experience, ensuring students can track their progress and mentors can manage their work on the go — without being tied to a desktop browser. The app scope is defined below separately for each login role.

**Student App**

The Student mobile app provides enrolled students with a seamless, always-accessible interface to track their academic consultancy journey, communicate with their assigned mentor, upload documents, and stay updated on service progress — all from their smartphone.

* Login with secure credentials

* View personal profile and update details

* Track application / service progress stage by stage

* View assigned mentor profile and contact details

* Upload required documents from camera or device storage

* View document approval status (Approved / Rejected / Pending)

* Raise and track support tickets

* Receive push notifications for status updates, document requests, payment reminders, and messages

* View and download study materials (PDFs, video links, templates)

* Make payments and view the installment schedule

* Download invoices

* Submit feedback and ratings on service completion

* View notifications history

| Feature | Description | Priority |
| :---- | :---- | :---- |
| Secure Login | Email/password login with session management | Must Have |
| Progress Tracker | Visual stage-by-stage progress bar for enrolled service | Must Have |
| Document Upload | Upload documents from gallery or camera directly | Must Have |
| Push Notifications | Real-time alerts for updates, messages, and payments | Must Have |
| Payment & Invoices | View pending payments, pay online, download invoices | Must Have |
| Study Materials | Access PDFs, video links, templates assigned by mentor | Must Have |
| Profile Management | Update personal details and contact information | Must Have |
| Feedback & Ratings | Submit star rating and review on service completion | Should Have |

**Mentor App**

The Mentor mobile app gives mentors a lightweight but fully functional workspace to manage their assigned students, review and act on documents, communicate through tickets, and track their tasks and earnings — all without needing to log into the full web portal.

* Login with secure credentials

* View personal dashboard with assigned students summary

* Browse and filter assigned student list

* View individual student profiles and service details

* Track each student's application status progress

* Review uploaded documents and approve, reject, or request corrections with remarks

* Raise and respond to student tickets 

* Attach files to ticket messages

* Assign tasks to students and track task completion

* Receive push notifications for new documents, ticket messages, and task updates

* View earnings summary and payout history

* Manage availability status

| Feature | Description | Priority |
| :---- | :---- | :---- |
| Secure Login | Email/password login with session management | Must Have |
| Student Dashboard | Overview of all assigned students and their current stages | Must Have |
| Document Review | Approve, reject, or request corrections on student documents | Must Have |
| Ticket-Based Support | Reply to student tickets with text and file attachments | Must Have |
| Task Management | Assign tasks to students and mark completion | Must Have |
| Push Notifications | Alerts for new documents, messages, and task updates | Must Have |
| Earnings Tracker | View earnings summary and payout history | Must Have |
| Availability Toggle | Set availability status visible to admin | Should Have |
| Student Stage Update | Move student progress to next stage from app | Should Have |

# **12\. Security & Access Control** {#12.-security-&-access-control}

Because the platform stores sensitive personal, academic, and financial data for students across multiple countries, security cannot be an afterthought \- it must be designed into every layer of the system from day one. The following controls are mandatory baseline requirements:

| Control | Purpose |
| :---- | :---- |
| Role Based Access Control (RBAC) | Ensures users only access data and actions relevant to their role |
| Secure authentication with password encryption | Protects user credentials from compromise |
| Audit logs and activity logs | Provides a full trail of who did what, and when |
| Scheduled data backup | Protects against data loss |
| Secure session management | Prevents unauthorized session hijacking |
| Two Factor Authentication (future enhancement) | Adds a second layer of login security |
| GDPR / data privacy ready architecture | Prepares the platform for international students and regulations |

# **13\. Non Functional & Technical Requirements** {#13.-non-functional-&-technical-requirements}

Beyond individual features, the platform must satisfy a set of quality attributes that determine whether it will perform reliably as the business scales. These nonfunctional requirements are as critical to the project's success as the functional modules described in Section 9\.

* Fully responsive across desktop, tablet, and mobile devices

* Secure by design at every layer

* Horizontally and vertically scalable architecture

* Cloud ready deployment

* SEO friendly frontend

* API based, modular architecture for future extensibility

* High performance under concurrent load

* Multi role, multi country, and multi currency ready

# **14\. Future Enhancements (Phase 2 & Beyond) \-**  **\< Proposed Value Additions \> Out of scope for current shared pricing** {#14.-future-enhancements-(phase-2-&-beyond)---<-proposed-value-additions->-out-of-scope-for-current-shared-pricing}

The architecture described in Section 6 should be designed to support the following future integrations without requiring a rebuild. **These are out of scope for the initial release but should inform technical decisions made during this phase:**

* Video consultation and online meetings

* AI chatbot for instant query resolution

* Student community / forum

* Certificate generation

* Digital signatures

* LMS integration

* Third party CRM integrations

* Payment wallet

* Referral rewards program

* Advanced predictive analytics

* Multilanguage support

# **15\. Assumptions & Dependencies** {#15.-assumptions-&-dependencies}

The scope, timeline, and cost associated with this project are based on the following assumptions. Any change to these assumptions may require a corresponding change to scope, timeline, or cost, to be handled through a formal change request.

* Client will provide brand assets (logo, color palette, content) prior to UI/UX design signoff.

* Payment gateway, SMS, and WhatsApp API credentials will be provided/procured by the client.

* Hosting and domain infrastructure will be arranged by the client.

* Content for static pages (About Us, policies, etc.) will be provided by the client unless otherwise agreed.

* Any third party integration not listed in this document is considered out of scope unless formally added via change request.

* University and country reference data will be supplied or sourced and verified jointly with the client.

# **16\. Expected Project Deliverables** {#16.-expected-project-deliverables}

Upon completion of the requirement and design phase, the following documentation and artifacts will be delivered to the client alongside the working platform, ensuring full transparency and a clear basis for acceptance testing:

* Business Requirements Document (BRD)

* Functional Requirements Document (FRD)

* Scope Document

* User Roles & Permissions Matrix

* Module wise Functional Requirements (this document)

* Wireframe Suggestions

* Non Functional Requirements

* Assumptions & Dependencies

* Future Scope Document

* Project Timeline and Milestones

# **17\. Project Timeline & Milestones** {#17.-project-timeline-&-milestones}

The platform will be delivered over a 3-month (12-week) engagement ( after the BRD & UI signoff ), following design, development, and integration activities to run in parallel wherever possible \- maximising delivery speed without compromising quality. 

Month-Wise Phase Breakdown

| Month | Weeks | Phases Active | Key Deliverables |
| :---- | :---- | :---- | :---- |
| Initial Phase (Pre-Month 1\) | W0 (Pre-kickoff) | Initial Discovery & Requirement Deep-Dive, Stakeholder Alignment & Scope Lock, Wireframing & Low-Fidelity Prototyping, UI/UX Design (High-Fidelity Mockups), Design Review, Feedback & Final Sign-off | Finalised & signed-off requirement document, Approved low-fidelity wireframes, High-fidelity UI/UX designs for all 3 panels, Client sign-off on design before development begins |
| Month 1 | W1 – W4 | Discovery & Req. FinalisationUI/UX Design & PrototypingAdmin Panel Development (start) | Signed-off wireframes & design systemDatabase schemaAdmin panel foundation |
| Month 2 | W5 – W8 | Public Website DevelopmentAdmin Panel Development (cont.)Student & Mentor Portal DevPayment & API Integrations (start)AI Recommendation Engine (start) | Fully working public websiteAdmin panel completeStudent & Mentor portals live on stagingPayment gateway connected |
| Month 3 | W9 – W12 | Student & Mentor Portal Dev (final)Payment & API Integrations (complete)AI Engine (complete)Testing & QABug FixesDeployment & Handover | All integrations completeFull regression test passProduction deploymentClient training & documentation handover |
| Month 4**Warranty Support** | W13 – W16 | Warranty period for support for the ongoing issue after go live | Team will be available for supporting the changes bugs/enhancements/improvements for this period |

# **18\. Resource Planning**

Delivering a platform of this scale requires a dedicated, multi-disciplinary team working in parallel across design, development, integration, and quality assurance. The resource plan below defines the core team composition, each member's role and responsibility, and their active engagement period across the 12-week timeline as mentioned below:

Proposed Project Team

| Role | Responsibility | Bandwidth Allocation |
| :---- | :---- | :---- |
| Project Manager x 1 | Overall delivery ownership, client coordination, sprint planning, risk management, status reporting | Partial  |
| UI/UX Designer x 1 | Wireframes for all 3 panels, design system, interactive prototype, design review iterations | Partial |
| Senior Solution Architect x 1 | Define overall technical architecture, tech stack selection, API design standards, database schema, scalability planning, security architecture, and code review oversight | Partial |
| Frontend Developer(s) x 2\[Angular\] | Public website, Student Portal UI, Mentor Portal UI, Admin Panel front-end, responsive design | Full  |
| App Developer x 2\[Flutter\] | Design and develop cross-platform mobile app (iOS & Android) for Student and Mentor logins using Flutter, including all app screens, API integration, push notifications, App Store/Play Store deployment | Full  |
| Backend Developer(s) x 2\[Node JS with Postgres DB\] | Database architecture, REST APIs, CRM logic, workflow engine, role-based access, all admin modules | Full  |
| Manual QA tester x 1 | Functional, regression, security, and performance testing; test case writing and defect tracking | Full  |
| DevOps / Deployment Engineer x 1\[For AWS Infra\] | Cloud hosting setup, CI/CD pipeline, production deployment, backup configuration, go-live support | Partial  |

# **19\. Project Pricing & Cost Structure** {#19.-project-pricing-&-cost-structure}

The following outlines the complete cost structure for the Global Education Mentorship & Consultancy Platform. All pricing is fixed and transparent — there are no hidden charges beyond what is listed below. The one-time fee covers everything required to design, build, and deliver the platform. The monthly fee ensures the platform stays maintained, secure, and supported post-launch. Cloud infrastructure costs are billed directly by AWS and are separate from both of the above.

* **One-Time Development Cost \- ₹ 21,00,000**  \[Twenty One Lac Rupees Only\]

Covers complete delivery of the public website, student & mentor portals, admin panel, mobile app (iOS & Android using Flutter), payment gateway, Email/SMS/WhatsApp integrations, UI/UX design, testing, deployment, and documentation handover. **Also includes a one-time VAPT (Vulnerability Assessment and Penetration Testing)** for the backend apis and mobile apps \-ensuring the platform is security-audited before going live.

* The above cost doesn’t include any hosting/server/3rd party api charges and shall be subjected to charge as per actuals.

* All the charges mentioned here are exclusive of taxes.

| Website and Web Portal Development | 8.0 Lacs |
| :---- | :---- |
| Associative Backend Development | 5.0 Lacs |

| Mobile App Development | 5.0 Lacs |
| :---- | :---- |
| Associative Backend Development | 3.0 Lacs |

# **20\. Sign Off** {#20.-sign-off}

This document represents the complete and detailed requirement understanding for the Global Education Mentorship & Consultancy Platform as of the date below. Development will proceed on the basis of this scope; any additions or changes after sign off will be handled through a formal change request process.

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>