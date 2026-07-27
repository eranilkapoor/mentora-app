export default () => ({
  env: process.env.NODE_ENV,
  host: process.env.HOST,
  port: parseInt(process.env.PORT || '3000', 10),
  api: {
    prefix: process.env.API_PREFIX || 'api',
    version: process.env.API_VERSION || 'v1',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },
  app: {
    webUrl:
      process.env.APP_WEB_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000',
    cookieDomain: process.env.COOKIE_DOMAIN || '',
    shutdownDrainMs: parseInt(process.env.SHUTDOWN_DRAIN_MS || '5000', 10),
    trustedProxyHops: parseInt(process.env.TRUST_PROXY_HOPS || '0', 10),
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
      keyId: process.env.APPLE_KEY_ID || '',
      privateKey: process.env.APPLE_PRIVATE_KEY || '',
    },
  },
  authMethods: {
    emailPasswordEnabled: process.env.AUTH_EMAIL_PASSWORD_ENABLED !== 'false',
    phoneOtpEnabled: process.env.AUTH_PHONE_OTP_ENABLED === 'true',
    social: {
      google: process.env.AUTH_SOCIAL_GOOGLE_ENABLED === 'true',
      facebook: process.env.AUTH_SOCIAL_FACEBOOK_ENABLED === 'true',
      apple: process.env.AUTH_SOCIAL_APPLE_ENABLED === 'true',
    },
    magicLinkEnabled: process.env.AUTH_MAGIC_LINK_ENABLED === 'true',
  },
  authSecurity: {
    maxConcurrentSessions: parseInt(
      process.env.AUTH_MAX_CONCURRENT_SESSIONS || '5',
      10,
    ),
    maxConcurrentStudentSessions: parseInt(
      process.env.AUTH_MAX_CONCURRENT_STUDENT_SESSIONS || '1',
      10,
    ),
    maxConcurrentParentSessions: parseInt(
      process.env.AUTH_MAX_CONCURRENT_PARENT_SESSIONS || '3',
      10,
    ),
    suspiciousLoginDetectionEnabled:
      process.env.AUTH_SUSPICIOUS_LOGIN_DETECTION_ENABLED !== 'false',
    reviewPhoneOtp: {
      enabled: process.env.AUTH_REVIEW_PHONE_OTP_ENABLED === 'true',
      countryCode: process.env.AUTH_REVIEW_PHONE_COUNTRY_CODE || '',
      phone: process.env.AUTH_REVIEW_PHONE || '',
      otp: process.env.AUTH_REVIEW_PHONE_OTP || '',
    },
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:8081',
    ],
    maxAgeSeconds: parseInt(process.env.CORS_MAX_AGE_SECONDS || '86400', 10),
  },
  media: {
    aiModerationEnabled: process.env.MEDIA_AI_MODERATION_ENABLED === 'true',
    ffmpegPath: process.env.MEDIA_FFMPEG_PATH || '',
    maxImageBytes: parseInt(
      process.env.MEDIA_MAX_IMAGE_BYTES || String(10 * 1024 * 1024),
      10,
    ),
    maxVideoBytes: parseInt(
      process.env.MEDIA_MAX_VIDEO_BYTES || String(100 * 1024 * 1024),
      10,
    ),
    deletedCleanupRetentionDays: parseInt(
      process.env.MEDIA_DELETED_CLEANUP_RETENTION_DAYS || '7',
      10,
    ),
    deletedCleanupLimit: parseInt(
      process.env.MEDIA_DELETED_CLEANUP_LIMIT || '100',
      10,
    ),
  },
  profiles: {
    inactiveArchiveDays: parseInt(
      process.env.PROFILE_INACTIVE_ARCHIVE_DAYS || '180',
      10,
    ),
    inactiveArchiveLimit: parseInt(
      process.env.PROFILE_INACTIVE_ARCHIVE_LIMIT || '500',
      10,
    ),
  },
  learning: {
    sessionReminderEnabled:
      process.env.LEARNING_SESSION_REMINDER_ENABLED !== 'false',
    sessionReminderDryRun:
      process.env.LEARNING_SESSION_REMINDER_DRY_RUN === 'true',
    sessionReminderLimit: parseInt(
      process.env.LEARNING_SESSION_REMINDER_LIMIT || '500',
      10,
    ),
    entitlementAuditEnabled:
      process.env.LEARNING_ENTITLEMENT_AUDIT_ENABLED !== 'false',
    entitlementAuditLimit: parseInt(
      process.env.LEARNING_ENTITLEMENT_AUDIT_LIMIT || '500',
      10,
    ),
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    provider: process.env.MONITORING_PROVIDER || 'log',
    sentryDsn: process.env.SENTRY_DSN || '',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || '0'),
  },
});
