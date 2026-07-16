# Database Plan

> Current home: `docs/planning/DATABASE-PLAN.md`
>
> Purpose: MongoDB collection ownership, entity relationships, Redis/local cache usage, queues, socket runtime state, data lifecycle, indexing, backup, and database operations.
>
> Source-of-truth rule: keep database design and data lifecycle decisions here. Keep API/module architecture in [Technical Plan](TECHNICAL-PLAN.md), user journeys in [Flow Plan](FLOW-PLAN.md), and delivery planning in [Project Plan](PROJECT-PLAN.md).

## Current Data Architecture

Match Mate uses MongoDB as the durable system of record and Redis or local cache as the short-lived operational store.

```text
Expo mobile app
  -> NestJS API
       -> MongoDB with Mongoose schemas
       -> Cache service
            -> Redis when CACHE_DRIVER=redis
            -> local-db/local-cache.json when CACHE_DRIVER=local
       -> BullMQ notification queue when enabled
       -> Socket.IO
            -> Redis pub/sub adapter when CACHE_DRIVER=redis
            -> local Socket.IO adapter otherwise
```

MongoDB owns users, sessions, profiles, preferences, media metadata, matching, interests, chat history, safety records, settings, payments, subscriptions, referrals, notifications, RBAC/admin records, analytics, support tickets, and success stories.

Redis/local cache owns OTPs, one-time login/password/2FA markers, rate-limit counters, temporary blocks, profile/preference read caches, plan feature caches, feature usage counters, chat presence, notification queue jobs, and Socket.IO pub/sub.

## Database Ownership Rules

- `match-mate-api-server/src/common/constants/collection-names.constants.ts` is the collection-name source of truth.
- `match-mate-api-server/src/modules/**/schemas/*.schema.ts` is the field and index source of truth.
- This document mirrors the current database model and explains collection purpose, important fields, relationships, indexes, cache behavior, and operational expectations.
- Add a collection constant, schema, indexes, repository/service boundary, export/deletion handling, and seed data when introducing new durable data.
- Do not store business-critical data only in Redis/local cache. Payment, notification, chat, auth, and account decisions must have a MongoDB record when they need auditability.
- Code-level source-of-truth and retention defaults live in `match-mate-api-server/src/common/constants/data-governance.constants.ts`.
- Retained/compliance-sensitive records use additive lifecycle fields where applicable: `deletedAt`, `anonymizedAt`, `retentionReason`, and `legalHoldUntil`.
- Business-critical mutable records use audit fields where applicable: `createdBy`, `updatedBy`, `source`, `reason`, `metadata`, and `version`.
- PII classification, encryption candidates, schema-version targets, retention, and archive policy are tracked in `DATA_PII_CLASSIFICATION`, `DATA_ENCRYPTION_STRATEGY`, `DATA_SCHEMA_VERSION_TARGETS`, `DATA_RETENTION_POLICY_DAYS`, and `DATA_ARCHIVE_POLICY_DAYS`.

## Source-of-Truth Decisions

| Area                           | Source of Truth                                     | Mirrors / Supporting Fields                                | Rule                                                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Membership entitlement         | `subscriptions`                                     | `users.membership`                                         | Use `subscriptions` for billing history, renewal, cancellation, and entitlement decisions. `users.membership` is a fast-read snapshot for auth/profile checks and must be synchronized from subscription lifecycle code. |
| Login/account access           | `users.status`                                      | `account_settings.isDeactivated`, deletion schedule fields | `users.status` decides whether a user can authenticate. `account_settings` stores lifecycle requests and user-facing settings state.                                                                                     |
| Discovery visibility           | `profiles.status`                                   | `privacy_settings.profileVisibility`, `account_settings`   | `profiles.status` decides whether the profile can appear in discovery/search. Privacy settings further narrow who can see it.                                                                                            |
| Notification feed              | `notifications`                                     | `notifications.delivery` compact snapshot                  | `notifications` owns in-app feed state: read, delete, category, action, and latest delivery summary.                                                                                                                     |
| Notification provider attempts | `notification_logs`                                 | none                                                       | Provider/channel attempts, payloads, responses, retries, and errors belong in `notification_logs`.                                                                                                                       |
| Media lifecycle                | `media.status`                                      | `media.isActive`, storage object state                     | `status` is file lifecycle: `processing`, `active`, or `deleted`.                                                                                                                                                        |
| Media moderation               | `media.moderationStatus`                            | `moderationReasons`, `reviewedBy`, `reviewedAt`            | `moderationStatus` is trust/safety review state: `pending`, `approved`, `flagged`, or `rejected`.                                                                                                                        |
| Media read visibility          | `media.isActive`                                    | `status`, `moderationStatus`                               | `isActive` is a fast query flag. Visible media should be active, lifecycle-active, and moderation-allowed.                                                                                                               |
| Chat room membership           | `chat_rooms.participants`                           | `participantHash`                                          | `participants` is the canonical list of room members.                                                                                                                                                                    |
| Per-user chat room state       | `chat_rooms.participantStates`                      | none                                                       | Read cursor, unread count, archive, pin, and mute state belong in `participantStates`, keyed by user.                                                                                                                    |
| Casual profile signals         | `interactions`                                      | activity logs where needed                                 | Views, shortlists, contact views, boosts, and analytics-style profile actions belong in `interactions`.                                                                                                                  |
| Formal interest requests       | `interests`                                         | optional interaction audit/mirror rows                     | Sent/received/accepted/rejected relationship intent belongs in `interests`.                                                                                                                                              |
| Computed compatibility         | `matches`                                           | `curated_matches` for admin picks                          | Algorithmic match score, mutuality, active/expired state belong in `matches`.                                                                                                                                            |
| Safety relationships           | `user_blocks`, `user_reports`, `user_profile_hides` | optional interaction audit/mirror rows                     | Durable block/report/hide behavior belongs in safety collections, not `interactions`.                                                                                                                                    |

