# Google Play Console Submission Guide — Match Mate

Last reviewed against repository and current Google guidance: 2026-07-14

Use this worksheet for closed testing and the first production submission. It
is based on the current package `com.webnza.matchmate` and repository behavior.
Google approval cannot be guaranteed; every declaration must remain accurate
for the exact Android App Bundle being submitted.

## 1. App Setup

| Play Console field | Recommended value                                                |
| ------------------ | ---------------------------------------------------------------- |
| App name           | Match Mate                                                       |
| Default language   | English (India) or the language used for the primary listing     |
| App or game        | App                                                              |
| Free or paid       | Free — subscriptions are sold as in-app products                 |
| Package name       | `com.webnza.matchmate`                                           |
| Category           | Dating                                                           |
| Tags               | Dating, Relationships, Matrimony/Marriage where Play offers them |
| Developer name     | Must exactly match the verified Play developer profile           |
| Contact email      | `support@webnza.com`                                             |
| Website            | `https://www.webnza.com`                                         |
| Contact phone      | **BUSINESS INPUT REQUIRED** — use a monitored support number     |

Do not use “official,” “government approved,” “100% verified,” “guaranteed
marriage,” or similar claims unless they are independently supportable.

## 2. App Content Declarations

### Privacy policy

Enter:

`https://matchmate.webnza.com/privacy-policy`

Repository status: implemented as a public HTML page and linked inside the app.
Before submission, open it in an incognito browser and confirm HTTP 200, no
login, no iframe/CORS error, readable mobile layout, and that the displayed
developer/entity name matches the Play listing.

### Account deletion

Enter this Data safety account-deletion URL:

`https://matchmate.webnza.com/account-deletion`

Repository status: in-app deletion scheduling and a public instruction page
exist. Verify that an unauthenticated user can discover a real request path,
such as the monitored support email, without being forced to reinstall or sign
in. State any legally retained billing, fraud, or safety records clearly.

### App access / sign-in details

Select **All or some functionality is restricted** and provide a dedicated
reviewer account. Copy
`docs/launch/REVIEWER-CREDENTIALS.template.md` to the ignored private file and
complete it.

Repository reviewer account:

- Email: `reviewer@webnza.com`
- Password: stored in ignored `docs/launch/REVIEWER-CREDENTIALS.private.md`
- Entitlement: active Platinum Yearly subscription
- Access: normal user only; no administrator or employee permissions
- MFA/OTP: disabled/not required for email-password review
- Phone reviewer: `+91 9876543210`, reusable OTP stored in the ignored private
  credentials file, with a separate Platinum Yearly standard-user account

Recommended Play reviewer instructions:

```text
1. Open Match Mate and tap Log in.
2. Choose Email and Password.
3. Enter the reviewer credentials supplied below.
4. This account has completed onboarding, has an active profile photo and
   matching preferences, and has Platinum Yearly access to Membership.
5. No OTP, invitation, payment, or external device is required for review.
6. To test account deletion: Settings > Account Settings > Delete Account.
7. To test report/block: open a match profile and use the safety actions.
8. Optional phone login: choose Phone, request an OTP for the supplied reviewer
   number, and enter the reusable OTP from the access credentials. No SMS is
   sent for this one reviewer destination.
```

Never give Google an employee/admin account. Test the reviewer credentials in
the exact release build immediately before submission.

### Ads

Recommended answer: **No, my app does not contain ads.**

Repository evidence: no mobile advertising SDK or advertising-ID use was
found. Google Play Billing subscriptions are not “ads.” Change this declaration
before adding banners, native ads, interstitials, rewarded ads, or an ad SDK.

### Content rating

Complete the IARC questionnaire truthfully. Recommended interpretation:

- App type: social/communication or other non-game app.
- Users exchange profile text, photos, videos, and private chat: **Yes, UGC and
  user interaction are present.**
