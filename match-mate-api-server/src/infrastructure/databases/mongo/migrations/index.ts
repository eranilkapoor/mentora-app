import normalizeProfileSiblings from './202606220001-normalize-profile-siblings.migration';
import type { MongoMigration } from './migration.interface';

export const MONGO_MIGRATIONS: readonly MongoMigration[] = [
  normalizeProfileSiblings,
];
