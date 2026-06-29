import addPaymentStoreTransactionIndex from './202606220001-add-payment-store-transaction-index.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  addPaymentStoreTransactionIndex,
];
