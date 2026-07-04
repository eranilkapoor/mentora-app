import addPaymentStoreTransactionIndex from './202606220001-add-payment-store-transaction-index.migration';
import addSubscriptionPurchaseTokenIndex from './202607040001-add-subscription-purchase-token-index.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  addPaymentStoreTransactionIndex,
  addSubscriptionPurchaseTokenIndex,
];
