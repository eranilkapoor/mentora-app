# Database Plan

> Current home: `docs/planning/DATABASE-PLAN.md`
>
> Purpose: MongoDB collection ownership, entity relationships, Redis/cache usage, data lifecycle, indexing, backup, and database operational recommendations.
>
> Source-of-truth rule: keep database design and data lifecycle decisions here. Keep API/module architecture in [Technical Plan](TECHNICAL-PLAN.md), user journeys in [Flow Plan](FLOW-PLAN.md), and delivery planning in [Project Plan](PROJECT-PLAN.md).

## Current Data Architecture

Match Mate uses MongoDB as the primary persistent database and Redis or local cache as the secondary ephemeral data layer.

```text
Expo app
  -> NestJS API
       -> MongoDB with Mongoose schemas
       -> Cache service
            -> Redis, when CACHE_DRIVER=redis
            -> Local file-backed cache, when CACHE_DRIVER=local
       -> Socket.IO
            -> Redis adapter in multi-instance mode
            -> Local adapter in single-instance mode
```

MongoDB owns durable business records: users, profiles, preferences, matches, chat history, notifications, payments, settings, admin records, analytics, support tickets, and audit trails.

Redis/local cache owns short-lived operational state: rate limits, login/auth helper keys, cached profile/preference reads, plan-feature cache, daily feature usage counters, notification queue jobs, and Socket.IO pub/sub.

## Database Ownership Rules

- Mongoose schemas in `match-mate-api-server/src/modules/**/schemas` are the field-level source of truth.
- `COLLECTION_NAMES` in `match-mate-api-server/src/common/constants/collection-names.constants.ts` is the collection-name source of truth.
- This document explains relationships, lifecycle, indexing intent, and operational behavior. It should not copy every schema field.
- Any new module with persistent data must add:
  - A collection name constant.
  - A Mongoose schema with indexes.
  - A repository/service boundary.
  - Data export/deletion handling if it stores user data.
  - Seed data if the collection is required for first-run behavior.

## MongoDB Collection Map

### Auth and Identity

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `users` | `auth` | Core user account, email/phone/social auth state, roles, referral code, auth accounts, recovery metadata |
| `user_sessions` | `auth` | Refresh-token sessions, device/session metadata, expiration and revocation |

### Profile and Preferences

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `profiles` | `profiles` | Structured matrimonial profile, derived completion/scoring, location and discoverability fields |
| `preferences` | `profiles` | Partner preferences and match scoring weights |
| `media` | `profiles` | Profile photos, video intros, storage metadata, moderation status, primary media state |
| `interactions` | `profiles` | Profile-level interactions such as views, likes, shortlists, and status history |
| `activity_logs` | `profiles` / `settings` | User activity and account/security related event history |

### Matching and Discovery

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `matches` | `matches` | Match score records between user pairs, active/expired state |
| `interests` | `matches` | Interest/request sent, received, accepted, rejected, withdrawn state |
| `curated_matches` | `matches` | Premium/admin curated recommendations and dismissal state |

### Chat

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `chat_rooms` | `chat` | Conversation rooms, participants, match/chat request state, room settings, last activity |
| `chat_messages` | `chat` | Message history, sender/receiver, attachments, reactions, delivery/read/moderation state |

### Safety and Verification

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `verifications` | `safety` | KYC/eKYC/manual verification state for each user |
| `user_blocks` | `safety` | User block relationships |
| `user_profile_hides` | `safety` | Per-user hidden profile relationships |
| `user_reports` | `safety` | Reports against users/content for moderation |

