import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const migration: MongoMigration = {
  id: '202607140001',
  name: 'hash-refresh-sessions',
  checksum: 'sha256:invalidate-plaintext-refresh-sessions-v1',
  async up(connection: Connection): Promise<void> {
    await connection.collection(COLLECTION_NAMES.USER_SESSION).updateMany(
      { refreshToken: { $exists: true } },
      {
        $unset: { refreshToken: '' },
        $set: { isActive: false, loggedOutAt: new Date() },
      },
    );
  },
  async down(): Promise<void> {
    // Plaintext refresh credentials are intentionally not recoverable.
  },
};

export default migration;