- Matrimonial/dating theme: **Yes.**
- Intended explicit sexual content, nudity, violence, drugs, gambling, or
  profanity supplied by Match Mate: **No.**
- Unrestricted web browser: **No.**
- Location sharing: location is used for matching; exact live-location
  broadcasting is not a core feature.
- Purchases of digital subscriptions: **Yes.**

Do not answer “No user interaction” merely because profiles are moderated.
The app has report, block, moderation, terms, and community-guideline flows;
verify each is reachable in the reviewer build.

### Target audience

Recommended selection: **18 and over only**. Do not select child age groups.

Match Mate is an adult matrimonial service. The mobile date picker limits DOB
selection and the API rejects profile creation below age 18. Store artwork and
copy must not be child-directed.

### Data safety

Recommended top-level answers:

- Does the app collect or share required user data types? **Yes**.
- Is all collected data encrypted in transit? **Yes**, provided every
  production API/media endpoint remains HTTPS.
- Can users request deletion? **Yes**.
- Account creation supported? **Yes**.
- Independent security review? **No**, unless a qualifying audit has actually
  been completed.

Use this inventory as the starting point, then reconcile it with every enabled
production SDK and provider:

| Play data type                        | Collected                               | Required/optional                            | Primary purposes                                                                                             |
| ------------------------------------- | --------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Approximate and precise location      | Yes when permitted                      | Optional                                     | App functionality, matching, fraud/safety                                                                    |
| Name                                  | Yes                                     | Required                                     | Account management, app functionality                                                                        |
| Email address                         | Yes                                     | Required for email login                     | Account management, security, communication                                                                  |
| Phone number                          | Depending on enabled login/profile flow | Optional unless phone login is enabled       | Account management, security, communication                                                                  |
| User IDs                              | Yes                                     | Required                                     | Account management, app functionality, security                                                              |
| Other personal info                   | Yes                                     | Mix of required and optional                 | DOB/age, gender, religion/community, marital, family, education, occupation, income and matrimonial matching |
| Photos and videos                     | Yes when uploaded                       | Optional but important to profile experience | Profile, verification, moderation                                                                            |
| Audio files                           | Yes if voice/video recording is enabled | Optional                                     | Communication/profile media                                                                                  |
| Files and documents                   | Yes for verification/support uploads    | Optional                                     | Verification, safety, support                                                                                |
| Other in-app messages                 | Yes                                     | Optional feature                             | Chat and support                                                                                             |
| App interactions                      | Yes                                     | Required for operation                       | Matches, interests, shortlists, views, analytics, personalization                                            |
| Search history / matching preferences | Yes                                     | Optional profile preference                  | App functionality, personalization                                                                           |
| Other user-generated content          | Yes                                     | Optional                                     | Profiles, bios, support and success stories                                                                  |
| Purchase history                      | Yes                                     | Only for purchasers                          | Subscription entitlement, fraud prevention, account management                                               |
| Crash logs and diagnostics            | Yes when Sentry is enabled              | Required for diagnostics while enabled       | Analytics, security, app functionality                                                                       |
| Device or other IDs                   | Yes                                     | Required for sessions/push while enabled     | Security, fraud prevention, notifications                                                                    |

“Shared” has a specific Play definition. Transfers to contracted service
providers may qualify for an exclusion, but this depends on contracts and use.
Review at minimum Google/Firebase, Expo, Sentry, hosting/storage, email/SMS,
identity verification, and support providers. Do not simply declare “not
shared” without that review.

### Government apps

Recommended answer: **No**. Match Mate is not developed by or on behalf of a
government body and must not imply government affiliation.

### Financial features

Recommended answer: **This app does not provide financial features.**

The app sells its own digital matrimonial subscriptions through Google Play;
it does not provide banking, lending, investing, insurance, money transfer,
cryptocurrency, earned-wage access, or financial advice. Purchase history must
still be disclosed in Data safety.

### Health

Recommended answer: **No health features.**

