# Mentora Play Reviewer Access

Use these values in Play Console under **Policy and programs > App content >
App access > Sign-in details**. This file is intentionally ignored by Git.

## Credentials

- Email: `reviewer@webnza.com`
- Password: `Test@123456#`
- Subscription: Platinum Yearly
- Two-factor authentication: Disabled
- OTP: Not required
- Role: Standard user; no employee or administrator permissions

## Phone Reviewer

- Country code: `+91`
- Phone: `9876543210`
- Reusable OTP: `123456`
- Subscription: Platinum Yearly
- SMS delivery: Not required for this destination
- Role: Standard user; no employee or administrator permissions

The API deployment must set:

```text
AUTH_REVIEW_PHONE_OTP_ENABLED=true
AUTH_REVIEW_PHONE_COUNTRY_CODE=91
AUTH_REVIEW_PHONE=9876543210
AUTH_REVIEW_PHONE_OTP=123456
```

## Reviewer Instructions

1. Open Mentora and select **Log in**.
2. Choose **Email** and enter the credentials above.
3. The account has completed onboarding, an active profile and profile photo,
   approved verification state, matching preferences, and Platinum Yearly
   access. No purchase is required.
4. Open **Membership** to verify Platinum access.
5. Open a profile to test interest, shortlist, report, and block controls.
6. Open **Settings > Account Settings > Delete Account** to inspect the account
   deletion path. Do not confirm deletion unless the review is complete.

For phone review, choose **Phone**, enter `+91 9876543210`, request the code,
and enter `123456`. The API intentionally does not send SMS for this one
configuration-bound reviewer destination.

The credentials must remain active, reusable, location-independent, and exempt
from password expiry or mandatory OTP for the entire review period.
