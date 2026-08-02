# Push Notifications

## Current Implementation

Supported push providers:

- `log`
- `fcm`

Backend uses Firebase Admin SDK. Mobile uses `expo-notifications` and registers device tokens with:

```http
POST /api/v1/notifications/device-tokens
```

Tokens can be revoked through:

```http
POST /api/v1/notifications/device-tokens/revoke
```

## Backend Environment

```env
NOTIFICATION_PUSH_ENABLED=true
NOTIFICATION_PUSH_PROVIDER=fcm
```

Provide one of these credential forms:

```env
NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON=
```

or:

```env
NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH=
```

or:

```env
NOTIFICATION_PUSH_FCM_PROJECT_ID=
NOTIFICATION_PUSH_FCM_CLIENT_EMAIL=
NOTIFICATION_PUSH_FCM_PRIVATE_KEY=
```

## Mobile Environment

```env
EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true
```

Mobile config:

- `expo-notifications` plugin is present.
- Android has `google-services.json` configured in `app.json`.
- iOS APNs setup must be completed in Apple Developer and EAS credentials for production builds.

## Firebase Setup

1. Create Firebase project.
2. Add Android app with package `com.webnza.mentora`.
3. Download `google-services.json` and place it in the mobile app as configured.
4. Add iOS app with bundle id `com.webnza.mentora`.
5. Configure APNs key/certificate for iOS push.
6. Create Firebase service account for backend sends.
7. Set backend FCM credentials.

## Validation Steps

Backend:

```bash
cd mentora-api-server
npm run env:validate
npm run test -- push-notification.provider.spec.ts
```

Mobile:

```bash
cd mentora-mobile-app
npm run typecheck
```

Manual smoke:

1. Install a native Android/iOS build.
2. Allow notification permission.
3. Confirm device token is registered through `/notifications/device-tokens`.
4. Trigger a notification that includes `push` channel.
5. Confirm notification arrives while app is foreground/background.
6. Logout and confirm token revocation.

## Common Failures

| Symptom                   | Check                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| No token registered       | Permission denied, Expo notifications setup, physical device requirement |
| FCM credentials missing   | Provide JSON/path or project/client/private-key trio                     |
| Android build cannot send | `google-services.json` package mismatch                                  |
| iOS push not received     | APNs key/cert and EAS credentials                                        |
| Push skipped              | User notification settings or no active device tokens                    |
