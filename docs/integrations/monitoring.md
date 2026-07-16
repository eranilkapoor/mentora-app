# Monitoring And Error Reporting

## Current Implementation

Supported monitoring providers:

- `log`
- `sentry`

Backend uses `@sentry/node`. Mobile uses `@sentry/react-native`. Both are controlled by env flags.

## Backend Environment

```env
MONITORING_ENABLED=true
MONITORING_PROVIDER=sentry
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0
```

Production validation requires:

```env
MONITORING_ENABLED=true
MONITORING_PROVIDER=sentry
SENTRY_DSN=<dsn>
```

## Mobile Environment

```env
EXPO_PUBLIC_ERROR_REPORTING_ENABLED=true
EXPO_PUBLIC_ERROR_REPORTING_PROVIDER=sentry
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0
```

## Setup Steps

1. Create separate Sentry projects for API and mobile.
2. Configure backend DSN in non-public API env.
3. Configure mobile DSN in Expo public env.
4. Set sample rates intentionally. Start low in production.
5. Confirm source maps / release setup before relying on stack traces for production triage.

## Validation Steps

```bash
cd match-mate-api-server
npm run env:validate
npm run typecheck
```

```bash
cd match-mate-mobile-app
npm run typecheck
```

Manual smoke:

1. Enable Sentry in staging.
2. Trigger a controlled test exception.
3. Confirm event appears in the correct Sentry project and environment.
4. Confirm no PII or secrets appear in breadcrumbs, tags, or event payloads.

## Common Failures

| Symptom                         | Check                                                 |
| ------------------------------- | ----------------------------------------------------- |
| Production env validation fails | Sentry required in production by validation schema    |
| Mobile events missing           | Public env not included in build profile or DSN blank |
| Backend events missing          | `MONITORING_ENABLED`, provider, DSN                   |
| No stack context                | Source maps/release upload not configured             |
