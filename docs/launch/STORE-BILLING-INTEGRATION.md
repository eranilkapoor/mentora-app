# Store Billing Integration

Match Mate uses one internal plan catalog and separate commerce providers:

- MongoDB owns plan identity, feature entitlements, display ordering, and the mapping to store products.
- Google Play and Apple own localized prices, introductory offers, renewals, cancellations, refunds, and billing UI.
- Razorpay/Stripe remain web-only providers.
- The API is authoritative for Match Mate entitlement activation after provider verification.

## Console Product Catalog

Create these exact IDs. They are seeded in `plans.seed-data.ts`.

| Match Mate plans | Google product       | Google base plans                | Apple products                                                                            |
| ---------------- | -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| Silver           | `matchmate_silver`   | `monthly`, `quarterly`, `yearly` | `matchmate_silver_monthly`, `matchmate_silver_quarterly`, `matchmate_silver_yearly`       |
| Gold             | `matchmate_gold`     | `monthly`, `quarterly`, `yearly` | `matchmate_gold_monthly`, `matchmate_gold_quarterly`, `matchmate_gold_yearly`             |
| Platinum         | `matchmate_platinum` | `monthly`, `quarterly`, `yearly` | `matchmate_platinum_monthly`, `matchmate_platinum_quarterly`, `matchmate_platinum_yearly` |
| Assisted         | `matchmate_assisted` | `half-yearly`, `yearly`          | `matchmate_assisted_half_yearly`, `matchmate_assisted_yearly`                             |

Put all Apple subscription products in subscription group `matchmate_membership`. Configure the seven-day trial as Apple introductory offers and as Google offers named `trial-7-days` under every base plan. The app falls back to the regular Google base-plan offer when an account is not eligible. Free and Custom Assisted are not store products. `matchmate_profile_boost_24h` is a separate consumable product.

## Runtime Flow

1. Mobile loads the API plan catalog and its platform mapping.
2. `expo-iap` loads localized store products and replaces DB list prices on native plan cards.
3. The platform purchase sheet handles payment and offer eligibility.
4. Mobile sends the purchase token or StoreKit JWS to `POST /payments/store/verify-subscription`.
5. The API checks the selected plan/product/base-plan mapping and, in strict mode, queries the provider server API.
6. The API records an idempotent payment and activates access using the provider expiry time.
7. Mobile finishes/acknowledges the transaction only after API success.
8. Restore Purchases repeats verification from Subscription & Billing.

## Required Secrets

Google Play:

- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: raw or base64 JSON for a service account granted Play Console subscription/order read access.

Apple:

- `APPLE_STORE_ISSUER_ID`
- `APPLE_STORE_KEY_ID`
- `APPLE_STORE_BUNDLE_ID`
- `APPLE_STORE_PRIVATE_KEY`: App Store Connect In-App Purchase key (`.p8`).
- `APPLE_STORE_ENVIRONMENT`: `sandbox` or `production`.

Production must set:

```env
PAYMENT_MOBILE_STORE_VERIFICATION_MODE=strict
PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED=true
```

Keep all private keys in the deployment secret manager, never EAS public variables or source control. `EXPO_PUBLIC_STORE_BILLING_ENABLED=true` is safe in the mobile build because it is only a feature switch.

## Release Evidence Still Required

- Create and activate every console product/base plan and its regional pricing.
- Test purchase, eligible/ineligible trial, renewal, grace period, cancellation, refund, expiry, duplicate delivery, app reinstall, and restore with licensed sandbox accounts.
- Verify Google RTDN delivery in production and register App Store Server Notifications V2 before launching iOS billing.
- Record successful sandbox evidence before enabling production rollout.

Google subscription synchronization is implemented in the API. The following
console and deployment settings must match the production configuration.

## 1. Google Cloud setup

- Enable Cloud Pub/Sub API.
- Topic: `projects/match-mate-app/topics/matchmate-google-play-rtdn`.
- Grant this account Pub/Sub Publisher permission:

`google-play-developer-notifications@system.gserviceaccount.com`

- Create an authenticated push subscription pointing to:

`POST https://matchmate.webnza.com/api/v1/payments/google-play/rtdn`