### Settings and Consent

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `account_settings` | `settings` | Account status, deactivation, deletion request/completion metadata |
| `privacy_settings` | `settings` | Profile visibility, contact visibility, screenshot/photo/online status controls |
| `notification_settings` | `settings` | Channel preferences, quiet hours, category preferences |
| `communication_settings` | `settings` | Read receipts, typing indicators, message permissions, voice/video preferences |
| `security_settings` | `settings` | 2FA/app PIN/security notification/device summary preferences |
| `localization_settings` | `settings` | Language, region, timezone, currency, location sharing |
| `accessibility_settings` | `settings` | High contrast, reduced motion, screen reader, bold text |
| `media_settings` | `settings` | Media auto-download/autoplay/data saver/private photo options |
| `ai_settings` | `settings` | AI recommendation, ranking, compatibility, profile data usage preferences |
| `user_consents` | `settings` | Versioned consent records for terms, privacy, marketing, data processing |

### Monetization, Billing, and Referrals

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `plans` | `subscriptions` | Public subscription plans and pricing metadata |
| `features` | `subscriptions` | Feature catalog and usage limit keys |
| `plan_features` | `subscriptions` | Plan to feature mapping |
| `subscriptions` | `subscriptions` | Current and historical subscription periods, renewal/cancel state |
| `profile_boosts` | `subscriptions` | Time-boxed profile boost records |
| `payments` | `payments` | Payment orders, gateway/store identifiers, status, amount, reconciliation fields |
| `promotion_coupons` | `payments` | Coupon code validity, discounts, campaign limits |
| `payment_invoices` | `payments` | Invoice number, payment linkage, tax/GST/receipt metadata |
| `referral_rewards` | `referrals` | Referral relationships and reward status |
| `wallet_transactions` | `referrals` | Coin/referral wallet credit/debit ledger |

### Notifications

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `notifications` | `notifications` | In-app notification records, read state, category/action metadata |
| `notification_templates` | `notifications` | Seeded notification templates for channels/events/locales |
| `notification_logs` | `notifications` | Channel delivery attempts and provider response metadata |
| `notification_device_tokens` | `notifications` | Push device tokens by user/device/platform |

### Admin, Analytics, and Support

| Collection | Owner Module | Purpose |
| ---------- | ------------ | ------- |
| `permissions` | `admin` | RBAC permission catalog |
| `roles` | `admin` | RBAC roles and permission assignment |
| `admin_audit_logs` | `admin` | Admin action audit trail |
| `analytics_events` | `analytics` | Raw analytics event stream |
| `analytics_daily_summaries` | `analytics` | Daily aggregate analytics summaries |
| `support_tickets` | `support` | User support tickets, messages, assignment, status and priority |

## Entity Relationship Summary

```text
User
  1 -> 1 Profile
  1 -> 1 Preference
  1 -> many Media
  1 -> many UserSession
  1 -> many ActivityLog
  1 -> 1 each Settings collection
  1 -> many UserConsent
  1 -> 1 Verification

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
  1 -> many Payment

Payment
  1 -> 0..1 PaymentInvoice
  0..1 -> 1 Subscription

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

User
  1 -> many SupportTicket
  1 -> many AdminAuditLog as actor, for admins
  1 -> many AnalyticsEvent
```

## Relationship Notes

- MongoDB does not enforce foreign keys. Integrity is enforced in service/repository logic and unique indexes.
- Most user-owned collections reference `userId`.
- Pair relationships use compound uniqueness to prevent duplicates:
  - `interests`: `senderId + receiverId`.
  - `matches`: `userId + targetUserId`.
  - `user_blocks`: `userId + blockedUserId`.
  - `user_profile_hides`: `userId + hiddenUserId`.
  - `user_reports`: `reportedBy + reportedUserId`.
  - `curated_matches`: `userId + profileUserId + status` with partial active uniqueness.
  - `chat_messages`: client id uniqueness where provided for idempotent sends.
- Settings collections are intentionally split by domain and use unique `userId` indexes.
- Chat messages are separate from rooms to keep room documents small and allow paginated history.
- Notification logs are separate from notifications to keep in-app notification reads fast while retaining channel delivery history.
- Payment invoices are separate from payments to keep immutable receipt/tax artifacts isolated.

## Important Indexes and Query Patterns

### Identity

