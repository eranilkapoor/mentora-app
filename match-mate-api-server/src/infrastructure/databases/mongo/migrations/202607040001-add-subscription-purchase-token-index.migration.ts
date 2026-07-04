import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

export const SUBSCRIPTION_PURCHASE_TOKEN_INDEX = 'storePurchaseToken_1';

const migration: MongoMigration = {
  id: '202607040001',
  name: 'add-subscription-purchase-token-index',
  checksum: 'sha256:subscription-purchase-token-index-v1',
  async up(connection: Connection): Promise<void> {
    await connection.collection(COLLECTION_NAMES.SUBSCRIPTION).createIndex(
      { storePurchaseToken: 1 },
      {
        name: SUBSCRIPTION_PURCHASE_TOKEN_INDEX,
        sparse: true,
        unique: true,
      },
    );
  },
  async down(connection: Connection): Promise<void> {
    await connection
      .collection(COLLECTION_NAMES.SUBSCRIPTION)
      .dropIndex(SUBSCRIPTION_PURCHASE_TOKEN_INDEX);
  },
};

export default migration;
