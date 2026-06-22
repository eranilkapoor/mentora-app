import normalizeProfileSiblings from './202606220001-normalize-profile-siblings.migration';
import addPaymentStoreTransactionIndex from './202606220002-add-payment-store-transaction-index.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  normalizeProfileSiblings,
  addPaymentStoreTransactionIndex,
];
