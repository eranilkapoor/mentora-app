# Procurement Management Plan

Last reviewed: 2026-08-01

## Procurement Scope

Mentora depends on third-party providers for production-grade operations. Provider setup must be tracked as procurement and release work, not only engineering configuration.

## Provider Categories

| Category | Examples | Selection criteria |
| --- | --- | --- |
| AI/model | AI tutor, moderation, summaries, usage metering. | Safety, latency, cost, moderation, API reliability, data policy. |
| Payments | Razorpay, Stripe, app-store billing. | Settlement, refunds, webhooks, India/global support, reporting. |
| Communications | Email, SMS, WhatsApp, push. | Deliverability, templates, callbacks, compliance, cost. |
| Storage/media | S3-compatible storage, CDN, video/recording storage. | Security, retention, cost, signed URLs, regional needs. |
| Monitoring/APM | Sentry/APM/uptime alerts. | Error visibility, alerting, release tracking, cost. |
| CRM operations | Dialer, OCR, calendar, geo/maps, webinar, accounting export. | API quality, callback support, SLAs, integration effort. |

## Procurement Controls

- No provider is production-enabled without approved account ownership.
- Credentials must be stored in deployment/EAS/CI secret stores, never git.
- Webhook/callback signing must be configured and tested.
- Provider cost, quota, and rate limits must be recorded before launch.
- Vendor contracts should define data handling, retention, uptime, support, and incident notice where applicable.

## Provider Readiness Checklist

| Item | Required |
| --- | --- |
| Account created under company ownership | Yes |
| Production credentials stored in secret store | Yes |
| Test credentials stored separately | Yes |
| Webhook URL configured | If provider uses callbacks |
| Webhook signature verified | If provider uses callbacks |
| Smoke test passed | Yes |
| Failure/disable fallback documented | Yes |
| Cost/limit documented | Yes |
| Data processing/legal review completed | If provider handles user/student data |

## Current Procurement Status

See [Production Secrets Checklist](../launch/PRODUCTION-SECRETS-CHECKLIST.md) and [Integrations Index](../integrations/README.md) for provider groups and readiness checks.