## Soft Delete, Anonymization, and Audit Fields

| Collection Area                              | Fields                                                                                                                                | Functional Behavior                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Users, profiles, media, account settings     | `deletedAt`, `anonymizedAt`, `retentionReason`, `legalHoldUntil`                                                                      | Account erasure marks retained identity/profile/media metadata as deleted/anonymized and removes direct PII where policy allows.                                                 |
| Payments, invoices, subscriptions            | `anonymizedAt`, `retentionReason`, `legalHoldUntil`, `source`, `reason`, `metadata`, `version`, plus selected `createdBy`/`updatedBy` | Account erasure keeps finance records for tax/reconciliation while replacing customer PII with deleted-account placeholders and removing phone/GST/store purchase token details. |
| Verification, user reports, admin audit logs | `anonymizedAt`, `retentionReason`, `legalHoldUntil`, `source`, `reason`, `metadata`, `version`                                        | Account erasure keeps trust/safety/audit evidence, removes KYC file/provider payload/IP/user-agent fields, and marks records with compliance retention reasons.                  |
| Promotion coupons, curated matches           | `deletedAt`, `retentionReason`, `legalHoldUntil`, `createdBy`, `updatedBy`, `source`, `reason`, `metadata`, `version`                 | Supports admin auditability and future soft-delete/legal-hold workflows for campaign and curation operations.                                                                    |

## MongoDB Collection Inventory

### Auth and Identity

| Collection      | Schema                                | Main Fields                                                                                                                                                                                                                                                                                              | Indexes                                                                                                                                   | Need and Use                                                                                                                 |
| --------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `users`         | `auth/schemas/user.schema.ts`         | `email`, `phone.countryCode`, `phone.phone`, `passwordHash`, `status`, `isEmailVerified`, `isPhoneVerified`, `isOnboardingCompleted`, `referralCode`, `referralPoints`, `roles`, `permissions`, `membership`, `authAccounts`, `failedLoginAttempts`, `lastLoginAt`, password recovery fields, 2FA fields | unique `email`; unique sparse `phone.phone`; unique sparse `referralCode`; indexed social auth provider/providerId via schema definitions | Core identity and login record. Drives access, onboarding, roles, referral code, membership snapshot, and social auth links. |
| `user_sessions` | `auth/schemas/user-session.schema.ts` | `userId`, `refreshTokenHash`, `tokenFamilyId`, `device`, `ip`, `userAgent`, `isActive`, `expiresAt`, timestamps                                                                                                                                                                                          | unique `refreshTokenHash`; TTL `expiresAt`                                                                                                | Refresh session store. Supports logout, logout-all, token rotation, device tracking, and automatic expired-session cleanup.  |

### Profile, Preference, Media, and Activity

| Collection      | Schema                                               | Main Fields                                                                                                                                                                                                                                  | Indexes                                                                                                                                                                | Need and Use                                                                                                                                                                                |
| --------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `profiles`      | `profiles/schemas/profile/profile.schema.ts`         | `userId`, `profileFor`, `personal`, `physical`, `education`, `career`, `family`, `religiousDetails`, `lifestyle`, `location`, `age`, `profileScore`, `profileCompletionPercentage`, `visibilityScore`, `isPremium`, `status`, `lastActiveAt` | unique `userId`; discovery compound indexes on gender/religion/city/status/score fields; `location` 2dsphere                                                           | Main matrimonial profile used by onboarding, profile detail, discovery, matching, and admin review. Nested profile schemas hold personal, physical, education, family, and related details. |
| `preferences`   | `profiles/schemas/preference/preference.schema.ts`   | `userId`, `filters` with age/height/location/religion/caste/education/profession/income/marital and other partner filters, `settings`, `weights`, `schemaVersion`                                                                            | unique `userId`                                                                                                                                                        | Partner-preference document used by match scoring and search. Separating it from profile keeps user profile and desired-partner filters independent.                                        |
| `media`         | `profiles/schemas/media/media.schema.ts`             | `userId`, `type`, `url`, `mimeType`, `isPrimary`, `status`, `moderationStatus`, `moderationReasons`, `isActive`, `uploadedAt`                                                                                                                | `type`; `isPrimary + isActive`; `moderationStatus + status + createdAt`; user/status/isActive/isPrimary/uploadedAt compounds; partial unique primary-media constraints | Stores photo/video metadata and moderation state. Actual files live in configured storage, while Mongo keeps review, ordering, primary, and active flags.                                   |
| `interactions`  | `profiles/schemas/interaction/interaction.schema.ts` | `fromUserId`, `toUserId`, `type`, `status`, timestamps                                                                                                                                                                                       | `fromUserId + createdAt`; `toUserId + type + status`; `status + createdAt`; pair/type uniqueness from schema-level constraints                                         | Tracks profile-level actions such as views, likes, shortlists, and history needed for activity feeds and duplicate prevention.                                                              |
| `activity_logs` | `profiles/schemas/settings/activity-logs.schema.ts`  | `userId`, `category`, `action`, metadata, timestamps                                                                                                                                                                                         | `userId + createdAt`; `action`                                                                                                                                         | User activity/security history for settings screens, export, audit, and debugging.                                                                                                          |

