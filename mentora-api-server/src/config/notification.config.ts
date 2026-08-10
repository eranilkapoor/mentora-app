const isProduction = process.env.NODE_ENV === 'production';
const demoMode =
  process.env.INTEGRATION_DEMO_MODE !== undefined
    ? process.env.INTEGRATION_DEMO_MODE === 'true'
    : !isProduction;

export default () => ({
  notification: {
    queue: {
      enabled:
        process.env.NOTIFICATION_QUEUE_ENABLED !== undefined
          ? process.env.NOTIFICATION_QUEUE_ENABLED === 'true'
          : process.env.CACHE_DRIVER === 'redis',
      name: process.env.NOTIFICATION_QUEUE_NAME || 'notification-dispatch',
      dlqName: process.env.NOTIFICATION_DLQ_NAME || 'notification-dispatch-dlq',
      concurrency: Number(process.env.NOTIFICATION_QUEUE_CONCURRENCY || '5'),
      attempts: Number(process.env.NOTIFICATION_QUEUE_ATTEMPTS || '5'),
      backoffMs: Number(process.env.NOTIFICATION_QUEUE_BACKOFF_MS || '3000'),
    },
    email: {
      enabled: process.env.NOTIFICATION_EMAIL_ENABLED === 'true' || demoMode,
      provider: process.env.NOTIFICATION_EMAIL_PROVIDER || 'log',
      from: process.env.NOTIFICATION_EMAIL_FROM || 'support@mentora.test',
      deliveryCallbackUrl:
        process.env.NOTIFICATION_EMAIL_DELIVERY_CALLBACK_URL ||
        'https://sandbox-notifications.mentora.test/email/callback',
      deliveryCallbackSecret:
        process.env.NOTIFICATION_EMAIL_DELIVERY_CALLBACK_SECRET ||
        (demoMode ? 'demo-email-callback-secret' : ''),
      apiKey:
        process.env.NOTIFICATION_EMAIL_API_KEY ||
        (demoMode ? 'demo-email-api-key' : ''),
      ses: {
        region:
          process.env.NOTIFICATION_EMAIL_SES_REGION ||
          process.env.AWS_REGION ||
          'us-east-1',
        accessKeyId:
          process.env.NOTIFICATION_EMAIL_SES_ACCESS_KEY_ID ||
          process.env.AWS_ACCESS_KEY_ID ||
          '',
        secretAccessKey:
          process.env.NOTIFICATION_EMAIL_SES_SECRET_ACCESS_KEY ||
          process.env.AWS_SECRET_ACCESS_KEY ||
          '',
        configurationSet:
          process.env.NOTIFICATION_EMAIL_SES_CONFIGURATION_SET || '',
      },
      smtp: {
        dsn: process.env.NOTIFICATION_EMAIL_SMTP_DSN || '',
        host: process.env.NOTIFICATION_EMAIL_SMTP_HOST || '',
        port: Number(process.env.NOTIFICATION_EMAIL_SMTP_PORT || '587'),
        username: process.env.NOTIFICATION_EMAIL_SMTP_USERNAME || '',
        password: process.env.NOTIFICATION_EMAIL_SMTP_PASSWORD || '',
        secure: process.env.NOTIFICATION_EMAIL_SMTP_SECURE === 'true',
        requireTls: process.env.NOTIFICATION_EMAIL_SMTP_REQUIRE_TLS !== 'false',
        rejectUnauthorized:
          process.env.NOTIFICATION_EMAIL_SMTP_REJECT_UNAUTHORIZED !== 'false',
        timeoutMs: Number(
          process.env.NOTIFICATION_EMAIL_SMTP_TIMEOUT_MS || '15000',
        ),
      },
    },
    sms: {
      enabled: process.env.NOTIFICATION_SMS_ENABLED === 'true' || demoMode,
      provider: process.env.NOTIFICATION_SMS_PROVIDER || 'log',
      deliveryCallbackUrl:
        process.env.NOTIFICATION_SMS_DELIVERY_CALLBACK_URL ||
        'https://sandbox-notifications.mentora.test/sms/callback',
      deliveryCallbackSecret:
        process.env.NOTIFICATION_SMS_DELIVERY_CALLBACK_SECRET ||
        (demoMode ? 'demo-sms-callback-secret' : ''),
      msg91: {
        authKey:
          process.env.NOTIFICATION_SMS_MSG91_AUTH_KEY ||
          (demoMode ? 'demo-msg91-auth-key' : ''),
        templateId:
          process.env.NOTIFICATION_SMS_MSG91_TEMPLATE_ID ||
          (demoMode ? 'demo-msg91-template-id' : ''),
        otpTemplateId:
          process.env.NOTIFICATION_SMS_MSG91_OTP_TEMPLATE_ID ||
          process.env.NOTIFICATION_SMS_MSG91_TEMPLATE_ID ||
          '',
        baseUrl:
          process.env.NOTIFICATION_SMS_MSG91_BASE_URL ||
          'https://control.msg91.com',
        timeoutMs: Number(
          process.env.NOTIFICATION_SMS_MSG91_TIMEOUT_MS || '10000',
        ),
      },
    },
    push: {
      enabled: process.env.NOTIFICATION_PUSH_ENABLED === 'true' || demoMode,
      provider: process.env.NOTIFICATION_PUSH_PROVIDER || 'log',
      deliveryCallbackUrl:
        process.env.NOTIFICATION_PUSH_DELIVERY_CALLBACK_URL ||
        'https://sandbox-notifications.mentora.test/push/callback',
      deliveryCallbackSecret:
        process.env.NOTIFICATION_PUSH_DELIVERY_CALLBACK_SECRET ||
        (demoMode ? 'demo-push-callback-secret' : ''),
      serverKey:
        process.env.NOTIFICATION_PUSH_SERVER_KEY ||
        (demoMode ? 'demo-fcm-server-key' : ''),
      fcm: {
        serviceAccountPath:
          process.env.NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_PATH || '',
        serviceAccountJson:
          process.env.NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON || '',
        projectId: process.env.NOTIFICATION_PUSH_FCM_PROJECT_ID || '',
        clientEmail: process.env.NOTIFICATION_PUSH_FCM_CLIENT_EMAIL || '',
        privateKey: process.env.NOTIFICATION_PUSH_FCM_PRIVATE_KEY || '',
      },
    },
  },
});
