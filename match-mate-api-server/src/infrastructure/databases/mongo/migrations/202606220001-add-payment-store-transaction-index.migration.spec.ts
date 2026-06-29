import {
  ensurePaymentStoreTransactionIndex,
  PAYMENT_STORE_TRANSACTION_INDEX,
} from './202606220001-add-payment-store-transaction-index.migration';

describe('payment store transaction index migration', () => {
  it('creates the unique sparse index after a clean preflight', async () => {
    const toArray = jest.fn().mockResolvedValue([]);
    const createIndex = jest
      .fn()
      .mockResolvedValue(PAYMENT_STORE_TRANSACTION_INDEX);
    const collection = {
      aggregate: jest.fn(() => ({ toArray })),
      createIndex,
      dropIndex: jest.fn(),
    };

    await ensurePaymentStoreTransactionIndex(collection);

    expect(createIndex.mock.calls).toEqual([
      [
        { gateway: 1, storeTransactionId: 1 },
        {
          name: PAYMENT_STORE_TRANSACTION_INDEX,
          sparse: true,
          unique: true,
        },
      ],
    ]);
  });

  it('rejects duplicate store transaction identifiers', async () => {
    const collection = {
      aggregate: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([
          {
            _id: { gateway: 'google_play', storeTransactionId: 'txn-1' },
            count: 2,
          },
        ]),
      })),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
    };

    await expect(
      ensurePaymentStoreTransactionIndex(collection),
    ).rejects.toThrow('google_play:txn-1 (2)');
    expect(collection.createIndex.mock.calls).toHaveLength(0);
  });
});