### Matching and Discovery

| Collection        | Schema                                    | Main Fields                                                                        | Indexes                                                                                       | Need and Use                                                                                                                               |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `matches`         | `matches/schemas/match.schema.ts`         | `userId`, `targetUserId`, `score`, `isMutual`, `isActive`, `expiresAt`, timestamps | unique `userId + targetUserId`; `score + isActive`; `isActive + expiresAt`                    | Stores computed match relationships and score snapshots for fast discovery and ranking.                                                    |
| `interests`       | `matches/schemas/interest.schema.ts`      | `senderId`, `receiverId`, `status`, timestamps                                     | unique `senderId + receiverId`; `receiverId + status`; `senderId + status`                    | Durable interest/request lifecycle: sent, received, accepted, rejected, withdrawn. Prevents duplicate requests between the same two users. |
| `curated_matches` | `matches/schemas/curated-match.schema.ts` | `userId`, `profileUserId`, `curatedById`, `priority`, `status`, timestamps         | `userId + status + priority + createdAt`; `profileUserId + status`; partial active uniqueness | Admin/premium curated recommendations that can be prioritized, dismissed, or tracked separately from algorithmic matches.                  |

### Chat

| Collection      | Schema                                | Main Fields                                                                                                                                                                        | Indexes                                                                                                                          | Need and Use                                                                                                             |
| --------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `chat_rooms`    | `chat/schemas/chat-room.schema.ts`    | `participantHash`, `roomType`, `participants`, `participantStates.userId`, `participantStates.unreadCount`, `createdById`, `status`, `messageCount`, `lastActivityAt`, timestamps  | unique `participantHash`/room key; `participants + status + lastActivityAt`; `participantStates.userId + lastActivityAt`         | Conversation container. Keeps room membership, unread counters, status, and last activity separate from message history. |
| `chat_messages` | `chat/schemas/chat-message.schema.ts` | `roomId`, `senderId`, `receiverId`, `type`, `content`, `attachments.url`, `status`, `moderationStatus`, `moderationReasons`, `isDeletedForEveryone`, `clientMessageId`, timestamps | `roomId + createdAt`; `receiverId + status + roomId`; `moderationStatus + createdAt`; sparse unique `clientMessageId + senderId` | Durable chat history with delivery/read/moderation state. Client message IDs provide idempotency for retries.            |

### Safety and Verification

| Collection           | Schema                                       | Main Fields                                                    | Indexes                                                 | Need and Use                                                                                 |
| -------------------- | -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `verifications`      | `safety/schemas/verification.schema.ts`      | `userId`, `status`, `provider`, submission/review metadata     | unique `userId`; `status + submittedAt`                 | KYC/eKYC/manual verification status used by trust badges, profile filters, and admin queues. |
| `user_blocks`        | `safety/schemas/user-block.schema.ts`        | `userId`, `blockedUserId`, timestamps                          | unique `userId + blockedUserId`                         | Prevents discovery, contact, and interaction between blocked users.                          |
| `user_profile_hides` | `safety/schemas/user-profile-hide.schema.ts` | `userId`, `hiddenUserId`, timestamps                           | unique `userId + hiddenUserId`; `hiddenUserId + userId` | Lets a user hide profiles from their own discovery without creating a full block.            |
| `user_reports`       | `safety/schemas/user-report.schema.ts`       | `reportedBy`, `reportedUserId`, reason/details/status metadata | unique `reportedBy + reportedUserId`                    | User/content report trail for moderation and support actions.                                |

### Settings and Consent

Every settings collection is user-owned and normally has a unique `userId` record. Splitting settings by domain keeps screens, defaults, and data export/deletion easier to reason about.

| Collection               | Schema                                             | Main Fields                                                                                                                                                                    | Indexes                                                 | Need and Use                                                                   |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `account_settings`       | `settings/schemas/account-setting.schema.ts`       | `userId`, account status, deactivation/deletion request fields, deletion completion metadata                                                                                   | unique `userId`                                         | Account lifecycle settings, deactivation, and deletion workflow state.         |
| `privacy_settings`       | `settings/schemas/privacy-setting.schema.ts`       | `userId`, `profileVisibility`, `showPhotosTo`, `showLastSeen`, contact/privacy flags                                                                                           | unique `userId`; `profileVisibility`                    | Controls discoverability, photo visibility, last seen, and contact exposure.   |
| `notification_settings`  | `settings/schemas/notification-setting.schema.ts`  | `userId`, channel toggles `inAppEnabled`, `pushEnabled`, `emailEnabled`, `smsEnabled`, `marketingEnabled`, `doNotDisturb`, category preferences, `quietHours`, sound/vibration | unique `userId`                                         | Per-user notification delivery preferences and quiet-hour decisions.           |
| `communication_settings` | `settings/schemas/communication-setting.schema.ts` | `userId`, `whoCanMessage`, `whoCanCall`, read receipts, typing, call/message controls                                                                                          | unique `userId`                                         | Chat/call permissions and communication behavior.                              |
| `security_settings`      | `settings/schemas/security-setting.schema.ts`      | `userId`, 2FA method, recovery code hashes, login devices, app lock/security flags                                                                                             | unique `userId`                                         | Security preferences, 2FA configuration, and device summary storage.           |
| `localization_settings`  | `settings/schemas/localization-setting.schema.ts`  | `userId`, language/region/timezone/currency/location-sharing fields, `dateFormat`                                                                                              | unique `userId`                                         | Locale, formatting, timezone, and regional settings.                           |
| `accessibility_settings` | `settings/schemas/accessibility-setting.schema.ts` | `userId`, `fontSize`, high contrast, reduced motion, screen reader, bold text flags                                                                                            | unique `userId`                                         | Accessibility behavior for mobile UI.                                          |
| `media_settings`         | `settings/schemas/media-setting.schema.ts`         | `userId`, `mediaQuality`, auto-download/autoplay/data-saver/private-photo options                                                                                              | unique `userId`                                         | Media consumption and privacy preferences.                                     |
| `ai_settings`            | `settings/schemas/ai-setting.schema.ts`            | `userId`, recommendation/ranking/profile-data AI preference flags                                                                                                              | unique `userId`                                         | AI personalization consent and ranking behavior controls.                      |
| `user_consents`          | `settings/schemas/user-consent.schema.ts`          | `userId`, `type`, `version`, `accepted`, `acceptedAt`, timestamps                                                                                                              | unique `userId + type + version`; `userId + acceptedAt` | Versioned consent evidence for terms, privacy, marketing, and data processing. |

