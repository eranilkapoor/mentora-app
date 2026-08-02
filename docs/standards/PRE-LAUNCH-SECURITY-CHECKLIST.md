# Mentora Pre-Launch Security Checklist

Last updated: 2026-07-26

Use this checklist before every production launch candidate. Keep provider,
infrastructure, and independent-review evidence under `docs/launch`.

## Application Security

- Authentication routes use equalized failure responses, throttling, and no
  secret-bearing logs.
- Access and refresh tokens use the expected issuer, audience, token type,
  session binding, rotation, and revocation behavior.
- Admin, moderation, support, payment, KYC, export, deletion, and role-change
  routes are covered by role/permission tests.
- Internal service-to-service routes that are not user-authenticated use
  `@RequireInternalApiKey()` and reject missing or invalid `X-API-Key` headers.
- Public/static routes expose no credentials, private user data, stack traces,
  environment details, or infrastructure topology.
- All request DTOs use whitelist validation, explicit field limits, and
  route-specific authorization.

## Privacy And Data Protection

- Student profile, parent relationship, learning, export, moderation, admin, and PDF responses are
  generated from allowlisted presenters or DTOs.
- Contact details, age, guardian details, academic records, documents, AI tutor
  messages, assessment results, payment data, and sensitive settings obey
  relationship permissions, parental controls, entitlement checks, and retention
  rules.
- AI tutor sessions are denied outside the schedule window, without active
  entitlement, for unenrolled subjects, when parent controls block access, or
  when a parallel active session exists for the same student.
- AI tutor messages, assessment records, and safety events do not expose
  unnecessary billing, parent, or document data to model context.
- Account export and deletion flows are tested for authentication,
  authorization, audit trail, idempotency, and provider cleanup where available.
- Consent, terms, privacy policy, account deletion, and community guideline
  pages are reachable from mobile flows.

## Logging And Monitoring

- Request logs are metadata-only and never include auth bodies, reset/magic
  tokens, OTPs, payment payloads, KYC fields, chat messages, or URL secrets.
- Sentry/API/mobile error contexts are recursively scrubbed before capture.
- Correlation IDs appear in API logs and error responses without exposing
  internal exception messages.
- Alerting and dashboard ownership is recorded for production DSNs and log
  sinks.

## Payments, Stores, And Entitlements

- Client price, coin, and entitlement metadata is ignored for trusted server
  fulfillment decisions.
- Store and gateway verification is idempotent and rejects stale, duplicate, or
  unsupported transitions.
- Subscription expiry, restore, refund/revoke, and entitlement reconciliation
  tests pass for the selected launch providers.

## Mobile Release

- Coverage gates pass, native smoke tests pass, and any known console warnings
  are triaged.
- Production builds use production API audience/environment headers and cannot
  authenticate to staging or preview resources.
- Push, social login, deep links, static WebView pages, and store purchase
  restore are verified on physical devices.

## Infrastructure Evidence

- HTTPS/HSTS, WAF/rate limits, TLS Redis/Mongo, private object storage, CDN
  cache policy, backups, restore drills, and deployment rollback evidence are
  attached under `docs/launch`.
- Secret scanning, dependency scanning, CodeQL, image scanning, SBOM, and
  provenance checks are attached to the release artifact.
- Independent security/performance review findings are tracked to closure.
