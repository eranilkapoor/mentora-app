# Production Secrets Checklist

Keep the real values in the deployment secret store, EAS secrets, CI/CD secrets, or the host control panel. Do not commit actual secret values.

## Mobile EAS Secrets

- `EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true` only after backend FCM is ready.
- Add the Firebase Android app for package `com.webnza.matchmate`, download its
  client `google-services.json`, save it as
  `match-mate-mobile-app/google-services.json` (the configured
  `expo.android.googleServicesFile` path), and upload the FCM V1 credential to
  EAS before enabling push. The
  Firebase Admin service-account JSON is a server secret and cannot replace
  this Android client file.
- `EXPO_PUBLIC_ERROR_REPORTING_ENABLED=true` after Sentry or Crashlytics is configured.
- `EXPO_PUBLIC_ERROR_REPORTING_PROVIDER=sentry` if using Sentry.
- `EXPO_PUBLIC_SENTRY_DSN`
- Google OAuth client IDs for web, Android, and iOS.
- Facebook app ID if Facebook login is enabled.

## Backend Environment

- `NOTIFICATION_PUSH_ENABLED=true`
- `NOTIFICATION_PUSH_PROVIDER=fcm`
- `NOTIFICATION_PUSH_FCM_PROJECT_ID`
- `NOTIFICATION_PUSH_FCM_CLIENT_EMAIL`
- `NOTIFICATION_PUSH_FCM_PRIVATE_KEY`
- `NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON` if using full service-account JSON instead of split fields.
- `NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH` if the deployment mounts the
  Firebase Admin JSON as a protected file (preferred over an inline secret).
- `MONITORING_ENABLED=true`
- `MONITORING_PROVIDER=sentry`
- `SENTRY_DSN`
- Payment webhook secrets and gateway keys.
- JWT secrets, database credentials, Redis credentials.

## Release Rule

Enable mobile push only after backend push is enabled and a real Android device successfully registers a token and receives a test notification.
