import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const settingsCollections = [
  COLLECTION_NAMES.ACCOUNT_SETTING,
  COLLECTION_NAMES.PRIVACY_SETTING,
  COLLECTION_NAMES.NOTIFICATION_SETTING,
  COLLECTION_NAMES.COMMUNICATION_SETTING,
  COLLECTION_NAMES.SECURITY_SETTING,
  COLLECTION_NAMES.LOCALIZATION_SETTING,
  COLLECTION_NAMES.ACCESSIBILITY_SETTING,
  COLLECTION_NAMES.MEDIA_SETTING,
  COLLECTION_NAMES.AI_SETTING,
] as const;

const migration: MongoMigration = {
  id: '202607160001',
  name: 'ensure-settings-user-unique-indexes',
  checksum: 'sha256:settings-user-unique-indexes-v1',
  async up(connection: Connection): Promise<void> {
    await Promise.all(
      settingsCollections.map((collectionName) =>
        connection.collection(collectionName).createIndex(
          { userId: 1 },
          {
            unique: true,
            name: 'uniq_userId',
          },
        ),
      ),
    );
  },
  async down(connection: Connection): Promise<void> {
    await Promise.all(
      settingsCollections.map((collectionName) =>
        connection
          .collection(collectionName)
          .dropIndex('uniq_userId')
          .catch((error: unknown) => {
            if (
              error instanceof Error &&
              /index not found/i.test(error.message)
            ) {
              return undefined;
            }
            throw error;
          }),
      ),
    );
  },
};

export default migration;
