# Flow Plan

> Current home: `docs/planning/FLOW-PLAN.md`
>
> Purpose: user journeys, screen flows, UX blueprint, and deep flow notes for the current Match Mate app.
>
> Source-of-truth rule: keep navigation and journey decisions here. Keep API/module details in [Technical Plan](TECHNICAL-PLAN.md), delivery scope in [Project Plan](PROJECT-PLAN.md), and backlog status in [Task Roadmap](TASK-ROADMAP.md).

## Current Product Shape

Match Mate is currently an Expo React Native mobile app backed by a NestJS API. The app supports iOS, Android, and Web through Expo. The dedicated Match Mate admin interface lives in the sibling repository `../juaaree-main-app`, where the legacy Juaaree PHP admin shell exposes Match Mate API-backed screens.

Implemented mobile navigation:

- Auth stack: Welcome, Login, Register, Forgot Password, Reset Password, Magic Login, 2FA Challenge, Privacy Policy, Terms.
- Onboarding stack: Onboarding form and success screen.
- Bottom tabs: Home, Matches, Chats, Membership, Profile.
- App/settings stack: profile editing, preferences, account, privacy, notifications, security, communication, accessibility, AI, media, localization, billing, referrals, support, legal, theme, and language screens.

Implemented admin navigation in `../juaaree-main-app`:

- Match Mate Login / Logout / Dashboard.
- Members, profiles, audit logs, RBAC roles, RBAC permissions.
- Plans, plan features, plan entitlements.
- Moderation queue, media moderation, chat moderation, KYC queue.
- Payments, payment reconciliation, settlement report, GST report.
- Notifications, notification templates, notification DLQ.
- Analytics overview, analytics stats, analytics funnel, daily analytics, analytics taxonomy.
- Curated matches, support tickets, success stories.

Root routing is controlled by auth state:

```text
No access token
  -> Auth

Access token + onboarding incomplete or completion pending
  -> Onboarding

Access token + onboarding complete
  -> App Tabs
```

## Primary Journey

```text
Welcome
  -> Login / Register / Magic Login / Forgot Password
  -> Optional 2FA Challenge
  -> Onboarding, when profile is incomplete
  -> App Tabs
       -> Home
       -> Matches
       -> Chats
       -> Membership
       -> Profile
  -> Settings, Support, Billing, Security, Legal
```

## Notification Delivery Model

Notifications are a cross-cutting side effect in many flows. A flow can create an in-app notification, emit realtime events, and optionally deliver push, email, or SMS.

What happens when `NotificationsService.notify` is used:

1. If a template key is supplied, the active template is loaded and variables are rendered.
2. If a dedupe key is supplied, recent duplicates are suppressed within the configured window.
3. The recipient user and notification settings are loaded.
4. Delivery channels are decided from requested channels, template channels, user preferences, quiet hours/do-not-disturb, priority, and whether the user has usable email/phone.
5. Paid engagement categories can lose email/SMS delivery if the recipient plan does not include those features.
6. A notification row is created.
7. Push, email, and SMS are queued or sent directly depending on queue configuration.
8. Realtime events are emitted to the user:
   - `notification:new`
   - `notification:unread-count`

Important categories:

| Category | Typical Flow | Type |
| --- | --- | --- |
| `interest_received` | Someone sends interest | match |
| `interest_accepted` | Interest accepted | success/match |
| `match_found` | Mutual match or daily matches | match |
| `profile_view` | Profile viewed | info |
| `message_received` | Chat request, message, chat response | chat |
| `subscription` | Payment/subscription events | payment |
| `system` | Security, account, unmatched, general system updates | system |

## Auth Flow Deep Dive

### Welcome

The Welcome screen is the unauthenticated entry point. It routes users to Login, Register, Magic Login, Forgot Password, Privacy Policy, or Terms.

### Email Login

Inputs:

- Email.
- Password.
- Device/platform headers from the app/API layer.

Process:

1. Mobile calls `POST /auth/login`.
2. API checks the email/password auth method feature flag.
3. User is found by email provider and password is verified.
4. Blocked, suspended, or deleted users are rejected.
5. If 2FA is enabled, the API starts a challenge and returns challenge data instead of tokens.
6. If 2FA is not required, login activity and analytics are recorded.
7. Access token and refresh token are created.
8. A user session is stored with device, IP, user agent, token family, and expiry.
9. Previous active sessions for the same device are revoked.
10. Concurrent session limit is enforced.
11. Suspicious login detection can compare device/IP network with previous sessions.

Notifications and emails:

- Normal login: no user-facing notification by default.
- Suspicious login: creates a warning notification titled `New login detected`.
- Suspicious login channels: `in_app` plus `email` unless login notifications are disabled; then `in_app` only.

Next screen:

- If 2FA is required: `TwoFactorChallenge`.
- If login succeeds and `isOnboardingCompleted` is false: `Onboarding`.
- If login succeeds and onboarding is complete: `App` tabs, normally Home.

### 2FA Challenge

Inputs:

- Challenge ID.
- TOTP/SMS code or recovery code.

Process:

1. Mobile calls `POST /auth/2fa/verify`.
2. API consumes the challenge using code or recovery code.
3. User status is checked.
4. Login activity and analytics are recorded with the original provider/source.
5. Tokens and a session are issued.

Notifications and emails:

- No success notification by default.
- SMS setup/request flows can send a 2FA OTP when the user manages 2FA from security settings.

Next screen:

- Onboarding if profile setup is incomplete.
- App tabs if onboarding is complete.

### Email Registration

Inputs:

- Email.
- Password.
- Optional phone and country code.
- Optional referral code and attribution fields.

Process:

1. Mobile calls `POST /auth/register`.
2. API checks email/password registration is enabled.
3. Referral code is validated when present.
4. Existing email-provider users are rejected.
5. Password is hashed.
6. User is created as active with `USER` role, free membership, email unverified, phone unverified, onboarding incomplete.
7. Registration activity and analytics are recorded.
8. Referral attribution is applied when present.
9. Tokens and a session are issued.

Notifications and emails:

- Welcome email is sent when the user has an email.
- If phone was supplied and OTP sending is configured for this registration path, an OTP can be sent for phone verification.

Next screen:

- Onboarding, because new registered users are created with `isOnboardingCompleted: false`.

### Phone OTP Login/Register

Inputs:

- Country code.
- Phone number.
- OTP.
- Optional registration/profile context supported by the verify DTO.

Process:

1. User requests OTP with `POST /auth/send-otp`.
2. API checks the phone auth method feature flag.
3. OTP service sends or simulates the OTP depending on provider configuration.
4. User verifies OTP with `POST /auth/verify-otp`.
5. Existing phone-provider users are logged in.
6. New phone users are created with free membership, phone verified, onboarding incomplete.
7. Tokens and a session are issued.

Notifications and emails:

- OTP is sent by the OTP/SMS provider path.
- No email is sent for phone-only accounts unless an email exists later.

Next screen:

- Onboarding for new phone users.
- App tabs or Onboarding for existing users based on onboarding state.

### Social Login/Register

Inputs:

- Provider.
- Provider token/profile payload.
- Optional email.
- Optional referral code and attribution.

Process:

1. Mobile calls `POST /auth/social-login`.
2. API checks the provider feature flag.
3. Provider token/profile is verified.
4. Existing social account logs in.
5. Existing email account can be linked to the social account and then logged in.
6. New social account creates a free, active user with onboarding incomplete.
7. Social profile photo is synced as approved primary image if no active image exists.
8. Existing users can still be sent through 2FA if enabled.
9. Tokens and session are issued after 2FA or direct login.

Notifications and emails:

- New social users can receive the registration welcome email if an email is available.
- Suspicious-login notification behavior matches email login.

Next screen:

- 2FA challenge if required.
- Onboarding for new/incomplete users.
- App tabs for completed users.

### Magic Login

Inputs:

- Email for request.
- Token from magic-login deep link for verification.

Process:

1. User requests a link with `POST /auth/magic-link/request`.
2. API checks magic-link auth is enabled.
3. Existing account is looked up without leaking whether the account exists.
4. A short-lived magic token is generated and cached by JTI.
5. Security email is sent with `/magic-login?token=...`.
6. User opens the deep link and mobile calls `POST /auth/magic-link/verify`.
7. API verifies token type, user, JTI cache state, and user status.
8. Tokens and session are issued.

Notifications and emails:

- Security email with the magic sign-in link.
- No in-app notification is created for the request.

Next screen:

- Onboarding or App tabs based on onboarding state.

### Forgot And Reset Password

Inputs:

- Forgot password: email.
- Reset exchange: reset code from deep link.
- Reset password: token, new password, confirm password.

Process:

1. User submits email with `POST /auth/forgot-password`.
2. API does not leak account existence; unknown users still receive `{ sent: true }`.
3. Existing email/password users receive a reset email with a 15-minute one-time link.
4. App exchanges the reset code through `POST /auth/reset-password/exchange-code`.
5. App submits new password through `POST /auth/reset-password`.
6. API verifies token, prevents reuse, checks password confirmation, hashes new password, and revokes user sessions.

Notifications and emails:

- Password reset request: security email only.
- Password reset success: in-app and email notification titled `Password changed successfully`.

Next screen:

- User signs in again because reset revokes existing sessions.

### Logout And Session Management

Inputs:

- Current refresh token for logout.
- Session ID for selected-device logout.

Process:

1. Mobile logout revokes notification device token best-effort.
2. Mobile calls `POST /auth/logout`.
3. API marks current session inactive.
4. Mobile tracks logout analytics best-effort.
5. Local refresh token and cached notification push token are cleared.
6. Redux auth state is cleared.

Notifications and emails:

- No user-facing logout notification by default.

Next screen:

- Auth stack, starting at Welcome.

Other session actions:

- `POST /auth/logout-all` signs out all active sessions.
- `GET /auth/sessions` lists active sessions.
- `DELETE /auth/sessions/:sessionId` signs out a selected device.

## Onboarding Flow Deep Dive

Implemented mobile onboarding currently has three steps:

```text
Basic
  -> Preferences
  -> Photos
  -> Onboarding Success
  -> App Tabs
```

Inputs:

- Basic profile fields from the onboarding basic step.
- Partner preference fields from the preferences step.
- Up to 6 profile images through multipart `profileImages`.

Process:

1. The screen keeps form state locally while the user moves through steps.
2. Basic and preference steps are validated before moving forward.
3. Final submit calls `POST /profiles/onboarding` as multipart form data.
4. API validates the DTO with whitelist and rejects non-whitelisted fields.
5. Images are accepted only as JPG, PNG, or WEBP, up to 5 MB each, maximum 6 files.
6. Profile, preferences, media records, profile score/completion, and onboarding completion state are handled by the profile service.
7. RTK Query invalidates profile, profile media, and preference caches.
8. Root routing moves the user out of onboarding once auth state reflects completion.

Notifications and emails:

- No onboarding completion notification is created by default in the implemented flow.

Next screen:

- `OnboardingSuccess`, then App tabs.

Recommended future expansion:

- Split onboarding into identity, location/community, education/career, family/lifestyle, preferences, and verification/media if the product needs a longer guided matrimonial setup.
- Keep each step independently saveable before expanding the step count.

## Main App Navigation

| Tab | Current Role |
| --- | --- |
| Home | Discovery entry point, recommended/new/nearby/curated match surfaces, notifications access |
| Matches | Browse/filter matches, interests, shortlisted profiles, and match detail |
| Chats | Conversation list, chat requests, active rooms, unread badge |
| Membership | Plans, upgrade, payment-method selection, subscription actions |
| Profile | My profile, media/profile actions, settings entry |

Settings remains a stack, not a tab, because it contains many secondary management screens.

## Access And Role Model

This repository implements customer/member screens in the mobile app and staff/admin operations in the API. The dedicated staff/admin frontend is implemented in the sibling repository `../juaaree-main-app` through `AdminMatchMateController`, `AdminMatchMateModule`, `MatchMateApiClient`, and the `admin/view/match-mate/*` PHP views.

Built-in roles:

| Role | Intended Access |
| --- | --- |
| `super_admin` | Full system access, all permissions, RBAC, audit logs, admin operations |
| `admin` | Full operational admin access, all permissions |
| `support` | User lookup, profile/setup support, settings assistance, reports/blocks/activity, support tickets |
| `finance` | Dashboard, payment reports, subscriptions, plans, analytics, refunds where permitted |
| `kyc_reviewer` | KYC/profile verification review and related activity visibility |
| `content_moderator` | Media, chat, reports, blocks, content/success-story moderation |
| `marketing_admin` | Broadcasts, notification templates/campaign dispatch, notification analytics, dashboard analytics |
| `moderator` | User, profile, media, report, block, and chat moderation |
| `user` | Regular member app access |

Permission families:

- System/admin: `admin:*`, `system:*`, `dashboard:*`.
- User/profile: `user:*`, `profile:*`, `activity:*`.
- Media/chat/moderation: `media:*`, `chat:*`, `report:*`, `block:*`.
- Matching/interactions: `interest:*`, `match:*`, `shortlist:*`.
- Plans/finance: `plan:*`, `feature:*`, `subscription:*`, `payment:*`.
- Analytics/marketing: `analytics:*`, `notification:*`.
- Referrals/rewards: `referral:*`.

Access rules:

1. API requests authenticate through JWT.
2. Admin/staff routes use role guards and, for many routes, permission guards.
3. `super_admin` and `admin` are treated as full-access roles.
4. Non-user staff roles bypass member feature gating in the subscription feature guard.
5. Staff changes that affect users, payments, moderation, notifications, or RBAC should write admin audit logs where the controller/service currently does so.
6. The PHP admin shell keeps a separate Match Mate API session using stored access token, refresh token, session ID, and user data.
7. If the Match Mate access token is expired, the admin adapter attempts refresh; if refresh fails, it redirects to `match_mate_login.php` with a safe return URL.

## Home And Discovery Flow Deep Dive

```text
Home
  -> Notifications
       -> Notification Detail
       -> Contextual target from action metadata
  -> Recommended / New / Nearby / Curated profiles
       -> Match Detail
            -> Send Interest
            -> Shortlist
            -> Chat when allowed
            -> Block / Report where available
```

Implemented discovery endpoints:

- `GET /matches/recommended`
- `GET /matches/new`
- `GET /matches/nearby`
- `GET /matches/online`
- `GET /matches/curated`
- `DELETE /matches/curated/:curatedMatchId`
- `GET /matches/profile/:userId`

Inputs:

- Pagination.
- Filter query where supported by `MatchQueryDto` and `NearbyQueryDto`.
- Current user profile and preferences from backend matching services.

Process:

1. Mobile requests the selected discovery list.
2. Backend loads the viewer profile and candidate profiles.
3. Safety/access rules exclude blocked or unavailable users.
4. Compatibility, recency, online, nearby, or curated logic is applied depending on endpoint.
5. The app opens match detail with selected candidate data.

Notifications and emails:

- Daily match digest task can notify users: `Your daily matches are ready`.
- Daily match digest channels: `in_app` and `push`.

Next screen:

- User usually returns to Home or goes to Match Detail, Chat, or Membership if gated.

## Matches And Interest Flow Deep Dive

```text
Matches
  -> Recommended / Matched / Requests / Sent / Shortlisted
  -> Filter / Sort
  -> Match Detail
       -> Send interest
       -> Accept / reject received interest
       -> Withdraw sent interest
       -> Shortlist / remove shortlist
       -> Unmatch
```

Implemented match/interest endpoints:

- `GET /matches/my`
- `GET /matches/stats`
- `GET /matches/who-viewed-me`
- `GET /matches/shortlisted`
- `POST /matches/shortlist/:userId`
- `DELETE /matches/shortlist/:userId`
- `POST /matches/interest`
- `POST /matches/interest/respond`
- `DELETE /matches/interest/:interestId`
- `GET /matches/interests/received`
- `GET /matches/interests/sent`
- `POST /matches/unmatch/:userId`

### Send Interest

Inputs:

- Receiver user ID.

Process:

1. Mobile calls `POST /matches/interest`.
2. Backend validates sender/receiver, access boundaries, duplicate state, and match/interest rules.
3. Interest record is created or updated.
4. Receiver notification is created.

Notifications and emails:

- Receiver gets `New interest received`.
- Category: `interest_received`.
- Channels requested: `in_app`, `push`, `email`.
- Email may be suppressed by recipient settings or missing paid email notification feature.
- Action target: Matches requests tab with interest ID.

Next screen:

- Sender remains in match context with sent/pending state.
- Receiver can open notification into requests.

### Accept Or Reject Interest

Inputs:

- Interest ID.
- Action: `ACCEPT` or reject action from DTO.

Process:

1. Mobile calls `POST /matches/interest/respond`.
2. Backend validates receiver ownership and current interest state.
3. Accepted interest creates or activates a match.
4. Both users can now chat when matched.
5. Response notifications are created.

Notifications and emails:

- On accept, responder receives `It's a match` as `match_found`, channels `in_app` and `push`.
- Sender receives `Interest accepted` as `interest_accepted`, channels `in_app` and `push`.
- Rejected/other response sends sender `Interest updated` as `system`, channels `in_app` and `push`.

Next screen:

- Accepted users can move to Match Detail or Chat.
- Rejected interest leaves no active match.

### Unmatch

Inputs:

- Target user ID.
- Optional reason.

Process:

1. Mobile calls `POST /matches/unmatch/:userId`.
2. Backend ends the active match state.
3. Target is notified.

Notifications and emails:

- Target receives `Match updated`.
- Category: `system`.
- Channels: `in_app`.

Next screen:

- Match disappears from active matches and chat access can be restricted.

## Chat Flow Deep Dive

```text
Chats
  -> Chat List
       -> Conversation
            -> Create/get room
            -> Send text/media message
            -> Mark delivered/read
            -> Accept/reject chat request
            -> Pin / mute / archive
            -> Delete own message
```

Inputs:

- Target user ID for direct room.
- Optional initial message.
- Room ID for existing conversation.
- Message content and optional attachments.
- Client message ID for retry/idempotency-style client tracking.

Process:

1. Chat list loads rooms, unread counts, blocked relations, participant profiles, primary media, and presence.
2. Creating a direct room checks valid IDs, user existence, block/safety access, and messaging permission.
3. If users have an active match, the room is active.
4. If users do not have an active match but messaging is allowed, the room starts as pending with a chat request.
5. First pending-room message is stored as the request message.
6. Sending a message validates room access, blocks, non-empty content/attachments, profanity rules, and attachment ownership.
7. Messages update room state, unread counts, and realtime conversation events.
8. Opening messages marks delivered; explicit read action marks messages read.

Notifications and emails:

- New chat request: receiver gets `New chat request`, category `message_received`.
- Chat request response: requester gets `Chat request accepted` or `Chat request declined`.
- New message: receiver gets `New message`, category `message_received`.
- Chat notification action target: Chat detail with room ID and user ID.
- Default requested channel is in-app unless provider/template/settings expand delivery; notification settings and paid feature rules still apply.

Next screen:

- Active rooms open into conversation.
- Pending rooms show accept/reject state to the receiver and pending state to requester.
- Chat tab badge shows unread count from Redux chat state.

## Membership And Payment Flow Deep Dive

```text
Membership
  -> Plans / comparison
  -> Payment option sheet
       -> Web payment order
       -> Store subscription verification, when enabled
  -> Verify payment / subscription
  -> Current plan, billing history, invoices, support paths
```

Inputs:

- Plan ID.
- Billing cycle.
- Coupon code where supported.
- Payment method/gateway.
- Store purchase token/product ID for mobile store subscription verification.

Process:

1. Mobile loads plans, current subscription, feature access, and self-service billing data.
2. User selects plan or assisted/custom plan details.
3. Web payment creates an order and then verifies payment after gateway completion.
4. Store billing path verifies App Store/Google Play subscription receipt when enabled.
5. Backend records payment/subscription state, invoices, renewal/expiry fields, and feature access.
6. Premium feature gates re-check entitlement after purchase.

Notifications and emails:

- Subscription/payment events use `subscription` category.
- System can use email/SMS fallback for subscription notifications when only one verified contact channel exists.
- Delivery still respects preferences except critical-priority messages.

Next screen:

- Successful payment returns user to Membership/current plan state.
- Failed payment should route to retry or Support.

## Profile Flow Deep Dive

```text
Profile
  -> My profile
  -> Media
       -> Add image/video
       -> Set primary
       -> Remove
  -> Edit Profile
       -> Personal
       -> Physical
       -> Education
       -> Family
       -> Location
  -> Edit Preferences
  -> Settings
```

Inputs:

- Profile section DTOs.
- Location coordinates.
- Image/video form data for media.

Process:

1. Mobile loads `GET /profiles/me`.
2. Edit screens update independent profile sections.
3. Profile media APIs upload, set primary, and remove image/video media.
4. API recomputes persisted profile state and returns updated profile data.
5. RTK Query invalidates affected profile/media/preference cache tags.

Notifications and emails:

- Normal profile edits do not send user-facing notifications by default.
- Media moderation, verification, or safety flows can add notifications when those services act on submitted data.

Next screen:

- User returns to Profile, Match Detail preview, or Settings depending on entry point.

## Settings Flow Deep Dive

Implemented settings areas:

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

Notification settings model:

- Master in-app, push, email, and SMS toggles.
- Do-not-disturb and quiet hours.
- Per-category preferences for interest received, interest accepted, profile view, match found, message received, subscription, and system.
- Critical notifications can bypass opt-out and quiet hours where configured.
- SMS is opt-in unless used as a contact fallback for eligible system/subscription notices.

Security settings model:

- 2FA status.
- TOTP setup/enable.
- SMS 2FA request/enable.
- Disable 2FA.
- Regenerate recovery codes.
- Suspicious login alerts.
- Login notification preferences.
- Device/session management.

## Support Flow Deep Dive

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

Inputs:

- Ticket category.
- Subject/message.
- Replies.
- Ticket ID for detail/close.

Process:

1. User opens support from Settings or contextual support links.
2. Mobile lists support tickets and ticket detail.
3. Creating a ticket stores a support ticket for user/admin handling.
4. Replies append to the ticket thread.
5. Closing changes ticket status.

Notifications and emails:

- Support ticket replies/status changes should use support/system notifications when wired to admin workflows.
- Contextual support should be linked from payment failure, verification failure, media rejection, and account deletion.

## Staff And Admin Flow Deep Dive

### Staff Login And Entry

Inputs:

- Staff email/password, phone OTP, social login, magic login, or another enabled auth method.
- Optional 2FA challenge.

Process:

1. Staff users pass through the same auth flow as regular users.
2. JWT payload includes built-in roles and derived permissions.
3. Staff/API clients call admin endpoints with the issued access token.
4. Role and permission guards decide which admin modules are available.

Notifications and emails:

- Suspicious-login alerts and password/security emails follow the same auth rules as member accounts.

Current UI state:

- Staff backend flows are implemented in this repository.
- The dedicated staff dashboard frontend is implemented in `../juaaree-main-app`.

### Juaaree Admin Frontend Bridge

```text
Juaaree admin shell
  -> Match Mate Login
       -> POST Match Mate /auth/login
       -> Store Match Mate access token, refresh token, session ID, user
  -> Match Mate Dashboard
  -> Manage Match Mate resource
       -> List
       -> Search / filter
       -> Sort
       -> Paginate
       -> Add / edit when enabled
       -> Row action / global action when configured
  -> Disconnect Match Mate
       -> Clear Match Mate API session from PHP admin session
```

Implemented files:

- Controller: `../juaaree-main-app/admin/controller/AdminMatchMateController.class.php`.
- Module/resource matrix: `../juaaree-main-app/admin/module/AdminMatchMateModule.class.php`.
- API bridge: `../juaaree-main-app/admin/module/MatchMateApiClient.class.php`.
- Views: `../juaaree-main-app/admin/view/match-mate/dashboard.php`, `list.php`, `form.php`, `action.php`, `login.php`.
- Menu wiring: `../juaaree-main-app/admin/include/template.php`.
- Probe/test helpers: `../juaaree-main-app/tools/matchmate-admin-probe.js` and `test-matchmate-admin-module.php`.

Process:

1. CRM admin opens `match_mate_dashboard.php`.
2. If no valid Match Mate token exists, the controller redirects to `match_mate_login.php?return=...`.
3. Login posts email/password to the Match Mate API login endpoint.
4. API response tokens are stored in the PHP admin session.
5. All Match Mate admin screens call API endpoints through `MatchMateApiClient` with bearer token and optional API key.
6. Expired JWTs are refreshed through `/auth/refresh`; 401 after refresh clears the local Match Mate session and sends the operator back to login.
7. API validation errors are converted into operator-friendly messages; correlation/request IDs are appended when present.
8. Disconnect clears only the Match Mate API session from the Juaaree admin shell.

Admin UI behavior:

- List pages support resource-specific filters from an allowlist, configured page size, server pagination where supported, local sorting, no-record empty state, and action links.
- Form pages support create/edit for resources where `allowCreate` or edit is enabled.
- Action pages render dynamic fields, confirm prompts, JSON text areas, select/multiselect inputs, and optional API result output.
- Dashboard renders returned API summary metrics and quick links to members, audit logs, roles, plans, moderation, payments, and notifications.

### Admin Frontend Resource Matrix

