import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PaymentsController } from '@/modules/payments/controllers/payments.controller';
import { PaymentsService } from '@/modules/payments/services/payments.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

class ToggleJwtGuardStub implements CanActivate {
  static allowed = true;

  canActivate(context: ExecutionContext): boolean {
    if (!ToggleJwtGuardStub.allowed) {
      return false;
    }

    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'user-1' };
    return true;
  }
}

describe('Payments verify access and failure handling (e2e)', () => {
  let app: INestApplication;

  const paymentsService = {
    verifyPayment: jest.fn(),
  };

  const verifyPayload = {
    orderId: 'order-1',
    gatewayPaymentId: 'pay-1',
    signature: 'signature-1',
    method: 'upi',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: paymentsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(ToggleJwtGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ToggleJwtGuardStub.allowed = true;
    paymentsService.verifyPayment.mockResolvedValue({ verified: true });
  });

  it('returns 403 when jwt guard blocks verify requests', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer())
      .post('/payments/verify')
      .send(verifyPayload)
      .expect(403);

    expect(paymentsService.verifyPayment).not.toHaveBeenCalled();
  });

  it('returns 400 when verification fails with invalid payment signature', async () => {
    paymentsService.verifyPayment.mockRejectedValue(
      new BadRequestException('Invalid payment signature'),
    );

    const response = await request(app.getHttpServer())
      .post('/payments/verify')
      .send(verifyPayload)
      .expect(400);

    expect(response.body.message).toContain('Invalid payment signature');
    expect(paymentsService.verifyPayment).toHaveBeenCalledWith('user-1', {
      orderId: 'order-1',
      gatewayPaymentId: 'pay-1',
      signature: 'signature-1',
      method: 'upi',
    });
  });

  it('returns success when verification passes for authenticated users', async () => {
    const response = await request(app.getHttpServer())
      .post('/payments/verify')
      .send(verifyPayload)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({ verified: true });
  });
});
