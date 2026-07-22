# MatchMate Enterprise Readiness Prompts

Last reviewed: 2026-07-22

This file contains the next executable work, ordered by risk. Complete P0
remediation before launch evidence or new product work. Completed capabilities
and long-term status belong in TASK-ROADMAP.md; provider and console evidence
belongs under docs/launch.

## Audit Scope

This review covered the NestJS API, Expo/React Native application, shared
OpenAPI contract, membership enforcement, authentication, payments, media,
chat, privacy, administration, CI workflows, dependency manifests, Docker
image, tests, and operations documentation.

This was a static code/configuration review plus local automated checks. It was
not a penetration test, production infrastructure review, load test, mobile
binary reverse-engineering exercise, or legal opinion. Those independent checks
remain required.

## Verification Snapshot

- Repository lint, API/mobile type checks, OpenAPI drift check, migration
  validation, and API build passed.
- API unit suites: 1,063 tests pass, but the earlier coverage command failed the
  configured per-file gates for auth, notifications, matches, profiles,
  subscriptions, and media services. Aggregate line coverage was 93.26%.
- Mobile suites: 79 Jest suites and 208 tests pass after expanding coverage
  across auth, onboarding, home, matches, chat, membership, profile, settings,
  support, static pages, success stories, rewards, billing, and key hooks.
  Aggregate mobile coverage is now 42.94% statements, 30.57% branches, 37.5%
  functions, and 43.56% lines. Global Jest thresholds were raised to 40%
  statements, 25% branches, 30% functions, and 40% lines as a staged floor.
- API E2E now passes all 18 suites and 45 tests, including the repaired
  DB-backed interest lifecycle.
- English/Hindi validation passed for 1,432 static translation keys.
- Expo Doctor passed all 18 checks.
- API npm audit reported no advisories. Mobile production npm audit reported 19
  moderate affected-package entries through the Expo toolchain, including the
  PostCSS and uuid advisory chains. Treat the recommended Expo major upgrade as
  a planned SDK migration, not a blind automated fix.
- No obvious private-key or live credential pattern was found in tracked source
  during the point-in-time scan. Automated secret scanning is still absent.

## Controls Already Present

- Strict TypeScript is enabled in both applications.
- The API has global authentication, request validation, throttling, Helmet,
  correlation IDs, graceful shutdown, migration locking, and index auditing.
- Refresh tokens use SecureStore on native mobile and access tokens remain
  memory-only.
- CI runs lint, type checks, contract checks, tests, E2E, and i18n checks.
- Dependabot, manual CodeQL, Sentry hooks, Redis/BullMQ support, and strict
  mobile-store receipt verification foundations exist.

Do not remove these controls while implementing the prompts below.

## P0 Remediation Progress

Implementation pass updated: 2026-07-14. `PARTIAL` means code-side risk was
reduced but the full Done condition below is not yet satisfied. No item is
marked complete from configuration or focused tests alone.

