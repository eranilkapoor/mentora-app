# Store Billing Integration

MatchMate uses one internal plan catalog and separate commerce providers:

- MongoDB owns plan identity, feature entitlements, display ordering, and the mapping to store products.
- Google Play and Apple own localized prices, introductory offers, renewals, cancellations, refunds, and billing UI.
- Razorpay/Stripe remain web-only providers.
- The API is authoritative for MatchMate entitlement activation after provider verification.

## Console Product Catalog

Create these exact IDs. They are seeded in `plans.seed-data.ts`.

| MatchMate plans | Google product | Google base plans | Apple products |
|---|---|---|---|
| Silver | `matchmate_silver` | `monthly`, `quarterly`, `yearly` | `matchmate_silver_monthly`, `matchmate_silver_quarterly`, `matchmate_silver_yearly` |
| Gold | `matchmate_gold` | `monthly`, `quarterly`, `yearly` | `matchmate_gold_monthly`, `matchmate_gold_quarterly`, `matchmate_gold_yearly` |
| Platinum | `matchmate_platinum` | `monthly`, `quarterly`, `yearly` | `matchmate_platinum_monthly`, `matchmate_platinum_quarterly`, `matchmate_platinum_yearly` |
| Assisted | `matchmate_assisted` | `half-yearly`, `yearly` | `matchmate_assisted_half_yearly`, `matchmate_assisted_yearly` |

Put all Apple subscription products in subscription group `matchmate_membership`. Configure the seven-day trial as Apple introductory offers and as Google offers named `trial-7-days` under every base plan. The app falls back to the regular Google base-plan offer when an account is not eligible. Free and Enterprise Custom are not store products. `matchmate_profile_boost_24h` is a separate consumable product.

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
- Register Google RTDN and App Store Server Notifications V2 for provider-driven lifecycle reconciliation.
- Record successful sandbox evidence before enabling production rollout.
