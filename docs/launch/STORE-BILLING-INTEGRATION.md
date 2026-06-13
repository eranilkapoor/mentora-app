# Store Billing Integration Notes

The backend already exposes receipt verification for:

- Google Play: `google_play`
- Apple App Store: `apple_iap`
- Web fallback: `razorpay`

The mobile app now blocks native store purchases unless:

`EXPO_PUBLIC_STORE_BILLING_ENABLED=true`

## Before Enabling Native Billing

- Add a production purchase SDK, such as RevenueCat or `react-native-iap`.
- Create Play Console subscription products for each active backend plan.
- Create App Store subscription products for each active backend plan.
- Store each product ID against the matching backend plan.
- Purchase through the native billing SDK first.
- Send the returned `purchaseToken` or Apple receipt to `/payments/store/verify-subscription`.
- Enable strict backend receipt verification in production.

## Recommended Path

Use RevenueCat for MVP launch speed if both Android and iOS subscriptions are required. Keep backend verification as the final source of truth for plan activation.
