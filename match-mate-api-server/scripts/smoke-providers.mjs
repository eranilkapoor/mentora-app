import { config } from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
config({ path: [`.env.${nodeEnv}`, '.env'], quiet: true });

const strictMode = process.env.SMOKE_STRICT === 'true';

const providerChecks = [
  {
    provider: 'google-play-billing',
    enabled: () =>
      process.env.PAYMENT_MOBILE_STORE_VERIFICATION_MODE === 'strict',
    vars: ['GOOGLE_PLAY_PACKAGE_NAME', 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON'],
  },
  {
    provider: 'apple-store-billing',
    enabled: () => Boolean(process.env.APPLE_STORE_ISSUER_ID),
    vars: [
      'APPLE_STORE_ISSUER_ID',
      'APPLE_STORE_KEY_ID',
      'APPLE_STORE_BUNDLE_ID',
      'APPLE_STORE_PRIVATE_KEY',
    ],
  },
  {
    provider: 'email-ses',
    enabled: () =>
      process.env.NOTIFICATION_EMAIL_ENABLED === 'true' &&
      process.env.NOTIFICATION_EMAIL_PROVIDER === 'ses',
    vars: ['NOTIFICATION_EMAIL_FROM', 'NOTIFICATION_EMAIL_SES_REGION'],
    anyOf: [
      [
        'NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID',
        'NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY',
      ],
      ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    ],
  },
  {
    provider: 'sms-msg91',
    enabled: () =>
      process.env.NOTIFICATION_SMS_ENABLED === 'true' &&
      process.env.NOTIFICATION_SMS_PROVIDER === 'msg91',
    vars: [
      'NOTIFICATION_SMS_MSG91_AUTH_KEY',
      'NOTIFICATION_SMS_MSG91_TEMPLATE_ID',
    ],
  },
  {
    provider: 'push-fcm',
    enabled: () =>
      process.env.NOTIFICATION_PUSH_ENABLED === 'true' &&
      process.env.NOTIFICATION_PUSH_PROVIDER === 'fcm',
    anyOf: [
      ['NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON'],
      [
        'NOTIFICATION_PUSH_FCM_PROJECT_ID',
        'NOTIFICATION_PUSH_FCM_CLIENT_EMAIL',
        'NOTIFICATION_PUSH_FCM_PRIVATE_KEY',
      ],
    ],
  },
  {
    provider: 'storage-s3',
    enabled: () => process.env.STORAGE_DRIVER === 's3',
    vars: [
      'AWS_REGION',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET',
    ],
  },
  {
    provider: 'social-google',
    enabled: () => process.env.AUTH_SOCIAL_GOOGLE_ENABLED === 'true',
    vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  },
  {
    provider: 'social-facebook',
    enabled: () => process.env.AUTH_SOCIAL_FACEBOOK_ENABLED === 'true',
    vars: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'],
  },
];

function runChecks() {
  const report = providerChecks
    .filter((check) => check.enabled())
    .map((check) => {
      const missing = (check.vars ?? []).filter((variable) => {
        const value = process.env[variable];
        return !value || value.trim().length === 0;
      });

      const anyOfSatisfied =
        !check.anyOf ||
        check.anyOf.some((group) =>
          group.every((variable) => Boolean(process.env[variable]?.trim())),
        );

      return {
        provider: check.provider,
        missing: [...missing, ...(anyOfSatisfied ? [] : check.anyOf.flat())],
        ok: missing.length === 0 && anyOfSatisfied,
      };
    });

  const failed = report.filter((entry) => !entry.ok);

  console.log('Provider smoke configuration report');
  for (const entry of report) {
    if (entry.ok) {
      console.log(`- ${entry.provider}: ok`);
      continue;
    }

    const level = strictMode ? 'error' : 'warn';
    console[level](
      `- ${entry.provider}: missing -> ${entry.missing.join(', ')}`,
    );
  }

  if (strictMode && failed.length > 0) {
    process.exitCode = 1;
  }
}

runChecks();
