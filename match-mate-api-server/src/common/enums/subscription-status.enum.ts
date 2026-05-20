export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  TRIAL = 'trial',
  PENDING = 'pending',
  GRACE_PERIOD = 'grace_period'
}

export enum PaymentProvider {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
  APPLE_IAP = 'apple_iap',
  GOOGLE_PLAY = 'google_play',
  MANUAL = 'manual',
}