### Subscriptions, Payments, Coupons, and Referrals

| Collection            | Schema                                           | Main Fields                                                                                                                                                                                                                         | Indexes                                                                                                                                            | Need and Use                                                                       |
| --------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `plans`               | `subscriptions/schemas/plan.schema.ts`           | `name`, `slug`, `tier`, `planType`, `billingCycle`, `price`, `durationDays`, `trialDays`, `autoRenewDefault`, `isCustom`, `currency`, `isPopular`, `sortOrder`, `isActive`, `storeProducts.android`, `storeProducts.ios`, `version` | unique `slug`; `tier`; `planType + sortOrder`; `price`; `isActive`; `sortOrder`; Android/iOS product ID indexes                                    | Public subscription plan catalog and app-store product mapping.                    |
| `features`            | `subscriptions/schemas/feature.schema.ts`        | `key`, `name`, `type`, `limit`, `isActive`, `version`                                                                                                                                                                               | unique `key`                                                                                                                                       | Feature catalog for premium limits and access checks.                              |
| `plan_features`       | `subscriptions/schemas/plan-feature.schema.ts`   | `planId`, `featureId`, enabled/limit override fields, `version`                                                                                                                                                                     | unique `planId + featureId`                                                                                                                        | Many-to-many bridge between plans and features. Cached by plan for feature checks. |
| `subscriptions`       | `subscriptions/schemas/subscription.schema.ts`   | `userId`, `planId`, `startDate`, `endDate`, `status`, auto-renew/store fields                                                                                                                                                       | user and status/date indexes from schema definitions                                                                                               | User subscription periods and renewal/cancel status.                               |
| `profile_boosts`      | `subscriptions/schemas/profile-boost.schema.ts`  | `userId`, `source`, `startsAt`, `endsAt`, `multiplier`, `status`                                                                                                                                                                    | `userId + status + endsAt`                                                                                                                         | Time-boxed visibility boosts that affect discovery ranking.                        |
| `payments`            | `payments/schemas/payment.schema.ts`             | `userId`, `orderId`, `amount`, `taxAmount`, `discountAmount`, `netAmount`, `currency`, `gateway`, `purpose`, `status`, `initiatedAt`, gateway/store IDs, signature verification, attempts, subscription/plan linkage                | unique `orderId`; gateway/store sparse unique indexes; `userId + createdAt`; `status + createdAt`; `gateway + storeOriginalTransactionId + paidAt` | Payment order, verification, refund/reconciliation, and store purchase tracking.   |
| `promotion_coupons`   | `payments/schemas/promotion-coupon.schema.ts`    | `code`, `title`, `discountType`, `discountValue`, `maxDiscountAmount`, `eligibleTiers`, `eligiblePlanTypes`, `eligiblePlanIds`, redemption limits, `redeemedCount`, `validFrom`, `validTill`, `status`                              | `code + status`; `validTill`                                                                                                                       | Coupon eligibility, discount calculation, and redemption limits.                   |
| `payment_invoices`    | `payments/schemas/payment-invoice.schema.ts`     | `invoiceNumber`, `paymentId`, `userId`, `orderId`, `currency`, `taxableAmount`, `discountAmount`, `gstPercentage`, `gstAmount`, `totalAmount`, `sacCode`, `issuedAt`                                                                | unique `invoiceNumber`; `userId + issuedAt`; `issuedAt`                                                                                            | Immutable invoice/tax record separate from payment attempts.                       |
| `referral_rewards`    | `referrals/schemas/referral-reward.schema.ts`    | `referrerId`, `referredUserId`, `referralCode`, `status`, registration/subscription reward points, subscription amount/rate, `totalPoints`, campaign metadata                                                                       | `referrerId + createdAt`; unique `referredUserId`; `campaign + createdAt`                                                                          | Tracks referral relationship and reward state.                                     |
| `wallet_transactions` | `referrals/schemas/wallet-transaction.schema.ts` | `userId`, `type`, `source`, `points`, `balanceAfter`, `status`, timestamps                                                                                                                                                          | `userId + createdAt`                                                                                                                               | Referral/coin wallet ledger. Keeps every credit/debit auditable.                   |

