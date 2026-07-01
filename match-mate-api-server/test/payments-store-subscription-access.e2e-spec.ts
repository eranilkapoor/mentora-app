import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
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

describe('Payments store subscription access (e2e)', () => {
  let app: INestApplication;

  const paymentsService = {
    verifyStoreSubscription: jest.fn(),
  };

  const payload = {
    gateway: 'google_play',
    planId: '507f1f77bcf86cd799439011',
    productId: 'matchmate.premium.monthly',
    basePlanId: 'monthly-base',
    transactionId: 'txn-1001',
    purchaseToken: 'token-xyz',
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ToggleJwtGuardStub.allowed = true;
    paymentsService.verifyStoreSubscription.mockResolvedValue({ active: true });
  });

  it('returns 403 when jwt guard blocks store subscription verification', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer())
      .post('/payments/store/verify-subscription')
      .send(payload)
      .expect(403);

    expect(paymentsService.verifyStoreSubscription).not.toHaveBeenCalled();
  });

  it('returns 400 when required purchase token is missing for google play', async () => {
    const invalidPayload = { ...payload };
    delete (invalidPayload as { purchaseToken?: string }).purchaseToken;

    await request(app.getHttpServer())
      .post('/payments/store/verify-subscription')
      .send(invalidPayload)
      .expect(400);

    expect(paymentsService.verifyStoreSubscription).not.toHaveBeenCalled();
  });

  it('returns success when authenticated request has valid store payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/payments/store/verify-subscription')
      .send(payload)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({ active: true });
    expect(paymentsService.verifyStoreSubscription).toHaveBeenCalledWith(
      'user-1',
      payload,
    );
  });
});
