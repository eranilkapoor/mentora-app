import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

type StaleIndexDefinition = {
  collection: string;
  name: string;
  keys: Record<string, 1 | -1>;
};

const staleIndexes: StaleIndexDefinition[] = [
  {
    collection: COLLECTION_NAMES.PAYMENT,
    name: 'idx_userId_createdAt_initiatedAt',
    keys: { userId: 1, createdAt: -1, initiatedAt: -1 },
  },
  {
    collection: COLLECTION_NAMES.SUBJECT,
    name: 'uniq_code_sparse',
    keys: { code: 1 },
  },
  {
    collection: COLLECTION_NAMES.STUDENT_PROFILE,
    name: 'idx_anonymizedAt_retentionReason',
    keys: { anonymizedAt: 1, retentionReason: 1 },
  },
  {
    collection: COLLECTION_NAMES.STUDENT_PROFILE,
    name: 'idx_legalHoldUntil',
    keys: { legalHoldUntil: 1 },
  },
  {
    collection: COLLECTION_NAMES.PARENT_PROFILE,
    name: 'idx_anonymizedAt_retentionReason',
    keys: { anonymizedAt: 1, retentionReason: 1 },
  },
  {
    collection: COLLECTION_NAMES.PARENT_PROFILE,
    name: 'idx_legalHoldUntil',
    keys: { legalHoldUntil: 1 },
  },
  {
    collection: COLLECTION_NAMES.PARENT_STUDENT_RELATIONSHIP,
    name: 'idx_anonymizedAt_retentionReason',
    keys: { anonymizedAt: 1, retentionReason: 1 },
  },
  {
    collection: COLLECTION_NAMES.PARENT_STUDENT_RELATIONSHIP,
    name: 'idx_legalHoldUntil',
    keys: { legalHoldUntil: 1 },
  },
  {
    collection: COLLECTION_NAMES.STUDENT_ACADEMIC_RECORD,
    name: 'idx_studentProfileId_status_updatedAt',
    keys: { studentProfileId: 1, status: 1, updatedAt: -1 },
  },
  {
    collection: COLLECTION_NAMES.LEARNING_SCHEDULE,
    name: 'idx_anonymizedAt_retentionReason',
    keys: { anonymizedAt: 1, retentionReason: 1 },
  },
  {
    collection: COLLECTION_NAMES.LEARNING_SCHEDULE,
    name: 'idx_legalHoldUntil',
    keys: { legalHoldUntil: 1 },
  },
  {
    collection: COLLECTION_NAMES.LEARNING_ENTITLEMENT,
    name: 'idx_anonymizedAt_retentionReason',
    keys: { anonymizedAt: 1, retentionReason: 1 },
  },
  {
    collection: COLLECTION_NAMES.LEARNING_ENTITLEMENT,
    name: 'idx_legalHoldUntil',
    keys: { legalHoldUntil: 1 },
  },
];

const migration: MongoMigration = {
  id: '202607280001',
  name: 'drop-stale-schema-indexes',
  checksum: 'sha256:drop-stale-schema-indexes-v1',
  async up(connection: Connection): Promise<void> {
    await Promise.all(
      staleIndexes.map((index) =>
        dropIndexIfExists(connection, index.collection, index.name),
      ),
    );
  },
  async down(connection: Connection): Promise<void> {
    await Promise.all(
      staleIndexes.map((index) =>
        connection
          .collection(index.collection)
          .createIndex(index.keys, { name: index.name }),
      ),
    );
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
      if (
        error instanceof Error &&
        (/index not found/i.test(error.message) ||
          /ns not found/i.test(error.message))
      ) {
        return undefined;
      }
      throw error;
    });
}

export default migration;