### Notifications

| Collection                   | Schema                                                      | Main Fields                                                                                                                                                                                                                                                       | Indexes                                                                                          | Need and Use                                                                 |
| ---------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `notifications`              | `notifications/schemas/notification.schema.ts`              | `userId`, `title`, `message`, `type`, `isRead`, `category`, `priority`, action payload, `isDeleted`, `isSentPush`, `isSentEmail`, `isSentSms`, delivery status snapshots, `dedupeKey`, timestamps                                                                 | `userId + isRead + createdAt`; `userId + category + createdAt`; `userId + dedupeKey + createdAt` | In-app notification feed and durable per-user notification record.           |
| `notification_templates`     | `notifications/schemas/notification-templates.schema.ts`    | `key`, `eventKey`, `locale`, `name`, `category`, `priority`, `title`, `message`, variables, channel templates `inApp/push/email/sms`, `channels`, `cooldownMinutes`, `maxPerDay`, `quietHours`, `tags`, `mandatory`, `status`, `isActive`, `createdBy`, `version` | unique template key/locale/version patterns; category/priority/event/status/isActive indexes     | Seeded templates for consistent notification copy and channel behavior.      |
| `notification_logs`          | `notifications/schemas/notification-logs.schema.ts`         | `notificationId`, `userId`, `channel`, `status`, provider response/error metadata, `retryCount`, timestamps                                                                                                                                                       | `notificationId + channel + createdAt`; channel/status indexes                                   | Delivery attempt history for push/email/SMS and operational troubleshooting. |
| `notification_device_tokens` | `notifications/schemas/notification-device-token.schema.ts` | `userId`, `deviceId`, `token`, `platform`, `isActive`, timestamps                                                                                                                                                                                                 | `token`; unique user/device/token pattern from schema definitions                                | Push-token registry by user/device/platform.                                 |

### Admin, Analytics, Support, and Success Stories

| Collection                  | Schema                                                | Main Fields                                                                                                                                               | Indexes                                                                                                                                             | Need and Use                                                                    |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `permissions`               | `admin/schemas/permission.schema.ts`                  | `name`, `module`, `isActive`, `version`                                                                                                                   | unique permission name; `module + isActive`                                                                                                         | RBAC permission catalog for admin/super-admin/finance/marketing/support access. |
| `roles`                     | `admin/schemas/role.schema.ts`                        | `name`, `type`, `default`, `permissions`, `isActive`, `version`                                                                                           | unique role name/type patterns from schema definitions                                                                                              | Role bundles for application and admin users.                                   |
| `admin_audit_logs`          | `admin/schemas/admin-audit-log.schema.ts`             | `actorId`, `action`, `resource`, `targetId`, metadata, timestamps                                                                                         | `createdAt`; `actorId + createdAt`; `resource + targetId + createdAt`                                                                               | Immutable-ish admin action history for accountability.                          |
| `analytics_events`          | `analytics/schemas/analytics-event.schema.ts`         | `eventType`, `userId`, `sessionId`, `platform`, `source`, `campaign`, `funnelStage`, `isPremium`, `occurredAt`, event metadata                            | `eventType + occurredAt`; `userId + occurredAt`; `platform + occurredAt`; `source + campaign + occurredAt`; `funnelStage + occurredAt`; `sessionId` | Raw analytics event stream for product, marketing, and funnel reporting.        |
| `analytics_daily_summaries` | `analytics/schemas/analytics-daily-summary.schema.ts` | `day`, `from`, `to`, `overview`, `funnel`, `generatedAt`                                                                                                  | unique day/date key from schema definitions; `generatedAt`                                                                                          | Daily rollups so dashboards do not scan raw events.                             |
| `support_tickets`           | `support/schemas/support-ticket.schema.ts`            | `userId`, `subject`, `category`, `priority`, `status`, `messages.authorId`, `messages.authorType`, `messages.message`, `messages.attachments`, timestamps | `userId + updatedAt`; `status + priority + updatedAt`; `category + status`                                                                          | User support case thread with assignment/status lifecycle.                      |
| `success_stories`           | `success-stories/schemas/success-story.schema.ts`     | `userId`, `title`, `story`, `partnerName`, `marriageDate`, `photoUrls`, `publicationConsent`, `status`, `publishedAt`, timestamps                         | `status + publishedAt`; `userId + createdAt`                                                                                                        | User-submitted success stories, moderated before publication.                   |

## Entity Relationship Summary

```text
User
  1 -> many UserSession
  1 -> 1 Profile
  1 -> 1 Preference
  1 -> many Media
  1 -> many ActivityLog
  1 -> 1 Verification
  1 -> 1 each Settings collection
  1 -> many UserConsent

User
  1 -> many Interest as sender
  1 -> many Interest as receiver
  1 -> many Match as user
  1 -> many Match as targetUser
  1 -> many CuratedMatch as recipient
  1 -> many Interaction as fromUser
  1 -> many Interaction as toUser

User
  many -> many User through user_blocks
  many -> many User through user_profile_hides
  many -> many User through user_reports

User
  many -> many ChatRoom through participants
  1 -> many ChatMessage as sender
  1 -> many ChatMessage as receiver

Plan
  many -> many Feature through plan_features
  1 -> many Subscription

Payment
  many -> 1 User
  0..1 -> 1 Subscription
  0..1 -> 1 Plan
  1 -> 0..1 PaymentInvoice

User
  1 -> many Subscription
  1 -> many Payment
  1 -> many ProfileBoost
  1 -> many ReferralReward as referrer
  1 -> 0..1 ReferralReward as referredUser
  1 -> many WalletTransaction

User
  1 -> many Notification
  1 -> many NotificationDeviceToken
  1 -> many NotificationLog
  1 -> many SupportTicket
  1 -> many SuccessStory
  1 -> many AnalyticsEvent
  1 -> many AdminAuditLog as actor, for admin users
```

