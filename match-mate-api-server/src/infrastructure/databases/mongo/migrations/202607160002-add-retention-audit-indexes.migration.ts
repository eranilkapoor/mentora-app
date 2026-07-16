import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const complianceCollections = [
  COLLECTION_NAMES.USER,
  COLLECTION_NAMES.PROFILE,
  COLLECTION_NAMES.MEDIA,
  COLLECTION_NAMES.ACCOUNT_SETTING,
  COLLECTION_NAMES.PAYMENT,
  COLLECTION_NAMES.PAYMENT_INVOICE,
  COLLECTION_NAMES.SUBSCRIPTION,
  COLLECTION_NAMES.VERIFICATION,
  COLLECTION_NAMES.USER_REPORT,
  COLLECTION_NAMES.ADMIN_AUDIT_LOG,
  COLLECTION_NAMES.CURATED_MATCH,
] as const;

const legalHoldCollections = [
  ...complianceCollections,
  COLLECTION_NAMES.PROMOTION_COUPON,
] as const;

const migration: MongoMigration = {
  id: '202607160002',
  name: 'add-retention-audit-indexes',
  checksum: 'sha256:retention-audit-indexes-v1',
  async up(connection: Connection): Promise<void> {
    await Promise.all([
      ...complianceCollections.map((collectionName) =>
        connection
          .collection(collectionName)
          .createIndex(
            { anonymizedAt: 1, retentionReason: 1 },
            { name: 'idx_anonymizedAt_retentionReason' },
          ),
      ),
      ...legalHoldCollections.map((collectionName) =>
        connection
          .collection(collectionName)
          .createIndex({ legalHoldUntil: 1 }, { name: 'idx_legalHoldUntil' }),
      ),
      connection
        .collection(COLLECTION_NAMES.PROMOTION_COUPON)
        .createIndex(
          { deletedAt: 1, status: 1 },
          { name: 'idx_deletedAt_status' },
        ),
    ]);
  },
  async down(connection: Connection): Promise<void> {
    await Promise.all([
      ...complianceCollections.map((collectionName) =>
        dropIndexIfExists(
          connection,
          collectionName,
          'idx_anonymizedAt_retentionReason',
        ),
      ),
      ...legalHoldCollections.map((collectionName) =>
        dropIndexIfExists(connection, collectionName, 'idx_legalHoldUntil'),
      ),
      dropIndexIfExists(
        connection,
        COLLECTION_NAMES.PROMOTION_COUPON,
        'idx_deletedAt_status',
      ),
    ]);
  },
};

async function dropIndexIfExists(
  connection: Connection,
  collectionName: string,
  indexName: string,
): Promise<void> {
  await connection
    .collection(collectionName)
    .dropIndex(indexName)
    .catch((error: unknown) => {
      if (error instanceof Error && /index not found/i.test(error.message)) {
        return undefined;
      }
      throw error;
    });
}

export default migration;