General profile/lifestyle fields do not make Match Mate a medical or health
app. Reassess before adding medical records, diagnosis, treatment, health
research, or Health Connect.

## 3. Permissions Declaration Audit

Current Android permissions have identifiable features:

| Permission           | App use                                             | Submission note                                             |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| Coarse/fine location | Nearby/location-based matching                      | Ask only when that feature is used; disclose in Data safety |
| Camera               | Capture profile/verification media                  | Explain immediately before permission request               |
| Microphone           | Voice/video recording                               | Ask only when recording begins                              |
| Notifications        | Matches, chat, security, billing and support alerts | Runtime opt-in and settings are implemented                 |
| Billing              | Google Play subscriptions                           | Required                                                    |

Broad `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` declarations were removed.
Selected profile uploads use the picker flow; do not re-add broad access unless
the app later qualifies for and passes Play’s Photo and Video permission review.

After producing the AAB, verify the final merged manifest in Play Console. SDKs
can add permissions that are not obvious from `app.json`.

### Android compatibility gates

- Expo SDK 54 targets Android API 36, above Play's current API 35 minimum.
- Upload the AAB to an internal track first and confirm Play reports no 16 KB
  native-library/page-size compatibility issue. This is mandatory for new apps
  targeting Android 15 or later.
- Review the Pre-launch report for crashes, ANRs, accessibility, security, and
  device compatibility before promoting the same artifact to closed testing.

## 4. Store Listing Copy

### App name

`Match Mate`

### Short description (maximum 80 characters)

`Find compatible matrimonial matches with privacy, verification and secure chat.`

### Full description draft

```text
Match Mate helps adults discover compatible matrimonial profiles through
meaningful preferences, privacy controls and safer communication.

Build a detailed matrimonial profile with your background, education,
profession, family information, lifestyle and partner preferences. Explore
recommended profiles, express interest, shortlist suitable matches and chat
after connecting.

Key features:
• Personalized matrimonial recommendations and filters
• Detailed profiles with optional photos and video introductions
• Interest, shortlist and private chat workflows
• Profile verification and moderation tools
• Report, block, privacy and communication controls
• English and Hindi support
• Optional subscription plans for additional benefits
• Account data export and deletion controls

Match Mate is intended only for adults aged 18 and over. Users are responsible
for providing accurate information and communicating respectfully. Match Mate
does not guarantee marriage, identity, compatibility or outcomes. Some
features require an internet connection, permissions or an active subscription.
```

Avoid putting prices, rankings, temporary offers, competitor names, or
unverifiable superlatives in the listing.

## 5. Graphic Assets

Prepare and review separately from runtime assets:

- App icon: 512 × 512 PNG, no transparency.
- Feature graphic: 1024 × 500 JPG or PNG.
- At least 2 phone screenshots; use 6–8 strong screenshots for conversion.
- Tablet screenshots if tablet distribution remains enabled.
- Screenshots must show real current UI, no private user data, fake claims, or
  features unavailable in the submitted build.
- Add English and Hindi localized listings only when every localized asset and
  description is ready.

Repository status: runtime icon, adaptive icon, splash icon, and favicon exist.
The current runtime icon files are only 500 x 500; prepare a source-quality app
icon (preferably 1024 x 1024 for the build) and a separate 512 x 512 opaque Play
listing icon. The current icon's outer rounded corners contain black pixels, so
do not use a simple resize as the Play listing asset; export the logo on a clean
full-square background with Play-safe margins. A dedicated Play feature graphic
and final store screenshot set are not present and must be supplied before
submission.

## 6. Closed Testing and Production Access

If the developer account is a personal account created after 13 November 2023,
Google currently requires at least 12 opted-in closed testers for 14 continuous
days before applying for production access. Testers should actively use core
flows and provide feedback; merely adding email addresses is weak evidence.

Keep a testing record containing:

- tester count and opt-in dates;
- devices/Android versions;
- flows tested;
- issues discovered and fixes made;
- feedback summary;
- why the app is ready for production.

Use `PLAY-STORE-QA-CHECKLIST.md` for the release run.

## 7. Current Readiness Verdict

### Submission gate: external verification required as of 2026-07-14

The deployment owner reports that `matchmate.webnza.com` is now working. A
repeat probe from the current development runner still resolves the hostname to
`13.232.104.246` but receives a connection refusal on port 443 for every URL
below. This can be caused by deployment firewall or source-network rules, so it
does not by itself prove that the public deployment is down. Do not promote the
AAB until the URLs and both reviewer logins pass from an unrelated mobile or
incognito network.

Unblock only after all of these pass from a network outside the deployment:

```text
https://matchmate.webnza.com/api/v1/health
https://matchmate.webnza.com/privacy-policy
https://matchmate.webnza.com/terms-conditions
https://matchmate.webnza.com/community-guidelines
https://matchmate.webnza.com/account-deletion
```

Each public policy URL must return HTTP 200 without authentication. The health
endpoint must show the production API is available without exposing secrets.

### Present in the application

- Public privacy, terms, community-guideline and deletion pages
- In-app account deletion request
- Email/password reviewer-compatible login
- Adult DOB picker plus server-side minimum-age enforcement
- Report, block and moderation foundations
- Notification preferences
- Google Play subscription integration and restore
- HTTPS production API configuration
- No advertising SDK detected

### Must be completed or manually verified before submission

- Public URLs return HTTP 200 from an incognito browser
- Dedicated reviewer credentials and reviewer notes
- Both reviewer records and their Platinum Yearly subscriptions were
  synchronized in the configured database on 2026-07-14; verify both logins
  from the exact release AAB
- Deploy the destination-bound phone-review OTP variables to the API secret
  store and verify `+91 9876543210` with the reusable OTP
- Final Data safety declaration reconciled with production SDK/provider use
- Terms/privacy acceptance occurs before profile/media UGC creation
- Report user, report content/media/message, and block user are clearly reachable
- Moderation queue has an operational response process
- Support phone and verified developer identity/contact details
- Store icon, feature graphic, screenshots and localized listing assets
- Final merged-manifest permission review
- Play Console must report API-level and 16 KB page-size compatibility
- Licensed-track purchase/restore and RTDN evidence
- Closed-test duration/tester requirement if applicable

### Performance baseline

- Expo Doctor passes all 18 checks.
- A production Android export measured 8.05 MiB: a 6.94 MiB Hermes bundle plus
  approximately 1.11 MiB of assets. This is a JavaScript/export baseline, not
  the final AAB or Play download size.
- Unused direct `react-native-paper` and `@expo/vector-icons` dependencies were
  removed. Record the final AAB size and Play-reported compressed download size
  before promotion, then fail future releases on a meaningful regression.
- Conversation-list and active-media compound indexes now match their hot read
  filters and sort order. Validate them with production-like `explain()` plans,
  slow-query monitoring, and load tests before raising traffic.

## 8. Official References

- [Prepare your app for review](https://support.google.com/googleplay/android-developer/answer/9859455)
- [Data safety form guidance](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Target audience and content](https://support.google.com/googleplay/android-developer/answer/9867159)
- [Target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
- [16 KB page-size compatibility](https://developer.android.com/guide/practices/page-sizes)
- [Reviewer sign-in requirements](https://support.google.com/googleplay/android-developer/answer/15748846)
- [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Account-deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111)
- [User-generated-content policy](https://support.google.com/googleplay/android-developer/answer/9876937)
- [Photo and Video Permissions policy](https://support.google.com/googleplay/android-developer/answer/14115180)
- [Create the store listing](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Closed-testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Financial features declaration](https://support.google.com/googleplay/android-developer/answer/13849271)

Re-check these pages in Play Console immediately before submission because
policy questions and wording can change.