- `users.email` unique partial index.
- `users.phone.phone` unique sparse index.
- `users.authAccounts.provider + authAccounts.providerId` unique index.
- `users.referralCode` unique sparse index.
- `user_sessions.expiresAt` TTL index for automatic expired session cleanup.
- `user_sessions.refreshToken` index for refresh/logout lookup.

### Discovery

- `profiles.userId` unique index.
- `profiles.status + verifications.status + createdAt` for active/verified browsing; `verifications.status = approved` is the canonical identity outcome.
- `profiles.personal.gender + personal.religion + personal.city` for common matrimonial filters.
- `profiles.location` 2dsphere index for nearby discovery.
- `preferences.userId` unique index.
- `media.userId`, `media.type`, `media.isPrimary + isActive`, and `media.moderationStatus + status + createdAt`.

### Matching and Interactions

- `matches.userId + targetUserId` unique index.
- `matches.score + isActive` and `matches.isActive + expiresAt`.
- `interests.senderId + receiverId` unique index.
- `interests.receiverId + status` and `interests.senderId + status`.
- `interactions.fromUserId + toUserId + type` unique index.
- `interactions.fromUserId + createdAt`, `interactions.toUserId + type + status`.
- `curated_matches.userId + status + priority + createdAt`.

### Chat

- `chat_rooms.roomKey` unique index.
- `chat_rooms.participants + status + lastActivityAt`.
- `chat_rooms.participantStates.userId + lastActivityAt`.
- `chat_messages.roomId + createdAt` for paginated history.
- `chat_messages.receiverId + status + roomId` for unread/delivery updates.
- `chat_messages.moderationStatus + createdAt` for moderation queue.
- `chat_messages.clientMessageId + senderId` unique sparse index for idempotency.

### Notifications

- `notifications.userId + isRead + createdAt`.
- `notifications.userId + category + createdAt`.
- `notifications.userId + dedupeKey + createdAt`.
- `notification_device_tokens.userId + deviceId + token` unique index.
- `notification_logs.notificationId + channel + createdAt`.
- `notification_templates.event + channel + locale + audience + version` unique index.

### Payments and Subscriptions

- `payments.orderId` unique index.
- `payments.gatewayPaymentId`, `gatewayOrderId`, `gatewaySignature`, and store transaction IDs.
- `payments.userId + createdAt`, `payments.status + createdAt`, and gateway/store reconciliation indexes.
- `payment_invoices.invoiceNumber` unique index.
- `payment_invoices.userId + issuedAt`.
- `plans.slug` and `plans.code` unique indexes.
- `plan_features.planId + featureId` unique index.
- `features.key` unique index.
- `profile_boosts.userId + status + endsAt`.

### Safety, Settings, Admin, Analytics, Support

- User settings collections use unique `userId`.
- `privacy_settings.profileVisibility` supports visibility filters.
- `user_consents.userId + type + version` unique index.
- `admin_audit_logs.actorId + createdAt`, `resource + targetId + createdAt`.
- `analytics_events.eventType + occurredAt`, `userId + occurredAt`, `platform + occurredAt`, `source + campaign + occurredAt`, `funnelStage + occurredAt`.
- `analytics_daily_summaries.dateKey` unique index.
- `support_tickets.userId + updatedAt`, `status + priority + updatedAt`, and `category + status`.

## Redis and Cache Plan

### Drivers

| Driver | Usage | Notes |
| ------ | ----- | ----- |
| `redis` | Production and multi-instance environments | Backed by ioredis. Provides main cache client plus Socket.IO pub/sub clients. |
| `local` | Local development fallback | File-backed cache under `local-db/local-cache.json`; not suitable for multi-instance production. |

The cache service interface supports `set`, `get`, `del`, `delByPattern`, `has`, `flush`, `incr`, and `expire`.

### Current Cache Key Patterns

