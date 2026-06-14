# Flow Plan

> Current home: `docs/planning/FLOW-PLAN.md`
>
> Purpose: user journeys, screen flows, UX blueprint, and recommended flow improvements for the current Match Mate app.
>
> Source-of-truth rule: keep navigation and journey decisions here. Keep API/module details in [Technical Plan](TECHNICAL-PLAN.md), delivery scope in [Project Plan](PROJECT-PLAN.md), and backlog status in [Task Roadmap](TASK-ROADMAP.md).

## Current Product Shape

The current application is primarily an Expo React Native app backed by a NestJS API. The mobile app supports iOS, Android, and Web through Expo. A separate web marketing/customer portal is not currently represented as a dedicated frontend app in this repository, so web-specific landing-page wireframes should be treated as future scope unless a web app is added.

Implemented mobile navigation is organized around:

- Auth stack: Welcome, Login, Register, Forgot Password, Reset Password, Magic Login, 2FA Challenge, Privacy Policy, Terms.
- Onboarding stack: first-time profile setup.
- Bottom tabs: Home, Matches, Chats, Membership, Profile.
- App-level Settings stack: profile editing, preferences, account, privacy, notifications, security, communication, accessibility, AI, media, localization, billing, referrals, support, legal, and theme/language screens.

## Primary User Journey

```text
Welcome
  -> Login / Register / Magic Login / Forgot Password
  -> Optional 2FA Challenge
  -> Onboarding
  -> App Tabs
       -> Home
       -> Matches
       -> Chats
       -> Membership
       -> Profile
  -> Settings and Support
```

## Auth Flow

### Current Screens

- Welcome
- Login
- Register
- Forgot Password
- Reset Password
- Magic Login
- Two Factor Challenge
- Privacy Policy
- Terms and Conditions

### Flow

```text
Welcome
  -> Login
       -> Email login
       -> Phone OTP login, when enabled
       -> Social login, when providers are enabled
       -> 2FA challenge, when required
       -> App or Onboarding
  -> Register
       -> Email/phone/social-aware registration
       -> Onboarding
  -> Forgot Password
       -> Reset Password
  -> Magic Login
       -> App or Onboarding
```

### UX Requirements

- Auth methods must respect environment feature flags.
- Legal links should remain reachable before registration.
- Login/register errors should use localized API response codes where available.
- Password reset and magic login deep links should route into the correct screen when the app is installed.
- 2FA should clearly show the challenge method and recovery path without exposing sensitive details.

## Onboarding Flow

### Current Intent

Onboarding should create the profile, preference baseline, settings defaults, and completion state before the user reaches the main app.

### Recommended Step Model

1. Basic identity: profile-for, name, gender, date of birth, marital status.
2. Location and community: country, state, city, religion, caste/community, mother tongue.
3. Education and career: education level, field, occupation, income, work location.
4. Family and lifestyle: family type, family values, diet, drinking/smoking, disability, about.
5. Partner preferences: age, height, location, religion/community, education, income, lifestyle.
6. Photos and verification prompt: primary photo, optional video intro, profile quality checklist.

### Recommendations

- Keep onboarding resumable if the app closes mid-flow.
- Show a profile completion indicator after onboarding, not during every step.
- Avoid blocking core discovery on optional details, but clearly mark high-impact missing fields.
- Save each step independently to reduce data loss.
- Route incomplete users back to onboarding before showing the main tabs.

## Main App Navigation

### Bottom Tabs

| Tab | Current Role |
| --- | ------------ |
| Home | Discovery entry point, recommended/new/nearby/curated match surfaces, notifications access |
| Matches | Browse/filter match list and open match detail |
| Chats | Conversation list and chat room flow |
| Membership | Plans, upgrade, payment-method selection, subscription actions |
| Profile | My profile, profile PDF/share actions, settings entry |

### App-Level Settings

Settings is reachable from Profile and top-level app affordances. It should remain a stack, not a tab, because it contains many secondary management screens.

## Home Flow

