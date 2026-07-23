# Google Play Console Submission Guide - Mentora

Last reviewed against repository behavior: 2026-07-23

Use this worksheet for closed testing and the first production submission. Every declaration must match the exact Android App Bundle being submitted.

## 1. App Setup

| Play Console field | Recommended value |
| --- | --- |
| App name | Mentora |
| Default language | English (India) or the primary listing language |
| App or game | App |
| Free or paid | Free; subscriptions are sold as in-app products |
| Package name | `com.webnza.mentora` |
| Category | Education |
| Tags | Education, Tutoring, AI Learning, Study Help, Parent Tools where Play offers them |
| Developer name | Must exactly match the verified Play developer profile |
| Contact email | `support@webnza.com` |
| Website | `https://www.webnza.com` |
| Contact phone | Business input required: use a monitored support number |

Do not claim guaranteed marks, guaranteed admissions, government approval, medical/mental-health outcomes, or fully human supervision unless those claims are operationally true and supportable.

## 2. App Content Declarations

### Privacy Policy

Enter:

```text
https://mentora.webnza.com/privacy-policy
```

Before submission, confirm HTTP 200 without login, readable mobile layout, and matching developer/entity details.

### Account Deletion

Enter:

```text
https://mentora.webnza.com/account-deletion
```

The public page and in-app account deletion flow must clearly explain retained billing, fraud, safety, audit, and legal records.

### App Access / Sign-In Details

Select **All or some functionality is restricted** and provide reviewer credentials.

Recommended reviewer notes:

```text
1. Open Mentora and tap Log in.
2. Choose Email and Password.
3. Enter the supplied reviewer credentials.
4. The reviewer account has completed onboarding, has at least one student profile, and has an active learning subscription/entitlement.
5. No OTP, invitation, payment, or external device is required for review.
6. To test AI tutor access: open Learn or Schedule and use the available scheduled session.
7. To test account deletion: Settings > Account Settings > Delete Account.
8. To test safety: open a chat/session/support surface and use report/block where available.
```

Never give Google an employee/admin account. Test the reviewer credentials in the exact release build immediately before submission.

### Ads

Recommended answer: **No, my app does not contain ads.**

Change this before adding ad SDKs, banners, interstitials, rewarded ads, or advertising ID usage.

### Content Rating

Complete the IARC questionnaire truthfully.

Recommended interpretation:

- App type: education, communication, or other non-game app.
- Users can create profile text, upload media/documents, chat, and contact support: **Yes, UGC and user interaction are present.**
- AI tutoring / educational assistance theme: **Yes.**
- Intended explicit sexual content, nudity, violence, drugs, gambling, or profanity supplied by Mentora: **No.**
- Unrestricted web browser: **No.**
- Location: only regional/timezone/curriculum support if enabled; no live-location broadcast.
- Digital subscriptions: **Yes.**

### Target Audience

Mentora supports students and parent-managed learners. Before selecting child age groups in Play Console, complete a legal/product review for:

- child-directed listing copy and screenshots;
- parental consent and controls;
- child data collection, retention, deletion, and disclosure;
- AI tutor safety and moderation;
- support process for minors;
- applicable regional laws.

If the launch build is not ready for child-directed distribution, keep the listing directed to adults/parents and clearly state that parents manage child profiles.

### Data Safety

Recommended top-level answers:

- Does the app collect or share required user data types? **Yes**.
- Is all collected data encrypted in transit? **Yes**, provided production API/media endpoints remain HTTPS.
- Can users request deletion? **Yes**.
- Account creation supported? **Yes**.
- Independent security review? **No**, unless a qualifying audit has actually been completed.

Starting data inventory:

| Play data type | Collected | Required/optional | Primary purposes |
| --- | --- | --- | --- |
| Approximate location | Optional | Optional | Timezone, regional curriculum, fraud/safety |
| Name | Yes | Required | Account and student profile management |
| Email address | Yes | Required for email login | Account, security, communication |
| Phone number | Depending on enabled flow | Optional unless phone login/contact is enabled | Account, security, communication |
| User IDs | Yes | Required | Account, entitlement, safety |
| Other personal info | Yes | Mix | DOB/age policy, gender, parent/guardian, address, academic and accessibility context |
| Photos/videos | Optional | Optional | Avatar, profile media, support or document review |
| Files/documents | Optional | Optional | Student documents, consent, support, verification |
| Messages | Yes when chat/support/session history is used | Optional feature | AI tutor, classroom, tutor/support communication |
| App interactions | Yes | Required | Schedules, AI tutor sessions, progress, analytics, personalization |
| Purchase history | Yes for purchasers | Required for buyers | Subscription entitlement, invoices, fraud prevention |
| Crash logs/diagnostics | Yes when enabled | Required while enabled | Diagnostics, security, app quality |
| Device IDs/tokens | Yes | Required for sessions/push while enabled | Security, fraud prevention, notifications |

Review all enabled SDKs/providers before declaring whether data is shared.

## 3. Permissions Declaration Audit

| Permission | App use | Submission note |
| --- | --- | --- |
| Camera | Avatar, document, or support media capture | Explain before request |
| Microphone | Audio/video tutoring or classroom features when enabled | Ask only when recording/session begins |
| Notifications | Session reminders, progress, billing, support, and safety alerts | Runtime opt-in and settings required |
| Billing | Google Play subscriptions | Required |
| Location | Timezone/regional support only if enabled | Ask only when needed and disclose in Data safety |

After producing the AAB, review the final merged manifest in Play Console.

## 4. Store Listing Copy

### Short Description

```text
AI tutoring, schedules, progress, and parent-managed learning support.
```

### Full Description Draft

```text
Mentora helps students and parents plan, schedule, and track AI-powered tutoring.

Create a student profile, add academic details, choose subjects, schedule tutor sessions, and follow learning progress from one place. Parents can manage child profiles, review settings, control access, and keep learning focused.

Key features:
- Student and parent login
- Parent-managed multiple student profiles
- Academic profile, subjects, goals, and course preferences
- Scheduled AI tutor sessions
- Subscription and entitlement-based access
- Learning history and progress surfaces
- Notifications for sessions, payments, and safety
- English and Hindi support
- Account data export and deletion controls

Mentora provides educational assistance and does not guarantee exam scores, admissions, certifications, employment, or academic outcomes. Some features require internet access, permissions, or an active subscription.
```

## 5. Required Launch Checks

- Public URLs return HTTP 200 without authentication:
  - `https://mentora.webnza.com/privacy-policy`
  - `https://mentora.webnza.com/terms-conditions`
  - `https://mentora.webnza.com/community-guidelines`
  - `https://mentora.webnza.com/account-deletion`
- Reviewer account has a student profile, schedule, entitlement, and non-admin access.
- Terms/privacy acceptance occurs before profile/media/document creation.
- Report/block/support flows are reachable.
- Child/student data disclosures are reconciled with the release build.
- Store icon, feature graphic, screenshots, and localized listing assets are current.
- Final manifest permissions match actual features.
- Purchase/restore flow passes on a licensed-test account.
- Closed-test duration/tester requirements are satisfied if applicable.

## 6. Official References

Re-check these in Play Console immediately before submission because policy questions and wording can change:

- Prepare your app for review
- Data safety form guidance
- Target audience and content
- User Data policy
- Account-deletion requirements
- User-generated-content policy
- Photo and Video Permissions policy
- Financial features declaration
