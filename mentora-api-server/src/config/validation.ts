import * as Joi from 'joi';

const envString = Joi.string().trim();
const optionalString = envString.empty('');
const placeholderSecretValues = [
  'your_access_key',
  'your_secret_key',
  'change_me',
  'changeme',
  'placeholder',
  'replace_me',
  'REPLACE_ME',
];
const optionalAwsCredential = envString.empty(['', ...placeholderSecretValues]);
const hostSchema = Joi.alternatives().try(
  Joi.string().hostname(),
  Joi.string().ip(),
);
const optionalHost = hostSchema.empty('');
const awsRegionSchema = Joi.string()
  .trim()
  .pattern(/^[a-z]{2}-[a-z]+-\d$/)
  .messages({
    'string.pattern.base': 'must be a valid AWS region like us-east-1',
  });
const durationSchema = Joi.string()
  .trim()
  .pattern(/^\d+(ms|s|m|h|d|w|y)?$/i)
  .messages({
    'string.pattern.base':
      'must be a valid duration like 15m, 7d, 3600 or 500ms',
  });
const optionalDuration = durationSchema.empty('');
const optionalEmail = Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .empty('');
const optionalUri = Joi.string()
  .trim()
  .uri({ scheme: ['http', 'https'] })
  .empty('');
const optionalSmtpUri = Joi.string()
  .trim()
  .uri({ scheme: ['smtp', 'smtps'] })
  .empty('');
const mongoUriSchema = Joi.string()
  .trim()
  .uri({ scheme: [/mongodb(\+srv)?/] })
  .messages({
    'string.uri': 'must be a valid MongoDB connection string',
  });
const s3BucketSchema = Joi.string()
  .trim()
  .pattern(/^(?!\d+\.\d+\.\d+\.\d+$)(?!-)(?!.*--)[a-z0-9.-]{3,63}(?<!-)$/)
  .messages({
    'string.pattern.base': 'must be a valid S3 bucket name',
  });

function validateAllowedOrigins(value: string, helpers: Joi.CustomHelpers) {
  const ancestors = helpers.state.ancestors as unknown[];
  const root =
    ancestors.length > 0 && typeof ancestors[0] === 'object'
      ? (ancestors[0] as { NODE_ENV?: string })
      : undefined;

  const env = root?.NODE_ENV;
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return helpers.error('any.custom', {
      customMessage: 'ALLOWED_ORIGINS must contain at least one origin',
    });
  }

  if (env === 'production' && origins.includes('*')) {
    return helpers.error('any.custom', {
      customMessage: 'ALLOWED_ORIGINS cannot contain * in production',
    });
  }

  for (const origin of origins) {
    if (origin === '*') {
      continue;
    }

    const { error } = Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .validate(origin);
    if (error) {
      return helpers.error('any.custom', {
        customMessage: `ALLOWED_ORIGINS contains an invalid origin: ${origin}`,
      });
    }
  }

  return value;
}

