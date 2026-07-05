import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PaymentsController } from '@/modules/payments/controllers/payments.controller';
import { PaymentsService } from '@/modules/payments/services/payments.service';
import { GooglePlayRtdnService } from '@/modules/payments/services/google-play-rtdn.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'user-1' };
    return true;
  }
}

describe('Payments webhook idempotency (e2e)', () => {
  let app: INestApplication;

  const processedEventIds = new Set<string>();

  const paymentsService = {
    processWebhook: jest.fn(
      async (dto: { eventId: string; orderId: string; status: string }) => {
        const replay = processedEventIds.has(dto.eventId);
        processedEventIds.add(dto.eventId);

        return {
          processed: true,
          eventId: dto.eventId,
          orderId: dto.orderId,
          status: dto.status,
          isIdempotentReplay: replay,
        };
      },
    ),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: paymentsService },
        {
          provide: GooglePlayRtdnService,
          useValue: { handleMessage: jest.fn() },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    processedEventIds.clear();
  });

  it('processes first webhook call and marks duplicate replay as idempotent', async () => {
    const payload = {
      eventId: 'evt-1001',
      orderId: 'order-1',
      status: 'SUCCESS',
    };

    const first = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-payment-signature', 'signed')
      .send(payload)
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/payments/webhook')
      .set('x-payment-signature', 'signed')
      .send(payload)
      .expect(201);

    expect(first.body.success).toBe(true);
    expect(first.body.data).toMatchObject({
      eventId: 'evt-1001',
      isIdempotentReplay: false,
    });

    expect(second.body.success).toBe(true);
    expect(second.body.data).toMatchObject({
      eventId: 'evt-1001',
      isIdempotentReplay: true,
    });

    expect(paymentsService.processWebhook).toHaveBeenCalledTimes(2);
  });
});
