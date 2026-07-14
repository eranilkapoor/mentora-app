# Play Store Release QA Checklist

Use this checklist for every closed-testing and production candidate.

Complete `PLAY-CONSOLE-SUBMISSION-GUIDE.md` before starting this QA run.

## Build Identity

- Android package: `com.webnza.matchmate`
- App name: `Match Mate`
- Build profile: `production`
- Build type: Android App Bundle (`.aab`)
- API base URL: `https://matchmate.webnza.com/api/v1`
- Push enabled only when production FCM is configured and tested.

## Submission Gate

- Production API health returns HTTP 200 over HTTPS from an external network.
- Privacy policy, terms, community guidelines, and account-deletion pages each
  return HTTP 200 without authentication.
- `reviewer@webnza.com` logs in without OTP and shows Platinum Yearly in the
  exact release AAB.
- Play Console accepts the AAB's target API level and reports no 16 KB
  page-size compatibility issue.
- Pre-launch report has no unresolved crash, ANR, security, or accessibility
  blocker.
- Store listing has a 512 x 512 opaque icon, 1024 x 500 feature graphic, and
  at least two current phone screenshots.

## Required Store Screenshots

Capture light and dark theme screenshots where applicable.

- Welcome screen
- Login screen
- Register screen
- Onboarding profile details
- Home recommended matches
- Matches list with filters open
- Match detail
- Chat list
- Chat conversation
- Notifications list/detail
- Profile
- Edit profile media/video intro
- Settings
- Subscription and billing
- Refer and rewards

## Android Device Matrix

- Pixel recent Android version
- Samsung Galaxy mid-range device
- Redmi/Xiaomi low-memory device
- Small-screen Android phone
- Large-screen Android phone
- Android tablet
- Foldable or resizable emulator if available

## iOS / iPad Smoke Matrix

- iPhone recent iOS version
- iPhone small-screen size
- iPad portrait
- iPad landscape

## Critical Regression Flow

- Email registration
- Phone OTP registration when enabled
- Google login when enabled
- Forgot password deep link
- Onboarding completion lands on Home
- Nearby matches asks for location only when needed
- Send, withdraw, accept, reject interest
- Shortlist and unshortlist profile
- Chat send/read/typing indicator
- Block user removes chat access
- Notification tap opens detail or action target
- Plan purchase test path
- Restore purchase test path with a Play license tester
- Logout and login with another user on same device

## Release Blockers

- Any crash on app open
- Login/register blocked for reviewer
- Production build pointing to localhost
- Missing privacy policy or account deletion instructions
- Broken payment or subscription screen
- Push notification permission loop
- Dark theme unreadable text on major screens
