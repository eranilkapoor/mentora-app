# Pagination Audit

Last reviewed: 2026-06-12

## Mobile App

- Home feed: paged `FlatList`, lazy load enabled.
- Matches feed: paged `FlatList`, lazy load enabled.
- Chat list: paged `FlatList`, lazy load enabled.
- Notifications: paged `FlatList`, lazy load enabled.
- Chat messages: API supports cursor-style `beforeMessageId`; verify older-message loading during QA.

## Backend APIs

- Match discovery: page/limit with `hasNextPage`.
- My matches/interests/shortlists/viewers: page/limit metadata.
- Notifications: page/limit with `hasNextPage`.
- Chat conversations: page/limit with `hasMore`.
- Chat messages: limit plus cursor.
- Admin users/audit/payments: page/limit available.

## QA Checks

- Confirm no launch screen requests more than 20 items unless it is a small static settings list.
- Confirm infinite scroll does not duplicate items after refresh.
- Confirm pull-to-refresh resets page state to page 1.
- Confirm empty, loading, and footer-loading states render in dark theme.