| Admin Page | API Area | Main UI Behavior |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Summary metrics and quick links |
| Members | `/admin/users` | Search, status filter, create user, view user, status change, profile/preference/settings edits, plan assignment/cancel, role assign/remove, broadcast |
| Profiles | `/admin/users` | User profile-oriented listing and search |
| Audit Logs | `/admin/audit-logs` | Actor/resource/action/target/date filters |
| RBAC Roles | `/admin/rbac/roles` | List/create/edit/delete roles |
| RBAC Permissions | `/admin/rbac/permissions` | List/search/view/create/delete permissions |
| Plans | `/admin/plans` | Plan create/edit plus assign/remove plan features |
| Plan Features | `/admin/plans/feature/all` | Feature list and create feature through `/admin/plans/feature` |
| Plan Entitlements | `/admin/plans/full/all` | Read-only plan-with-features matrix |
| Moderation Queue | `/admin/moderation/queue` | Unified moderation listing |
| Media Moderation | `/admin/moderation/media` | Review media approve/reject with note |
| Chat Moderation | `/admin/moderation/chat` | Review flagged message approve/reject with note |
| KYC Queue | `/admin/moderation/kyc` | Review KYC as verified, rejected, or needs review |
| Payments | `/admin/payments` | Payment list/detail, refund action, invoice PDF result |
| Payment Reconciliation | `/admin/payments/reports/reconciliation` | Date/stale pending report |
| Settlement Report | `/admin/payments/reports/settlement` | Date/gateway/currency settlement report |
| GST Report | `/admin/payments/reports/gst` | Date-filtered GST report |
| Notifications | `/admin/notifications/analytics` and `/admin/notifications` | Analytics list, send direct notification, dispatch template |
| Notification Templates | `/admin/notifications/templates` | Include inactive filter, create/update template action |
| Notification DLQ | `/admin/notifications/dlq` | View job, replay one, replay all, purge by state/age |
| Analytics Overview | `/admin/analytics/overview` | Flattened analytics metrics and optional track event action |
| Analytics Stats | `/admin/analytics/stats` | Event/platform/funnel/source/campaign filters |
| Analytics Funnel | `/admin/analytics/funnel` | Funnel-stage metrics |
| Daily Analytics | `/admin/analytics/summary/daily` | Daily active users, registrations, matches, revenue |
| Analytics Taxonomy | `/admin/analytics/taxonomy` | Event taxonomy reference |
| Curated Matches | `/admin/curated-matches` | Create/delete curated match, user filter |
| Support Tickets | `/admin/support/tickets` | Status/priority filters, reply, update status |
| Success Stories | `/admin/success-stories` | Status filter, review story as published/rejected/archived |

Admin frontend inputs:

- Scalar filters: search, status, actorId, resource, action, targetId, orderId, userId, gateway, method, purpose, dates, channel, templateKey, state, priority.
- JSON action fields: profile sections, preferences, settings, role IDs, notification variables, plan feature values, metadata.
- Confirmation actions: subscription cancel, payment refund, feature removal, DLQ replay/purge, delete where enabled.

Notifications and emails:

- The admin frontend does not send email/push itself. It calls Match Mate API endpoints, and the API notification/subscription/support/moderation services decide side effects.
- Direct notification and template dispatch actions can create in-app/push/email/SMS delivery according to the API notification delivery model.

### Super Admin / Admin Governance Flow

```text
Admin auth
  -> Dashboard
  -> RBAC
       -> Permissions
       -> Roles
       -> Assign user roles
  -> Audit logs
  -> User operations
  -> Moderation / Finance / Marketing / Support modules
```

Implemented API areas:

- `GET /admin/dashboard`
- `GET /admin/audit-logs`
- `admin/rbac` permission, role, assignment, and user-role operations.

Process:

1. Super admin/admin signs in.
2. Dashboard loads operational metrics.
3. RBAC allows creating/listing/deleting permissions, creating/updating/deleting roles, assigning roles, and viewing user roles.
4. Audit logs allow privileged users to review sensitive admin actions.

Side effects:

- RBAC and sensitive admin operations should be audit logged.
- These flows do not send member notifications by default unless they trigger a downstream user, notification, payment, or moderation action.

### User Operations And Support-Admin Flow

```text
Admin / Support
  -> List users
  -> User detail
       -> Create user
       -> Complete setup
       -> Create/update profile
       -> Update preferences
       -> Update settings
       -> Update user status
       -> Assign/cancel subscription when role allows
```

Roles:

- User list/detail/status: `super_admin`, `admin`, `moderator`, `support`.
- Create user: `super_admin`, `admin`.
- Complete setup/profile/preferences/settings assistance: `super_admin`, `admin`, `support`.
- Subscription assignment/cancellation: `super_admin`, `admin`, `finance`.

Process:

1. Staff searches or filters users.
2. Staff opens a user detail record.
3. Staff performs the permitted correction or lifecycle action.
4. Backend updates the relevant user/profile/preference/settings/subscription data.
5. Audit metadata captures actor, target user, reason, before/after where available.

Notifications and emails:

- No generic notification is guaranteed for every admin user edit.
- Account status, subscription, security, or support-related actions should trigger user-facing system/subscription notifications when implemented in the corresponding service.

### Support Ticket Admin Flow

```text
Support / Admin
  -> Support ticket queue
  -> Ticket detail
       -> Reply
       -> Update priority/status
       -> Close or resolve
```

Roles:

- `super_admin`, `admin`, `support`.

Process:

1. Staff lists support tickets by status/priority/category.
2. Staff opens ticket detail.
3. Staff replies as an admin/support author or updates ticket status/priority.
4. User sees the ticket update in the support ticket flow.

Notifications and emails:

- Ticket reply/status updates should map to support/system notifications when wired.
- This remains a key place to add explicit user-facing notification templates.

### Finance Flow

