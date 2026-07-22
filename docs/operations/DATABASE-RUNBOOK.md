# Database Operations Runbook

## CI Checks

Run on every pull request through `npm run verify`:

- `npm run db:audit:ci`
- `npm run migration:validate`
- `npm --prefix mentora-api-server run explain:audit -- --dry-run`

These checks do not require database credentials. They validate the migration manifest and the critical-query audit definitions.

## Staging Migration Process

1. Take or confirm a recent staging backup.
2. Set `DB_DRIVER=mongo` and `MONGO_URI` for staging.
3. Run `npm run db:audit:staging`.
4. Run `npm --prefix mentora-api-server run migration:up`.
5. Run `npm --prefix mentora-api-server run index:audit:strict`.
6. Run `npm --prefix mentora-api-server run explain:audit`.
7. Review for unexpected `COLLSCAN`, high `totalDocsExamined`, or slow execution.

## Production Migration Process

1. Confirm point-in-time restore is enabled.
2. Record the latest backup timestamp.
3. Apply the same migration to staging first.
4. Run production migration during a low-traffic window.
5. Run strict index audit and explain audit after migration.
6. Keep rollback notes for reversible migrations; irreversible migrations require restore plan approval.

## Backup Restore Drill

Run at least once per quarter:

1. Restore latest production backup into isolated staging.
2. Start API against restored database with production secrets disabled.
3. Run `migration:status`, `index:audit:strict`, and smoke tests.
4. Verify sample user, payment, invoice, chat, notification, and admin audit records.
5. Record restore time, issues, and responsible reviewer.

## Monitoring Checklist

Track these in the cloud/APM dashboard:

- Mongo slow queries and profiler samples.
- Index usage and unexpected collection scans.
- Mongo connection pool usage and wait queue.
- Redis memory, evictions, command latency, and connection count.
- BullMQ notification queue waiting/failed/delayed counts and DLQ depth.
- API error rate, request latency, socket connection count, and reconnect rate.

Recommended first alert thresholds:

- Mongo connection pool above 80 percent for 5 minutes.
- Redis memory above 80 percent or any sustained evictions.
- Notification queue waiting count above expected delivery throughput for 10 minutes.
- Any critical explain-audit query returning `COLLSCAN` after indexes are applied.
