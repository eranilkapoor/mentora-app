import { ErrorCode } from '@/common/constants';
import { AdminRefundPaymentDto } from '../dto/admin-refund-payment.dto';
import { CreateOrderDto } from '../dto/create-order.dto';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
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

  const planModel = {
    findById: jest.fn(),
  };

  const couponModel = {
    findOne: jest.fn(),
  };

  const invoiceModel = {
    findOne: jest.fn(),
    create: jest.fn(),
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
    );
  });

  it('rejects createOrder when plan is invalid for subscription purpose', async () => {
    const dto: CreateOrderDto = {
      planId: 'plan-1',
      purpose: PaymentPurpose.SUBSCRIPTION,
      amount: 0,
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

    paymentRepo.findByOrderId.mockResolvedValue({ orderId: 'ORD_1' });
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
});