```text
Home
  -> Notifications
       -> Notification Detail
       -> Contextual target, when action metadata exists
  -> Recommended / New / Nearby / Curated matches
       -> Match Detail
            -> Send Interest
            -> Shortlist
            -> Report / Block
            -> Chat, when allowed
```

### UX Requirements

- Preserve discovery scroll/list state when returning from a profile.
- Use skeleton/loading states for match cards.
- Keep premium gates visible but non-blocking for free discovery.
- Show empty states for no matches, no nearby permission, and filters too narrow.
- Surface safety actions in profile detail without making them visually primary.

## Matches Flow

```text
Matches
  -> Filter / Sort
  -> Match List
       -> Match Detail
            -> Send Interest
            -> Chat, if mutual match or chat request accepted
            -> Shortlist
            -> Block / Report
```

### Filter Coverage

Filters should align with backend match query support:

- Age and height range.
- Location and nearby mode.
- Religion, caste/community, mother tongue.
- Education, occupation, income.
- Online status and new profiles where supported.
- Pagination/lazy loading for long lists.

### Recommendations

- Add saved filter presets after core filtering is stable.
- Show active filter chips so users understand why a list is narrow.
- Keep the reset action obvious.
- Avoid swipe-only controls; matrimonial browsing needs deliberate comparison.

## Match Detail Flow

```text
Match Detail
  -> View personal, education, career, family, lifestyle, media, and preferences
  -> Send / withdraw interest
  -> Shortlist / remove shortlist
  -> Start chat or request chat
  -> Block / report
```

### UX Requirements

- Show verification and profile completion signals near identity details.
- Keep profile images/video intro inspectable, not decorative only.
- Make blocked/reported state persistent across Home, Matches, and Chat.
- Handle restricted chat states with clear copy: pending interest, blocked, reported, unmatched, or premium gate.

## Chats Flow

```text
Chats
  -> Chat List
       -> Conversation
            -> Send text
            -> Send attachment / voice message, when enabled
            -> Typing, delivered, read, reactions
            -> Room settings
                 -> Pin / mute / archive
                 -> Block / report
```

### UX Requirements

- Chat list should show unread count, last-message status, typing preview, mute/archive/pin state, and request actions.
- Conversation should support safe retry for failed sends.
- Voice and media messages should show upload/progress/failure states.
- Chat requests should clearly separate accepted conversations from pending requests.
- Moderation states should prevent unsafe messaging and explain what happened.

## Membership and Monetization Flow

```text
Membership
  -> Plan list / comparison
  -> Payment method sheet
       -> Web payment order
       -> Mobile store subscription, when enabled
  -> Verify payment / subscription
  -> Current plan and billing summary
  -> Cancel auto-renewal, invoice, refund/support paths
```

### UX Requirements

- Keep `EXPO_PUBLIC_STORE_BILLING_ENABLED` guarded until Apple/Google product mapping is ready.
- Show current plan, expiry, renewal state, and cancellation effect before payment actions.
- Keep Razorpay/Stripe web payments separate from App Store / Google Play subscription verification.
- Provide receipts/invoices and support routes from billing history.
- Explain premium gates at the moment of need, not only on the plan page.

## Profile Flow

```text
Profile
  -> My profile details
  -> Download / share profile PDF
  -> Settings
       -> Edit Profile
       -> Edit Preferences
       -> Account / Privacy / Security / Billing / Support
```

### UX Requirements

- Profile should show completion, verification, media, and key matrimonial fields.
- PDF/share actions should handle missing photos and permissions gracefully.
- Edit Profile should keep sections independently saveable.
- Photo and video intro management should show primary media state and upload failure states.

## Settings Flow

### Current Settings Areas

- Edit profile.
- Edit preferences.
- Account settings.
- Change email/phone.
- Linked accounts.
- Profile verification / KYC.
- Manage devices.
- Login history.
- Two-factor setup.
- Subscription and billing.
- Refer and rewards.
- Blocked users.
- Privacy settings.
- Notification settings.
- Communication settings.
- Accessibility settings.
- AI/recommendation settings.
- Media settings.
- Localization settings.
- Security settings.
- Language.
- Theme.
- Help and support.
- Support tickets and ticket detail.
- FAQs and community guidelines.
- Privacy policy and terms.

