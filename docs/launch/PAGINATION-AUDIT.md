# Pagination Audit

Last reviewed: 2026-06-12

## Mobile App

- Home feed: paged `FlatList`, lazy load enabled.
- Learn/Schedule/Progress feeds: paged lists should use lazy loading where API data is not static.
- Chat list: paged `FlatList`, lazy load enabled.
- Notifications: paged `FlatList`, lazy load enabled.
- Chat messages: API supports cursor-style `beforeMessageId`; verify older-message loading during QA.

## Backend APIs

- Students, schedules, learning sessions, progress, notifications, and support lists should expose page/limit or cursor metadata.
- Notifications: page/limit with `hasNextPage`.
- Chat conversations: page/limit with `hasMore`.
- Chat messages: limit plus cursor.
- Admin users/audit/payments: page/limit available.

## QA Checks

- Confirm no launch screen requests more than 20 items unless it is a small static settings list.
- Confirm infinite scroll does not duplicate items after refresh.
- Confirm pull-to-refresh resets page state to page 1.
- Confirm empty, loading, and footer-loading states render in dark theme.