MongoDB does not enforce foreign keys. Services and unique indexes protect integrity. Pair collections use compound uniqueness to prevent duplicates, especially interests, matches, blocks, hidden profiles, reports, and idempotent chat messages.

## Cache, Redis, and Runtime State

### Cache Drivers

| Driver  | Implementation                                               | Use                                                                                                                                                     |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `redis` | `RedisCacheService` using ioredis                            | Production and multi-instance environments. Supports TTL keys, pattern deletes with SCAN, atomic counters, set-if-absent, and consume-if-value-matches. |
| `local` | `LocalCacheService` persisted at `local-db/local-cache.json` | Local/single-process development only. Persists unexpired keys to disk and cleans expired keys every 60 seconds.                                        |

### Cache API

The shared cache interface supports `set`, `get`, `del`, `delByPattern`, `has`, `flush`, `incr`, `expire`, `incrementWithExpiry`, `setIfAbsent`, and `consumeIfValueMatches`.

### Current Cache Key Patterns

| Key Pattern                                                   | Owner           | TTL                          | Purpose                                                            |
| ------------------------------------------------------------- | --------------- | ---------------------------- | ------------------------------------------------------------------ |
| `auth:{userId}`                                               | `auth`          | 900 seconds                  | Short-lived access-token helper cache after login.                 |
| `auth:magic-link:{jti}`                                       | `auth`          | 600 seconds                  | One-time magic link marker consumed atomically.                    |
| `auth:password-reset:{code}`                                  | `auth`          | reset TTL from service       | Password reset token payload lookup. Deleted after use.            |
| `auth:password-reset:consumed:{jti}`                          | `auth`          | 900 seconds                  | Replay protection counter for password-reset token consumption.    |
| `auth:2fa:{challengeId}`                                      | `auth`          | 2FA challenge TTL            | 2FA challenge payload consumed atomically.                         |
| `auth:2fa:{challengeId}:attempts`                             | `auth`          | challenge attempt TTL        | Failed 2FA attempt counter; locks/deletes challenge when exceeded. |
| `auth:otp:{purpose}:{challengeId}:{destinationHash}`          | `auth`          | OTP TTL                      | Hashed OTP storage for phone/email/direct challenge purposes.      |
| `auth:otp:{purpose}:{challengeId}:{destinationHash}:attempts` | `auth`          | OTP TTL                      | OTP failed-attempt counter.                                        |
| `auth:otp:{purpose}:{challengeId}:{destinationHash}:cooldown` | `auth`          | cooldown TTL                 | Prevents repeated OTP sends during cooldown.                       |
| `profile:{userId}`                                            | `profiles`      | 300 seconds                  | Enriched profile read cache.                                       |
| `preference:{userId}`                                         | `profiles`      | 300 seconds                  | Preference read cache.                                             |
| `media:images:{userId}`                                       | `profiles`      | service-managed invalidation | Media image list invalidation key.                                 |
| `media:videos:{userId}`                                       | `profiles`      | service-managed invalidation | Media video list invalidation key.                                 |
| `plan_features:{planId}`                                      | `subscriptions` | 300 seconds                  | Active feature list for a plan.                                    |
| `usage:{userId}:{featureKey}:{window}`                        | `subscriptions` | window-based                 | Feature usage counter.                                             |
| `usage-marker:{userId}:{featureKey}:{window}`                 | `subscriptions` | window-based                 | Avoids double-counting marker-style feature usage.                 |
| `rate-limit:{name}:{method}:{route}:{identifier}`             | common guard    | route TTL                    | Per-route rate-limit counter.                                      |
| `blocked:{identifier}`                                        | common guard    | 3600 seconds                 | Temporary block after rate-limit breach.                           |
| `presence:user:{userId}`                                      | chat            | 90 seconds                   | Shared online marker for chat presence.                            |
| `presence:socket:{socketId}`                                  | chat            | 90 seconds                   | Shared socket-to-user lookup for disconnect handling.              |
| `presence:last-seen:{userId}`                                 | chat            | 90 days                      | Last seen timestamp after final socket disconnect.                 |
| BullMQ keys                                                   | notifications   | queue-managed                | Notification dispatch and DLQ state when queueing is enabled.      |

### Rate-Limit Windows

| Area                | TTL        | Default Limit         |
| ------------------- | ---------- | --------------------- |
| Login               | 15 minutes | 5 attempts            |
| Register            | 1 hour     | 3 attempts            |
| OTP send            | 1 hour     | 5 attempts            |
| Forgot password     | 1 hour     | 3 attempts            |
| Profile update      | 1 hour     | 10 requests           |
| Avatar/media upload | 1 hour     | 5 requests            |
| Send interest       | 1 day      | 50 free, 200 premium  |
| Profile view        | 1 day      | 100 free, 500 premium |
| Match search        | 1 hour     | 30 requests           |
| Chat send message   | 1 hour     | 100 free, 500 premium |
| General API         | 1 hour     | 1000 requests         |

### Cache Invalidation Rules