| Item | Status | Implemented in this pass | Remaining stop-ship work |
| --- | --- | --- | --- |
| 1 | PARTIAL | Fixed onboarding validation and the DB E2E feature-service double. | Add missing per-file coverage and prove root CI twice from clean workspaces and in GitHub Actions. |
| 2 | PARTIAL | Added deny-by-default summary/detail profile presenters and applied them to discovery, match lists/details, and premium curation; coordinates, DOB, internal fields, family names, disability notes, and income are conditionally excluded. | Add self/admin/export/moderation DTOs, central relationship/plan visibility policy, repository projections, and full contract matrix. |
| 3 | PARTIAL | Blocked generic `/uploads/kyc` delivery and added no-store behavior; media access now applies stronger owner/type/status checks. | Provision private buckets/KMS/CDN policy and an authenticated or signed delivery gateway with derivative/deletion tests. |
| 4 | PARTIAL | Added interceptor file/field/count limits, strict MIME allowlists, magic-byte/category checks, pre-storage rejection, uploader-bound chat paths, ownership checks, and a partial unique primary-media index. | Add streaming quarantine, decoder/re-encoding/malware controls, isolated FFmpeg workers, transactional cap enforcement, and failed-storage compensation. |
| 5 | PARTIAL | Made nested password hashes non-selectable, excluded auth credentials in admin queries, and added route-level permissions to moderation endpoints. | Add purpose-specific admin DTOs, role/action denial matrix, step-up MFA, case-based masking, and tamper-evident minimized audits. |
| 6 | PARTIAL | Removed request body/query logging, made unknown 500 responses generic, recursively scrubbed API/mobile Sentry context, and routed reset/magic links directly to email without notification persistence, queues, DLQ, or realtime. | Share one tested redactor across every audit/provider surface and add canary, retention, access, deletion, and alerting evidence. |
| 7 | PARTIAL | Added typed access/refresh tokens, issuer/audience enforcement, separate refresh key/audience, hashed session tokens, session/family binding, atomic rotation, reuse revocation, web response suppression, Origin checks, and a migration invalidating plaintext sessions. Access validation now requires the bound live session and resolves current user status, roles, permissions, and membership on every request. | Add key rotation/token versioning, dedicated CSRF tokens, admin-session invalidation events, replay alerts, and the complete revocation matrix. |
| 8 | PARTIAL | Equalized forgot-password responses with dummy bcrypt work, made reset and magic links atomically single-use, enforced 12-64 character new passwords while preserving legacy login compatibility, and aligned mobile validation. Email login now explicitly retrieves the hidden credential hash and performs dummy bcrypt work for unknown/malformed accounts. OTPs are purpose/challenge-bound HMAC records in Redis with hashed destination keys, resend cooldown, five-attempt invalidation, TTL expiry, and atomic consume; 2FA challenges have atomic consume and attempt lockout, and recovery-code removal is conditional and single-use under concurrency. | Envelope-encrypt TOTP secrets, add TOTP timestep replay prevention, breached-password checks, device/IP dimensions, and provider-failure telemetry. |
| 9 | PARTIAL | Replaced process-local/read-write counters with Redis Lua-backed atomic increment-and-expiry for rate limits and quotas; production requires Redis and focused concurrency/cache tests pass. | Reserve/commit/release quota around successful business actions, add exact boundary semantics, multi-dimension limits, degraded-mode tests, and three-replica load evidence. |
| 10 | PARTIAL | Removed client amount/coin/benefit metadata, derives plan price/currency/duration from active server plans, and closes coin packs until a trusted SKU catalog exists. | Implement immutable SKUs and real Razorpay/Stripe order/checkout/status verification, or remove those gateways from production. |
| 11 | PARTIAL | Added an explicit webhook transition matrix and conditional Mongo status updates: terminal/unsupported transitions are rejected, failures cannot overwrite success, refunds require success, and concurrent stale transitions lose atomically. | Implement the durable provider-event ledger, fulfillment/outbox state machine, Mongo transactions, atomic wallet/subscription invariants, per-benefit reconciliation, and refund compensation before accepting money. |
| 12 | PARTIAL | Corrected Gold chat, plan boost limits, zero-limit denial, Silver monthly messages, and chat attachment entitlement/ownership checks in API and seed data. The idempotent master seeder now creates canonical active free-plan subscription records and synchronizes embedded membership plan IDs for seeded users without downgrading paid users. | Replace duplicated policy with one versioned catalog consumed by backend/mobile/CRM and generate the complete plan acceptance matrix. |
| 13 | OPEN | Existing recursive export secret removal was retained; no full erasure workflow was claimed. | Build the inventory, resumable per-resource erasure, protected report export, recent-auth encrypted async export, provider deletion, retention, and backup handling. |
| 14 | PARTIAL | API onboarding/profile DTOs now reject invalid DOBs and ages outside 18-100. | Add immutable versioned required consent, optional processing consent/withdrawal, DOB-change policy, re-consent, and analytics gating. |
| 15 | PARTIAL | Split EAS development/preview API hosts, added app environment headers and API mismatch rejection, and made production require Mongo, Redis, S3, monitoring, queues, strict store config, and separate refresh credentials. | Provision isolated provider/cloud resources, require TLS/replica set/private-bucket/distributed-socket proofs, tune Redis outage behavior, and use separate Sentry/OAuth projects. |
| 16 | PARTIAL | Chat list totals now use an authoritative unread query independent of loaded/paginated rooms. | Add atomic read cursors, normalized mobile cache reconciliation, older-message pagination, reconnect/offline/multi-device handling, and the full unread test matrix. |
| 17 | PARTIAL | Removed the non-functional App PIN control and blocked generic settings updates from enabling it. | Implement and test a real device-local lock, SecureStore/Keychain binding, foreground re-authentication, privacy cover, biometrics, recovery, and lockout before restoring the control. |

Focused verification completed in this pass:

- Repository `npm run verify` passed: API/mobile lint and type checks, OpenAPI
  drift, five migration validations, and the API build are green.
- Full API unit suite: 1,063 tests passed.
- Full mobile unit suite: 79 Jest suites and 208 tests passed; coverage gates
  now enforce 40% statements, 25% branches, 30% functions, and 40% lines.
- Full API E2E suite: 45 tests passed.
- Second priority pass focused suites: 69 distributed OTP/cache tests, 21
  access-session authorization tests, 73 payment/auth tests, and 38 OTP/2FA
  lockout tests passed.
- Atomic cache/rate/quota suites: 50 tests passed.
- Linked-account primary repair and atomic recovery-code focused suites: 45
  tests passed; API and mobile type checks passed.
- Legacy email-login, unknown-account timing, repository credential projection,
  and seeded free-subscription focused suites passed.
- Auth, session, chat, media, KYC, match, payment, and notification focused
  suites passed in their latest targeted runs; the security-email run passed
  87 tests.
- Full root CI, clean-workspace repetition, coverage gates, and native mobile
  E2E remain pending and therefore item 1 remains partial.

## P0 - Stop-Ship Remediation

### 1. Restore a green, reproducible release baseline

Fix the current red test gates without lowering thresholds:

- Update the onboarding validation expectation for required city and state.
- Repair the matches-interest-lifecycle E2E module so it uses the real feature
  service contract or a complete test double.
- Add the missing branch coverage for the six services failing their explicit
  thresholds.
- Make npm run ci pass from a clean clone with npm ci and no local cache
  assumptions.
- Upload test and coverage artifacts only after the commands exit successfully;
  retain failure artifacts separately.

Done when the root CI command passes twice from clean workspaces and the same
commit is green in GitHub Actions.

### 2. Replace raw profile spreading with audience-safe response models

