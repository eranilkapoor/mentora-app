const bool = (value: string | undefined) => value === 'true';

export default () => ({
  integrations: {
    ai: {
      enabled: bool(process.env.AI_PROVIDER_ENABLED),
      provider: process.env.AI_PROVIDER || 'openai',
      apiKey:
        process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.AI_PROVIDER_BASE_URL || '',
      model: process.env.AI_PROVIDER_MODEL || '',
    },
    calendar: {
      enabled: bool(process.env.CALENDAR_SYNC_ENABLED),
      googleClientId: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
      microsoftClientId: process.env.MICROSOFT_CALENDAR_CLIENT_ID || '',
      microsoftClientSecret: process.env.MICROSOFT_CALENDAR_CLIENT_SECRET || '',
    },
    dialer: {
      enabled: bool(process.env.DIALER_PROVIDER_ENABLED),
      provider: process.env.DIALER_PROVIDER || '',
      apiKey: process.env.DIALER_PROVIDER_API_KEY || '',
      baseUrl: process.env.DIALER_PROVIDER_BASE_URL || '',
      webhookSecret: process.env.DIALER_WEBHOOK_SECRET || '',
    },
    geo: {
      enabled: bool(process.env.GEO_TELEMETRY_ENABLED),
      provider: process.env.GEO_TELEMETRY_PROVIDER || 'google_maps',
      apiKey: process.env.GEO_TELEMETRY_API_KEY || '',
    },
    ocr: {
      enabled: bool(process.env.OCR_PROVIDER_ENABLED),
      provider: process.env.OCR_PROVIDER || '',
      apiKey: process.env.OCR_PROVIDER_API_KEY || '',
      baseUrl: process.env.OCR_PROVIDER_BASE_URL || '',
    },
    sso: {
      googleEnabled: bool(process.env.AUTH_SOCIAL_GOOGLE_ENABLED),
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      microsoftEnabled: bool(process.env.AUTH_MICROSOFT_ENABLED),
      microsoftClientId: process.env.MICROSOFT_CLIENT_ID || '',
      microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      samlEnabled: bool(process.env.AUTH_SAML_ENABLED),
      samlMetadataUrl: process.env.AUTH_SAML_METADATA_URL || '',
    },
    whatsapp: {
      enabled: bool(process.env.WHATSAPP_PROVIDER_ENABLED),
      provider: process.env.WHATSAPP_PROVIDER || 'meta',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      appSecret: process.env.WHATSAPP_APP_SECRET || '',
    },
  },
});