Google’s setup instructions are here: [Configure Google Play RTDN](https://developer.android.com/google/play/billing/getting-ready).

## 2. Play Console setup

In Play Console:

`MatchMate → Monetize → Monetization setup → Real-time developer notifications`

Configure:

- Topic: `projects/match-mate-app/topics/matchmate-google-play-rtdn`
- Notification type: subscriptions and voided purchases
- Send a test notification
- Save the configuration

## 3. Secure the webhook

Pub/Sub should send an authenticated OIDC JWT.

The API must validate:

- JWT signature
- Expected audience
- Expected service-account email
- `email_verified`
- Token expiration

Required environment values would be similar to:

```env
GOOGLE_PLAY_RTDN_ENABLED=true
GOOGLE_PLAY_RTDN_AUDIENCE=https://matchmate.webnza.com/api/v1/payments/google-play/rtdn
GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL=matchmate-rtdn-push@match-mate-app.iam.gserviceaccount.com
```

Google recommends authenticated push subscriptions and validation of the audience and service-account identity: [Pub/Sub push authentication](https://docs.cloud.google.com/pubsub/docs/authenticate-push-subscriptions).

## 4. Backend RTDN endpoint

Implemented endpoint:

```text
POST /api/v1/payments/google-play/rtdn
```

The endpoint currently:

1. Authenticate the Pub/Sub JWT.
2. Decode `message.data` from Base64.
3. Validate `packageName === com.webnza.matchmate`.
4. Extract `subscriptionNotification.purchaseToken`.
5. Call Google `subscriptionsv2.get` using that token.
6. Treat Google’s API response as authoritative.
7. Find the local subscription using `storePurchaseToken`.
8. Update:
   - status
   - expiry date
   - auto-renew flag
   - product/base plan
   - latest order ID
   - last verification time
9. Return `2xx` only after durable processing.

RTDN only indicates that something changed; Google explicitly requires calling the Developer API for the complete current state: [RTDN reference](https://developer.android.com/google/play/billing/rtdn-reference).

## 5. Lifecycle handling

The reconciliation must correctly handle:

- Renewed → extend `endDate` and refresh entitlement
- Canceled → set `autoRenew=false`, retain access until expiry
- Grace period → set `GRACE_PERIOD`
- Account hold → suspend paid entitlement
- Restarted/recovered → restore `ACTIVE`
- Expired → set `EXPIRED`, downgrade membership
- Revoked/refunded → terminate entitlement immediately
- Replaced/upgraded/downgraded → map the authoritative product/base plan to the local plan and switch entitlement

## 6. Reliability

Implemented reliability behavior:

- Retry-safe lifecycle updates based on the latest authoritative Play state
- Non-2xx retry when RTDN arrives before the mobile purchase claim
- Indexed purchase-token lookup
- Scheduled subscription-expiry fallback
- Request correlation and redacted application logging

Remaining reliability enhancements:

- Configure and test a Pub/Sub dead-letter topic
- Persist Pub/Sub `messageId`/order-level processing history for operational audit
- Record each renewal/refund as a detailed local payment-ledger event
- Add alerts for repeated RTDN authentication, permission, and reconciliation failures

## Match Mate Google RTDN Values

Use these names consistently:

- Topic ID: `matchmate-google-play-rtdn`
- Full topic name: `projects/match-mate-app/topics/matchmate-google-play-rtdn`
- Push subscription ID: `matchmate-google-play-rtdn-push`
- Push endpoint: `https://matchmate.webnza.com/api/v1/payments/google-play/rtdn`
- OIDC audience: `https://matchmate.webnza.com/api/v1/payments/google-play/rtdn`
- Push identity service account: `matchmate-rtdn-push@match-mate-app.iam.gserviceaccount.com`

The API validates the Pub/Sub OIDC signature, audience, verified email, package
name, and notification payload. It then queries `subscriptionsv2.get` and
updates the existing subscription by purchase token. A notification arriving
before the mobile claim receives a non-2xx response so Pub/Sub retries it.

Cloud Pub/Sub is the broker. RabbitMQ is not required. BullMQ is optional only
if RTDN processing later becomes heavy; the current handler is idempotent and
synchronous so Pub/Sub retry delivery is sufficient.

Production configuration:

```env
GOOGLE_PLAY_RTDN_ENABLED=true
GOOGLE_PLAY_RTDN_AUDIENCE=https://matchmate.webnza.com/api/v1/payments/google-play/rtdn
GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL=matchmate-rtdn-push@match-mate-app.iam.gserviceaccount.com
```