function validateNotificationProviders(
  env: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  if (
    env.NOTIFICATION_EMAIL_ENABLED &&
    env.NOTIFICATION_EMAIL_PROVIDER === 'ses'
  ) {
    if (!env.NOTIFICATION_EMAIL_FROM) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_EMAIL_FROM is required when NOTIFICATION_EMAIL_PROVIDER=ses',
      });
    }

    if (!env.NOTIFICATION_EMAIL_SES_REGION && !env.AWS_REGION) {
      return helpers.error('any.custom', {
        customMessage:
          'Either NOTIFICATION_EMAIL_SES_REGION or AWS_REGION is required when NOTIFICATION_EMAIL_PROVIDER=ses',
      });
    }

    const hasDedicatedSesCredentials =
      Boolean(env.NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID) &&
      Boolean(env.NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY);
    const hasAwsCredentials =
      Boolean(env.AWS_ACCESS_KEY_ID) && Boolean(env.AWS_SECRET_ACCESS_KEY);

    if (!hasDedicatedSesCredentials && !hasAwsCredentials) {
      return helpers.error('any.custom', {
        customMessage:
          'SES email delivery requires NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID and NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY, or fallback AWS credentials',
      });
    }
  }

  if (
    env.NOTIFICATION_EMAIL_ENABLED &&
    env.NOTIFICATION_EMAIL_PROVIDER === 'smtp'
  ) {
    if (!env.NOTIFICATION_EMAIL_FROM) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_EMAIL_FROM is required when NOTIFICATION_EMAIL_PROVIDER=smtp',
      });
    }

    const hasDsn = Boolean(env.NOTIFICATION_EMAIL_SMTP_DSN);
    const hasHostCredentials =
      Boolean(env.NOTIFICATION_EMAIL_SMTP_HOST) &&
      Boolean(env.NOTIFICATION_EMAIL_SMTP_PORT) &&
      Boolean(env.NOTIFICATION_EMAIL_SMTP_USERNAME) &&
      Boolean(env.NOTIFICATION_EMAIL_SMTP_PASSWORD);

    if (!hasDsn && !hasHostCredentials) {
      return helpers.error('any.custom', {
        customMessage:
          'SMTP email delivery requires NOTIFICATION_EMAIL_SMTP_DSN, or NOTIFICATION_EMAIL_SMTP_HOST, NOTIFICATION_EMAIL_SMTP_PORT, NOTIFICATION_EMAIL_SMTP_USERNAME, and NOTIFICATION_EMAIL_SMTP_PASSWORD',
      });
    }
  }

  if (
    env.NOTIFICATION_SMS_ENABLED &&
    env.NOTIFICATION_SMS_PROVIDER === 'msg91'
  ) {
    if (!env.NOTIFICATION_SMS_MSG91_AUTH_KEY) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_SMS_MSG91_AUTH_KEY is required when NOTIFICATION_SMS_PROVIDER=msg91',
      });
    }

    if (!env.NOTIFICATION_SMS_MSG91_TEMPLATE_ID) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_SMS_MSG91_TEMPLATE_ID is required when NOTIFICATION_SMS_PROVIDER=msg91',
      });
    }
  }

  if (
    env.NOTIFICATION_PUSH_ENABLED &&
    env.NOTIFICATION_PUSH_PROVIDER === 'fcm'
  ) {
    const hasServiceAccountJson = Boolean(
      env.NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON,
    );
    const hasServiceAccountPath = Boolean(
      env.NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH,
    );
    const hasDiscreteCredentials =
      Boolean(env.NOTIFICATION_PUSH_FCM_PROJECT_ID) &&
      Boolean(env.NOTIFICATION_PUSH_FCM_CLIENT_EMAIL) &&
      Boolean(env.NOTIFICATION_PUSH_FCM_PRIVATE_KEY);

    if (
      !hasServiceAccountJson &&
      !hasServiceAccountPath &&
      !hasDiscreteCredentials
    ) {
      return helpers.error('any.custom', {
        customMessage:
          'FCM push delivery requires NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH, NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON, or the project/client/private key trio',
      });
    }
  }

  return env;
}