- Profile writes delete `profile:{userId}`.
- Preference writes delete `preference:{userId}`.
- Media writes delete `profile:{userId}`, `media:images:{userId}`, and `media:videos:{userId}`.
- Plan-feature changes delete `plan_features:{planId}`.
- Feature usage keys expire by usage window and should not be manually reset except through admin/debug tooling.
- OTP, magic-link, password-reset, and 2FA keys must expire and be deleted/consumed after successful use.
- Never cache raw passwords, raw OTPs, provider secrets, refresh tokens, payment signatures, KYC files, or private media binaries.

## Socket.IO and Presence

### Socket Adapter

- `HybridSocketIoAdapter` uses Redis pub/sub when `CACHE_DRIVER=redis` and both Redis clients are ready.
- If Redis is disabled or unavailable, the app falls back to local Socket.IO mode.
- Redis pub/sub distributes socket events across API instances. Chat presence also writes through the shared cache service so online and last-seen state can be read across instances.

### Chat Namespace: `/chats`

Connection input can provide JWT through `handshake.auth.token`, `Authorization: Bearer ...`, or `?token=...`. On connect, the gateway verifies JWT, checks `CHAT_ACCESS`, stores `socket.data.userId`, joins the user room, emits `connection:ready`, and broadcasts `presence:update`.

| Client Event   | Input                     | Process                                                                                                                                          | Server Response/Event                                             | Data Impact                                                      |
| -------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| connect        | JWT                       | Verify token, check chat feature access, add socket to local and shared-cache presence, join `user:{userId}` style room through realtime service | `connection:ready`; `presence:update`                             | Presence cache and local socket map updated.                     |
| `room:join`    | `roomId`                  | Validate room access, join conversation room, load recent messages                                                                               | `room:joined`                                                     | No durable write unless service updates read/activity elsewhere. |
| `room:leave`   | `roomId`                  | Leave conversation room                                                                                                                          | `room:left`                                                       | No durable write.                                                |
| `message:send` | room/message payload      | Check `MESSAGE_LIMIT`, create message through chat service, emit realtime message through service                                                | `message:sent` plus room/user notifications from realtime service | Writes `chat_messages`; updates `chat_rooms` counters/activity.  |
| `message:read` | `roomId` and read payload | Mark room read through chat service                                                                                                              | `message:read:ack`                                                | Updates unread/read state in chat collections.                   |
| `typing`       | `roomId`, `isTyping`      | Validate conversation access, update Redis TTL key `typing:room:{roomId}:user:{userId}`, broadcast to conversation room                          | `typing`; `typing:ack`                                            | Transient Redis state; TTL only, no durable Mongo write.          |
| disconnect     | socket id                 | Remove socket from local and shared-cache presence; if last local socket, save lastSeen                                                          | `presence:update`                                                 | Presence marker is cleared and `lastSeen` is cached.             |

Current chat presence uses local maps as fast in-process hints and the shared cache service for cross-instance state:

- `presence:user:{userId}` marks an online user with a short TTL.
- `presence:socket:{socketId}` maps socket ID to user ID with a short TTL.
- `presence:last-seen:{userId}` stores the last disconnect timestamp with a bounded retention TTL.
- Typing events remain transient socket broadcasts and are not durable.

### Notifications Namespace: `/notifications`

Connection input accepts JWT from auth token, authorization header, or query token. On connect, the gateway verifies JWT, stores `socket.data.userId`, joins the notification user room, and emits `connection:ready`. Socket.IO cleanup handles disconnect. Durable notification data remains in `notifications` and `notification_logs`.

### Payment Sockets

The current `payments/controllers/payments.gateway.ts` file defines a payment gateway interface for order creation and verification; it is not a Socket.IO gateway. Payment state is durable in `payments` and `payment_invoices`.

## Notification Queue

- Notification dispatch can use BullMQ when queueing is enabled.
- Queue names are `notification-dispatch` and `notification-dispatch-dlq`.
- Job IDs are derived from notification IDs where possible to reduce duplicate dispatch.
- Queue state is operational. Durable user notification state lives in `notifications`, and delivery attempts/provider results live in `notification_logs`.

## Data Lifecycle and Retention

| Data Type                      | Lifecycle                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| User account                   | Durable until deletion completes; deactivation should preserve data until policy allows deletion. |
| User sessions                  | TTL cleanup on `expiresAt`; revoke on logout, logout-all, token rotation, and security actions.   |
| Profile/preferences/settings   | Durable user-owned data; included in export and deletion workflows.                               |
| Media metadata                 | Durable metadata; object lifecycle depends on local/S3 storage and moderation/deletion policy.    |
| Matches/interests/interactions | Durable relationship history unless policy requires deletion/anonymization.                       |
| Chat rooms/messages            | Durable conversation history unless deletion/moderation policy removes or redacts content.        |
| Notifications/logs             | In-app records are durable; delivery logs should have bounded retention for operations.           |
| Payments/invoices              | Long-term retention for finance, refunds, tax, and compliance.                                    |
| Admin audit logs               | Long-term retention for accountability.                                                           |
| Analytics events               | Raw events need a retention policy; daily summaries can be retained longer.                       |
| Support tickets                | Retain according to support/legal policy.                                                         |
| Success stories                | Retain only while consent and publication status allow.                                           |
| Cache keys                     | Ephemeral; TTL wherever possible.                                                                 |

## Data Export and Deletion

The export/deletion model must include user-owned data across:

- User, sessions, profile, preference, media, interactions, activity logs.
- Matches, interests, curated matches, blocks, hidden profiles, reports, verification.
- Chat rooms/messages where policy allows export.
- Notifications, device tokens, notification logs.
- Plans/subscriptions/payments/invoices/referrals/wallet records, with finance records retained or anonymized as legally required.
- Account, privacy, notification, communication, security, localization, accessibility, media, AI settings, and consents.
- Analytics events, support tickets, and success stories.

Recommended deletion flow:

1. Mark deletion requested in `account_settings`.
2. Revoke `user_sessions` and auth/cache challenge keys.
3. Remove profile from discovery by profile/account status.
4. Retain finance/audit records where legally required.
5. Delete or anonymize profile, preferences, media metadata, notifications, settings, referrals, analytics, support, and success-story user identifiers according to policy.
6. Delete physical media files from local/S3 storage when policy allows.

## Migrations and Index Audits

The versioned MongoDB migration runner records production data/index transitions that cannot be handled safely by ordinary app startup. It is not necessary to create empty migrations for every existing collection.

Registered migrations:

| Migration                                               | Purpose                                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `202606220001-add-payment-store-transaction-index`      | Adds payment store transaction index for purchase reconciliation.                        |
| `202607040001-add-subscription-purchase-token-index`    | Adds subscription purchase token index for store subscriptions.                          |
| `202607090001-move-personal-astro-to-religious-details` | Moves astrology fields from personal profile data into religious details.                |
| `202607130001-align-notification-email-defaults`        | Aligns notification email defaults.                                                      |
| `202607140001-hash-refresh-sessions`                    | Migrates refresh sessions to hashed refresh token storage.                               |
| `202607160001-ensure-settings-user-unique-indexes`      | Ensures one-user-one-document unique `userId` indexes exist on all settings collections. |
| `202607160002-add-retention-audit-indexes`              | Adds retention/anonymization/legal-hold indexes for compliance-sensitive collections.    |

Operational rules:

- Do not auto-apply migrations during API startup.
- Apply migrations after backup and staging verification with `npm run migration:up` or `npm run migration:up:prod`.
- `npm run index:audit` compares registered Mongoose indexes with MongoDB without modifying the database.
- Use `npm run index:audit -- --strict` before releases to fail on unexpected legacy indexes.
- `npm run db:audit:ci` runs credential-free database checks in CI; `npm run db:audit:staging` runs real index/explain checks when staging `MONGO_URI` is available.
- Keep `MONGO_AUTO_INDEX=false` in staging/production and create/drop indexes through reviewed migrations or release operations.

## Backup and Recovery

### MongoDB

- Use managed backups or scheduled `mongodump` snapshots.
- Keep point-in-time restore enabled where the provider supports it.
- Test restores into staging before launch and before major migrations.
- Encrypt backups at rest and restrict restore permissions.
- Keep indexes reproducible from schemas and migrations.
- Follow `docs/operations/DATABASE-RUNBOOK.md` for migration, restore drill, and monitoring checklists.

### Redis

- Treat Redis cache keys as disposable unless BullMQ queue durability is explicitly required.
- Configure Redis persistence only if queue durability requirements need it.
- Never rely on Redis as the only copy of payment, notification, chat, or account data.

## Operational Guidelines

- Production should use `CACHE_DRIVER=redis`; local cache is only for development/single-process use.
- Monitor MongoDB connection count, slow queries, disk, memory, index usage, and replication lag.
- Paginate large list endpoints against indexed fields.
- Avoid unbounded embedded arrays in high-write documents. Chat messages, notifications, payments, logs, analytics, and support messages should remain carefully bounded or split if growth becomes high.
- Keep internal Mongo references consistent as `Types.ObjectId`; external provider/order/idempotency references remain strings with explicit semantics.
- Use transactions only where cross-collection consistency matters and the deployment supports them.
- Use bulk writes in seeders, migrations, and admin maintenance jobs.
- Keep real credentials, payment secrets, and provider secrets out of seed data and docs.

## Recommended Improvements

1. Add scheduled retention/archive jobs that consume `DATA_RETENTION_POLICY_DAYS` and `DATA_ARCHIVE_POLICY_DAYS`; `npm run archive:policy` prints the approved high-volume collection archive plan.
2. Add strict CI enforcement around `npm run index:audit -- --strict` when an ephemeral Mongo service is available in CI.
3. Review strict index-audit output before each release and remove obsolete indexes only through migrations.
4. Add operational metrics for account deletion/anonymization and physical S3/local media erasure.
5. Add a database seed manifest for plans, features, plan features, notification templates, settings defaults, RBAC, support examples, and dummy profiles.
6. Run MongoDB explain-plan checks with `npm run explain:audit`; use `-- --dry-run` in CI without Mongo and a real `MONGO_URI` against staging/prod for execution stats.
7. Add queue health and DLQ metrics to monitoring dashboards.
8. Generate an ER diagram or Mermaid export for non-engineering stakeholders.

## Documentation Ownership

- Collection names: `COLLECTION_NAMES`.
- Field definitions and index declarations: Mongoose schema files.
- Relationships, data lifecycle, cache, queues, and socket runtime state: this file.
- API endpoints: [Technical Plan](TECHNICAL-PLAN.md) and Swagger.
- User flows: [Flow Plan](FLOW-PLAN.md).
- Launch and deployment operations: `docs/launch/*` and `docs/operations/*`.