Discovery and match repositories currently select almost the whole Profile
document, and services spread those documents into API responses. This can
expose exact coordinates, date/time/place of birth, income, disability notes,
family names and occupations, religious details, internal tags, audit fields,
and last-active data.

Implement:

- Explicit summary, match-detail, self, admin, export, and moderation DTOs with
  deny-by-default projections.
- One audience-aware presenter that enforces profileVisibility,
  showOnlyToPremium, showPhotosTo, blurPhotosForUnmatched, age/income visibility,
  contact visibility, blocks, and hidden-profile rules.
- Coarse public location only; never return GeoJSON coordinates in discovery or
  match responses.
- Independent income redaction so showIncome false cannot be bypassed through
  the education object.
- Contract tests that enumerate viewer relationship, plan, block, photo,
  contact, age, income, and visibility combinations.

Primary evidence: match-discovery.repository.ts,
match-discovery.service.ts, match.repository.ts, and matches.service.ts.

Done when every non-self response is generated from an allowlist and automated
tests prove that restricted fields never appear.

### 3. Move profile media and KYC documents behind authorized delivery

All uploads are currently available through the public /uploads route with
cross-origin access and public caching. KYC identity proof and selfie files use
the same delivery model. A copied URL bypasses later blur, hide, match, plan,
block, rejection, and deletion decisions.

Implement:

- Private object storage with public-access blocking and encryption enabled.
- Separate KYC and user-media buckets/prefixes, IAM roles, KMS keys, retention
  rules, and access logs.
- Short-lived, audience-bound signed URLs or an authenticated media gateway.
- Server-generated blurred, thumbnail, and watermarked derivatives; do not send
  the original URL when only a derivative is authorized.
- No-store delivery for KYC and revocable cache policy for private media.
- Deletion propagation to originals, derivatives, CDN caches, and failed-delete
  retry queues.
- Authorization tests for self, match, unmatched user, blocked user, moderator,
  KYC reviewer, expired URL, and deleted object.

Primary evidence: main.ts, storage.service.ts, kyc.service.ts, and
media.service.ts.

Done when direct object URLs are unusable without short-lived authorization and
KYC is never served by the generic upload route.

### 4. Build a hostile-file upload and media-processing boundary