| Key Pattern | Owner | TTL | Purpose |
| ----------- | ----- | --- | ------- |
| `auth:{userId}` | `auth` | 900 seconds | Short-lived access token helper cache after login |
| `auth:magic-link:{jti}` | `auth` | 600 seconds | One-time magic login token marker |
| `auth:2fa:{challengeId}` | `auth` | 300 seconds | 2FA challenge payload |
| `profile:{userId}` | `profiles` | 300 seconds | Enriched profile read cache |
| `preference:{userId}` | `profiles` | 300 seconds | Preference read cache |
| `plan_features:{planId}` | `subscriptions` | 300 seconds | Plan feature lookup cache |
| `usage:{userId}:{featureKey}:{yyyy-mm-dd}` | `subscriptions` | 86400 seconds | Daily feature usage counter |
| `rate-limit:{name}:{method}:{route}:{identifier}` | common guard | per config | Per-route rate limit counters |
| `blocked:{identifier}` | common guard | 3600 seconds | Temporary block after rate-limit breach |
| BullMQ notification keys | `notifications` | queue-managed | Notification dispatch and dead-letter queues |

### Rate Limit Windows

| Area | TTL | Default Limit |
| ---- | --- | ------------- |
| Login | 15 minutes | 5 attempts |
| Register | 1 hour | 3 attempts |
| OTP send | 1 hour | 5 attempts |
| Forgot password | 1 hour | 3 attempts |
| Profile update | 1 hour | 10 requests |
| Avatar/media upload | 1 hour | 5 requests |
| Send interest | 1 day | 50 free, 200 premium |
| Profile view | 1 day | 100 free, 500 premium |
| Match search | 1 hour | 30 requests |
| Chat send message | 1 hour | 100 free, 500 premium |
| General API | 1 hour | 1000 requests |

### Socket.IO and Presence

- Redis pub/sub is used by the hybrid Socket.IO adapter when `CACHE_DRIVER=redis`.
- Current chat presence is held in in-memory maps inside `ChatPresenceService`.
- For multi-instance production, presence should move to Redis keys with short TTLs, for example:
  - `presence:user:{userId}` with socket count and last seen.
  - `presence:socket:{socketId}` with user mapping.
  - `typing:room:{roomId}:user:{userId}` with a 5 to 10 second TTL.

### Notification Queues

- Notification dispatch can use BullMQ when notification queueing is enabled.
- Default queue names:
  - `notification-dispatch`.
  - `notification-dispatch-dlq`.
- Job IDs are built from notification IDs to reduce duplicate dispatch.
- Delivery results remain durable in `notification_logs`.

### Cache Invalidation Rules

- Profile writes must delete `profile:{userId}`.
- Preference writes must delete `preference:{userId}`.
- Plan/feature writes must delete `plan_features:{planId}`.
- Feature usage counters expire daily and should not be manually reset except by admin/debug tooling.
- Magic link and 2FA keys must be deleted or expire after use.
- Never cache raw passwords, OTPs, provider secrets, refresh tokens, payment signatures, or KYC documents.

## Data Lifecycle and Retention

| Data Type | Lifecycle |
| --------- | --------- |
| User account | Durable until deletion request is completed; deactivation should preserve data until policy allows deletion |
| User sessions | Expire automatically via TTL index on `expiresAt`; revoke on logout/logout-all/security actions |
| Profile/preferences/settings | Durable user-owned data; included in data export and deletion workflows |
| Media metadata | Durable metadata; file object lifecycle depends on local/S3 storage and moderation/deletion rules |
| Chat messages | Durable conversation history unless deletion/moderation policy removes or redacts content |
| Notifications | Durable in-app records; delivery logs may be retained for audit/debug for a bounded period |
| Payments/invoices | Long-term retention for finance, refund, tax, and compliance needs |
| Admin audit logs | Long-term retention for accountability |
| Analytics events | Raw events should have a retention policy; daily summaries can be retained longer |
| Support tickets | Retain for support/legal audit according to policy |
| Cache keys | Ephemeral; TTL wherever possible |

## Data Export and Deletion

The data export service already reads user-owned data across:

- User, profile, preference, media, sessions.
- Notifications, subscriptions, payments, referrals.
- Blocks, hidden profiles, reports.
- Consents, activity logs.
- Account, privacy, notification, communication, security, localization, accessibility, media, and AI settings.

