# SMS And Phone OTP Integration

## Current Implementation

Supported SMS providers:

- `log`
- `msg91`

Fast2SMS is not implemented in the current codebase. To use Fast2SMS, add a new provider branch in `SmsNotificationProvider`, env validation keys, and tests.

Phone OTP uses `OtpService`, which sends OTP notifications with MSG91 metadata when configured.

## Backend Environment

Auth method:

```env
AUTH_PHONE_OTP_ENABLED=true
```

SMS provider:

```env
NOTIFICATION_SMS_ENABLED=true
NOTIFICATION_SMS_PROVIDER=msg91
NOTIFICATION_SMS_MSG91_AUTH_KEY=
NOTIFICATION_SMS_MSG91_TEMPLATE_ID=
NOTIFICATION_SMS_MSG91_OTP_TEMPLATE_ID=
NOTIFICATION_SMS_MSG91_BASE_URL=https://control.msg91.com
NOTIFICATION_SMS_MSG91_TIMEOUT_MS=10000
```

Reviewer/static OTP support:

```env
AUTH_REVIEW_PHONE_OTP_ENABLED=true
AUTH_REVIEW_PHONE_COUNTRY_CODE=91
AUTH_REVIEW_PHONE=
AUTH_REVIEW_PHONE_OTP=123456
```

## MSG91 Setup

1. Create or use a MSG91 account.
2. Create Flow templates for general SMS and OTP.
3. Get `authkey`.
4. Set `NOTIFICATION_SMS_MSG91_TEMPLATE_ID`.
5. Set `NOTIFICATION_SMS_MSG91_OTP_TEMPLATE_ID` if OTP template differs.
6. Ensure phone numbers include country code; provider normalizes digits only.

## OTP API Flow

Request OTP:

```http
POST /api/v1/auth/send-otp
Content-Type: application/json
```

Verify OTP:

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json
```

## Validation Steps

```bash
cd mentora-api-server
npm run env:validate
npm run test -- sms-notification.provider.spec.ts
npm run test -- otp.service.spec.ts
```

Manual smoke:

1. Start with `NOTIFICATION_SMS_PROVIDER=log` and confirm OTP flow works without provider cost.
2. Switch to `msg91`.
3. Request OTP for a real test phone number with country code.
4. Confirm MSG91 request id in logs/provider response.
5. Enter OTP and confirm login/register succeeds.
6. Test invalid OTP, expired OTP, and resend limits.

## Adding Fast2SMS Later

Required code work:

1. Add `fast2sms` to `NOTIFICATION_SMS_PROVIDER` validation.
2. Add env keys such as `NOTIFICATION_SMS_FAST2SMS_API_KEY`, route/sender/template ids.
3. Add `sendViaFast2Sms` in `SmsNotificationProvider`.
4. Add tests for success, provider error, missing credentials, and timeout.
5. Update this doc with provider setup.

## Common Failures

| Symptom               | Check                                                               |
| --------------------- | ------------------------------------------------------------------- |
| SMS provider disabled | `NOTIFICATION_SMS_ENABLED=true`                                     |
| Env validation fails  | MSG91 auth key and template id are required                         |
| OTP not delivered     | Template approval, DLT registration, country code, provider balance |
| Reviewer OTP ignored  | Review phone must match configured country code and phone exactly   |
