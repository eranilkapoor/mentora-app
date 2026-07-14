/* eslint-disable @typescript-eslint/no-floating-promises */
import { Types } from 'mongoose';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentRepository } from './payment.repository';

const userId = new Types.ObjectId().toString();

const fluent = (value: unknown = []) => {
  const query: Record<string, jest.Mock> = {};
  for (const method of ['lean', 'sort', 'skip', 'limit']) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn().mockResolvedValue(value);
  return query;
};

describe('PaymentRepository', () => {
  const query = fluent([{ orderId: 'order-1' }]);
  const countQuery = { exec: jest.fn().mockResolvedValue(5) };
  const aggregateQuery = { exec: jest.fn().mockResolvedValue([]) };
  const model = {
    create: jest.fn(),
    findOne: jest.fn(() => query),
    countDocuments: jest.fn(() => countQuery),
    findOneAndUpdate: jest.fn((...args: unknown[]) => {
      void args;
      return query;
    }),
    find: jest.fn(() => query),
    aggregate: jest.fn(() => aggregateQuery),
    updateMany: jest.fn(() => query),
  };
  let repository: PaymentRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    query.exec.mockResolvedValue([{ orderId: 'order-1' }]);
    countQuery.exec.mockResolvedValue(5);
    aggregateQuery.exec.mockResolvedValue([]);
    repository = new PaymentRepository(model as never);
  });

  it('delegates creation and all direct payment lookups', async () => {
    repository.create({ orderId: 'order-1' });
    await repository.findByOrderId('order-1');
    await repository.findByOrderIdAndUser('order-1', userId);
    await repository.findByIdempotencyKey(userId, 'idem-1');
    await repository.findSuccessfulStoreTransaction({
      gateway: PaymentGateway.GOOGLE_PLAY,
      transactionId: 'txn-1',
    });
    await repository.findPaymentByOrderId('order-1');
    expect(model.findOne).toHaveBeenCalledTimes(5);
  });

  it('counts store renewals with empty, complete, and one-sided filters', async () => {
    const fromDate = new Date('2026-01-01');
    const toDate = new Date('2026-02-01');
    await repository.countStoreRenewals({});
    await repository.countStoreRenewals({
      gateway: PaymentGateway.APPLE_IAP,
      fromDate,
      toDate,
    });
    await repository.countStoreRenewals({ fromDate });
    await repository.countStoreRenewals({ toDate });
    expect(model.countDocuments).toHaveBeenCalledTimes(4);
  });

  it('marks success, failure, refund, expiry, and invoice attachment', async () => {
    await repository.markSuccess({
      orderId: 'order-1',
      gatewayPaymentId: 'payment-1',
      gatewayOrderId: 'gateway-order',
      method: PaymentMethod.CARD,
      signatureVerified: true,
      gatewayPayload: { ok: true },
      storeProductId: 'product',
      storeTransactionId: 'transaction',
      storeOriginalTransactionId: 'original',
    });
    await repository.markFailed({
      orderId: 'order-1',
      failureCode: 'DECLINED',
      failureReason: 'Declined',
      gatewayPayload: {},
    });
    await repository.markRefunded('order-1', {});
    await repository.expireStalePending(new Date());
    await repository.attachInvoice('order-1', new Types.ObjectId());
    expect(model.findOneAndUpdate).toHaveBeenCalledTimes(4);
    const successFilter = model.findOneAndUpdate.mock.calls[0]?.[0] as {
      orderId: string;
      status: { $in: PaymentStatus[] };
    };
    const failureFilter = model.findOneAndUpdate.mock.calls[1]?.[0] as {
      status: { $in: PaymentStatus[] };
    };
    expect(successFilter.orderId).toBe('order-1');
    expect(successFilter.status.$in).toContain(PaymentStatus.PENDING);
    expect(failureFilter.status.$in).not.toContain(PaymentStatus.SUCCESS);
    expect(model.findOneAndUpdate).toHaveBeenNthCalledWith(
      3,
      { orderId: 'order-1', status: PaymentStatus.SUCCESS },
      expect.any(Object),
      { new: true },
    );
    expect(model.updateMany).toHaveBeenCalled();
  });

  it('paginates user payments with and without optional filters', async () => {
    await expect(
      repository.findUserPayments({ userId, page: 2, limit: 2 }),
    ).resolves.toEqual({
      items: [{ orderId: 'order-1' }],
      pagination: { page: 2, limit: 2, total: 5, totalPages: 3 },
    });
    await repository.findUserPayments({
      userId,
      page: 1,
      limit: 10,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.SUBSCRIPTION,
      currency: 'INR',
    });
    expect(model.find).toHaveBeenCalledTimes(2);
  });

  it('paginates admin payments across every supported filter', async () => {
    const fromDate = new Date('2026-01-01');
    const toDate = new Date('2026-02-01');
    await repository.findAdminPayments({ page: 1, limit: 10 });
    await repository.findAdminPayments({
      orderId: 'order-1',
      userId,
      status: PaymentStatus.SUCCESS,
      gateway: PaymentGateway.RAZORPAY,
      method: PaymentMethod.CARD,
      purpose: PaymentPurpose.SUBSCRIPTION,
      fromDate,
      toDate,
      page: 2,
      limit: 2,
    });
    await repository.findAdminPayments({ fromDate, page: 1, limit: 10 });
    await repository.findAdminPayments({ toDate, page: 1, limit: 10 });
    expect(model.find).toHaveBeenCalledTimes(4);
  });

  it('builds analytics, stale-payment, coupon, and settlement queries', async () => {
    const fromDate = new Date('2026-01-01');
    const toDate = new Date('2026-02-01');
    await repository.getStatusSummary({ fromDate, toDate });
    await repository.countStalePending(toDate);
    await repository.countStalePending(toDate, fromDate, toDate);
    await repository.countStalePending(toDate, fromDate);
    await repository.countStalePending(toDate, undefined, toDate);
    await repository.countSuccessfulCouponUsage({ couponCode: 'save10' });
    await repository.countSuccessfulCouponUsage({
      couponCode: 'save10',
      userId,
    });
    await repository.getSettlementBreakdown({ fromDate, toDate });
    await repository.getSettlementBreakdown({
      fromDate,
      toDate,
      gateway: PaymentGateway.RAZORPAY,
      currency: 'INR',
    });
    expect(model.aggregate).toHaveBeenCalledTimes(3);
  });
});
