import addPaymentStoreTransactionIndex from './202606220001-add-payment-store-transaction-index.migration';
import addSubscriptionPurchaseTokenIndex from './202607040001-add-subscription-purchase-token-index.migration';
import hashRefreshSessions from './202607140001-hash-refresh-sessions.migration';
import ensureSettingsUserUniqueIndexes from './202607160001-ensure-settings-user-unique-indexes.migration';
import addRetentionAuditIndexes from './202607160002-add-retention-audit-indexes.migration';
import addCriticalQueryIndexes from './202607160003-add-critical-query-indexes.migration';
import addMentoraLearningIndexes from './202607220001-add-mentora-learning-indexes.migration';
import dropStaleSchemaIndexes from './202607280001-drop-stale-schema-indexes.migration';
import renameOrganizationDomainFields from './202608010001-rename-organization-domain-fields.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  addPaymentStoreTransactionIndex,
  addSubscriptionPurchaseTokenIndex,
  hashRefreshSessions,
  ensureSettingsUserUniqueIndexes,
  addRetentionAuditIndexes,
  addCriticalQueryIndexes,
  addMentoraLearningIndexes,
  dropStaleSchemaIndexes,
  renameOrganizationDomainFields,
];
