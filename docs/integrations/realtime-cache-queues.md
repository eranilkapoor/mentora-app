# Realtime, Cache, And Queues

## Current Implementation

Integrations:

- Socket.IO for chat and notification realtime
- Redis cache driver
- Socket.IO Redis adapter for distributed realtime
- BullMQ notification dispatch queue

Local mode can use in-memory cache. Production/distributed mode should use Redis.

## Backend Environment

```env
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASS=
REDIS_DB=0
```

Notification queue:

```env
NOTIFICATION_QUEUE_ENABLED=true
NOTIFICATION_QUEUE_NAME=notification-dispatch
NOTIFICATION_DLQ_NAME=notification-dispatch-dlq
NOTIFICATION_QUEUE_CONCURRENCY=5
NOTIFICATION_QUEUE_ATTEMPTS=5
NOTIFICATION_QUEUE_BACKOFF_MS=3000
```

If `NOTIFICATION_QUEUE_ENABLED` is omitted, it defaults to enabled when `CACHE_DRIVER=redis`.

## Mobile Realtime

Mobile uses Socket.IO client for realtime services. The API base URL and auth token are used for socket authentication.

Public env:

```env
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_API_PATH=/api/v1
```

## Validation Steps

```bash
cd match-mate-api-server
npm run env:validate
npm run test -- redis-cache.service.spec.ts
npm run test -- chat.gateway.spec.ts
npm run test -- notifications.gateway.spec.ts
npm run test -- notification-queue.service.spec.ts
```

Manual smoke:

1. Start Redis.
2. Start API with `CACHE_DRIVER=redis`.
3. Open two app sessions.
4. Send chat message and confirm realtime delivery/read events.
5. Trigger notification and confirm realtime notification update.
6. Stop Redis in a non-production environment and confirm failures are visible.

## Common Failures

| Symptom                           | Check                                                           |
| --------------------------------- | --------------------------------------------------------------- |
| Queue validation fails            | `NOTIFICATION_QUEUE_ENABLED=true` requires `CACHE_DRIVER=redis` |
| Sockets work on one instance only | Redis adapter missing or Redis unreachable                      |
| Presence stale                    | Redis TTL/connectivity                                          |
| Mobile socket auth fails          | Access token, API base URL, CORS/origin config                  |
