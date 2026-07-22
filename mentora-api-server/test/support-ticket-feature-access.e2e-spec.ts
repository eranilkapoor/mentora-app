import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SupportTicketController } from '@/modules/support/controllers/support-ticket.controller';
import { SupportTicketService } from '@/modules/support/services/support-ticket.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: 'user-1' };
    return true;
  }
}

class ToggleFeatureGuardStub implements CanActivate {
  static allowed = true;

  canActivate(): boolean {
    return ToggleFeatureGuardStub.allowed;
  }
}

describe('Support ticket feature access (e2e)', () => {
  let app: INestApplication;

  const supportService = {
    createTicket: jest.fn(),
    listTickets: jest.fn(),
    getTicket: jest.fn(),
    replyToTicket: jest.fn(),
    closeTicket: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SupportTicketController],
      providers: [{ provide: SupportTicketService, useValue: supportService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .overrideGuard(FeatureGuard)
      .useClass(ToggleFeatureGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ToggleFeatureGuardStub.allowed = true;
    supportService.createTicket.mockResolvedValue({ _id: 'ticket-1' });
  });

  it('returns 403 when feature guard blocks support ticket access', async () => {
    ToggleFeatureGuardStub.allowed = false;

    await request(app.getHttpServer())
      .post('/support/tickets')
      .send({
        subject: 'Need urgent support',
        category: 'technical',
        message: 'I cannot access my account after payment update.',
      })
      .expect(403);

    expect(supportService.createTicket).not.toHaveBeenCalled();
  });

  it('creates ticket successfully when feature guard allows access', async () => {
    const response = await request(app.getHttpServer())
      .post('/support/tickets')
      .send({
        subject: 'Need urgent support',
        category: 'technical',
        message: 'I cannot access my account after payment update.',
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(supportService.createTicket).toHaveBeenCalledWith('user-1', {
      subject: 'Need urgent support',
      category: 'technical',
      message: 'I cannot access my account after payment update.',
    });
  });
});
