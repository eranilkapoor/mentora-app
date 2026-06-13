export enum WalletTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  ADJUSTMENT = 'adjustment',
  EXPIRE = 'expire',
}

export enum WalletTransactionSource {
  REFERRAL_REGISTRATION = 'referral_registration',
  REFERRAL_SUBSCRIPTION = 'referral_subscription',
  COIN_PURCHASE = 'coin_purchase',
  COIN_SPEND = 'coin_spend',
  REDEMPTION = 'redemption',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

export enum WalletTransactionStatus {
  POSTED = 'posted',
  REVERSED = 'reversed',
}
