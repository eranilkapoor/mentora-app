# MatchMate Prompt Audit Tracker

Last reviewed: 2026-06-18

## Fixed In This Pass

1. Client-side auth error handling is now consistent for Login, Register, Forgot Password, and Reset Password. Forgot/Reset now use the shared API response/error message helper instead of generic network-only fallback messages.
2. Language selection now lives inside Localization Settings as an option sheet. The separate Language route has been removed from the Settings stack.
3. Theme selection now lives inside Accessibility Settings as an option sheet. The separate Theme route has been removed from the Settings stack.
4. Security Settings now has a single Two-Factor Authentication entry. The duplicate 2FA Method link was removed, and the remaining row shows the selected method when enabled.
5. Settings profile subtitle now shows email first, then phone number, then user ID fallback.
6. Profile Boost on Membership only renders when the current active plan includes an enabled `profile_boost` feature.
7. Matches Curated tab now only appears when curated matches exist. On first load it auto-selects Curated when inventory exists; otherwise Recommended remains default.
8. Send Interest feedback now uses toast notifications instead of Android-blocking popups.
9. Matches filter modal now respects safe-area bottom padding so action buttons stay above Android navigation controls.
10. Added missing `auth.errors.forgot_password_failed` translation in English and Hindi. `settings.notifications.disable_all_sub` already exists in both locales.
11. Subscription & Billing now resolves current-plan benefits from the membership plan catalog, and shows billing cycle, trial status, payment provider, and provider reconciliation state.
12. Profile PDF/share biodata now uses a sectioned biodata layout, includes a privacy note/footer, and masks exact age/date of birth, income, phone, and email according to current privacy settings.
13. Edit Profile placeholder audit completed for the missing Family and Astro inputs, with English/Hindi placeholder keys added. Partner Preferences editable inputs already had placeholders during this scan.
14. Added `npm run i18n:check` for the mobile app. The checker scans static `t('...')` keys and validates English/Hindi locale coverage.
15. Fixed the missing English/Hindi locale keys exposed by the new i18n checker, including chat reaction failures, notification bulk-action subtitles, and Hindi linked-account labels.
16. Chat quick reactions are now hidden by default and reveal only on hover, focus, or press interaction.
17. Match Detail bottom CTA now uses device safe-area padding, and report/block actions wrap cleanly on narrow screens.
18. Long onboarding/edit-profile dropdowns for religion, country, residency country, and qualification are now searchable with taller option panels.
19. Match discovery now applies the saved `subCaste` preference filter in addition to the existing religion, caste, and height filters.
20. Backend Sentry SDK wiring is now live through `ErrorMonitoringService`, initialized during API bootstrap when monitoring provider is `sentry` and `SENTRY_DSN` is configured.
21. Mobile Sentry SDK wiring is now live through the shared `errorReporter`, initialized before root component registration when `EXPO_PUBLIC_ERROR_REPORTING_PROVIDER=sentry` and a DSN is configured.
22. Added a backend regression spec for strict match discovery filters covering religion, caste, sub-caste, height, verification, and minimum score behavior.
23. `DropdownPicker` now renders its options in a positioned modal portal, preventing nested scroll views/cards from clipping long dropdown lists.
24. Production Sentry env flags now align with configured DSNs for mobile and backend, with trace sampling defaulted to `0` until APM sampling is intentionally enabled.
25. Product recommendation documented: keep the current Home discovery grid/list and Matches/Chats bottom navigation structure for now; defer swipe mode or Discover/Activity split until analytics or UX evidence supports the extra navigation complexity.
26. Support ticket/helpdesk request and response shapes now live in the shared `@matchmate/api-contract` package and are consumed by the mobile support API service.

## Completed Or Audited

1. Help & Support, Support Tickets, FAQs, Community Guidelines, Terms & Conditions, and Privacy Policy have structured screens and backend/helpdesk APIs. Remaining work is device visual QA only.
2. Subscription & Billing has richer billing/subscription data, payment flow integration, current-plan benefits, trial/cancel/auto-renew status, and provider reconciliation display. Remaining work is device visual QA only.
3. Seeder users, roles, subscriptions, feature/plan mapping, sample collection documents, and plan lifecycle defaults are implemented. Remaining work is seeded-login flow QA only.
4. Shared API contract coverage now includes membership, billing, payment, subscription, and support ticket/helpdesk surfaces. Full Swagger-generated SDK migration is intentionally deferred as an architecture choice, not a current blocker.
5. Home currently has search and list browsing only; there is no active Home filter modal to safe-area harden. Matches filter modal is already safe-area aware.
6. DropdownPicker has nested scrolling/search support, long-list fields opt into search/taller panels, and the picker now uses a modal portal to avoid nested clipping.

## Remaining Manual QA

1. Run seeded-profile/device QA for strict Religion, Caste, Sub-caste, and Height preference filters to confirm real result counts and edge cases beyond the unit-level regression test.
2. Run seeded-login device QA across Support Tickets, Subscription Billing, Membership checkout, Interest, Chat, and Payment flows.
3. Run final device visual QA for Help & Support, legal screens, Subscription & Billing, and the portal-based dropdowns.
