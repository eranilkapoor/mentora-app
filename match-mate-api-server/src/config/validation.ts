import * as Joi from 'joi';

const envString = Joi.string().trim();
const optionalString = envString.empty('');
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
    env.NOTIFICATION_SMS_ENABLED &&
    env.NOTIFICATION_SMS_PROVIDER === 'twilio'
  ) {
    if (!env.NOTIFICATION_SMS_TWILIO_ACCOUNT_SID) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_SMS_TWILIO_ACCOUNT_SID is required when NOTIFICATION_SMS_PROVIDER=twilio',
      });
    }

    if (!env.NOTIFICATION_SMS_TWILIO_AUTH_TOKEN) {
      return helpers.error('any.custom', {
        customMessage:
          'NOTIFICATION_SMS_TWILIO_AUTH_TOKEN is required when NOTIFICATION_SMS_PROVIDER=twilio',
      });
    }

    if (!env.NOTIFICATION_SMS_TWILIO_FROM && !env.NOTIFICATION_SMS_SENDER_ID) {
      return helpers.error('any.custom', {
        customMessage:
          'Either NOTIFICATION_SMS_TWILIO_FROM or NOTIFICATION_SMS_SENDER_ID is required when NOTIFICATION_SMS_PROVIDER=twilio',
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
    const hasDiscreteCredentials =
      Boolean(env.NOTIFICATION_PUSH_FCM_PROJECT_ID) &&
      Boolean(env.NOTIFICATION_PUSH_FCM_CLIENT_EMAIL) &&
      Boolean(env.NOTIFICATION_PUSH_FCM_PRIVATE_KEY);

    if (!hasServiceAccountJson && !hasDiscreteCredentials) {
      return helpers.error('any.custom', {
        customMessage:
          'FCM push delivery requires NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON or the project/client/private key trio',
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

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),

  HOST: optionalHost,

  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  SHUTDOWN_DRAIN_MS: Joi.number().integer().min(0).max(30000).default(5000),

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

  SEEDER_CONFIRM: optionalString,

  CACHE_DRIVER: Joi.string().trim().valid('redis', 'local').default('local'),

  REDIS_HOST: optionalHost
    .when('CACHE_DRIVER', { is: 'redis', then: hostSchema.required() })
    .when('NOTIFICATION_QUEUE_ENABLED', {
      is: true,
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
    then: envString.required(),
  }),

  AWS_SECRET_ACCESS_KEY: optionalString.when('STORAGE_DRIVER', {
    is: 's3',
    then: envString.required(),
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

  JWT_SECRET: Joi.string().trim().min(32).max(512).required(),

  JWT_ACCESS_EXPIRES_IN: optionalDuration.default('15m'),

  JWT_REFRESH_EXPIRES_IN: optionalDuration.default('7d'),

  JWT_AUDIENCE: optionalString.default('user'),

  JWT_ISSUER: optionalString.default('matchmate-api'),

  PAYMENT_GST_PERCENTAGE: Joi.number().min(0).max(100).default(0),

  PAYMENT_SIGNATURE_SECRET: optionalString,

  PAYMENT_WEBHOOK_SECRET: optionalString,

  THROTTLE_TTL: Joi.number().integer().min(1).max(86400).default(60),

  THROTTLE_LIMIT: Joi.number().integer().min(1).max(10000).default(100),

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
    .valid('log', 'ses')
    .default('log'),

  NOTIFICATION_EMAIL_FROM: optionalEmail,

  NOTIFICATION_EMAIL_API_KEY: optionalString,

  NOTIFICATION_EMAIL_SES_REGION: awsRegionSchema.empty('').optional(),

  NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID: optionalString,

  NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY: optionalString,

  NOTIFICATION_EMAIL_SES_CONFIGURATION_SET: optionalString,

  NOTIFICATION_SMS_ENABLED: Joi.boolean().default(false),

  NOTIFICATION_SMS_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'twilio')
    .default('log'),

  NOTIFICATION_SMS_SENDER_ID: optionalString,

  NOTIFICATION_SMS_API_KEY: optionalString,

  NOTIFICATION_SMS_TWILIO_ACCOUNT_SID: optionalString,

  NOTIFICATION_SMS_TWILIO_AUTH_TOKEN: optionalString,

  NOTIFICATION_SMS_TWILIO_FROM: optionalString,

  NOTIFICATION_PUSH_ENABLED: Joi.boolean().default(false),

  NOTIFICATION_PUSH_PROVIDER: Joi.string()
    .trim()
    .valid('log', 'fcm')
    .default('log'),

  NOTIFICATION_PUSH_SERVER_KEY: optionalString,

  NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON: optionalString,

  NOTIFICATION_PUSH_FCM_PROJECT_ID: optionalString,

  NOTIFICATION_PUSH_FCM_CLIENT_EMAIL: optionalEmail,

  NOTIFICATION_PUSH_FCM_PRIVATE_KEY: optionalString,

  CHAT_PROFANITY_FILTER_ENABLED: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(true),

  CHAT_PROFANITY_BLOCKED_WORDS: optionalString,
})
  .custom(validateAuthProviderConfig)
  .custom(validateNotificationProviders)
  .custom(validateProductionProviders)
  .prefs({ abortEarly: false, convert: true })
  .messages({
    'any.custom': '{{#customMessage}}',
  });