Recommended deletion behavior:

1. Mark account deletion requested in `account_settings`.
2. Revoke user sessions.
3. Stop discovery visibility by updating profile/account state.
4. Retain finance/audit records where legally required.
5. Delete or anonymize profile, preferences, media metadata, notifications, settings, referrals, analytics, and support user identifiers according to policy.
6. Delete physical media files from local/S3 storage when policy allows.

## Backup and Recovery

### MongoDB

- Use managed MongoDB backups or scheduled `mongodump` snapshots.
- Keep point-in-time restore enabled where the provider supports it.
- Test restore into a staging environment before launch.
- Keep indexes reproducible from schemas and migration scripts.
- Encrypt backups at rest and restrict restore permissions.

### Redis

- Treat Redis cache keys as disposable unless BullMQ queue persistence is required.
- For notification queues, configure Redis persistence according to provider and queue durability needs.
- Do not rely on Redis as the only copy of business-critical payment, notification, chat, or account data.

## Operational Guidelines

- Production must use `CACHE_DRIVER=redis`; local cache is only for local/single-process development.
- Production MongoDB should be managed and monitored for connection count, slow queries, disk, memory, index usage, and replication lag.
- Large list endpoints must paginate against indexed fields.
- Avoid unbounded embedded arrays in high-write documents. Chat messages, notifications, payments, logs, and analytics should remain separate collections.
- Keep ObjectId references consistent as `Types.ObjectId` in schemas.
- Use transactions only where cross-collection consistency matters and the deployment supports them.
- Use bulk writes in seeders and admin maintenance jobs where possible.
- Keep real credentials out of seed data and docs.

## Migration Scope

The versioned MongoDB migration runner is shared by the complete database. It is not necessary or desirable to create an empty migration for every existing Mongoose collection. Schema files remain the field-definition source of truth, while migrations record ordered production data or index transitions that cannot be handled safely by ordinary application startup.

Current manifest status:

- Two migrations are registered: profile sibling normalization and creation of the unique sparse payment gateway/store-transaction index.
- Both migrations are currently pending in the reviewed development database.
- Migrations are deliberately not applied automatically during API startup.
- `npm run index:audit` compares all registered Mongoose indexes with MongoDB without modifying the database. Add `-- --strict` to also fail on legacy indexes.

For every future production data transformation, collection rename, destructive field change, or index transition, add an immutable migration and test before deployment. Staging and production default to `MONGO_AUTO_INDEX=false`; release automation applies migrations and then performs a strict index audit. Apply pending migrations only after backup and staging verification with `npm run migration:up` or the compiled production command `npm run migration:up:prod`.

## Recommended Improvements

1. Move OTP storage from in-memory `Map` to the cache service with keys such as `auth:otp:{countryCode}:{phone}` and TTL.
2. Move chat presence from in-memory maps to Redis before running multiple API instances.
3. Review strict index-audit output before each release and remove obsolete indexes only through reviewed migrations.
4. Add retention policy constants for notifications, notification logs, analytics events, audit logs, support tickets, and chat moderation artifacts.
5. Add integration coverage and operational metrics for the implemented account deletion/anonymization and S3 erasure job.
6. Add a database seed manifest that lists required seed groups: plans, features, plan features, notification templates, settings defaults, admin/RBAC, support examples, dummy profiles.
7. Add MongoDB explain-plan checks for match discovery, chat history, notification list, payment history, and admin queues.
8. Add queue health and DLQ metrics to monitoring dashboards.
9. Add a short ER diagram image or generated Mermaid export for non-engineering stakeholders if needed.

## Documentation Ownership

- Collection field definitions: Mongoose schema files.
- Collection names: `COLLECTION_NAMES`.
- Relationships, data lifecycle, and cache plan: this file.
- API endpoints: [Technical Plan](TECHNICAL-PLAN.md) and Swagger.
- User flows: [Flow Plan](FLOW-PLAN.md).
- Launch and deployment operations: `docs/launch/*` and `docs/operations/*`.
