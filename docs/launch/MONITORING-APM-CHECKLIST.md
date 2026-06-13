# Monitoring and APM Checklist

The backend now has a central `ErrorMonitoringService` connected to the global exception filter.

## Current Repo State

- Backend exceptions are captured centrally.
- Monitoring is disabled by default.
- `MONITORING_PROVIDER=log` keeps behavior dependency-free.
- `MONITORING_PROVIDER=sentry` is reserved for the real Sentry SDK wiring.

## Before Production Rollout

- Create the Sentry or APM project.
- Store `SENTRY_DSN` in the deployment secret store.
- Set `MONITORING_ENABLED=true`.
- Set `MONITORING_PROVIDER=sentry`.
- Add uptime checks for `/live`.
- Add readiness checks for `/ready`.
- Add alerts for 5xx rate, API latency, DB readiness failures, and payment webhook failures.

## Recommended Alert Thresholds

- 5xx error rate above 2 percent for 5 minutes.
- P95 API latency above 1500ms for 10 minutes.
- `/ready` failing for 2 consecutive checks.
- Payment webhook failures above 1 percent.
- Push dispatch failures above 5 percent.
