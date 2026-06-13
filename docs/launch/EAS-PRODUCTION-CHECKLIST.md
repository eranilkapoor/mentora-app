# EAS Production Build Checklist

The current `eas.json` production profile is store-ready in shape:

- `distribution`: `store`
- `channel`: `production`
- Android `buildType`: `app-bundle`
- `cli.appVersionSource`: `remote`

## Before Uploading to Play Console

- Run `eas build --platform android --profile production`.
- Confirm the generated artifact is an `.aab`.
- Confirm EAS remote app version and Android `versionCode` have advanced from the previous Play upload.
- Confirm Android signing credentials are managed in EAS and match the Play Console app signing setup.
- Confirm production env has no localhost URLs.
- Confirm social-login OAuth SHA fingerprints include the release signing certificate.
- Confirm Play Billing products match backend plan identifiers before enabling in-app subscriptions.

## Versioning Rule

Because `appVersionSource` is `remote`, use EAS/Expo version management for the Play upload version. Do not rely only on `app.json` version when preparing a production upload.

## Signing Rule

Keep upload keystores and service account keys out of the repo. Store them in EAS credentials or the organization password manager.
