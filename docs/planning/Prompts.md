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

## Already Implemented Or Partially Implemented

1. Help & Support, Support Tickets, FAQs, Community Guidelines, Terms & Conditions, and Privacy Policy already have improved structured screens from recent support/legal work. Needs visual QA only.
2. Subscription & Billing has richer billing/subscription data, payment flow integration, current-plan benefits, trial/cancel/auto-renew status, and provider reconciliation display. Needs device visual QA only.
3. Seeder users, roles, subscriptions, feature/plan mapping, sample collection documents, and plan lifecycle defaults were recently expanded. Needs seeded-login QA against interest/chat/payment flows.
4. OpenAPI/shared API contract exists under `packages/api-contract` and is consumed by membership/payment services. Broader generated-client migration remains a separate architecture task.

## Still Recommended Next Code Fixes

1. Add a reusable missing-translation test that scans `t('...')` keys and validates English/Hindi locale coverage.
2. Improve Profile PDF/share biodata HTML with masked sensitive fields based on privacy settings.
3. Add placeholders to any remaining Edit Profile and Partner Preference fields after a focused field-by-field audit.
4. Complete Android safe-area QA for Home filters in addition to the Matches filter modal fixed here.
5. Fix Match Detail bottom action/report/block spacing after device screenshots.
6. Investigate DropdownPicker clipping in nested scroll areas for Highest Qualification and similar fields; component already uses `FlatList` with `nestedScrollEnabled`, so this likely needs layout/portal handling.
7. Enforce strict Religion, Caste, Sub-caste, and Height preference filters from backend query/service logic and verify with seeded profiles.
8. Hide chat reactions until hover/focus/press state instead of always showing them.
9. Complete Sentry SDK wiring for mobile and backend using the configured DSNs.
10. Decide product UX for grid vs swipe mode and Discover/Activity bottom navigation split before implementation.
