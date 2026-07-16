import addPaymentStoreTransactionIndex from './202606220001-add-payment-store-transaction-index.migration';
import addSubscriptionPurchaseTokenIndex from './202607040001-add-subscription-purchase-token-index.migration';
import movePersonalAstroToReligiousDetails from './202607090001-move-personal-astro-to-religious-details.migration';
import alignNotificationEmailDefaults from './202607130001-align-notification-email-defaults.migration';
import hashRefreshSessions from './202607140001-hash-refresh-sessions.migration';
import ensureSettingsUserUniqueIndexes from './202607160001-ensure-settings-user-unique-indexes.migration';
import addRetentionAuditIndexes from './202607160002-add-retention-audit-indexes.migration';
import addCriticalQueryIndexes from './202607160003-add-critical-query-indexes.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  addPaymentStoreTransactionIndex,
  addSubscriptionPurchaseTokenIndex,
  movePersonalAstroToReligiousDetails,
  alignNotificationEmailDefaults,
  hashRefreshSessions,
  ensureSettingsUserUniqueIndexes,
  addRetentionAuditIndexes,
  addCriticalQueryIndexes,
];