```text
Finance / Admin
  -> Payment list
  -> Payment detail
  -> Invoice PDF
  -> Reconciliation report
  -> Settlement report
  -> GST report
  -> Refund
  -> User subscription assignment/cancellation
```

Roles:

- `super_admin`, `admin`, `finance`.

Implemented API areas:

- `GET /admin/payments`
- `GET /admin/payments/:orderId`
- `GET /admin/payments/:orderId/invoice/pdf`
- `GET /admin/payments/reports/reconciliation`
- `GET /admin/payments/reports/settlement`
- `GET /admin/payments/reports/gst`
- `POST /admin/payments/:orderId/refund`
- Admin user subscription assign/cancel operations.

Process:

1. Finance lists payments or opens reports.
2. Finance investigates payment/order/invoice detail.
3. Finance initiates refund where permitted.
4. Payment service processes the refund and audit logs the action.

Notifications and emails:

- Payment/subscription events should use `subscription` category notifications.
- Refund and cancellation actions should route to email/in-app notification templates when customer messaging is required.

### Marketing And Notification Operations Flow

```text
Marketing Admin / Admin
  -> Broadcast
  -> Send direct notification
  -> Dispatch template notification
  -> Manage templates
  -> Notification analytics
  -> Dead-letter queue
       -> Inspect
       -> Replay one / replay all
       -> Purge
```

Roles:

- Broadcast: `super_admin`, `admin`, `marketing_admin`.
- Notification admin routes: `super_admin`, `admin`, `marketing_admin`.

Implemented API areas:

- `POST /admin/broadcast`
- `POST /admin/notifications`
- `POST /admin/notifications/dispatch/template`
- `GET /admin/notifications/templates`
- `POST /admin/notifications/templates/:key`
- `GET /admin/notifications/analytics`
- `GET /admin/notifications/dlq`
- `GET /admin/notifications/dlq/:jobId`
- `POST /admin/notifications/dlq/:jobId/replay`
- `POST /admin/notifications/dlq/replay-all`
- `PATCH /admin/notifications/dlq/purge`

Process:

1. Marketing creates a broadcast or sends a targeted notification/template.
2. Notification service applies template rendering, settings, preferences, quiet hours, feature-based channel rules, and delivery logs.
3. Delivery failures can enter the dead-letter queue when queueing is enabled.
4. Marketing/admin reviews analytics and replays or purges failed delivery jobs.
5. Audit logs record sends, template changes, DLQ replay, and purge actions.

Notifications and emails:

- Depends on selected category/template/channels.
- Delivery can include in-app, push, email, and SMS after settings and plan rules are applied.

### Moderation, KYC, And Safety Flow

```text
Moderator / Content Moderator / KYC Reviewer / Admin
  -> Unified moderation queue
  -> Media queue
       -> Approve / reject media
  -> Chat queue
       -> Approve / reject flagged message
  -> KYC queue
       -> Approve / reject verification
  -> User reports / blocks through admin safety operations
```

Roles:

- Moderation queue: `super_admin`, `admin`, `moderator`, `content_moderator`, `kyc_reviewer`.
- Media review requires media permissions.
- Chat review requires chat moderation permissions.
- KYC review requires profile verification permissions.

Implemented API areas:

- `GET /admin/moderation/queue`
- `GET /admin/moderation/media`
- `PATCH /admin/moderation/media/:mediaId/review`
- `GET /admin/moderation/chat`
- `PATCH /admin/moderation/chat/:messageId/review`
- `GET /admin/moderation/kyc`
- `POST /admin/moderation/kyc/:userId/review`

Process:

1. Reviewer loads queue by type/status.
2. Reviewer approves or rejects the item with optional note/reason.
3. Media, chat, or KYC service updates the target record.
4. Rejected chat messages emit realtime deletion events to the conversation.
5. Review action is written to admin audit logs.

Notifications and emails:

- KYC/media rejection or approval should notify users through system/profile verification templates where product policy requires it.
- Chat moderation currently affects realtime conversation state; explicit user education copy should be added where needed.

### Plan And Feature Management Flow

```text
Super Admin / Admin
  -> Plans
       -> List plan catalog
       -> Create plan
       -> Update plan
  -> Features
       -> Create feature
       -> Update feature
       -> Delete feature
  -> Plan features
       -> View effective feature matrix
```

Roles:

- `super_admin`, `admin`.

Process:

1. Admin reviews active plans and features.
2. Admin creates or updates plan/feature definitions.
3. Feature changes affect member gates such as interests, chat, media upload, support tickets, profile analytics, notifications, and premium discovery.

Notifications and emails:

- Plan catalog changes do not notify users by default.
- User subscription changes should use subscription notifications when triggered for an individual user.

### Curated Matches Operations Flow

```text
Curator / Admin
  -> Curated matches queue
  -> Create curated match
  -> Update / dismiss / expire curated match
  -> User sees curated match in Matches/Home
```

Roles:

- Curator roles are defined in the curated matches admin controller and include privileged admin/moderation-style access.

Process:

1. Staff selects a user and candidate profile.
2. Backend creates or updates a curated match record.
3. Member discovery endpoints surface curated matches.
4. Member can dismiss curated matches from the app.

Notifications and emails:

- Curated match delivery should use match-found/curated-match notification templates when configured.

