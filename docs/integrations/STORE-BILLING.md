# Mobile Store Billing

## Current Implementation

Supported providers:

- Google Play subscriptions
- Apple App Store subscriptions

Mobile implementation:

- `expo-iap` is used through `useStoreBilling`.
- Android purchases use `productId`, `basePlanId`, and offer token.
- iOS purchases use product SKU.
- Purchases are sent to `POST /api/v1/payments/store/verify-subscription`.
- Restore purchase flow verifies active purchases idempotently.

Backend implementation:

- Google Play uses Android Publisher API `purchases/subscriptionsv2/tokens`.
- Google Play purchases are acknowledged after backend verification.
- Apple uses App Store Server API transaction lookup and decodes `signedTransactionInfo`.
- Google RTDN endpoint: `POST /api/v1/payments/google-play/rtdn`.

## Backend Environment

```env
PAYMENT_MOBILE_STORE_VERIFICATION_MODE=sandbox
PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED=false

GOOGLE_PLAY_PACKAGE_NAME=com.webnza.mentora
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
GOOGLE_PLAY_RTDN_ENABLED=false
GOOGLE_PLAY_RTDN_AUDIENCE=
GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL=

APPLE_STORE_ISSUER_ID=
APPLE_STORE_KEY_ID=
APPLE_STORE_BUNDLE_ID=com.webnza.mentora
APPLE_STORE_PRIVATE_KEY=
APPLE_STORE_ENVIRONMENT=sandbox
```

Production requirements:

```env
PAYMENT_MOBILE_STORE_VERIFICATION_MODE=strict
PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED=true
GOOGLE_PLAY_PACKAGE_NAME=com.webnza.mentora
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<json, base64 json, or path>
APPLE_STORE_ENVIRONMENT=production
```

## Mobile Environment

```env
EXPO_PUBLIC_STORE_BILLING_ENABLED=true
```

Native requirements:

- Android permission `com.android.vending.BILLING` is present in `app.json`.
- `expo-iap` plugin is present in `app.json`.
- Store billing only works on Android/iOS builds with the native module, not Expo Go.

## Catalog Mapping

Backend plans expose store mapping as:

```ts
storeProducts: {
  android: {
    productId,
    productType: "subscription",
    basePlanId,
    offerId,
    subscriptionGroupId
  },
  ios: {
    productId,
    productType: "subscription",
    subscriptionGroupId
  }
}
```

Every paid self-service plan that should be purchasable through the stores needs matching App Store Connect and Play Console products.

## Google Play Setup

1. Create subscription products in Play Console.
2. Add base plans and optional offers.
3. Match backend plan mappings:
   - `productId`
   - `basePlanId`
   - `offerId` when required
4. Create a Google Cloud service account.
5. Grant Play Console API access with subscription read/manage permissions.
6. Store service-account JSON in `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`.
7. Enable Android Publisher API.
8. For RTDN, create Pub/Sub topic and push subscription to:

```text
https://<api-host>/api/v1/payments/google-play/rtdn
```

9. Set `GOOGLE_PLAY_RTDN_AUDIENCE` to that HTTPS endpoint.
10. Set `GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL` to the Pub/Sub push service account.

## Apple App Store Setup

1. Create subscriptions in App Store Connect.
2. Use product ids that match backend plan mappings.
3. Create App Store Connect API key.
4. Configure:
   - `APPLE_STORE_ISSUER_ID`
   - `APPLE_STORE_KEY_ID`
   - `APPLE_STORE_PRIVATE_KEY`
   - `APPLE_STORE_BUNDLE_ID`
5. Use `APPLE_STORE_ENVIRONMENT=sandbox` until TestFlight/sandbox flows pass.

## Validation Steps

Backend:

```bash
cd mentora-api-server
npm run env:validate
npm run test -- store-receipt-verifier.service.spec.ts
npm run test -- google-play-rtdn.service.spec.ts
```

Mobile:

```bash
cd mentora-mobile-app
npm run typecheck
```

Manual smoke:

1. Build with EAS or a native dev client.
2. Confirm plans show store prices from Google/Apple.
3. Purchase a sandbox subscription.
4. Confirm backend creates payment and subscription.
5. Confirm Google purchase acknowledgement succeeds.
6. Restore purchase on a fresh install.
7. For Google, send an RTDN test notification and verify a 2xx response.

## Common Failures

| Symptom                           | Check                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| Store product unmapped            | Plan `storeProducts` does not match purchase `productId` / `basePlanId`              |
| Google 401/403                    | Service account missing Play Console access or Android Publisher API disabled        |
| Google acknowledgement error      | Wrong package name, product id, or purchase token                                    |
| Apple verification failed         | Wrong bundle id, environment, issuer/key/private key, or transaction id              |
| Works in debug but not production | Production validation requires strict store verification and Google Play credentials |