function validateProductionProviders(
  env: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  if (env.NODE_ENV !== 'production') {
    return env;
  }

  if (!env.PAYMENT_SIGNATURE_SECRET || !env.PAYMENT_WEBHOOK_SECRET) {
    return helpers.error('any.custom', {
      customMessage:
        'PAYMENT_SIGNATURE_SECRET and PAYMENT_WEBHOOK_SECRET are required in production',
    });
  }

  if (!env.APP_WEB_URL && !env.FRONTEND_URL) {
    return helpers.error('any.custom', {
      customMessage: 'APP_WEB_URL or FRONTEND_URL is required in production',
    });
  }

  const requiredInfrastructure: Array<[string, unknown, unknown]> = [
    ['DB_DRIVER', env.DB_DRIVER, 'mongo'],
    ['STORAGE_DRIVER', env.STORAGE_DRIVER, 's3'],
    ['MONITORING_ENABLED', env.MONITORING_ENABLED, true],
    ['MONITORING_PROVIDER', env.MONITORING_PROVIDER, 'sentry'],
  ];
  const invalidInfrastructure = requiredInfrastructure.find(
    ([, actual, expected]) => actual !== expected,
  );
  if (invalidInfrastructure) {
    const [name, , expected] = invalidInfrastructure;
    return helpers.error('any.custom', {
      customMessage: `Production requires ${name}=${String(expected)}`,
    });
  }

  if (!env.SENTRY_DSN) {
    return helpers.error('any.custom', {
      customMessage: 'SENTRY_DSN is required in production',
    });
  }

  if (env.NOTIFICATION_QUEUE_ENABLED === true && env.CACHE_DRIVER !== 'redis') {
    return helpers.error('any.custom', {
      customMessage:
        'Notification queue requires CACHE_DRIVER=redis because BullMQ uses Redis',
    });
  }

  if (
    !env.JWT_REFRESH_SECRET ||
    env.JWT_REFRESH_SECRET === env.JWT_SECRET ||
    env.JWT_REFRESH_AUDIENCE === env.JWT_AUDIENCE
  ) {
    return helpers.error('any.custom', {
      customMessage:
        'Production requires distinct JWT refresh signing key and audience',
    });
  }

  if (
    env.PAYMENT_MOBILE_STORE_VERIFICATION_MODE !== 'strict' ||
    env.PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED !== true
  ) {
    return helpers.error('any.custom', {
      customMessage:
        'Production requires strict mobile-store receipt verification',
    });
  }

  if (!env.GOOGLE_PLAY_PACKAGE_NAME || !env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON) {
    return helpers.error('any.custom', {
      customMessage:
        'GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_PLAY_SERVICE_ACCOUNT_JSON are required when strict mobile-store verification is enabled in production',
    });
  }

  return env;
}

function validateAuthProviderConfig(
  env: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  if (env.AUTH_SOCIAL_GOOGLE_ENABLED && !env.GOOGLE_CLIENT_ID) {
    return helpers.error('any.custom', {
      customMessage:
        'GOOGLE_CLIENT_ID is required when AUTH_SOCIAL_GOOGLE_ENABLED=true',
    });
  }

  if (env.AUTH_SOCIAL_FACEBOOK_ENABLED && !env.FACEBOOK_CLIENT_ID) {
    return helpers.error('any.custom', {
      customMessage:
        'FACEBOOK_CLIENT_ID is required when AUTH_SOCIAL_FACEBOOK_ENABLED=true',
    });
  }

  if (env.AUTH_SOCIAL_APPLE_ENABLED && !env.APPLE_CLIENT_ID) {
    return helpers.error('any.custom', {
      customMessage:
        'APPLE_CLIENT_ID is required when AUTH_SOCIAL_APPLE_ENABLED=true',
    });
  }

  return env;
}

function validateMongoPoolConfig(
  env: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  const minPoolSize = Number(env.MONGO_MIN_POOL_SIZE);
  const maxPoolSize = Number(env.MONGO_MAX_POOL_SIZE);

  if (minPoolSize > maxPoolSize) {
    return helpers.error('any.custom', {
      customMessage:
        'MONGO_MIN_POOL_SIZE cannot be greater than MONGO_MAX_POOL_SIZE',
    });
  }

  return env;
}

