# Social Login And Signup

## Current Implementation

Supported providers:

- Google login/signup
- Facebook login/signup
- Apple login/signup on iOS

Mobile flow:

- Google and Facebook use `expo-auth-session`.
- Apple uses `expo-apple-authentication`.
- The app sends `provider`, `provider_id`, `accessToken`, and optional profile fields to `POST /api/v1/auth/social-login`.

Backend flow:

- `SocialAuthVerifierService` verifies Google by calling `https://www.googleapis.com/userinfo/v2/me`.
- Facebook is verified through `https://graph.facebook.com/me`.
- Apple decodes and validates the identity token expiry and `aud` against `APPLE_CLIENT_ID`.

## Backend Environment

```env
AUTH_SOCIAL_GOOGLE_ENABLED=true
AUTH_SOCIAL_FACEBOOK_ENABLED=true
AUTH_SOCIAL_APPLE_ENABLED=true

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=/api/v1/auth/google/callback

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
```

Notes:

- `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_SECRET`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY` are configured but the current social-login verifier mainly validates client-provided access/identity tokens.
- `AUTH_SOCIAL_*_ENABLED=true` requires the matching client id in backend env validation.

## Mobile Environment

```env
EXPO_PUBLIC_AUTH_SOCIAL_GOOGLE_ENABLED=true
EXPO_PUBLIC_AUTH_SOCIAL_FACEBOOK_ENABLED=true
EXPO_PUBLIC_AUTH_SOCIAL_APPLE_ENABLED=true

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_REDIRECT_URI=
EXPO_PUBLIC_FACEBOOK_CLIENT_ID=
```

Mobile config:

- App scheme: `mentora`
- iOS bundle id: `com.webnza.mentora`
- Android package: `com.webnza.mentora`
- Apple auth plugin: `expo-apple-authentication`
- Web auth plugin: `expo-web-browser`

## Provider Console Setup

### Google

1. Create OAuth clients for Web, iOS, and Android in Google Cloud Console.
2. Android client must use package `com.webnza.mentora` and the signing certificate SHA-1/SHA-256 for the build profile.
3. iOS client must use bundle id `com.webnza.mentora`.
4. Web client redirect URI must match `EXPO_PUBLIC_GOOGLE_REDIRECT_URI` for web.
5. Enable People/UserInfo access scopes if prompted.

### Facebook

1. Create a Meta app.
2. Add Facebook Login.
3. Configure app id as `FACEBOOK_CLIENT_ID` and `EXPO_PUBLIC_FACEBOOK_CLIENT_ID`.
4. Add Android package, key hash, and iOS bundle id.
5. Request/verify `email` permission if production login needs email.

### Apple

1. Enable Sign in with Apple for the app identifier.
2. Ensure iOS bundle id is `com.webnza.mentora`.
3. Set backend `APPLE_CLIENT_ID` to the expected audience in Apple identity tokens.

## Validation Steps

Backend:

```bash
cd mentora-api-server
npm run env:validate
npm run test -- social-auth-verifier.service.spec.ts
```

Mobile:

```bash
cd mentora-mobile-app
npm run typecheck
```

Manual smoke:

1. Enable one provider at a time.
2. Open Login/Register.
3. Tap provider button.
4. Complete provider consent.
5. Confirm backend returns access and refresh tokens from `POST /auth/social-login`.
6. Confirm user has an `authAccounts` entry for the provider and can log in again without duplicate account creation.

## Common Failures

| Symptom                               | Check                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| Google cancelled or redirect mismatch | `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`, redirect URI, app scheme, Android SHA fingerprints |
| Facebook email missing                | Meta app permission review and user email visibility                                 |
| Apple rejected by backend             | `APPLE_CLIENT_ID` must match token `aud`; device must support Apple auth             |
| Provider button hidden                | `EXPO_PUBLIC_AUTH_SOCIAL_*_ENABLED` and client id are both required on mobile        |
