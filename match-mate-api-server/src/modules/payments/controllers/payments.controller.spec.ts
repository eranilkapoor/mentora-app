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
});
