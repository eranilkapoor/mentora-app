import { PaymentsController } from './payments.controller';
import { SuccessCode } from '@/common/constants';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

describe('PaymentsController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    createOrder: jest.fn(),
    verifyPayment: jest.fn(),
    verifyStoreSubscription: jest.fn(),
    validateCoupon: jest.fn(),
    markPaymentFailed: jest.fn(),
    processWebhook: jest.fn(),
    getUserPayments: jest.fn(),
    getUserPaymentDetail: jest.fn(),
    getInvoice: jest.fn(),
  };

  let controller: PaymentsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PaymentsController(service as never);
  });

  it('creates an order for the authenticated user', async () => {
    const dto = {
      planId: 'plan-1',
      amount: 499,
      currency: 'INR',
      gateway: PaymentGateway.RAZORPAY,
      purpose: PaymentPurpose.SUBSCRIPTION,
    };
    const data = { orderId: 'order-1' };
    service.createOrder.mockResolvedValue(data);

    const response = await controller.createOrder(req, dto);

    expect(service.createOrder).toHaveBeenCalledWith(userId, dto);
    expect(response).toMatchObject({
      success: true,
      code: SuccessCode.PAYMENT_CREATED,
      data,
    });
  });

  it('verifies web payments for the authenticated user', async () => {
    const dto = {
      orderId: 'order-1',
      gatewayPaymentId: 'pay-1',
      signature: 'signature',
    };
    const data = { status: 'success' };
    service.verifyPayment.mockResolvedValue(data);

    const response = await controller.verify(req, dto);

    expect(service.verifyPayment).toHaveBeenCalledWith(userId, dto);
    expect(response).toMatchObject({
      success: true,
      code: SuccessCode.PAYMENT_VERIFIED,
      data,
    });
  });

  it('passes payment webhooks with the provider signature', async () => {
    const dto = {
      eventId: 'evt-1',
      orderId: 'order-1',
      status: PaymentStatus.SUCCESS,
      payload: { payment: { entity: { id: 'pay-1' } } },
    };
    const data = { processed: true };
    service.processWebhook.mockResolvedValue(data);

    const response = await controller.webhook(dto, 'signed');

    expect(service.processWebhook).toHaveBeenCalledWith(dto, 'signed');
    expect(response).toMatchObject({
      success: true,
      code: SuccessCode.PAYMENT_WEBHOOK_PROCESSED,
      data,
    });
  });

  it('fetches payment detail and invoice by order id', async () => {
    service.getUserPaymentDetail.mockResolvedValue({ orderId: 'order-1' });
    service.getInvoice.mockResolvedValue({ invoiceNo: 'INV-1' });

    const payment = await controller.getPaymentByOrder(req, 'order-1');
    const invoice = await controller.getInvoice(req, 'order-1');

    expect(service.getUserPaymentDetail).toHaveBeenCalledWith(
      userId,
      'order-1',
    );
    expect(service.getInvoice).toHaveBeenCalledWith(userId, 'order-1');
    expect(payment.code).toBe(SuccessCode.PAYMENT_FETCHED);
    expect(invoice.code).toBe(SuccessCode.PAYMENT_INVOICE_FETCHED);
  });

  it('verifies store subscriptions and validates coupons', async () => {
    const storeDto = {
      platform: 'android',
      productId: 'gold-monthly',
      purchaseToken: 'purchase-token',
    } as never;
    const couponDto = { code: 'WELCOME10', planId: 'plan-1' } as never;
    service.verifyStoreSubscription.mockResolvedValue({ active: true });
    service.validateCoupon.mockResolvedValue({ valid: true });

    const verified = await controller.verifyStoreSubscription(req, storeDto);
    const coupon = await controller.validateCoupon(req, couponDto);

    expect(service.verifyStoreSubscription).toHaveBeenCalledWith(
      userId,
      storeDto,
    );
    expect(service.validateCoupon).toHaveBeenCalledWith(userId, couponDto);
    expect(verified.code).toBe(SuccessCode.PAYMENT_VERIFIED);
    expect(coupon.code).toBe(SuccessCode.COUPON_VALIDATED);
  });

  it('records failed payments and lists the current user history', async () => {
    const failDto = {
      orderId: 'order-1',
      reason: 'cancelled',
    } as never;
    const query = { page: 2, limit: 20 } as never;
    service.markPaymentFailed.mockResolvedValue({ recorded: true });
    service.getUserPayments.mockResolvedValue({ items: [] });

    const failed = await controller.markFailed(req, failDto);
    const history = await controller.getMyPayments(req, query);

    expect(service.markPaymentFailed).toHaveBeenCalledWith(userId, failDto);
    expect(service.getUserPayments).toHaveBeenCalledWith(userId, query);
    expect(failed.code).toBe(SuccessCode.PAYMENT_FAILED_RECORDED);
    expect(history.code).toBe(SuccessCode.PAYMENTS_FETCHED);
  });
});
