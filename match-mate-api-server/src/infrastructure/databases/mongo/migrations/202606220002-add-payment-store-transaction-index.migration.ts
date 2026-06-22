import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

export const PAYMENT_STORE_TRANSACTION_INDEX = 'gateway_1_storeTransactionId_1';

interface DuplicateStoreTransaction {
  _id: {
    gateway?: string;
    storeTransactionId?: string;
  };
  count: number;
}

interface PaymentIndexCollection {
  aggregate<T>(pipeline: object[]): { toArray(): Promise<T[]> };
  createIndex(
    key: Record<string, number>,
    options: { name: string; sparse: boolean; unique: boolean },
  ): Promise<string>;
  dropIndex(name: string): Promise<unknown>;
}

export async function ensurePaymentStoreTransactionIndex(
  payments: PaymentIndexCollection,
): Promise<void> {
  const duplicates = await payments
    .aggregate<DuplicateStoreTransaction>([
      { $match: { storeTransactionId: { $exists: true } } },
      {
        $group: {
          _id: {
            gateway: '$gateway',
            storeTransactionId: '$storeTransactionId',
          },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $limit: 10 },
    ])
    .toArray();

  if (duplicates.length > 0) {
    const examples = duplicates
      .map(
        ({ _id, count }) =>
          `${_id.gateway ?? 'unknown'}:${_id.storeTransactionId ?? 'null'} (${count})`,
      )
      .join(', ');
    throw new Error(
      `Cannot create ${PAYMENT_STORE_TRANSACTION_INDEX}; duplicate store transactions exist: ${examples}`,
    );
  }

  await payments.createIndex(
    { gateway: 1, storeTransactionId: 1 },
    {
      name: PAYMENT_STORE_TRANSACTION_INDEX,
      sparse: true,
      unique: true,
    },
  );
}

const migration: MongoMigration = {
  id: '202606220002',
  name: 'add-payment-store-transaction-index',
  checksum: 'sha256:payment-store-transaction-index-v1',
  async up(connection: Connection): Promise<void> {
    const payments = connection.collection(
      COLLECTION_NAMES.PAYMENT,
    ) as unknown as PaymentIndexCollection;
    await ensurePaymentStoreTransactionIndex(payments);
  },
  async down(connection: Connection): Promise<void> {
    const payments = connection.collection(
      COLLECTION_NAMES.PAYMENT,
    ) as unknown as PaymentIndexCollection;
    await payments.dropIndex(PAYMENT_STORE_TRANSACTION_INDEX);
  },
};

export default migration;
