import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const indexes = [
  {
    collection: COLLECTION_NAMES.PROFILE,
    keys: { status: 1, deletedAt: 1, lastActiveAt: -1, createdAt: -1 },
    name: 'idx_status_deletedAt_lastActiveAt_createdAt',
  },
  {
    collection: COLLECTION_NAMES.PROFILE,
    keys: {
      status: 1,
      'personal.gender': 1,
      'personal.city': 1,
      profileScore: -1,
      updatedAt: -1,
    },
    name: 'idx_status_personalGender_personalCity_profileScore_updatedAt',
  },
  {
    collection: COLLECTION_NAMES.CHAT_MESSAGE,
    keys: { roomId: 1, deletedAt: 1, createdAt: -1 },
    name: 'idx_roomId_deletedAt_createdAt',
  },
  {
    collection: COLLECTION_NAMES.CHAT_ROOM,
    keys: { 'participantStates.userId': 1, lastActivityAt: -1 },
    name: 'idx_participantStatesUserId_lastActivityAt',
  },
  {
    collection: COLLECTION_NAMES.NOTIFICATION,
    keys: { userId: 1, deletedAt: 1, createdAt: -1 },
    name: 'idx_userId_deletedAt_createdAt',
  },
  {
    collection: COLLECTION_NAMES.PAYMENT,
    keys: { userId: 1, createdAt: -1, initiatedAt: -1 },
    name: 'idx_userId_createdAt_initiatedAt',
  },
  {
    collection: COLLECTION_NAMES.MEDIA,
    keys: { moderationStatus: 1, isActive: 1, createdAt: 1 },
    name: 'idx_moderationStatus_isActive_createdAt',
  },
  {
    collection: COLLECTION_NAMES.SUPPORT_TICKET,
    keys: { status: 1, updatedAt: -1 },
    name: 'idx_status_updatedAt',
  },
] as const;

const migration: MongoMigration = {
  id: '202607160003',
  name: 'add-critical-query-indexes',
  checksum: 'sha256:critical-query-indexes-v1',
  async up(connection: Connection): Promise<void> {
    await Promise.all(
      indexes.map((index) =>
        connection
          .collection(index.collection)
          .createIndex(index.keys, { name: index.name }),
      ),
    );
  },
  async down(connection: Connection): Promise<void> {
    await Promise.all(
      indexes.map((index) =>
        dropIndexIfExists(connection, index.collection, index.name),
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
      if (error instanceof Error && /index not found/i.test(error.message)) {
        return undefined;
      }
      throw error;
    });
}

export default migration;
