export default () => ({
  payments: {
    gstPercentage: Number(process.env.PAYMENT_GST_PERCENTAGE || '0'),
    signatureSecret: process.env.PAYMENT_SIGNATURE_SECRET || '',
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
});