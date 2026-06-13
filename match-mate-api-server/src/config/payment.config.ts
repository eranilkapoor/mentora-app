export default () => ({
  payments: {
    gstPercentage: Number(process.env.PAYMENT_GST_PERCENTAGE || '0'),
    signatureSecret: process.env.PAYMENT_SIGNATURE_SECRET || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
    mobileStoreVerificationMode:
      process.env.PAYMENT_MOBILE_STORE_VERIFICATION_MODE || 'sandbox',
    mobileStoreStrictVerificationEnabled:
      process.env.PAYMENT_MOBILE_STORE_STRICT_VERIFICATION_ENABLED === 'true',
    allowUnsignedVerification:
      process.env.PAYMENT_ALLOW_UNSIGNED_VERIFICATION !== 'false' &&
      process.env.NODE_ENV !== 'production',
  },
});
