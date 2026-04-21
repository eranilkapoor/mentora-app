import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { buildReq } from 'src/test/helpers/mock-factory';

const mockPaymentService = () => ({
  createOrder: jest.fn(),
  verifyPayment: jest.fn(),
  markPaymentFailed: jest.fn(),
  processWebhook: jest.fn(),
  getUserPayments: jest.fn(),
  getUserPaymentDetail: jest.fn(),
});

const USER_ID = 'user-id-1';

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: ReturnType<typeof mockPaymentService>;

  beforeEach(async () => {
    service = mockPaymentService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createOrder()', () => {
    it('should create payment order', () => {
      const order = { orderId: 'ord-1', amount: 999 };
      service.createOrder.mockReturnValue(order);

      const result = controller.createOrder(
        buildReq() as any,
        { planId: 'plan-1' } as any,
      );
      expect(result).toEqual(order);
      expect(service.createOrder).toHaveBeenCalledWith(USER_ID, {
        planId: 'plan-1',
      });
    });
  });

  describe('verify()', () => {
    it('should verify payment', () => {
      const payment = { status: 'SUCCESS' };
      service.verifyPayment.mockReturnValue(payment);

      const result = controller.verify(buildReq() as any, {} as any);
      expect(result).toEqual(payment);
    });
  });

  describe('markFailed()', () => {
    it('should mark payment as failed', () => {
      service.markPaymentFailed.mockReturnValue({ status: 'FAILED' });
      const result = controller.markFailed(buildReq() as any, {} as any);
      expect(service.markPaymentFailed).toHaveBeenCalledWith(USER_ID, {});
    });
  });

  describe('webhook()', () => {
    it('should process webhook without signature', () => {
      service.processWebhook.mockReturnValue({ success: true });

      const result = controller.webhook({} as any, undefined);
      expect(result).toEqual({ success: true });
      expect(service.processWebhook).toHaveBeenCalledWith({}, undefined);
    });

    it('should process webhook with signature header', () => {
      service.processWebhook.mockReturnValue({ success: true });
      controller.webhook({} as any, 'sig-abc');
      expect(service.processWebhook).toHaveBeenCalledWith({}, 'sig-abc');
    });
  });

  describe('getMyPayments()', () => {
    it('should return user payments', () => {
      const payments = { payments: [], total: 0 };
      service.getUserPayments.mockReturnValue(payments);

      const result = controller.getMyPayments(buildReq() as any, {} as any);
      expect(result).toEqual(payments);
    });
  });

  describe('getPaymentByOrder()', () => {
    it('should return payment detail by orderId', () => {
      const detail = { orderId: 'ord-1', status: 'SUCCESS' };
      service.getUserPaymentDetail.mockReturnValue(detail);

      const result = controller.getPaymentByOrder(buildReq() as any, 'ord-1');
      expect(result).toEqual(detail);
      expect(service.getUserPaymentDetail).toHaveBeenCalledWith(
        USER_ID,
        'ord-1',
      );
    });
  });
});
