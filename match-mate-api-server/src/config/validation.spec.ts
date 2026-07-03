import { envValidationSchema } from './validation';

const productionEnv = () => ({
  NODE_ENV: 'production',
  API_BASE_URL: 'https://api.matchmate.example',
  APP_WEB_URL: 'https://matchmate.example',
  ALLOWED_ORIGINS: 'https://matchmate.example',
  DB_DRIVER: 'mongo',
  MONGO_URI: 'mongodb://localhost:27017/matchmate',
  JWT_SECRET: 'a-production-jwt-secret-that-is-long-enough',
  PAYMENT_SIGNATURE_SECRET: 'payment-signature-secret',
  PAYMENT_WEBHOOK_SECRET: 'payment-webhook-secret',
  PAYMENT_MOBILE_STORE_VERIFICATION_MODE: 'strict',
  PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED: true,
  GOOGLE_PLAY_PACKAGE_NAME: 'com.webnza.matchmate',
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: 'encoded-service-account',
});

describe('production environment validation', () => {
  it('accepts fail-closed mobile-store verification', () => {
    expect(envValidationSchema.validate(productionEnv()).error).toBeUndefined();
  });

  it.each([
    {
      PAYMENT_MOBILE_STORE_VERIFICATION_MODE: 'sandbox',
    },
    {
      PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED: false,
    },
  ])('rejects non-strict production store verification: %o', (override) => {
    const { error } = envValidationSchema.validate({
      ...productionEnv(),
      ...override,
    });

    expect(error?.message).toContain(
      'Production requires strict mobile-store receipt verification',
    );
  });

  it('requires Google Play credentials in strict production mode', () => {
    const env = productionEnv();
    delete (env as Partial<typeof env>).GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;

    const { error } = envValidationSchema.validate(env);

    expect(error?.message).toContain(
      'GOOGLE_PLAY_PACKAGE_NAME and GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
    );
  });
});
