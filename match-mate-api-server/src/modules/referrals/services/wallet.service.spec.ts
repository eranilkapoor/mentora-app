import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { AppException } from '@/common/exceptions/app.exception';
import {
  WalletTransactionSource,
  WalletTransactionStatus,
  WalletTransactionType,
} from '../enums/wallet-transaction.enum';
import type { WalletTransactionDocument } from '../schemas/wallet-transaction.schema';
import { WalletService } from './wallet.service';

describe('WalletService', () => {
  const findOne = jest.fn();
  const create = jest.fn();
  const aggregate = jest.fn();
  const findExec = jest.fn();
  const find = jest.fn(() => ({
    sort: jest.fn(() => ({
      limit: jest.fn(() => ({ lean: jest.fn(() => ({ exec: findExec })) })),
    })),
  }));
  const model = {
    findOne,
    create,
    aggregate,
    find,
  } as unknown as Model<WalletTransactionDocument>;
  let service: WalletService;

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    findOne.mockResolvedValue(null);
    create.mockImplementation((value: unknown) => Promise.resolve(value));
    aggregate.mockResolvedValue([]);
    findExec.mockResolvedValue([]);
    service = new WalletService(model);
  });

  it.each([0, -10, Number.NaN, undefined])(
    'ignores non-positive credit value %s',
    async (points) => {
      await expect(
        service.credit({
          userId: new Types.ObjectId(),
          points: points as number,
          source: WalletTransactionSource.REFERRAL_REGISTRATION,
        }),
      ).resolves.toBeNull();
      expect(create).not.toHaveBeenCalled();
    },
  );

  it('returns an existing idempotent credit', async () => {
    const existing = { points: 100 };
    const userId = new Types.ObjectId();
    findOne.mockResolvedValue(existing);

    await expect(
      service.credit({
        userId,
        points: 100.4,
        source: WalletTransactionSource.REFERRAL_REGISTRATION,
        referenceId: 'ref-1',
      }),
    ).resolves.toBe(existing);
    expect(findOne).toHaveBeenCalledWith({
      userId,
      source: WalletTransactionSource.REFERRAL_REGISTRATION,
      referenceId: 'ref-1',
      status: WalletTransactionStatus.POSTED,
    });
  });

  it('credits rounded points against the current balance', async () => {
    const userId = new Types.ObjectId().toString();
    jest.spyOn(service, 'getBalance').mockResolvedValue(25);

    await service.credit({
      userId,
      points: 10.6,
      source: WalletTransactionSource.REFERRAL_REGISTRATION,
      referenceId: 'new-ref',
      metadata: { campaign: 'summer' },
    });
    await service.credit({
      userId,
      points: 1,
      source: WalletTransactionSource.REFERRAL_REGISTRATION,
    });

    expect(create).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      type: WalletTransactionType.CREDIT,
      source: WalletTransactionSource.REFERRAL_REGISTRATION,
      points: 11,
      balanceAfter: 36,
      referenceId: 'new-ref',
      metadata: { campaign: 'summer' },
    });
  });

  it('delegates coin purchases to idempotent crediting', async () => {
    const credit = jest.spyOn(service, 'credit').mockResolvedValue(null);
    const userId = new Types.ObjectId();

    await service.creditCoinPurchase({
      userId,
      coins: 500,
      paymentId: 'payment-id',
      metadata: { gateway: 'razorpay' },
    });

    expect(credit).toHaveBeenCalledWith({
      userId,
      points: 500,
      source: WalletTransactionSource.COIN_PURCHASE,
      referenceId: 'payment-id',
      metadata: { gateway: 'razorpay' },
    });
  });

  it.each([999.4, Number.NaN])(
    'rejects invalid redemption amount %s',
    async (points) => {
      await expect(
        service.redeem(new Types.ObjectId().toString(), points),
      ).rejects.toBeInstanceOf(AppException);
    },
  );

  it('rejects redemption above the available balance', async () => {
    jest.spyOn(service, 'getBalance').mockResolvedValue(1000);
    await expect(
      service.redeem(new Types.ObjectId().toString(), 1500),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('posts a redemption debit and returns the updated summary', async () => {
    const userId = new Types.ObjectId().toString();
    const summary = { balance: 500 };
    jest.spyOn(service, 'getBalance').mockResolvedValue(1500);
    jest.spyOn(service, 'getSummary').mockResolvedValue(summary as never);

    await expect(service.redeem(userId, 1000)).resolves.toBe(summary);
    expect(create).toHaveBeenCalledWith({
      userId: new Types.ObjectId(userId),
      type: WalletTransactionType.DEBIT,
      source: WalletTransactionSource.REDEMPTION,
      points: -1000,
      balanceAfter: 500,
    });
  });

  it.each([0, Number.NaN])('rejects invalid spend amount %s', async (coins) => {
    await expect(
      service.spend({ userId: new Types.ObjectId().toString(), coins }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('returns the current summary for an existing idempotent spend', async () => {
    const userId = new Types.ObjectId().toString();
    const summary = { balance: 900 };
    findOne.mockResolvedValue({ _id: 'transaction' });
    jest.spyOn(service, 'getSummary').mockResolvedValue(summary as never);

    await expect(
      service.spend({ userId, coins: 100, referenceId: 'action-1' }),
    ).resolves.toBe(summary);
  });

  it('rejects spending above the current balance', async () => {
    jest.spyOn(service, 'getBalance').mockResolvedValue(50);
    await expect(
      service.spend({ userId: new Types.ObjectId().toString(), coins: 100 }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it.each([
    [{ campaign: 'launch' }, 'unlock'],
    [undefined, undefined],
  ])('posts a valid coin spend', async (metadata, reason) => {
    const userId = new Types.ObjectId().toString();
    jest.spyOn(service, 'getBalance').mockResolvedValue(500);
    jest
      .spyOn(service, 'getSummary')
      .mockResolvedValue({ balance: 400 } as never);

    await service.spend({
      userId,
      coins: 100.4,
      referenceId: metadata ? 'new-spend' : undefined,
      metadata,
      reason,
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: WalletTransactionType.DEBIT,
        points: -100,
        balanceAfter: 400,
        metadata: { ...(metadata ?? {}), reason },
      }),
    );
  });

  it.each([
    [1200, 1200, 0, true, false],
    [500, 0, 500, false, true],
  ])(
    'summarizes balance %s and pagination flags',
    async (
      balance,
      redeemablePoints,
      pendingPoints,
      hasNextPage,
      hasPrevPage,
    ) => {
      const userId = new Types.ObjectId();
      jest.spyOn(service, 'getBalance').mockResolvedValue(balance);
      findExec.mockResolvedValue([{ points: 100 }]);

      const result = await service.getSummary(userId);

      expect(result).toEqual({
        balance,
        redeemablePoints,
        pendingPoints,
        redemptionThreshold: 1000,
        transactions: [{ points: 100 }],
      });
      expect(hasNextPage).toBe(balance >= 1000);
      expect(hasPrevPage).toBe(balance < 1000);
    },
  );

  it.each([
    [[], 0],
    [[{ balance: -50 }], 0],
    [[{ balance: 125 }], 125],
  ])('normalizes aggregate balance %#', async (aggregateResult, expected) => {
    aggregate.mockResolvedValue(aggregateResult);
    await expect(service.getBalance(new Types.ObjectId())).resolves.toBe(
      expected,
    );
  });
});
