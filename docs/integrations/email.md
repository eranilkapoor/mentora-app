# Email Integration

## Current Implementation

Supported email providers:

- `log`
- `smtp`
- `ses`

Email is sent through `EmailNotificationProvider`. It is used by notification workflows and security emails such as password reset/change.

## Backend Environment

Common:

```env
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_EMAIL_PROVIDER=log
NOTIFICATION_EMAIL_FROM=no-reply@example.com
```

SMTP:

```env
NOTIFICATION_EMAIL_PROVIDER=smtp
NOTIFICATION_EMAIL_SMTP_DSN=smtps://user:password@smtp.example.com:465
```

or:

```env
NOTIFICATION_EMAIL_PROVIDER=smtp
NOTIFICATION_EMAIL_SMTP_HOST=smtp.example.com
NOTIFICATION_EMAIL_SMTP_PORT=587
NOTIFICATION_EMAIL_SMTP_USERNAME=
NOTIFICATION_EMAIL_SMTP_PASSWORD=
NOTIFICATION_EMAIL_SMTP_SECURE=false
NOTIFICATION_EMAIL_SMTP_REQUIRE_TLS=true
NOTIFICATION_EMAIL_SMTP_REJECT_UNAUTHORIZED=true
NOTIFICATION_EMAIL_SMTP_TIMEOUT_MS=15000
```

AWS SES:

```env
NOTIFICATION_EMAIL_PROVIDER=ses
NOTIFICATION_EMAIL_SES_REGION=ap-south-1
NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID=
NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY=
NOTIFICATION_EMAIL_SES_CONFIGURATION_SET=
```

The SES provider can also fall back to `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.

## SMTP Setup

1. Create mailbox/API SMTP credentials with your email provider.
2. Verify sender/domain as required by the provider.
3. Use `smtps://` on port 465 or SMTP+STARTTLS on port 587.
4. Set `NOTIFICATION_EMAIL_FROM` to a verified sender.
5. Keep `NOTIFICATION_EMAIL_SMTP_REJECT_UNAUTHORIZED=true` for production.

## AWS SES Setup

1. Verify domain or sender email in SES.
2. Move SES account out of sandbox for production.
3. Create IAM access key with least privilege for `ses:SendEmail`.
4. Set SES region and credentials.
5. Optional: create a configuration set for events and set `NOTIFICATION_EMAIL_SES_CONFIGURATION_SET`.

## Validation Steps

```bash
cd match-mate-api-server
npm run env:validate
npm run test -- email-notification.provider.spec.ts
npm run smoke:providers
```

Manual smoke:

1. Set provider to `log`; trigger forgot password and confirm log dispatch.
2. Set provider to `smtp` or `ses`.
3. Trigger forgot password for a real test user.
4. Confirm email arrives, link opens `/reset-password`, and reset succeeds.
5. Check notification delivery logs for `sent` status.

## Common Failures

| Symptom              | Check                                              |
| -------------------- | -------------------------------------------------- |
| Env validation fails | `NOTIFICATION_EMAIL_FROM` is required for SMTP/SES |
| SMTP timeout         | Host/port/firewall/TLS mode                        |
| SMTP auth failed     | Username/password or provider app password         |
| SES access denied    | IAM permissions, region, verified identity         |
| Email lands in spam  | SPF, DKIM, DMARC, sender reputation                |
