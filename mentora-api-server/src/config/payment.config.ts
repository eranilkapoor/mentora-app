const isProduction = process.env.NODE_ENV === 'production';
const demoMode =
  process.env.INTEGRATION_DEMO_MODE !== undefined
    ? process.env.INTEGRATION_DEMO_MODE === 'true'
    : !isProduction;

export default () => ({
  payments: {
    gstPercentage: Number(process.env.PAYMENT_GST_PERCENTAGE || '0'),
    signatureSecret:
      process.env.PAYMENT_SIGNATURE_SECRET ||
      (demoMode ? 'demo-payment-signature-secret' : ''),
    webhookSecret:
      process.env.PAYMENT_WEBHOOK_SECRET ||
      (demoMode ? 'demo-payment-webhook-secret' : ''),
    razorpay: {
      keyId:
        process.env.RAZORPAY_KEY_ID ||
        (demoMode ? 'rzp_test_mentora_demo' : ''),
      keySecret:
        process.env.RAZORPAY_KEY_SECRET ||
        (demoMode ? 'demo-razorpay-key-secret' : ''),
    },
    stripe: {
      publishableKey:
        process.env.STRIPE_PUBLISHABLE_KEY ||
        (demoMode ? 'pk_test_mentora_demo' : ''),
      secretKey:
        process.env.STRIPE_SECRET_KEY ||
        (demoMode ? 'sk_test_mentora_demo' : ''),
      webhookSecret:
        process.env.STRIPE_WEBHOOK_SECRET ||
        (demoMode ? 'whsec_mentora_demo' : ''),
    },
    mobileStoreVerificationMode:
      process.env.PAYMENT_MOBILE_STORE_VERIFICATION_MODE || 'sandbox',
    mobileStoreStrictVerificationEnabled:
      process.env.PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED === 'true',
    allowUnsignedVerification:
      process.env.PAYMENT_ALLOW_UNSIGNED_VERIFICATION !== 'false' &&
      process.env.NODE_ENV !== 'production',
    googlePlay: {
      packageName: process.env.GOOGLE_PLAY_PACKAGE_NAME || '',
      serviceAccountJson: process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || '',
      rtdn: {
        enabled: process.env.GOOGLE_PLAY_RTDN_ENABLED === 'true',
        audience: process.env.GOOGLE_PLAY_RTDN_AUDIENCE || '',
        serviceAccountEmail:
          process.env.GOOGLE_PLAY_RTDN_SERVICE_ACCOUNT_EMAIL || '',
      },
    },
    apple: {
      issuerId: process.env.APPLE_STORE_ISSUER_ID || '',
      keyId: process.env.APPLE_STORE_KEY_ID || '',
      bundleId: process.env.APPLE_STORE_BUNDLE_ID || '',
      privateKey: process.env.APPLE_STORE_PRIVATE_KEY || '',
      environment: process.env.APPLE_STORE_ENVIRONMENT || 'production',
    },
  },
});
