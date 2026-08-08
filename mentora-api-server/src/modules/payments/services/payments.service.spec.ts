/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-floating-promises */
import { ErrorCode } from '@/common/constants';
import { Types } from 'mongoose';
import { AdminRefundPaymentDto } from '../dto/admin-refund-payment.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { createPaymentSignature } from '../utils/payment-signature.util';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  const paymentRepo = {
    findByOrderIdAndUser: jest.fn(),
    markSuccess: jest.fn(),
    markFailed: jest.fn(),
    findByOrderId: jest.fn(),
    markRefunded: jest.fn(),
    create: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findSuccessfulStoreTransaction: jest.fn(),
    findUserPayments: jest.fn(),
    findPaymentByOrderId: jest.fn(),
    expireStalePending: jest.fn(),
    findAdminPayments: jest.fn(),
    getStatusSummary: jest.fn(),
    countStalePending: jest.fn(),
    countStoreRenewals: jest.fn(),
    getSettlementBreakdown: jest.fn(),
    countSuccessfulCouponUsage: jest.fn(),
    attachInvoice: jest.fn(),
  };

  const configService = {
    get: jest.fn(),
  };

  const subscriptionsService = {
    purchasePlan: jest.fn(),
    reconcileStoreSubscription: jest.fn(),
  };

  const referralsService = {
    awardSubscriptionReward: jest.fn(),
  };

  const walletService = {
    creditCoinPurchase: jest.fn(),
  };

  const profileBoostService = {
    activateBoost: jest.fn(),
  };

  const storeReceiptVerifier = {
    verify: jest.fn(),
  };

  const planModel = {
    findById: jest.fn(),
  };

  const couponModel = {
    findOne: jest.fn(),
  };

  const invoiceModel = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const creditNoteModel = {
    create: jest.fn(),
  };

  const contractModel = {
    create: jest.fn(),
  };

  const dunningModel = {
    create: jest.fn(),
  };

  const organizationModel = {
    findById: jest.fn(),
  };

  const branchModel = {
    countDocuments: jest.fn(),
  };

  const leadModel = {
    countDocuments: jest.fn(),
  };

  const membershipModel = {
    countDocuments: jest.fn(),
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();

    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        env: 'development',
        'payments.allowUnsignedVerification': true,
        'payments.gstPercentage': '18',
      };
      return values[key] ?? fallback;
    });

    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    invoiceModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    creditNoteModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    planModel.findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });

    service = new PaymentsService(
      paymentRepo as never,
      configService as never,
      subscriptionsService as never,
      referralsService as never,
      walletService as never,
      profileBoostService as never,
      planModel as never,
      couponModel as never,
      invoiceModel as never,
      creditNoteModel as never,
      contractModel as never,
      dunningModel as never,
      organizationModel as never,
      branchModel as never,
      leadModel as never,
      membershipModel as never,
      storeReceiptVerifier as never,
    );
  });

  it('rejects createOrder when plan is invalid for subscription purpose', async () => {
    const dto: CreateOrderDto = {
      planId: 'plan-1',
      purpose: PaymentPurpose.SUBSCRIPTION,
      currency: 'INR',
    };

    await expect(service.createOrder('user-1', dto)).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_FAILED,
    });
  });

  it('rejects verifyPayment when payment does not exist', async () => {
    paymentRepo.findByOrderIdAndUser.mockResolvedValue(null);

    await expect(
      service.verifyPayment('user-1', {
        orderId: 'ORD_1',
        gatewayPaymentId: 'PAY_1',
        signature: 'sig',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_NOT_FOUND });
  });

  it('rejects verifyPayment when signature cannot be validated', async () => {
    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        env: 'production',
        'payments.allowUnsignedVerification': false,
      };
      return values[key] ?? fallback;
    });

    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      orderId: 'ORD_1',
      status: PaymentStatus.PENDING,
      gatewayOrderId: 'GORD_1',
    });

    await expect(
      service.verifyPayment('user-1', {
        orderId: 'ORD_1',
        gatewayPaymentId: 'PAY_1',
        signature: 'invalid-signature',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_VERIFICATION_FAILED });
  });

  it('marks payment success when unsigned verification is allowed in non-production', async () => {
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      orderId: 'ORD_1',
      status: PaymentStatus.PENDING,
      gatewayOrderId: 'GORD_1',
    });
    paymentRepo.markSuccess.mockResolvedValue({
      orderId: 'ORD_1',
      status: PaymentStatus.SUCCESS,
      userId: { toString: () => 'user-1' },
    });

    const result = await service.verifyPayment('user-1', {
      orderId: 'ORD_1',
      gatewayPaymentId: 'PAY_1',
      signature: 'unsigned',
    });

    expect(paymentRepo.markSuccess).toHaveBeenCalled();
    expect(result).toMatchObject({ status: PaymentStatus.SUCCESS });
  });

  it('processes refunded webhook when signature is valid', async () => {
    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'payments.webhookSecret') return undefined;
      const values: Record<string, unknown> = {
        env: 'development',
        'payments.allowUnsignedVerification': true,
      };
      return values[key] ?? fallback;
    });

    paymentRepo.findByOrderId.mockResolvedValue({
      orderId: 'ORD_1',
      status: PaymentStatus.SUCCESS,
    });
    paymentRepo.markRefunded.mockResolvedValue({
      status: PaymentStatus.REFUNDED,
    });

    const result = await service.processWebhook({
      eventId: 'evt-1',
      orderId: 'ORD_1',
      status: PaymentStatus.REFUNDED,
    });

    expect(paymentRepo.markRefunded).toHaveBeenCalledWith('ORD_1', undefined);
    expect(result).toEqual({ processed: true, status: PaymentStatus.REFUNDED });
  });

  it('rejects admin refund when payment is not successful', async () => {
    const dto: AdminRefundPaymentDto = {
      amount: 100,
    };

    paymentRepo.findByOrderId.mockResolvedValue({
      orderId: 'ORD_1',
      status: PaymentStatus.FAILED,
      netAmount: 399,
    });

    await expect(
      service.adminInitiateRefund('ORD_1', dto),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_REFUND_FAILED });
  });

  it('creates catalog-backed and idempotent orders and rejects uncatalogued coin packs', async () => {
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();
    planModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(planId),
          isActive: true,
          isCustom: false,
          planType: 'self_service',
          price: 100,
          currency: 'INR',
          durationDays: 30,
          slug: 'silver-monthly',
        }),
      }),
    });
    paymentRepo.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve(data),
    );

    const planOrder = await service.createOrder(userId, {
      planId,
      purpose: PaymentPurpose.SUBSCRIPTION,
      currency: 'inr',
      customerGstin: 'GSTIN',
    });
    expect(planOrder).toMatchObject({ amount: 100, taxAmount: 18 });

    await expect(
      service.createOrder(userId, {
        purpose: PaymentPurpose.COIN_PACK,
        currency: 'INR',
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_FAILED,
      meta: expect.objectContaining({
        reason: 'coin_pack_catalog_not_configured',
      }),
    });

    paymentRepo.findByIdempotencyKey.mockResolvedValue({ orderId: 'existing' });
    await expect(
      service.createOrder(userId, {
        planId,
        idempotencyKey: 'idem',
      }),
    ).resolves.toEqual({
      isIdempotentReplay: true,
      payment: { orderId: 'existing' },
    });
  });

  it('rejects invalid order inputs and custom plans', async () => {
    const userId = new Types.ObjectId().toString();
    await expect(
      service.createOrder('', { purpose: PaymentPurpose.COIN_PACK }),
    ).rejects.toMatchObject({ code: ErrorCode.AUTH_UNAUTHORIZED });
    await expect(
      service.createOrder(userId, { purpose: PaymentPurpose.COIN_PACK }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    planModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ isActive: true, isCustom: true }),
      }),
    });
    await expect(
      service.createOrder(userId, { planId: new Types.ObjectId().toString() }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
  });

  it('handles payment verification state and update failures', async () => {
    const userId = new Types.ObjectId().toString();
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      status: PaymentStatus.SUCCESS,
    });
    await expect(
      service.verifyPayment(userId, {
        orderId: 'ORD',
        gatewayPaymentId: 'PAY',
        signature: 'sig',
      }),
    ).resolves.toEqual({ status: PaymentStatus.SUCCESS });

    for (const status of [PaymentStatus.REFUNDED, PaymentStatus.CANCELLED]) {
      paymentRepo.findByOrderIdAndUser.mockResolvedValue({ status });
      await expect(
        service.verifyPayment(userId, {
          orderId: 'ORD',
          gatewayPaymentId: 'PAY',
          signature: 'sig',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_VERIFICATION_FAILED });
    }

    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      status: PaymentStatus.PENDING,
      gatewayOrderId: 'GORD',
    });
    paymentRepo.markSuccess.mockResolvedValue(null);
    await expect(
      service.verifyPayment(userId, {
        orderId: 'ORD',
        gatewayPaymentId: 'PAY',
        signature: 'sig',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
  });

  it('marks failed payments and validates payment history/detail', async () => {
    const userId = new Types.ObjectId().toString();
    paymentRepo.findByOrderIdAndUser.mockResolvedValue(null);
    await expect(
      service.markPaymentFailed(userId, { orderId: 'ORD' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_NOT_FOUND });
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      status: PaymentStatus.SUCCESS,
    });
    await expect(
      service.markPaymentFailed(userId, { orderId: 'ORD' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_ALREADY_VERIFIED });
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      status: PaymentStatus.PENDING,
    });
    paymentRepo.markFailed.mockResolvedValue(null);
    await expect(
      service.markPaymentFailed(userId, { orderId: 'ORD' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
    paymentRepo.markFailed.mockResolvedValue({ status: PaymentStatus.FAILED });
    await expect(
      service.markPaymentFailed(userId, { orderId: 'ORD' }),
    ).resolves.toEqual({ status: PaymentStatus.FAILED });

    service.getUserPayments(userId, { currency: 'inr' });
    expect(paymentRepo.findUserPayments).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 20, currency: 'INR' }),
    );
    paymentRepo.findByOrderIdAndUser.mockResolvedValue(null);
    await expect(
      service.getUserPaymentDetail(userId, 'ORD'),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_NOT_FOUND });
  });

  it('processes webhook success, failure, and invalid outcomes', async () => {
    paymentRepo.findByOrderId.mockResolvedValue(null);
    await expect(
      service.processWebhook({
        eventId: 'e',
        orderId: 'ORD',
        status: PaymentStatus.SUCCESS,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_NOT_FOUND });

    paymentRepo.findByOrderId.mockResolvedValue({
      gatewayPaymentId: 'PAY',
      status: PaymentStatus.PENDING,
    });
    paymentRepo.markSuccess.mockResolvedValue(null);
    await expect(
      service.processWebhook({
        eventId: 'e',
        orderId: 'ORD',
        status: PaymentStatus.SUCCESS,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
    paymentRepo.markSuccess.mockResolvedValue({
      _id: new Types.ObjectId(),
      orderId: 'ORD',
      userId: new Types.ObjectId(),
      status: PaymentStatus.SUCCESS,
    });
    await expect(
      service.processWebhook({
        eventId: 'e',
        orderId: 'ORD',
        status: PaymentStatus.SUCCESS,
      }),
    ).resolves.toEqual({ processed: true, status: PaymentStatus.SUCCESS });

    paymentRepo.markFailed.mockResolvedValue(null);
    await expect(
      service.processWebhook({
        eventId: 'e',
        orderId: 'ORD',
        status: PaymentStatus.FAILED,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
    paymentRepo.markFailed.mockResolvedValue({ status: PaymentStatus.FAILED });
    await expect(
      service.processWebhook({
        eventId: 'e',
        orderId: 'ORD',
        status: PaymentStatus.FAILED,
      }),
    ).resolves.toEqual({ processed: true, status: PaymentStatus.FAILED });
  });

  it.each([
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.REFUNDED,
  ])('ignores replayed %s webhooks before side effects', async (status) => {
    paymentRepo.findByOrderId.mockResolvedValue({
      gatewayPaymentId: 'PAY',
      status,
    });

    await expect(
      service.processWebhook({ eventId: 'duplicate', orderId: 'ORD', status }),
    ).resolves.toEqual({ processed: false, duplicate: true, status });
    expect(paymentRepo.markSuccess).not.toHaveBeenCalled();
    expect(paymentRepo.markFailed).not.toHaveBeenCalled();
    expect(paymentRepo.markRefunded).not.toHaveBeenCalled();
    expect(subscriptionsService.purchasePlan).not.toHaveBeenCalled();
    expect(walletService.creditCoinPurchase).not.toHaveBeenCalled();
  });

  it.each([
    [PaymentStatus.REFUNDED, PaymentStatus.SUCCESS],
    [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
    [PaymentStatus.CANCELLED, PaymentStatus.SUCCESS],
    [PaymentStatus.PENDING, PaymentStatus.CANCELLED],
  ])(
    'rejects illegal webhook transition from %s to %s',
    async (currentStatus, requestedStatus) => {
      paymentRepo.findByOrderId.mockResolvedValue({
        orderId: 'ORD',
        status: currentStatus,
      });

      await expect(
        service.processWebhook({
          eventId: 'event-transition',
          orderId: 'ORD',
          status: requestedStatus,
        }),
      ).rejects.toMatchObject({
        code: ErrorCode.PAYMENT_FAILED,
        meta: expect.objectContaining({
          reason: 'invalid_payment_status_transition',
        }),
      });
      expect(paymentRepo.markSuccess).not.toHaveBeenCalled();
      expect(paymentRepo.markFailed).not.toHaveBeenCalled();
      expect(paymentRepo.markRefunded).not.toHaveBeenCalled();
    },
  );

  it('validates coupons and all coupon restrictions', async () => {
    const userId = new Types.ObjectId().toString();
    const plan = {
      _id: new Types.ObjectId(),
      isActive: true,
      isCustom: false,
      price: 100,
      tier: 'gold',
      planType: 'self_service',
    };
    planModel.findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(plan) }),
    });
    couponModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await expect(
      service.validateCoupon(userId, { planId: String(plan._id), code: 'BAD' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    const privateService = service as any;
    await expect(
      privateService.calculateCouponDiscount({ userId, plan, amount: 100 }),
    ).resolves.toMatchObject({ discountAmount: 0 });

    const coupon = {
      title: 'Offer',
      discountType: 'percent',
      discountValue: 20,
      maxDiscountAmount: 10,
    };
    couponModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(coupon) }),
    });
    paymentRepo.countSuccessfulCouponUsage.mockResolvedValue(0);
    await expect(
      privateService.calculateCouponDiscount({
        userId,
        plan,
        amount: 100,
        couponCode: ' save ',
      }),
    ).resolves.toMatchObject({ couponCode: 'SAVE', discountAmount: 10 });
  });

  it('generates invoices, reports, reconciliation, settlements, and refunds', async () => {
    const userId = new Types.ObjectId().toString();
    const paymentId = new Types.ObjectId();
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({ _id: paymentId });
    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue({ invoice: true }) }),
    });
    await expect(service.getInvoice(userId, 'ORD')).resolves.toEqual({
      invoice: true,
    });

    invoiceModel.find.mockReturnValue({
      sort: () => ({
        lean: () => ({
          exec: jest.fn().mockResolvedValue([
            {
              taxableAmount: 100,
              discountAmount: 5,
              gstAmount: 18,
              totalAmount: 113,
            },
            {},
          ]),
        }),
      }),
    });
    await expect(service.adminGstReport({})).resolves.toMatchObject({
      invoiceCount: 2,
      totals: { taxableAmount: 100, totalAmount: 113 },
    });
    paymentRepo.expireStalePending.mockResolvedValue({ modifiedCount: 3 });
    await expect(service.expireStalePendingPayments()).resolves.toEqual({
      expiredCount: 3,
    });
    service.adminListPayments({});
    paymentRepo.findPaymentByOrderId.mockResolvedValue(null);
    await expect(service.adminGetPaymentDetail('ORD')).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_NOT_FOUND,
    });

    paymentRepo.getStatusSummary.mockResolvedValue([
      { _id: PaymentStatus.SUCCESS, count: 8, netAmount: 800 },
      { _id: PaymentStatus.FAILED, count: 2, netAmount: 0 },
    ]);
    paymentRepo.countStalePending.mockResolvedValue(1);
    paymentRepo.countStoreRenewals.mockResolvedValue(2);
    await expect(service.adminReconcilePayments({})).resolves.toMatchObject({
      successRate: 80,
      stalePendingCount: 1,
    });
    paymentRepo.getSettlementBreakdown.mockResolvedValue([
      { _id: { status: PaymentStatus.SUCCESS }, count: 2, amount: 200 },
      { _id: { status: PaymentStatus.REFUNDED }, count: 1, amount: 50 },
    ]);
    await expect(service.adminSettlementReport({})).resolves.toMatchObject({
      totals: {
        transactionCount: 3,
        grossSettled: 200,
        refunded: 50,
        netSettled: 150,
      },
    });

    paymentRepo.findByOrderId.mockResolvedValue({
      orderId: 'ORD',
      status: PaymentStatus.SUCCESS,
      netAmount: 100,
      gateway: PaymentGateway.RAZORPAY,
      userId: new Types.ObjectId(userId),
    });
    paymentRepo.markRefunded.mockResolvedValue({
      orderId: 'ORD',
      status: PaymentStatus.REFUNDED,
      userId: new Types.ObjectId(userId),
    });
    await expect(service.adminInitiateRefund('ORD', {})).resolves.toMatchObject(
      {
        status: PaymentStatus.REFUNDED,
      },
    );
  });

  it('covers private activation, receipt, invoice, and signature boundaries', async () => {
    const privateService = service as any;
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId();
    await privateService.activateSubscriptionIfRequired(userId, {});
    await privateService.activateSubscriptionIfRequired(userId, {
      _id: new Types.ObjectId(),
      purpose: PaymentPurpose.SUBSCRIPTION,
      planId,
      gateway: PaymentGateway.RAZORPAY,
    });
    expect(subscriptionsService.purchasePlan).toHaveBeenCalled();
    await privateService.activateProfileBoostIfRequired(userId, {});
    await privateService.activateProfileBoostIfRequired(userId, {
      purpose: PaymentPurpose.LEARNING_BOOST,
      metadata: { durationHours: 'bad', multiplier: 'bad' },
    });
    expect(profileBoostService.activateBoost).toHaveBeenCalledWith(
      expect.objectContaining({ durationHours: 24, multiplier: 1.25 }),
    );
    await privateService.creditCoinPackIfRequired(userId, {});
    await expect(
      privateService.creditCoinPackIfRequired(userId, {
        purpose: PaymentPurpose.COIN_PACK,
        metadata: {},
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
    await privateService.creditCoinPackIfRequired(userId, {
      purpose: PaymentPurpose.COIN_PACK,
      orderId: 'ORD',
      metadata: { coinAmount: 10 },
    });
    expect(walletService.creditCoinPurchase).toHaveBeenCalled();

    await expect(
      privateService.createInvoiceIfRequired({}),
    ).resolves.toBeUndefined();
    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    invoiceModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    await privateService.createInvoiceIfRequired({
      _id: new Types.ObjectId(),
      orderId: 'ORD_1',
      userId: new Types.ObjectId(userId),
    });
    expect(paymentRepo.attachInvoice).toHaveBeenCalled();

    expect(() =>
      privateService.ensureMobileStoreReceiptAllowed({
        gateway: PaymentGateway.APPLE_IAP,
      }),
    ).toThrow();
    expect(privateService.canAllowUnsignedPaymentVerification()).toBe(true);
  });

  it('validates store product mappings and strict receipt verification', async () => {
    const privateService = service as any;
    const iosPlan = {
      storeProducts: {
        ios: { productId: 'gold.monthly', productType: 'subscription' },
      },
    };

    for (const [plan, dto] of [
      [{ storeProducts: {} }, { gateway: PaymentGateway.APPLE_IAP }],
      [
        {
          storeProducts: {
            ios: { productId: 'coins', productType: 'consumable' },
          },
        },
        { gateway: PaymentGateway.APPLE_IAP, productId: 'coins' },
      ],
      [iosPlan, { gateway: PaymentGateway.APPLE_IAP, productId: 'wrong' }],
      [
        {
          storeProducts: {
            android: {
              productId: 'gold.monthly',
              productType: 'subscription',
              basePlanId: 'monthly',
            },
          },
        },
        {
          gateway: PaymentGateway.GOOGLE_PLAY,
          productId: 'gold.monthly',
          basePlanId: 'annual',
        },
      ],
      [
        iosPlan,
        {
          gateway: PaymentGateway.APPLE_IAP,
          productId: 'gold.monthly',
          offerId: 'intro',
        },
      ],
    ] as const) {
      expect(() =>
        privateService.ensureStoreProductMatchesPlan(plan, dto),
      ).toThrow();
    }

    configService.get.mockReturnValue('sandbox');
    await expect(
      privateService.verifyStoreReceiptWhenRequired({}),
    ).resolves.toBeUndefined();

    configService.get.mockReturnValue('strict');
    storeReceiptVerifier.verify.mockResolvedValue({ transactionId: 'tx' });
    await expect(
      privateService.verifyStoreReceiptWhenRequired({}),
    ).resolves.toEqual({ transactionId: 'tx' });

    storeReceiptVerifier.verify.mockRejectedValue(new Error('invalid'));
    await expect(
      privateService.verifyStoreReceiptWhenRequired({}),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_VERIFICATION_FAILED });
  });

  it('verifies existing and new mobile-store subscriptions', async () => {
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();
    const dto = {
      gateway: PaymentGateway.APPLE_IAP,
      planId,
      productId: 'gold.monthly',
      transactionId: 'tx-1',
      receiptData: 'receipt',
    } as const;
    planModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(planId),
          isActive: true,
          isCustom: false,
          price: 100,
          currency: 'INR',
          storeProducts: {
            ios: { productId: 'gold.monthly', productType: 'subscription' },
          },
        }),
      }),
    });
    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue({
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      planId: new Types.ObjectId(planId),
    });
    await service.verifyStoreSubscription(userId, dto);
    expect(subscriptionsService.reconcileStoreSubscription).toHaveBeenCalled();

    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue({
      userId: new Types.ObjectId(),
    });
    await expect(
      service.verifyStoreSubscription(userId, dto),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_VERIFICATION_FAILED,
    });

    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue(null);
    planModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(planId),
          isActive: true,
          isCustom: false,
          price: 100,
          currency: 'INR',
          storeProducts: {
            ios: { productId: 'gold.monthly', productType: 'subscription' },
          },
        }),
      }),
    });
    paymentRepo.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ ...data, _id: new Types.ObjectId() }),
    );
    await expect(
      service.verifyStoreSubscription(userId, dto),
    ).resolves.toMatchObject({
      storeTransactionId: 'tx-1',
    });

    planModel.findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await expect(
      service.verifyStoreSubscription(userId, dto),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_FAILED,
    });
  });

  it('covers coupon eligibility and redemption denial branches', async () => {
    const privateService = service as any;
    const userId = new Types.ObjectId().toString();
    const plan = {
      _id: new Types.ObjectId(),
      tier: 'gold',
      planType: 'self_service',
      storeProducts: {
        ios: { productId: 'gold.monthly', productType: 'subscription' },
        android: { productId: 'gold.monthly', productType: 'subscription' },
      },
    };
    const baseCoupon = {
      title: 'Offer',
      discountType: 'fixed',
      discountValue: 10,
    };
    const cases = [
      { ...baseCoupon, eligibleTiers: ['platinum'] },
      { ...baseCoupon, eligiblePlanTypes: ['assisted'] },
      { ...baseCoupon, eligiblePlanIds: [new Types.ObjectId()] },
      { ...baseCoupon, maxRedemptions: 1 },
      { ...baseCoupon, maxRedemptionsPerUser: 1 },
    ];
    for (const [index, coupon] of cases.entries()) {
      couponModel.findOne.mockReturnValue({
        lean: () => ({ exec: jest.fn().mockResolvedValue(coupon) }),
      });
      paymentRepo.countSuccessfulCouponUsage.mockReset();
      if (index >= 3) {
        paymentRepo.countSuccessfulCouponUsage
          .mockResolvedValueOnce(index === 3 ? 1 : 0)
          .mockResolvedValueOnce(index === 4 ? 1 : 0);
      }
      await expect(
        privateService.calculateCouponDiscount({
          userId,
          plan,
          amount: 100,
          couponCode: 'SAVE',
        }),
      ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });
    }
  });

  it('covers refund, invoice, webhook-signature, and receipt failure branches', async () => {
    paymentRepo.findByOrderId.mockResolvedValue(null);
    await expect(service.adminInitiateRefund('ORD', {})).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_NOT_FOUND,
    });
    paymentRepo.findByOrderId.mockResolvedValue({
      status: PaymentStatus.SUCCESS,
      netAmount: 100,
      gateway: PaymentGateway.GOOGLE_PLAY,
    });
    await expect(
      service.adminInitiateRefund('ORD', { amount: 0 }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_REFUND_FAILED });
    paymentRepo.markRefunded.mockResolvedValue(null);
    await expect(service.adminInitiateRefund('ORD', {})).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_REFUND_FAILED,
    });

    paymentRepo.findByOrderIdAndUser.mockResolvedValue(null);
    await expect(
      service.getInvoice(new Types.ObjectId().toString(), 'ORD'),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_NOT_FOUND,
    });
    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      _id: new Types.ObjectId(),
    });
    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await expect(
      service.getInvoice(new Types.ObjectId().toString(), 'ORD'),
    ).rejects.toMatchObject({
      code: ErrorCode.PAYMENT_NOT_FOUND,
    });

    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (
        key === 'payments.webhookSecret' ||
        key === 'payments.signatureSecret'
      ) {
        return 'secret';
      }
      return fallback;
    });
    paymentRepo.findByOrderId.mockResolvedValue({});
    await expect(
      service.processWebhook(
        { eventId: 'e', orderId: 'ORD', status: PaymentStatus.SUCCESS },
        undefined,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_VERIFICATION_FAILED });
    expect(
      (service as any).verifySignature({
        orderId: 'ORD',
        paymentId: 'PAY',
        signature: 'invalid',
      }),
    ).toBe(false);

    const privateService = service as any;
    configService.get.mockImplementation((key: string) =>
      key === 'payments.mobileStoreVerificationMode' ? 'disabled' : undefined,
    );
    expect(() => privateService.ensureMobileStoreReceiptAllowed({})).toThrow();
    configService.get.mockImplementation((key: string) =>
      key === 'payments.mobileStoreVerificationMode' ? 'sandbox' : undefined,
    );
    expect(() =>
      privateService.ensureMobileStoreReceiptAllowed({
        gateway: PaymentGateway.GOOGLE_PLAY,
      }),
    ).toThrow();
    configService.get.mockImplementation((key: string) =>
      key === 'payments.mobileStoreVerificationMode' ? 'strict' : undefined,
    );
    expect(() =>
      privateService.ensureMobileStoreReceiptAllowed({
        gateway: PaymentGateway.GOOGLE_PLAY,
        purchaseToken: 'token',
      }),
    ).toThrow();
  });

  it('covers detail, plan restriction, invoice reuse, and signed webhook paths', async () => {
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();
    const payment = {
      _id: new Types.ObjectId(),
      orderId: 'ORD',
      status: PaymentStatus.SUCCESS,
    };

    paymentRepo.findByOrderIdAndUser.mockResolvedValue(payment);
    await expect(service.getUserPaymentDetail(userId, 'ORD')).resolves.toBe(
      payment,
    );

    paymentRepo.findPaymentByOrderId.mockResolvedValue(payment);
    await expect(service.adminGetPaymentDetail('ORD')).resolves.toBe(payment);

    planModel.findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await expect(
      service.validateCoupon(userId, { planId, code: 'SAVE' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    planModel.findById.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ isActive: true, isCustom: true }),
      }),
    });
    await expect(
      service.validateCoupon(userId, { planId, code: 'SAVE' }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue(null);
    await expect(
      service.verifyStoreSubscription(userId, {
        gateway: PaymentGateway.APPLE_IAP,
        planId,
        productId: 'custom.plan',
        transactionId: 'tx-custom',
        receiptData: 'receipt',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    const existingInvoice = { invoiceNumber: 'INV-EXISTING' };
    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(existingInvoice) }),
    });
    await expect(
      (service as any).createInvoiceIfRequired({
        _id: new Types.ObjectId(),
        orderId: 'ORD',
        userId: new Types.ObjectId(userId),
      }),
    ).resolves.toBe(existingInvoice);

    configService.get.mockImplementation((key: string, fallback?: unknown) =>
      key === 'payments.webhookSecret' ? 'secret' : fallback,
    );
    const webhook = {
      eventId: 'event-1',
      orderId: 'ORD',
      status: PaymentStatus.REFUNDED,
    };
    const signature = createPaymentSignature(
      `${webhook.eventId}|${webhook.orderId}|${webhook.status}`,
      'secret',
    );
    expect((service as any).verifyWebhookSignature(webhook, signature)).toBe(
      true,
    );

    paymentRepo.findByOrderId.mockResolvedValue(payment);
    paymentRepo.markRefunded.mockResolvedValue(null);
    await expect(
      service.processWebhook(webhook, signature),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_REFUND_FAILED });
  });

  it('covers optional inputs, provider variants, and production defaults', async () => {
    const privateService = service as any;
    const userId = new Types.ObjectId().toString();
    const planId = new Types.ObjectId().toString();
    const plan = {
      _id: new Types.ObjectId(planId),
      isActive: true,
      isCustom: false,
      price: 100,
      tier: 'gold',
      planType: 'self_service',
      storeProducts: {
        ios: { productId: 'gold.monthly', productType: 'subscription' },
        android: { productId: 'gold.monthly', productType: 'subscription' },
      },
    };

    configService.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
    planModel.findById.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(plan) }),
    });
    paymentRepo.findByIdempotencyKey.mockResolvedValue(null);
    paymentRepo.create.mockImplementation((data: Record<string, unknown>) =>
      Promise.resolve({ ...data, _id: new Types.ObjectId() }),
    );
    await expect(
      service.createOrder(userId, { planId, idempotencyKey: 'new-order' }),
    ).resolves.toMatchObject({ currency: 'INR', taxAmount: 0 });

    paymentRepo.findByOrderIdAndUser.mockResolvedValue({
      status: PaymentStatus.PENDING,
    });
    paymentRepo.markSuccess.mockResolvedValue(null);
    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      if (key === 'payments.allowUnsignedVerification') return true;
      return fallback;
    });
    await expect(
      service.verifyPayment(userId, {
        orderId: 'ORD',
        gatewayPaymentId: 'PAY',
        signature: 'unsigned',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    paymentRepo.findByOrderId.mockResolvedValue({});
    await expect(
      service.processWebhook({
        eventId: 'event',
        orderId: 'ORD',
        status: PaymentStatus.SUCCESS,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.PAYMENT_FAILED });

    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue({
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
    });
    await service.verifyStoreSubscription(userId, {
      gateway: PaymentGateway.APPLE_IAP,
      planId,
      productId: 'gold.monthly',
      transactionId: 'tx-existing',
      receiptData: 'receipt',
    });
    expect(
      subscriptionsService.reconcileStoreSubscription,
    ).toHaveBeenCalledWith(userId, expect.objectContaining({ planId }));

    paymentRepo.findSuccessfulStoreTransaction.mockResolvedValue(null);
    await expect(
      service.verifyStoreSubscription(userId, {
        gateway: PaymentGateway.GOOGLE_PLAY,
        planId,
        productId: 'gold.monthly',
        transactionId: 'tx-google',
        purchaseToken: 'token',
      }),
    ).resolves.toMatchObject({ currency: 'INR' });

    invoiceModel.find.mockReturnValue({
      sort: () => ({
        lean: () => ({ exec: jest.fn().mockResolvedValue([]) }),
      }),
    });
    await service.adminGstReport({
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });
    service.adminListPayments({
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });

    paymentRepo.getStatusSummary.mockResolvedValue([]);
    paymentRepo.countStalePending.mockResolvedValue(0);
    paymentRepo.countStoreRenewals.mockResolvedValue(0);
    await expect(
      service.adminReconcilePayments({
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
      }),
    ).resolves.toMatchObject({ successRate: 0 });

    paymentRepo.getSettlementBreakdown.mockResolvedValue([]);
    await service.adminSettlementReport({
      fromDate: '2026-01-01',
      toDate: '2026-01-31',
    });

    couponModel.findOne.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({
          title: 'Flat offer',
          discountType: 'fixed',
          discountValue: 15,
        }),
      }),
    });
    paymentRepo.countSuccessfulCouponUsage.mockResolvedValue(0);
    await expect(
      privateService.calculateCouponDiscount({
        userId,
        plan,
        amount: 100,
        couponCode: 'FLAT',
      }),
    ).resolves.toMatchObject({ discountAmount: 15 });

    configService.get.mockImplementation((key: string) => {
      if (key === 'payments.mobileStoreVerificationMode') return 'strict';
      if (key === 'payments.mobileStoreStrictVerificationEnabled') return true;
      return undefined;
    });
    expect(() =>
      privateService.ensureMobileStoreReceiptAllowed({
        gateway: PaymentGateway.APPLE_IAP,
        receiptData: 'receipt',
      }),
    ).not.toThrow();

    configService.get.mockReturnValue(undefined);
    invoiceModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await privateService.createInvoiceIfRequired({
      _id: new Types.ObjectId(),
      orderId: 'ORD_DEFAULT_GST',
      userId: new Types.ObjectId(userId),
    });

    await privateService.activateProfileBoostIfRequired(userId, {
      purpose: PaymentPurpose.LEARNING_BOOST,
    });
    expect(profileBoostService.activateBoost).toHaveBeenLastCalledWith(
      expect.objectContaining({ durationHours: 24, multiplier: 1.25 }),
    );
    await privateService.creditCoinPackIfRequired(userId, {
      purpose: PaymentPurpose.COIN_PACK,
      metadata: { coinAmount: 5 },
    });
    expect(walletService.creditCoinPurchase).toHaveBeenLastCalledWith(
      expect.objectContaining({ coins: 5, paymentId: expect.any(String) }),
    );
  });
});
