import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const migration: MongoMigration = {
  id: '202607130001',
  name: 'align-notification-email-defaults',
  checksum: 'sha256:notification-channel-defaults-v2',
  async up(connection: Connection): Promise<void> {
    await connection
      .collection(COLLECTION_NAMES.NOTIFICATION_SETTING)
      .updateMany(
        {},
        {
          $set: {
            'preferences.system.email': true,
            'preferences.subscription.email': true,
            'preferences.interestReceived.email': false,
            'preferences.interestAccepted.email': false,
            'preferences.matchFound.email': false,
            'preferences.profileView.email': false,
            'preferences.profileView.push': true,
            'preferences.messageReceived.email': false,
          },
        },
      );
  },
  async down(connection: Connection): Promise<void> {
    await connection
      .collection(COLLECTION_NAMES.NOTIFICATION_SETTING)
      .updateMany(
        {},
        {
          $set: {
            'preferences.interestReceived.email': true,
            'preferences.interestAccepted.email': true,
            'preferences.matchFound.email': true,
            'preferences.profileView.push': false,
          },
        },
      );
  },
};

export default migration;
