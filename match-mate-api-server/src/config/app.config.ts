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
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },
});