Profile image/video and chat interceptors do not consistently set Multer byte
limits. Checks occur after memory buffering, MIME is client supplied, and the
current basic moderator accepts any image/* or video/* subtype. Flagged content
is still stored at a publicly reachable path. Video processing has no explicit
timeout or resource sandbox.

Implement:

- Reverse-proxy and Multer limits for body bytes, file bytes, file count, field
  count, header size, and request duration.
- Streaming upload to quarantine instead of buffering large files in the API
  process.
- Magic-byte detection, actual decoder validation, safe image re-encoding,
  metadata stripping, decompression-bomb checks, and malware scanning.
- A strict allowlist that rejects SVG and unsupported containers/codecs.
- Isolated FFmpeg workers with CPU, memory, wall-time, output-size, and process
  limits.
- Quarantine, scan, moderate, publish, reject, and delete states with retries.
- Compensating deletion when storage succeeds and database persistence fails.
- Atomic plan-cap enforcement and a partial unique index for one active primary
  image/video per user and type.
- Type/status ownership checks so an image route cannot promote or delete a
  video, and vice versa.

Done when malformed, oversized, polyglot, wrong-type, concurrent-cap, failed-DB,
and timed-out-transcode tests pass without process memory spikes or orphaned
objects.

### 5. Eliminate admin credential exposure and enforce least privilege

User authAccounts.passwordHash is not select:false. Admin queries exclude
nonexistent top-level password fields, so nested hashes can be returned by user
list/detail and create responses. The moderation controller also grants all
moderation routes to broad role groups instead of enforcing route permissions.

Implement:

- Mark password hashes and other credentials select:false at schema level.
- Use explicit admin DTOs and a recursive secret assertion in response tests.
- Split KYC, chat, media, support, payment, user, and content permissions.
- Add PermissionsGuard to every admin action and test every role/action pair.
- Require step-up authentication and mandatory MFA for KYC, chat review,
  refunds, role changes, data export, and account takeover actions.
- Mask KYC/chat previews until a justified case is opened.
- Minimize audit before/after payloads and add retention plus tamper evidence.

Primary evidence: user.schema.ts, admin.repository.ts, admin.service.ts, and
admin-moderation.controller.ts.

Done when no secret-bearing field can be serialized and least-privilege tests
deny every cross-role access path.

### 6. Make logs, errors, monitoring, and security notifications secret-safe

The request logger records request bodies and only performs shallow top-level
redaction. It misses newPassword, oldPassword, confirmPassword, refresh tokens,
OTP/code fields, nested payment/KYC/profile data, chat content, and credential
query parameters. Unknown 500 responses return exception.message. Sentry has no
scrubbing hook.

Password-reset and magic-login URLs are also passed through the general
notification service, which persists the secret-bearing message, emits it over
realtime, and can copy the full job into the dead-letter queue.

Implement:

- Metadata-only request logging with route-specific allowlists; never log
  authentication bodies, message bodies, KYC/payment payloads, or URL secrets.
- Recursive redaction shared by Winston, Sentry, audit logs, provider logs,
  queues, and dead-letter records.
- Generic external 500 responses with internal correlation IDs only.
- A transactional security-email path that does not create an in-app
  notification or persist reset/magic credentials in ordinary notification or
  DLQ records.
- PII masking for email, phone, IP, device IDs, and provider responses.
- Retention, access control, deletion, and alerting rules for logs and errors.

Done when seeded canary secrets never appear in API responses, logs, Sentry
events, notification collections, realtime payloads, queue inspection, or DLQ.

### 7. Redesign access and refresh sessions

Refresh JWTs are stored in plaintext and use the same key and claim shape as
access JWTs. Tokens lack a type, jti, family, and session binding; access-token
verification does not enforce issuer/audience; blocked users and changed admin
permissions remain usable until token expiry.

The web flow sets an HttpOnly refresh cookie but also returns the refresh token
in JSON. Production SameSite=None cookie use has no explicit CSRF/Origin
defense.

Implement:

- Opaque random refresh tokens stored only as hashes, or typed refresh JWTs
  whose jti/family is hashed and bound to one session/device.
- Separate signing keys and audiences for access, refresh, password reset,
  magic login, and admin sessions, with kid-based rotation.
- Refresh rotation with atomic consume, reuse detection, family revocation, and
  replay alerts.
- Issuer, audience, token type, session status, user status, and token-version
  validation.
- Web responses that never expose refresh tokens to JavaScript.
- Host-only, narrowly scoped secure cookies plus CSRF and Origin validation for
  cookie-authenticated operations.
- Session revocation tests for logout, password change, block, deletion, role
  change, reuse, and concurrent refresh.

Done when a stolen database, old refresh token, wrong token type, stale admin
token, cross-site request, or replayed token cannot create a session.

### 8. Harden password recovery, magic links, OTP, and two-factor auth

Forgot-password returns a different result for unknown/non-password accounts.
The reset JWT can be reused after code exchange. Magic-link has/then/delete and
2FA challenge get/then/delete operations are non-atomic. OTPs are plaintext in
a process-local Map, lack purpose binding and attempt counters, and do not work
reliably across replicas. TOTP secrets are plaintext in MongoDB.

Implement:

- Identical forgot-password responses and comparable timing for existing and
  nonexistent accounts.
- Purpose-specific, short-lived, single-use records consumed atomically only
  when the final action commits.
- Redis-backed hashed OTPs keyed by purpose, destination, challenge, and device,
  with resend cooldown, attempt cap, lockout, and abuse telemetry.
- Per-destination plus per-IP/device limits and anti-automation controls for
  SMS-cost endpoints.
- Envelope encryption for TOTP secrets and atomic single-use recovery codes.
- Challenge attempt counters and TOTP replay prevention.
- A password policy with a meaningful minimum length, an explicit bcrypt
  byte-length maximum, breached-password screening, and dummy-hash comparison
  for unknown login accounts.

Done when multi-replica, concurrent replay, enumeration, brute-force, restart,
and provider-failure tests pass.

Latest code-side update: recovery-code deletion now includes the matched hash in
the database predicate and succeeds only when one record is modified, preventing
two concurrent requests from accepting the same code.

### 9. Make throttles and feature usage counters distributed and atomic

Nest throttling uses process memory. The custom guard performs cache get/set
under a process-local lock, and feature quotas perform check/increment/expire
as separate commands. Replicas can exceed limits, a crash can leave incorrect
TTL state, and failed actions consume quota before business success.

Implement:

- Redis Lua scripts or another atomic distributed limiter for IP, account,
  destination, device, and route dimensions.
- Atomic quota reservation/commit/release, or idempotent post-commit usage
  events tied to the business transaction.
- Explicit UTC or product-timezone day/month boundaries and exact expirations.
- Degraded-mode policy that fails closed for auth, payment, contact, message,
  interest, and boost limits when Redis is unavailable.
- Concurrency/load tests across at least three API replicas.

Done when limits cannot be bypassed under concurrency and failed/idempotent
requests do not consume paid quota.

### 10. Replace client-defined payment benefits with a trusted product catalog

Coin-pack amount and coinAmount are accepted from the client without a server
SKU. Arbitrary metadata later controls boost duration and multiplier. Numeric
fields have no positive bounds.

The web UI offers Razorpay and Stripe, but it only creates an internal order and
shows a success toast. The API generates a gateway order ID locally and has no
Razorpay/Stripe order-creation integration in the dependency or source tree.

Implement:

- Immutable server-side SKUs for plans, coin packs, boosts, tax class, currency,
  store product IDs, price, quantity, duration, and multiplier.
- Ignore client amount, entitlement, and benefit metadata.
- Positive bounds and supported-currency/gateway validation.
- Real provider order creation and hosted/native checkout, or remove unavailable
  gateways from the production UI and API.
- Provider-native signature verification, amount/currency/order comparison, and
  server-to-server status confirmation.
- Idempotent catalog and checkout contract tests.

Done when changing any request amount, coin count, SKU metadata, gateway ID, or
boost parameter cannot change the charged price or granted benefit.

### 11. Make payment fulfillment, subscriptions, refunds, and wallet atomic

Payment status is marked SUCCESS before subscription, wallet, boost, invoice,
and referral fulfillment completes. A retry can then skip unfinished work or
duplicate it. Webhook transitions are not constrained by current state,
event-ID replay protection is not durable, and refunds do not revoke granted
benefits.

Subscription replacement, trial creation, user membership updates, and wallet
balance/debit operations also span multiple non-transactional writes.

Implement:

- A durable provider-event ledger and explicit payment transition matrix.
- One fulfillment state machine with an outbox, per-benefit idempotency keys,
  retryable steps, and reconciliation workers.
- Mongo transactions with majority write concern for financial and entitlement
  state, or an equivalently safe ledger design.
- Conditional wallet debits that prevent concurrent overspend and maintain a
  verifiable balance.
- One-active-subscription constraints, atomic plan replacement, and
  server-defined trial duration/eligibility.
- Refund/chargeback compensation for subscriptions, coins, boosts, invoices,
  coupons, and referral rewards.
- Raw provider webhook verification and replay/out-of-order tests.

Done when injected failures at every step converge to exactly one correct
financial and entitlement result.

### 12. Reconcile the membership matrix and close entitlement bypasses

Current seeded behavior does not match the approved product rules:

- Gold has UNLIMITED_CHAT but no MESSAGE_LIMIT mapping, while the send-message
  endpoint requires MESSAGE_LIMIT; Gold users can therefore be denied sending.
- Silver maps PROFILE_BOOST to 0, and Free has no boost mapping, despite the
  requested rule that plans through Gold receive five boosts and higher plans
  are unlimited.
- A numeric zero limit currently permits the first action because usage is
  incremented before zero is rejected.
- Silver's 100-message reset window is implicit and currently treated as daily.
- Chat send accepts attachment URLs/types under MESSAGE_LIMIT without enforcing
  the image/voice/video entitlement or upload ownership.
- Plan policy is duplicated between master seeding and fixed-plan limits.

Implement one versioned entitlement catalog used by seeding, API enforcement,
membership display, CRM, and tests. Define every value, reset window, unlimited
sentinel, downgrade behavior, and grandfathering rule.

Add a generated acceptance matrix covering Free, Silver, Gold, Platinum, and
Assisted for photos, one paid video, daily/monthly interests, accepting
interests, chat read/send, message quotas, contact views, profile views, boosts,
privacy settings, read receipts, typing, last seen, online status, auto reply,
and premium-only visibility.

Done when UI and backend consume the same catalog and matrix tests prove every
plan rule and bypass path.

### 13. Complete account erasure, export, and retention workflows

Account deletion currently covers only part of the data graph. KYC, chats,
notifications/device tokens, payments/subscriptions, analytics/IP data,
referrals/wallet, reports, support, consent, audit/activity, and provider
artifacts require explicit deletion, pseudonymization, or legal retention.
File-delete failures can be swallowed while deletion is marked complete.

Data export includes reports where the user is the accused, potentially
revealing reporter identity/reason, and does not redact every store token. It
loads whole histories synchronously and requires no recent-auth step.

Implement:

- A collection/field/provider data inventory with owner, legal basis, retention,
  export, deletion, backup, and legal-hold policy.
- A resumable erasure state machine with per-resource status, retries,
  idempotency, provider/CDN deletion, and reconciliation.
- Protected reporter identity and complete recursive secret/token redaction.
- Step-up authentication and an asynchronous encrypted export artifact with
  expiry, rate limit, access audit, and size controls.
- Backup-expiry and restore-deletion procedures.

Done when seeded data across every collection/provider is either erased or
retained under an approved, testable rule and failed steps cannot report
completion.

### 14. Enforce legal eligibility and versioned consent

The API validates dateOfBirth as a real calendar date but does not enforce an
adult/eligible age range. The mobile registration/onboarding path does not call
the existing consent API and has no terms/privacy acceptance control.
Analytics begins automatically without a consent gate.

Implement:

- Server-enforced age eligibility and maximum plausible age, based on legal
  review and market rules; do not rely on the date picker.
- A policy for DOB changes after identity verification.
- Required versioned Terms, Privacy, and Community Guidelines acceptance before
  account activation.
- Separate optional consent for analytics, marketing, precise location, and
  sensitive personalization, with withdrawal behavior.
- Re-consent when material versions change, immutable evidence, and admin/legal
  reporting.

Done when API tests reject ineligible or impossible dates and no protected
processing starts without the required consent evidence.

### 15. Isolate environments and make production fail closed

Development, preview, and production EAS profiles all target the same API host.
A development or preview build can therefore operate on production users,
payments, notifications, and KYC data.

Production validation does not require MongoDB, Redis, S3, monitoring, real
notification providers, or a distributed socket adapter. Local cache writes
auth/reset/usage data synchronously to plaintext JSON, and the socket adapter
can silently fall back to process-local mode.

Implement:

- Separate development, staging, preview, and production domains, databases,
  Redis, buckets, provider projects, payment sandboxes, OAuth clients, Sentry
  projects, and EAS channels.
- Build-time environment identity plus a backend audience/environment check
  that rejects mismatched clients.
- Production startup requirements for Mongo replica set, TLS Redis, private S3,
  queue, distributed sockets, monitoring, and real enabled providers.
- No production fallback to local DB/cache/storage/socket behavior.
- Redis command/connect timeouts, TLS, bounded retries, and a documented outage
  policy.

Done when a non-production binary cannot authenticate to or mutate production,
and production refuses to start with any local/degraded driver.

### 16. Redesign chat unread state and message history

The conversations service fetches a limited candidate set and calculates
unreadTotal from that set. On page one it can omit unread rooms beyond the
first page, and filtering changes the total. The mobile screen separately merges
pages, applies realtime deltas only to loaded rooms, and refetches the current
query on focus. This explains badges remaining stale after a room is read.

The chat UI requests only the newest 50 messages even though the API supports a
cursor, so older history is inaccessible.

Implement:

- A dedicated authoritative unread-total query independent of list pagination
  and filters.
- Atomic room-read state and message receipt updates with an idempotent read
  cursor.
- Room-specific RTK cache updates plus authoritative reconciliation on focus,
  reconnect, login, and multi-device events.
- Cursor pagination for conversations and older messages.
- A normalized event reducer instead of hard-coded 30/50-message query args.
- Tests for more than one page, more than 50 unread messages, read while
  offline, socket loss, multi-device reads, new messages during read, archive,
  filters, and app restart.

Done when message rows, room badges, and bottom-tab totals converge to zero
immediately and remain correct after reconnect/refetch.

### 17. Remove false mobile security controls

The app PIN toggle only updates appPinEnabled; the mobile app does not set,
verify, lock, recover, or rate-limit a PIN. Biometrics are disabled in every EAS
profile, and there is no background-to-foreground re-lock policy or privacy
cover.

Implement:

- Hide/disable the PIN toggle until a complete setup, verification, lockout,
  recovery, and reset flow exists.
- Treat app lock as device-local, bind it to SecureStore/Keychain, and never use
  the server flag as proof of device protection.
- Add configurable background timeout, foreground re-authentication, privacy
  cover in the app switcher, and safe biometric cancellation behavior.
- Test reinstall, logout, account switch, biometric enrollment change, lockout,
  offline unlock, and rooted/jailbroken threat decisions.

Done when enabling a displayed security control measurably enforces the stated
protection on every supported platform.

## P0 - Launch Evidence After Remediation

### 18. Google Play licensed-track acceptance test

Verify purchase, backend token validation, acknowledgement, entitlement
activation, persistence after restart, clean-install restore, RTDN delivery,
refund/revoke compensation, and reconciliation using a licensed tester.

Record build version, product/base-plan IDs, masked order ID, provider event ID,
API correlation ID, and screenshots under docs/launch.

### 19. Production notification acceptance test

On physical devices, verify FCM registration/rotation, direct and queued
delivery, foreground/background/terminated behavior, tap routing, quiet hours,
channel preferences, logout revocation, SMTP delivery, MSG91 OTP/template
delivery, and generic lock-screen content.

Record masked provider IDs and correlation IDs. APNs remains a separate
acceptance test.

### 20. Release regression matrix

Retain evidence for npm run ci, signed Android/iOS builds, cold start, access
expiry/refresh rotation, social login, chat reconnect/read counts, purchase and
restore, push tap, KYC upload/view authorization, profile export, account
deletion, dark/light themes, large text, and offline recovery.

## P1 - Enterprise Hardening

### 21. Secure chat attachments, moderation, and realtime transport

- Require every attachment to reference an owned, scanned, published upload;
  reject arbitrary http/https URLs and mismatched MIME/size/type claims.
- Enforce image, voice, video, and file entitlements in sendMessage, not only in
  the upload endpoint.
- Add attachment expiry/deletion and malware/report workflows.
- Remove JWT query-string authentication from sockets.
- Add connection/event rate limits, payload limits, backpressure, and bounded
  reconnect.
- Store presence in Redis with per-user socket counts so one disconnect does not
  mark a multi-device user offline.
- Apply online/last-seen privacy at the server and fail closed if the Redis
  adapter is unavailable in production.

### 22. Rebuild discovery and conversation queries for scale

- Replace unanchored multi-field regex search with an indexed search service or
  Atlas Search.
- Avoid loading every verified ID and every interaction ID into large $in/$nin
  arrays; denormalize safe flags or use indexed joins/materialized exclusions.
- Replace skip/deep-count pagination with stable cursors where practical.
- Rank compatibility globally in the database/search layer; do not sort one
  fetched page in memory and call it globally recommended.
- Move chat search/filter/pagination into indexed database queries rather than
  fetching a capped candidate set and filtering in memory.
- Add maxTimeMS, query budgets, explain-plan checks, and realistic-volume load
  tests.

### 23. Give scheduled work and queues one distributed owner

Eleven cron tasks can run on every replica. Move digest, expiry, cleanup,
deletion, analytics, and payment maintenance to a queue or leader-elected
worker with distributed locks, fencing tokens, idempotency keys, retry policy,
DLQ, and run history.

Notification and security queues must minimize payloads, encrypt sensitive
fields, set retention, and support safe replay without duplicating delivery.

### 24. Reduce mobile startup, query, and image cost

- Add bounded request timeouts, cancellation, network awareness, and retry only
  for safe/idempotent requests.
- Replace the startup fan-out of verify plus multiple settings requests with one
  versioned bootstrap response.
- Return relationship flags with home results instead of fetching matches,
  interests, and shortlist pages only to enrich cards.
- Debounce server search and cancel superseded requests.
- Serve responsive private thumbnails/derivatives and adopt an image component
  with explicit disk/memory caching.
- Limit prefetch to the next likely image rather than every profile photo.
- Fix image-error fallback state so a ref mutation actually re-renders.
- Add performance budgets for cold start, JS frame time, memory, network bytes,
  list scrolling, and image cache.

### 25. Minimize and protect mobile data and telemetry

- Stop persisting the full auth user and sensitive settings/login-history data
  in plaintext AsyncStorage.
- Persist only identifiers and low-risk preferences; encrypt necessary caches
  and purge every account-scoped key on logout/account switch/deletion.
- Configure SecureStore accessibility and Android backup/data-extraction rules.
- Add Sentry beforeSend/breadcrumb/request scrubbing, consent, release/dist,
  source-map upload, sampling, retention, and environment separation.
- Replace the Math.random installation ID with an OS-backed cryptographic UUID;
  never treat it as authentication proof.
- Add OTA update code signing, staged rollout, rollback, and channel-promotion
  evidence.

### 26. Harden OAuth, deep links, and embedded web content

- Use authorization code with PKCE and backend exchange instead of mobile
  front-channel access-token flows.
- Never place Facebook or other bearer tokens in query strings.
- Permit credential-bearing reset/magic routes only through verified universal
  or app links, with single-use server state; do not rely on a claimable custom
  scheme.
- Restrict WebView navigation to the owned HTTPS origin with
  onShouldStartLoadWithRequest; open approved external links in the system
  browser and remove http://* from the whitelist.
- Complete an App Store review of Sign in with Apple requirements before
  shipping Google login on iOS.
- Document the certificate-pinning decision and compensating controls in the
  mobile threat model.

### 27. Correct push registration and notification privacy

- Ask for push permission after a contextual pre-prompt, not automatically on
  login.
- Register the device token regardless of quiet hours; quiet hours control
  delivery, not registration.
- Apply master/channel/DND settings to realtime foreground toasts.
- Add a generic lock-screen mode that avoids exposing names, match activity, or
  message content.
- Revoke/rotate tokens on logout, reinstall, account switch, provider refresh,
  and invalid-token responses.
- Test cold-start taps, duplicate taps, expired navigation targets, and
  notification actions under a locked app.

### 28. Make the generated API contract the mobile source of truth

Only a small generated type is used while many response shapes are hand-written.
Generate a typed client or endpoint types from the OpenAPI artifact, preserve
the deliberately raw auth-refresh contract explicitly, and add runtime schema
validation for security/payment boundaries.

Replace the live-server contracts:snapshot dependency with a deterministic
contract bootstrap that requires no MongoDB, Redis, or running API. CI must
compare the generated artifact to actual controller metadata, not merely
regenerate from an already committed JSON file.

### 29. Tighten domain validation and identity normalization

- Add MaxLength and array/cardinality limits to all profile, preference,
  religious, family, notification, support, chat, payment metadata, and admin
  inputs.
- Enforce field-specific ranges and cross-field rules for age, height, income,
  coordinates, preference ranges, dates, and primary-image indexes.
- Canonicalize names without destroying intentional casing such as TCS.
- Change phone uniqueness to normalized country-code plus national number.
- Use the same provider identifier format for admin-created and user-created
  phone accounts.
- Add Unicode normalization, control-character rejection, and safe rendering
  tests for user-generated text.

### 30. Add production-grade observability and safe health endpoints

Public health responses currently disclose environment, memory, and Mongo host,
database, and state. Return only liveness/readiness status publicly and expose
detailed diagnostics only on an authenticated internal network.

Add OpenTelemetry traces, RED/USE metrics, queue/cron metrics, business
integrity metrics, dashboards, SLOs, burn-rate alerts, synthetic checks, and
on-call routing. Include correlation from mobile release/session to API,
provider event, queue job, and database operation without logging PII.

### 31. Establish encryption and secret lifecycle controls

- Envelope-encrypt TOTP secrets, store purchase tokens, sensitive provider
  payloads, KYC metadata, and any retained high-risk PII.
- Require TLS for Mongo, Redis, providers, and object storage.
- Move the local MatchMateKey.pem and all deployment credentials into a managed
  secret service; rotate any key that has been shared outside its intended
  boundary.
- Define key ownership, KMS policy, rotation, revocation, break-glass, backup,
  and incident procedures.
- Add pre-commit and CI secret scanning plus full-history scanning before public
  or third-party repository access.

### 32. Harden CI, dependencies, artifacts, and the container

- Keep CodeQL/SAST and Trivy API image scanning on every verification run.
- Add dependency review, npm audit policy, secret scanning, license policy,
  SBOM generation, and signed provenance.
- Plan an Expo SDK upgrade that resolves the current moderate advisory paths
  while passing Expo Doctor and native regression tests.
- Pin GitHub Actions and base images by immutable digest.
- Keep the API container non-root with a health check, then add an init process,
  read-only root filesystem, dropped capabilities, resource limits, and no
  writable application directory except explicit temporary mounts.
- Publish signed images from CI and promote the same digest across
  environments.

### 33. Raise mobile workflow and accessibility assurance

There are broad mobile Jest tests now covering 79 suites and 208 tests, but no
native E2E framework in the repository and aggregate coverage is still below
the desired 80% launch target.

- Add Maestro/Detox/Appium coverage for registration, onboarding, matches,
  privacy, chat/read counts, subscription, restore, notifications, KYC,
  deletion, and recovery.
- Raise mobile coverage thresholds in staged increments, with high thresholds
  for auth, billing, settings, navigation, chat, and storage utilities.
- Add component accessibility tests, screen-reader device passes, dynamic type,
  contrast, focus order, touch targets, reduced motion, RTL, keyboard, and
  tablet layouts.
- Add visual regression evidence for supported phones/tablets and light/dark
  modes.

### 34. Add settings and paginated-cache integration coverage

Add RTK Query integration tests for notification, privacy, communication,
security, localization, media, linked-account, matches, chat, support, admin,
and success-story mutations. Cover optimistic updates, rollback, paginated
invalidation, realtime interleaving, reconnect, logout/account switch, and
visible error behavior.

### 35. Protect admin/support data and audit evidence

- Return purpose-specific support/admin views rather than raw user, profile,
  verification, subscription, report, and purchase-token documents.
- Record who accessed KYC/chat/payment data, why, and for which case.
- Add approval/two-person controls for refunds, role grants, exports, and
  destructive actions.
- Store minimized append-only audit events with sequence/hash/timestamp
  integrity, retention, export, and alerting.
- Test object-level authorization for every admin identifier route.

### 36. Tune database and cache resilience

- Configure Mongo pool sizes, selection/socket/wait-queue timeouts, retry
  behavior, read preference, and required majority/journal write concern.
- Require a replica set for transactions and test failover.
- Make every migration idempotent across a crash after data change but before
  migration-record insertion.
- Audit indexes against production-like explain plans and collection sizes.
- Replace synchronous LocalCache disk rewrites with a test-only implementation;
  prohibit it in any shared environment.

### 37. Add analytics governance

Analytics stores IP, user agent, device/profile/target IDs, and arbitrary
metadata without an evident TTL. Define an event schema registry, field
allowlists, consent/legal basis, pseudonymization, purpose limitation, bot/test
filtering, retention TTL, deletion/export behavior, and access controls.

Do not allow arbitrary client metadata to become a permanent data lake.

## P2 - Product and Operations

### 38. Deployment and disaster-recovery automation

Build infrastructure as code, immutable deployment promotion, migration/index
preflight, canary/blue-green rollout, automatic rollback, runtime smoke tests,
multi-AZ database/cache/object storage, encrypted backups, point-in-time
recovery, and documented RPO/RTO.

Run and record restore, region-loss, Redis-loss, queue-backlog, provider-outage,
and credential-rotation drills.

### 39. Independent security and performance assurance

Commission threat modeling, OWASP ASVS/MASVS review, API/mobile penetration
testing, dependency/container review, abuse testing, load/soak/spike tests, and
privacy/legal review. Track every finding to remediation and retest evidence.

### 40. Juaaree Match Mate CRM acceptance and permission mapping

Run the existing CRM adapter against a seeded non-production API. Cover login,
refresh, users, profiles, roles, permissions, audit, KYC/media/chat review,
support, plans/features, subscription changes, payments/refunds/reconciliation,
notifications/templates/DLQ, analytics, pagination, and all denied-action
states.

Decide whether legacy CRM module permissions or MatchMate API RBAC controls page
visibility, then make sidebar links and every row/global action consistent.

### 41. Scheduled notification campaign builder

After notification privacy and queue integrity are fixed, add campaign CRUD,
audience rules, schedule/quiet-hour handling, throttling, dedupe, preview,
test-send, approval audit, delivery analytics, and CRM management screens.

### 42. Apple subscription server notifications

Add App Store Server Notifications V2 signature verification, durable event
idempotency, renewal/cancellation/grace/billing-retry/refund/revoke
reconciliation, fixtures, sandbox evidence, and compensation tests matching the
Google RTDN path.

### 43. Mobile user insights dashboard

After analytics consent/governance is implemented, add user-facing match,
interest, shortlist, view, and trend insights with server-side aggregates,
loading/empty/error states, English/Hindi text, accessibility, tests, and cache
invalidation.

### 44. Mobile version compatibility and operational kill switches

Add signed remote configuration for minimum supported version, maintenance
mode, provider outages, risky feature disablement, and gradual rollout. The API
must validate configuration signatures/audience, and the app must provide
accessible update/maintenance recovery screens without exposing secrets.

## External or Blocked

- Google Play licensed-track evidence and live RTDN delivery.
- App Store sandbox/live renewal, cancellation, and Server Notifications V2.
- APNs, SMS, email, social-provider, KYC-provider, and payment-provider
  production approvals and credentials.
- Production Sentry/source-map projects, alert routing, and on-call ownership.
- Cloud IAM/KMS, private buckets/CDN, Mongo replica set, Redis TLS, deployment
  platform, WAF/DDoS controls, and backup infrastructure.
- Branch protection/ruleset evidence and artifact-signing identities.
- Legal review, DPIA/retention schedule, penetration test, backup restore, load
  test, and disaster-recovery evidence.

## Completion Rule

Move an item out of this file only when:

- its implementation and negative-path tests pass;
- npm run ci is green;
- security/privacy behavior is verified at the API boundary;
- migrations, rollback, monitoring, and runbooks are included where relevant;
- required device/provider/production evidence is stored under docs/launch; and
- an independent reviewer has checked P0 security, privacy, and financial work.

Do not mark console-, provider-, infrastructure-, legal-, or production-only
work complete from source configuration alone.
