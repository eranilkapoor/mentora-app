const bool = (value: string | undefined) => value === 'true';
const isProduction = process.env.NODE_ENV === 'production';
const demoMode =
  process.env.INTEGRATION_DEMO_MODE !== undefined
    ? bool(process.env.INTEGRATION_DEMO_MODE)
    : !isProduction;
const demo = (value: string | undefined, fallback: string) =>
  value || (demoMode ? fallback : '');

export default () => ({
  integrations: {
    demoMode,
    ai: {
      enabled: bool(process.env.AI_PROVIDER_ENABLED) || demoMode,
      provider: process.env.AI_PROVIDER || 'openai',
      apiKey:
        process.env.AI_PROVIDER_API_KEY ||
        process.env.OPENAI_API_KEY ||
        (demoMode ? 'demo-openai-api-key' : ''),
      baseUrl: process.env.AI_PROVIDER_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.AI_PROVIDER_MODEL || 'gpt-4o-mini',
    },
    calendar: {
      enabled: bool(process.env.CALENDAR_SYNC_ENABLED) || demoMode,
      googleClientId: demo(
        process.env.GOOGLE_CALENDAR_CLIENT_ID,
        'demo-google-calendar-client-id',
      ),
      googleClientSecret: demo(
        process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
        'demo-google-calendar-client-secret',
      ),
      microsoftClientId: demo(
        process.env.MICROSOFT_CALENDAR_CLIENT_ID,
        'demo-microsoft-calendar-client-id',
      ),
      microsoftClientSecret: demo(
        process.env.MICROSOFT_CALENDAR_CLIENT_SECRET,
        'demo-microsoft-calendar-client-secret',
      ),
    },
    dialer: {
      enabled: bool(process.env.DIALER_PROVIDER_ENABLED) || demoMode,
      provider: process.env.DIALER_PROVIDER || 'demo_dialer',
      apiKey: demo(process.env.DIALER_PROVIDER_API_KEY, 'demo-dialer-api-key'),
      baseUrl:
        process.env.DIALER_PROVIDER_BASE_URL ||
        'https://sandbox-dialer.mentora.test',
      webhookSecret: demo(
        process.env.DIALER_WEBHOOK_SECRET,
        'demo-dialer-webhook-secret',
      ),
    },
    geo: {
      enabled: bool(process.env.GEO_TELEMETRY_ENABLED) || demoMode,
      provider: process.env.GEO_TELEMETRY_PROVIDER || 'google_maps',
      apiKey: demo(process.env.GEO_TELEMETRY_API_KEY, 'demo-geo-api-key'),
    },
    ocr: {
      enabled: bool(process.env.OCR_PROVIDER_ENABLED) || demoMode,
      provider: process.env.OCR_PROVIDER || 'demo_ocr',
      apiKey: demo(process.env.OCR_PROVIDER_API_KEY, 'demo-ocr-api-key'),
      baseUrl:
        process.env.OCR_PROVIDER_BASE_URL || 'https://sandbox-ocr.mentora.test',
    },
    sso: {
      googleEnabled: bool(process.env.AUTH_SOCIAL_GOOGLE_ENABLED) || demoMode,
      googleClientId: demo(
        process.env.GOOGLE_CLIENT_ID,
        'demo-google-oauth-client-id',
      ),
      googleClientSecret: demo(
        process.env.GOOGLE_CLIENT_SECRET,
        'demo-google-oauth-client-secret',
      ),
      microsoftEnabled: bool(process.env.AUTH_MICROSOFT_ENABLED) || demoMode,
      microsoftClientId: demo(
        process.env.MICROSOFT_CLIENT_ID,
        'demo-microsoft-oauth-client-id',
      ),
      microsoftClientSecret: demo(
        process.env.MICROSOFT_CLIENT_SECRET,
        'demo-microsoft-oauth-client-secret',
      ),
      samlEnabled: bool(process.env.AUTH_SAML_ENABLED),
      samlMetadataUrl: process.env.AUTH_SAML_METADATA_URL || '',
    },
    whatsapp: {
      enabled: bool(process.env.WHATSAPP_PROVIDER_ENABLED) || demoMode,
      provider: process.env.WHATSAPP_PROVIDER || 'meta',
      accessToken: demo(
        process.env.WHATSAPP_ACCESS_TOKEN,
        'demo-whatsapp-access-token',
      ),
      phoneNumberId: demo(
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        'demo-whatsapp-phone-number-id',
      ),
      businessAccountId: demo(
        process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        'demo-whatsapp-business-account-id',
      ),
      webhookVerifyToken: demo(
        process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
        'demo-whatsapp-webhook-verify-token',
      ),
      appSecret: demo(
        process.env.WHATSAPP_APP_SECRET,
        'demo-whatsapp-app-secret',
      ),
    },
    webinar: {
      enabled: bool(process.env.WEBINAR_PROVIDER_ENABLED) || demoMode,
      provider: process.env.WEBINAR_PROVIDER || 'demo_webinar',
      apiKey: demo(
        process.env.WEBINAR_PROVIDER_API_KEY,
        'demo-webinar-api-key',
      ),
      baseUrl:
        process.env.WEBINAR_PROVIDER_BASE_URL ||
        'https://sandbox-webinar.mentora.test',
    },
    accounting: {
      enabled: bool(process.env.ACCOUNTING_EXPORT_ENABLED) || demoMode,
      provider: process.env.ACCOUNTING_EXPORT_PROVIDER || 'demo_accounting',
      apiKey: demo(
        process.env.ACCOUNTING_EXPORT_API_KEY,
        'demo-accounting-api-key',
      ),
      baseUrl:
        process.env.ACCOUNTING_EXPORT_BASE_URL ||
        'https://sandbox-accounting.mentora.test',
    },
  },
});