### Analytics Flow

```text
Admin / Finance / Marketing
  -> Admin analytics
       -> Dashboard metrics
       -> Funnel/business analytics
       -> Notification analytics
       -> Payment analytics
```

Roles:

- `super_admin`, `admin`, `finance`, `marketing_admin`.

Process:

1. Staff requests analytics by date range/query.
2. Backend aggregates analytics events, payments, users, matches, or notifications depending on endpoint.
3. Finance uses payment/reporting views; marketing uses notification/funnel views; admins use full dashboard views.

Notifications and emails:

- Analytics views are read-only and do not notify users.

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

Implemented auth deep-link targets:

- Reset password with reset code exchange.
- Magic login with token verification.

Recommended deep-link targets:

- Notification detail.
- Match detail.
- Chat room.
- Support ticket detail.
- Payment/subscription result.

## Admin And Moderation Flow Summary

Admin capabilities are API-backed in this backend and surfaced through the PHP admin UI in `../juaaree-main-app`. The admin UI currently covers:

- Dashboard metrics.
- User management.
- RBAC.
- Moderation queues for profile reports, media, KYC, and chat.
- Support-ticket queue.
- Staff role dashboards for support, finance, marketing, KYC, content moderation, and general moderation.
- Plan and feature management.
- Payments, refunds, reconciliation, GST/settlement reports.
- Notification templates, broadcasts, analytics, and DLQ replay.
- Curated matches and success stories.
- Audit logs.

Admin UI changes should be tracked against `../juaaree-main-app`; API contract and backend behavior should be tracked in this repository.

## Functionality Coverage Checklist

This flow document now covers these implemented application areas:

- Auth, sessions, refresh, logout, 2FA, password reset, magic login, phone OTP, social auth.
- Member onboarding, profile, preferences, media, verification/KYC touchpoints.
- Discovery, recommended/new/nearby/online/curated matches, interests, shortlist, unmatch, profile views.
- Chat rooms, chat requests, messages, attachments, moderation, read/delivered state, room settings.
- Notifications, device tokens, templates, realtime unread counts, push/email/SMS delivery, DLQ, notification analytics.
- Membership, plans, features, subscriptions, web/store payment verification, invoices, refunds, reports.
- Settings across account, privacy, notification, communication, security, accessibility, AI, media, localization, theme, language.
- Support tickets, help/support contact routes, FAQs, community guidelines, legal/static pages.
- Referrals and wallet/reward surfaces.
- Analytics tracking and admin analytics.
- Admin/staff RBAC, roles, permissions, user operations, audit logs.
- Staff access for super admin, admin, support, finance, KYC reviewer, content moderator, marketing admin, moderator, and user.
- Dedicated Match Mate admin UI in `../juaaree-main-app`, including login/session bridge, dashboard, list/form/action views, resource filters, row actions, global actions, and API probe tooling.

Known documentation gaps to keep closing as code evolves:

- Exact backend role restrictions for each admin UI page should be kept aligned with the Match Mate API controllers and the Juaaree menu permissions.
- Success-story public/member submission flow should get a dedicated deep dive if it becomes launch-critical.
- Account deletion, data export, consent, privacy, blocked users, referrals, wallet, and static/legal pages can be expanded into their own deep dives if product needs per-screen acceptance criteria.
- Notification template keys should be mapped one-by-one after final template naming is frozen.

## Cross-Cutting UX Rules

- Preserve user context when moving between list, detail, chat, and settings screens.
- Always provide loading, empty, error, and retry states for network-backed screens.
- Keep destructive actions confirmed: block, report, deactivate, delete account, cancel subscription, delete message, close ticket.
- Keep safety and trust signals visible: verification, profile completion, blocked/reported state, secure account notices.
- Keep localization complete for all visible copy, including API success/error codes.
- Keep accessibility in the interaction model: readable text, touch target size, screen reader labels, contrast, reduced motion where needed.
- Avoid duplicate API calls from toggles and settings controls.
- For long lists, use pagination/infinite loading and stable placeholders.
- Explain premium gates at the moment of need, not only on the plan page.

## Recommended Improvements

1. Add a documented auth-state matrix: logged out, logged in without onboarding, logged in with onboarding complete, token refresh failed, 2FA required.
2. Add a profile-completion journey that links missing sections directly to `EditProfile` and `EditPreference`.
3. Add explicit empty-state copy for discovery filters, no nearby permission, no chats, no notifications, and no support tickets.
4. Add contextual support entry points from payment, verification, media moderation, and account deletion.
5. Add saved filters only after current filter behavior and pagination are stable.
6. Add deep-link QA cases for reset password, magic login, notification detail, match detail, chat, and payment result.
7. Add UX acceptance criteria to each launch-critical flow in the task roadmap.
8. Add an onboarding persistence plan before increasing onboarding from 3 steps to a longer guided journey.
9. Add a notification matrix per flow showing exact category, channels, action target, and template key where applicable.

## Documentation Ownership

- Keep this file focused on user journeys and screen flow decisions.
- Keep endpoint lists and technical architecture in [Technical Plan](TECHNICAL-PLAN.md).
- Keep delivery scope, milestones, risks, and project governance in [Project Plan](PROJECT-PLAN.md).
- Keep implementation backlog and launch work in [Task Roadmap](TASK-ROADMAP.md).