### Notification Settings Model

Recommended categories:

- Interactions: new interest, interest accepted, profile viewed, shortlisted.
- Messages: new message, chat request, message reaction, media failure.
- Matches and suggestions: new match, curated match, online/nearby alerts, profile score boost.
- Account and membership: payment confirmation, subscription expiry, renewal/cancellation, referral reward.
- Security: login alerts, password change, 2FA changes, device/session changes.
- Support: ticket reply, ticket status update.
- Promotions: offers and campaign announcements.

Recommended controls:

- Master notification toggle.
- Channel-level controls where provider support exists: push, email, SMS.
- Frequency control for match suggestions.
- Quiet hours / do-not-disturb.
- Locked-on security alerts where legally or operationally required.

## Support Flow

```text
Settings
  -> Help and Support
       -> FAQs
       -> Community Guidelines
       -> Support Tickets
            -> Create Ticket
            -> Ticket Detail
                 -> Replies
                 -> Close Ticket
```

### Recommendations

- Add contextual support entry points from payment failure, verification failure, media rejection, and account deletion flows.
- Keep ticket categories aligned with backend support/admin queues.
- Show expected response time and ticket status clearly.

## Admin and Moderation Flow

Admin is API-backed in the current backend. If an admin UI is added, it should cover:

- Dashboard metrics.
- User management.
- RBAC.
- Moderation queues for profile reports, media, KYC, and chat.
- Support-ticket queue.
- Plan and feature management.
- Payments, refunds, reconciliation, GST/settlement reports.
- Notification templates, broadcasts, analytics, and DLQ replay.
- Audit logs.

Admin UI work should be tracked separately from the mobile app flow unless an admin app is added to this repository.

## Deep Link Flow

Configured app scheme:

```text
matchmate://
```

Configured universal/app links:

```text
https://matchmate.webnza.com/reset-password
https://www.matchmate.webnza.com/reset-password
https://matchmate.webnza.com/magic-login
https://www.matchmate.webnza.com/magic-login
```

Recommended deep-link targets:

- Reset password.
- Magic login.
- Notification detail.
- Match detail.
- Chat room.
- Support ticket detail.
- Payment/subscription result.

## Cross-Cutting UX Rules

- Preserve user context when moving between list, detail, chat, and settings screens.
- Always provide loading, empty, error, and retry states for network-backed screens.
- Keep destructive actions confirmed: block, report, deactivate, delete account, cancel subscription.
- Keep safety and trust signals visible: verification, profile completion, blocked/reported state, secure account notices.
- Keep localization complete for all visible copy, including API success/error codes.
- Keep accessibility in the interaction model: readable text, touch target size, screen reader labels, contrast, reduced motion where needed.
- Avoid duplicate API calls from toggles and settings controls.
- For long lists, use pagination/infinite loading and stable placeholders.

## Recommended Improvements

1. Add a documented auth-state matrix: logged out, logged in without onboarding, logged in with onboarding complete, token refresh failed, 2FA required.
2. Add a profile-completion journey that links missing sections directly to `EditProfile` and `EditPreference`.
3. Add explicit empty-state copy for discovery filters, no nearby permission, no chats, no notifications, and no support tickets.
4. Add contextual support entry points from payment, verification, media moderation, and account deletion.
5. Add saved filters only after current filter behavior and pagination are stable.
6. Add deep-link QA cases for reset password, magic login, notification detail, match detail, chat, and payment result.
7. Add UX acceptance criteria to each launch-critical flow in the task roadmap.

## Documentation Ownership

- Keep this file focused on user journeys and screen flow decisions.
- Keep endpoint lists and technical architecture in [Technical Plan](TECHNICAL-PLAN.md).
- Keep delivery scope, milestones, risks, and project governance in [Project Plan](PROJECT-PLAN.md).
- Keep implementation backlog and launch work in [Task Roadmap](TASK-ROADMAP.md).
