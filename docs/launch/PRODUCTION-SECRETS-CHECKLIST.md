# Production Secrets Checklist

Keep the real values in the deployment secret store, EAS secrets, CI/CD secrets, or the host control panel. Do not commit actual secret values.

## Mobile EAS Secrets

- `EXPO_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true` only after backend FCM is ready.
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
- `MONITORING_ENABLED=true`
- `MONITORING_PROVIDER=sentry`
- `SENTRY_DSN`
- Payment webhook secrets and gateway keys.
- JWT secrets, database credentials, Redis credentials.

## Release Rule

Enable mobile push only after backend push is enabled and a real Android device successfully registers a token and receives a test notification.