function validateMentoraMongoDatabase(
  env: Record<string, unknown>,
  helpers: Joi.CustomHelpers,
) {
  if (env.DB_DRIVER !== 'mongo' || typeof env.MONGO_URI !== 'string') {
    return env;
  }

  const uri = env.MONGO_URI.trim();
  const dbName = uri
    .replace(/^mongodb(\+srv)?:\/\//, '')
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .at(-1);

  if (!dbName) {
    return helpers.error('any.custom', {
      customMessage:
        'MONGO_URI must include an explicit Mentora database name, for example /mentora.',
    });
  }

  if (/match[-_]?mate/i.test(dbName)) {
    return helpers.error('any.custom', {
      customMessage:
        'MONGO_URI database name must be Mentora-specific and must not reuse legacy app databases.',
    });
  }

  return env;
}

export const ENV_VALIDATION_SCHEMA = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),

  HOST: optionalHost,

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  SHUTDOWN_DRAIN_MS: Joi.number().integer().min(0).max(30000).default(5000),

  TRUST_PROXY_HOPS: Joi.number().integer().min(0).max(10).default(0),

  ALLOWED_ORIGINS: Joi.string()
    .trim()
    .default('*')
    .custom(validateAllowedOrigins),

  CORS_MAX_AGE_SECONDS: Joi.number().integer().min(0).max(86400).default(86400),

  API_PREFIX: Joi.string()
    .trim()
    .pattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i)
    .default('api'),

  API_VERSION: Joi.string()
    .trim()
    .pattern(/^v\d+$/i)
    .default('v1'),

  API_BASE_URL: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string()
      .trim()
      .uri({ scheme: ['https'] })
      .required(),
    otherwise: Joi.string()
      .trim()
      .uri({ scheme: ['http', 'https'] })
      .default('http://localhost:3000'),
  }),

  APP_WEB_URL: optionalUri,

  FRONTEND_URL: optionalUri,

  COOKIE_DOMAIN: optionalString,

  GOOGLE_CLIENT_ID: optionalString,

  GOOGLE_CLIENT_SECRET: optionalString,

  GOOGLE_CALLBACK_URL: optionalString.default('/api/v1/auth/google/callback'),

  FACEBOOK_CLIENT_ID: optionalString,

  FACEBOOK_CLIENT_SECRET: optionalString,

  APPLE_CLIENT_ID: optionalString,

  APPLE_TEAM_ID: optionalString,

  APPLE_KEY_ID: optionalString,

  APPLE_PRIVATE_KEY: optionalString,

  AUTH_EMAIL_PASSWORD_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  AUTH_PHONE_OTP_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_REVIEW_PHONE_OTP_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_REVIEW_PHONE_COUNTRY_CODE: Joi.string()
    .pattern(/^\d{1,4}$/)
    .when('AUTH_REVIEW_PHONE_OTP_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),

  AUTH_REVIEW_PHONE: Joi.string()
    .pattern(/^\d{8,15}$/)
    .when('AUTH_REVIEW_PHONE_OTP_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),

  AUTH_REVIEW_PHONE_OTP: Joi.string()
    .pattern(/^\d{6}$/)
    .when('AUTH_REVIEW_PHONE_OTP_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),

  AUTH_SOCIAL_GOOGLE_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_SOCIAL_FACEBOOK_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_SOCIAL_APPLE_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_MAGIC_LINK_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  AUTH_MAX_CONCURRENT_SESSIONS: Joi.number()
    .integer()
    .min(1)
    .max(25)
    .default(5),

  AUTH_SUSPICIOUS_LOGIN_DETECTION_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  DB_DRIVER: Joi.string().trim().valid('mongo', 'local').required(),

  MONGO_URI: Joi.when('DB_DRIVER', {
    is: 'mongo',
    then: mongoUriSchema.required(),
    otherwise: mongoUriSchema.empty('').optional(),
  }),

  MONGO_RETRY_ATTEMPTS: Joi.number().integer().min(0).max(20).default(5),

  MONGO_RETRY_DELAY: Joi.number().integer().min(0).max(60000).default(5000),

  MONGO_MAX_POOL_SIZE: Joi.number().integer().min(1).max(500).default(50),

  MONGO_MIN_POOL_SIZE: Joi.number().integer().min(0).max(100).default(0),

  MONGO_SERVER_SELECTION_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(10000),

  MONGO_SOCKET_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(300000)
    .default(45000),

  MONGO_MAX_IDLE_TIME_MS: Joi.number()
    .integer()
    .min(0)
    .max(300000)
    .default(30000),

  MONGO_WAIT_QUEUE_TIMEOUT_MS: Joi.number()
    .integer()
    .min(0)
    .max(60000)
    .default(10000),

  MONGO_SLOW_QUERY_THRESHOLD_MS: Joi.number()
    .integer()
    .min(0)
    .max(60000)
    .default(200),

  MONGO_AUTO_INDEX: Joi.boolean(),

  SEEDER_CONFIRM: optionalString,

  CACHE_DRIVER: Joi.string().trim().valid('redis', 'local').default('local'),

  REDIS_HOST: optionalHost.when('CACHE_DRIVER', {
    is: 'redis',
    then: hostSchema.required(),
  }),

  REDIS_PORT: Joi.number().integer().min(1).max(65535).default(6379),

  REDIS_PASS: optionalString,

  REDIS_DB: Joi.number().integer().min(0).max(15).default(0),

  STORAGE_DRIVER: Joi.string().trim().valid('local', 's3').default('local'),

  AWS_REGION: awsRegionSchema.empty('').when('STORAGE_DRIVER', {
    is: 's3',
    then: awsRegionSchema.required(),
    otherwise: awsRegionSchema.optional(),
  }),

  AWS_ACCESS_KEY_ID: optionalString.when('STORAGE_DRIVER', {
    is: 's3',
    then: optionalAwsCredential.optional(),
  }),

  AWS_SECRET_ACCESS_KEY: optionalString.when('STORAGE_DRIVER', {
    is: 's3',
    then: optionalAwsCredential.optional(),
  }),

  AWS_S3_BUCKET: s3BucketSchema.empty('').when('STORAGE_DRIVER', {
    is: 's3',
    then: s3BucketSchema.required(),
    otherwise: s3BucketSchema.optional(),
  }),

  AWS_S3_BASE_URL: optionalUri.when('STORAGE_DRIVER', {
    is: 's3',
    then: Joi.string()
      .trim()
      .uri({ scheme: ['https'] })
      .required(),
  }),

  MEDIA_AI_MODERATION_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  MEDIA_FFMPEG_PATH: optionalString,

  MEDIA_MAX_IMAGE_BYTES: Joi.number()
    .integer()
    .min(1_048_576)
    .max(52_428_800)
    .default(10_485_760),

  MEDIA_MAX_VIDEO_BYTES: Joi.number()
    .integer()
    .min(5_242_880)
    .max(524_288_000)
    .default(104_857_600),

  MEDIA_DELETED_CLEANUP_RETENTION_DAYS: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .default(7),

  MEDIA_DELETED_CLEANUP_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(500)
    .default(100),

  PROFILE_INACTIVE_ARCHIVE_DAYS: Joi.number()
    .integer()
    .min(0)
    .max(3650)
    .default(180),

  PROFILE_INACTIVE_ARCHIVE_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(5000)
    .default(500),

  LEARNING_SESSION_REMINDER_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  LEARNING_SESSION_REMINDER_DRY_RUN: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  LEARNING_SESSION_REMINDER_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(5000)
    .default(500),

  LEARNING_ENTITLEMENT_AUDIT_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  LEARNING_ENTITLEMENT_AUDIT_LIMIT: Joi.number()
    .integer()
    .min(1)
    .max(5000)
    .default(500),

  MONITORING_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  MONITORING_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'sentry')
    .default('log'),

  SENTRY_DSN: optionalString.when('MONITORING_PROVIDER', {
    is: 'sentry',
    then: envString.required(),
  }),

  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0),

  JWT_SECRET: Joi.string().trim().min(32).max(512).required(),

  JWT_REFRESH_SECRET: Joi.string().trim().min(32).max(512),

  JWT_ACCESS_EXPIRES_IN: optionalDuration.default('15m'),

  JWT_REFRESH_EXPIRES_IN: optionalDuration.default('7d'),

  JWT_AUDIENCE: optionalString.default('user'),

  JWT_REFRESH_AUDIENCE: optionalString.default('user-refresh'),

  JWT_ISSUER: optionalString.default('mentora-api'),

  PAYMENT_GST_PERCENTAGE: Joi.number().min(0).max(100).default(0),

  PAYMENT_SIGNATURE_SECRET: optionalString,

  PAYMENT_WEBHOOK_SECRET: optionalString,

  PAYMENT_ALLOW_UNSIGNED_VERIFICATION: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  PAYMENT_MOBILE_STORE_VERIFICATION_MODE: Joi.string()
    .trim()
    .valid('disabled', 'sandbox', 'strict')
    .default('sandbox'),

  PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  GOOGLE_PLAY_PACKAGE_NAME: optionalString,

  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: optionalString,

  GOOGLE_PLAY_RTDN_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),

  GOOGLE_PLAY_RTDN_AUDIENCE: Joi.when('GOOGLE_PLAY_RTDN_ENABLED', {
    is: true,
    then: Joi.string()
      .trim()
      .uri({ scheme: ['https'] })
      .required(),
    otherwise: optionalString,
  }),

  GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL: Joi.when('GOOGLE_PLAY_RTDN_ENABLED', {
    is: true,
    then: optionalEmail.required(),
    otherwise: optionalEmail,
  }),

  THROTTLE_TTL: Joi.number().integer().min(1).max(86400).default(60),

  THROTTLE_LIMIT: Joi.number().integer().min(1).max(10000).default(100),

  INTERNAL_API_KEYS: optionalString,

  NOTIFICATION_QUEUE_ENABLED: Joi.boolean().empty('').optional(),

  NOTIFICATION_QUEUE_NAME: optionalString.default('notification-dispatch'),

  NOTIFICATION_DLQ_NAME: optionalString.default('notification-dispatch-dlq'),

  NOTIFICATION_QUEUE_CONCURRENCY: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(5),

  NOTIFICATION_QUEUE_ATTEMPTS: Joi.number().integer().min(1).max(20).default(5),

  NOTIFICATION_QUEUE_BACKOFF_MS: Joi.number()
    .integer()
    .min(0)
    .max(300000)
    .default(3000),

  NOTIFICATION_EMAIL_ENABLED: Joi.boolean().default(false),

  NOTIFICATION_EMAIL_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'ses', 'smtp')
    .default('log'),

  NOTIFICATION_EMAIL_FROM: optionalEmail,

  NOTIFICATION_EMAIL_API_KEY: optionalString,

  NOTIFICATION_EMAIL_SES_REGION: awsRegionSchema.empty('').optional(),

  NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID: optionalString,

  NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY: optionalString,

  NOTIFICATION_EMAIL_SES_CONFIGURATION_SET: optionalString,

  NOTIFICATION_EMAIL_SMTP_DSN: optionalSmtpUri,

  NOTIFICATION_EMAIL_SMTP_HOST: optionalHost,

  NOTIFICATION_EMAIL_SMTP_PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(587),

  NOTIFICATION_EMAIL_SMTP_USERNAME: optionalString,

  NOTIFICATION_EMAIL_SMTP_PASSWORD: optionalString,

  NOTIFICATION_EMAIL_SMTP_SECURE: Joi.boolean().default(false),

  NOTIFICATION_EMAIL_SMTP_REQUIRE_TLS: Joi.boolean().default(true),

  NOTIFICATION_EMAIL_SMTP_REJECT_UNAUTHORIZED: Joi.boolean().default(true),

  NOTIFICATION_EMAIL_SMTP_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(15000),

  NOTIFICATION_SMS_ENABLED: Joi.boolean().default(false),

  NOTIFICATION_SMS_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'msg91')
    .default('log'),

  NOTIFICATION_SMS_MSG91_AUTH_KEY: optionalString,

  NOTIFICATION_SMS_MSG91_TEMPLATE_ID: optionalString,

  NOTIFICATION_SMS_MSG91_OTP_TEMPLATE_ID: optionalString,

  NOTIFICATION_SMS_MSG91_BASE_URL: optionalUri.default(
    'https://control.msg91.com',
  ),

  NOTIFICATION_SMS_MSG91_TIMEOUT_MS: Joi.number()
    .integer()
    .min(1000)
    .max(60000)
    .default(10000),

  NOTIFICATION_PUSH_ENABLED: Joi.boolean().default(false),

  NOTIFICATION_PUSH_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'fcm')
    .default('log'),

  NOTIFICATION_PUSH_SERVER_KEY: optionalString,

  NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON: optionalString,

  NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH: optionalString,

  NOTIFICATION_PUSH_FCM_PROJECT_ID: optionalString,

  NOTIFICATION_PUSH_FCM_CLIENT_EMAIL: optionalEmail,

  NOTIFICATION_PUSH_FCM_PRIVATE_KEY: optionalString,

  CHAT_PROFANITY_FILTER_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  CHAT_PROFANITY_BLOCKED_WORDS: optionalString,

  CHAT_MODERATION_REVIEW_WORDS: optionalString,
})
  .custom(validateMongoPoolConfig)
  .custom(validateMentoraMongoDatabase)
  .custom(validateAuthProviderConfig)
  .custom(validateNotificationProviders)
  .custom(validateProductionProviders)
  .and('AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY')
  .prefs({ abortEarly: false, convert: true })
  .messages({
    'any.custom': '{{#customMessage}}',
  });
