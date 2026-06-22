import { Types } from 'mongoose';
import { PaymentGateway } from '@/modules/payments/enums/payment-gateway.enum';
import { SubscriptionsService } from './subscriptions.service';

describe('SubscriptionsService reconciliation', () => {
  const userId = new Types.ObjectId().toString();
  const options = {
    planId: new Types.ObjectId().toString(),
    paymentProvider: PaymentGateway.GOOGLE_PLAY,
    storeProductId: 'gold_monthly',
    storeTransactionId: 'transaction-id',
  };

  it('returns an existing store transaction idempotently', async () => {
    const existing = { _id: new Types.ObjectId() };
    const subModel = {
      findOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(existing) })),
    };
    const service = new SubscriptionsService(
      subModel as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const purchase = jest.spyOn(service, 'purchasePlan');

    await expect(
      service.reconcileStoreSubscription(userId, options),
    ).resolves.toEqual({
      success: true,
      subscription: existing,
      reconciled: true,
    });
    expect(purchase).not.toHaveBeenCalled();
  });

  it('creates a renewable subscription for a new store transaction', async () => {
    const subModel = {
      findOne: jest.fn(() => ({ exec: jest.fn().mockResolvedValue(null) })),
    };
    const service = new SubscriptionsService(
      subModel as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const result = { success: true, subscription: { _id: 'subscription-id' } };
    const purchase = jest
      .spyOn(service, 'purchasePlan')
      .mockResolvedValue(result as never);

    await expect(
      service.reconcileStoreSubscription(userId, options),
    ).resolves.toBe(result);
    expect(purchase).toHaveBeenCalledWith(
      userId,
      options.planId,
      expect.objectContaining({
        autoRenew: true,
        storeTransactionId: options.storeTransactionId,
      }),
    );
  });
});
