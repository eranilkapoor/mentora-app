export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  ADJUSTMENT = 'adjustment',
  EXPIRE = 'expire',
}

export enum WalletTransactionSource {
  REFERRAL_REGISTRATION = 'referral_registration',
  REFERRAL_SUBSCRIPTION = 'referral_subscription',
  REDEMPTION = 'redemption',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum WalletTransactionStatus {
  POSTED = 'posted',
  REVERSED = 'reversed',
}
