# Mentora Integrations

This folder documents the external integrations currently present or scaffolded in the Mentora API and mobile app.

## Inventory

| Area                       | Providers / systems                             | Current status                                                                                                                                                                                                                                         | Primary docs                                         |
| -------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Social login/signup        | Google, Facebook, Apple                         | Implemented in mobile and API token verification. Google and Facebook use OAuth access tokens; Apple uses iOS identity token claims.                                                                                                                   | [social-auth.md](social-auth.md)                     |
| Mobile store subscriptions | Google Play Billing, Apple App Store / StoreKit | Implemented through `expo-iap`, backend receipt verification, Google Play acknowledgement, and Google RTDN reconciliation.                                                                                                                             | [store-billing.md](store-billing.md)                 |
| Web/manual payments        | Razorpay, Stripe, manual                        | Payment model supports `razorpay`, `stripe`, and `manual`; current backend creates internal orders and verifies an app-level signature/webhook signature. Provider SDK checkout/order creation still needs to be wired before production web payments. | [web-payments.md](web-payments.md)                   |
| Email                      | Log, SMTP, AWS SES                              | Implemented in notification provider.                                                                                                                                                                                                                  | [email.md](email.md)                                 |
| SMS / OTP                  | Log, MSG91                                      | Implemented for MSG91 flow API. Fast2SMS is not present in code.                                                                                                                                                                                       | [sms.md](sms.md)                                     |
| Push notifications         | Log, Firebase Cloud Messaging                   | Implemented with Firebase Admin and mobile device-token registration.                                                                                                                                                                                  | [push-notifications.md](push-notifications.md)       |
| Storage/media              | Local disk, AWS S3, FFmpeg                      | Local and S3 storage implemented. FFmpeg path is configurable for video thumbnails. AI moderation is only a feature flag unless a provider is added.                                                                                                   | [storage-media.md](storage-media.md)                 |
| Realtime/cache/queue       | Socket.IO, Redis, BullMQ                        | Implemented. Redis is optional locally and required for distributed realtime/cache/notification queue production mode.                                                                                                                                 | [realtime-cache-queues.md](realtime-cache-queues.md) |
| Monitoring/error reporting | Sentry, log                                     | Backend and mobile Sentry config exists behind env flags.                                                                                                                                                                                              | [monitoring.md](monitoring.md)                       |

## Common Validation Commands

Run these after changing integration environment variables:

```bash
cd mentora-api-server
npm run env:validate
npm run typecheck
npm run smoke:providers
```

For stricter provider checks where real credentials are expected:

```bash
cd mentora-api-server
npm run smoke:providers:strict
```

For mobile build-time public variables:

```bash
cd mentora-mobile-app
npm run typecheck
npm run lint:check
```

## Important Notes

- Never commit real private keys, service-account JSON, SMTP passwords, payment secrets, or webhook secrets.
- `EXPO_PUBLIC_*` values are bundled into the mobile app and are not secrets.
- Production backend validation requires strict store receipt verification, S3 storage, Sentry monitoring, payment secrets, distinct JWT refresh secrets, and safe CORS origins.
- The docs here describe the current repository state. If a provider console changes its UI, keep the values and validation steps aligned with the env names in `mentora-api-server/src/config/*` and `mentora-mobile-app/src/core/utils/config.ts`.
