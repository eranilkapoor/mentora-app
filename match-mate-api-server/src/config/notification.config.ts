export default () => ({
  notification: {
    seedDefaults: process.env.NOTIFICATION_SEED_DEFAULTS !== 'false',
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
      enabled: process.env.NOTIFICATION_EMAIL_ENABLED === 'true',
      provider: process.env.NOTIFICATION_EMAIL_PROVIDER || 'log',
      from: process.env.NOTIFICATION_EMAIL_FROM || '',
      apiKey: process.env.NOTIFICATION_EMAIL_API_KEY || '',
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
    },
    sms: {
      enabled: process.env.NOTIFICATION_SMS_ENABLED === 'true',
      provider: process.env.NOTIFICATION_SMS_PROVIDER || 'log',
      senderId: process.env.NOTIFICATION_SMS_SENDER_ID || '',
      apiKey: process.env.NOTIFICATION_SMS_API_KEY || '',
      twilio: {
        accountSid: process.env.NOTIFICATION_SMS_TWILIO_ACCOUNT_SID || '',
        authToken: process.env.NOTIFICATION_SMS_TWILIO_AUTH_TOKEN || '',
        from:
          process.env.NOTIFICATION_SMS_TWILIO_FROM ||
          process.env.NOTIFICATION_SMS_SENDER_ID ||
          '',
      },
    },
    push: {
      enabled: process.env.NOTIFICATION_PUSH_ENABLED === 'true',
      provider: process.env.NOTIFICATION_PUSH_PROVIDER || 'log',
      serverKey: process.env.NOTIFICATION_PUSH_SERVER_KEY || '',
      fcm: {
        serviceAccountJson:
          process.env.NOTIFICATION_PUSH_FCM_SERVICE_ACCOUNT_JSON || '',
        projectId: process.env.NOTIFICATION_PUSH_FCM_PROJECT_ID || '',
        clientEmail: process.env.NOTIFICATION_PUSH_FCM_CLIENT_EMAIL || '',
        privateKey: process.env.NOTIFICATION_PUSH_FCM_PRIVATE_KEY || '',
      },
    },
  },
});
