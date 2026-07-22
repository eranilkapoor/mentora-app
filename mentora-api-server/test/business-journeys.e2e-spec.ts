import { CanActivate, ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import { AppLogger } from '@/common/logger/logger.service';
import { ProfilesController } from '@/modules/profiles/controllers/profiles.controller';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';
import { MatchesController } from '@/modules/matches/controllers/matches.controller';
import { MatchesService } from '@/modules/matches/services/matches.service';
import { MatchDiscoveryService } from '@/modules/matches/services/match-discovery.service';
import { PremiumMatchCuratorService } from '@/modules/matches/services/premium-match-curator.service';
import { SupportTicketController } from '@/modules/support/controllers/support-ticket.controller';
import { SupportTicketService } from '@/modules/support/services/support-ticket.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { sub: 'user-1' };
    return true;
  }
}

describe('P0 business flows (e2e)', () => {
  let app: INestApplication;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getRefreshCookieOptions: jest.fn(),
  };

  const profilesService = {
    updatePersonalInfo: jest.fn(),
  };

  const matchesService = {
    sendInterest: jest.fn(),
    respondToInterest: jest.fn(),
  };

  const discoveryService = {
    getRecommendedMatches: jest.fn(),
    getNewMatches: jest.fn(),
    getNearbyMatches: jest.fn(),
    getOnlineMatches: jest.fn(),
  };

  const curatorService = {
    getCuratedMatches: jest.fn(),
    dismissCuratedMatch: jest.fn(),
  };

  const supportService = {
    createTicket: jest.fn(),
    listTickets: jest.fn(),
    getTicket: jest.fn(),
    replyToTicket: jest.fn(),
    closeTicket: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        AuthController,
        ProfilesController,
        MatchesController,
        SupportTicketController,
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: AppLogger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
        { provide: ProfilesService, useValue: profilesService },
        { provide: MatchesService, useValue: matchesService },
        { provide: MatchDiscoveryService, useValue: discoveryService },
        { provide: PremiumMatchCuratorService, useValue: curatorService },
        { provide: SupportTicketService, useValue: supportService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
      .overrideGuard(FeatureGuard)
      .useClass(AuthenticatedGuardStub)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authService.getRefreshCookieOptions.mockReturnValue({ httpOnly: true });
  });

  it('executes auth register, login, refresh, and logout lifecycle', async () => {
    authService.register.mockResolvedValue({ userId: 'user-1' });
    authService.login.mockResolvedValue({ accessToken: 'access-1' });
    authService.refresh.mockResolvedValue({
      success: true,
      code: 'AUTH_LOGIN_SUCCESS',
      data: { accessToken: 'access-2' },
    });
    authService.logout.mockResolvedValue(undefined);

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        password: 'Pass@12345',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user1@example.com', password: 'Pass@12345' })
      .expect(201);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('x-refresh-token', 'refresh-token-1')
      .expect(201);

    const logout = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('x-refresh-token', 'refresh-token-1')
      .expect(201);

    expect(register.body.success).toBe(true);
    expect(login.body.success).toBe(true);
    expect(refresh.body).toMatchObject({
      success: true,
      data: { accessToken: 'access-2' },
    });
    expect(logout.body.success).toBe(true);
    expect(authService.refresh).toHaveBeenCalled();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('updates profile personal section for authenticated user', async () => {
    profilesService.updatePersonalInfo.mockResolvedValue({
      personal: { firstName: 'Updated' },
    });

    const response = await request(app.getHttpServer())
      .put('/profiles/personal')
      .send({ firstName: 'Updated' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(profilesService.updatePersonalInfo).toHaveBeenCalledWith(
      expect.any(Object),
      'user-1',
      { firstName: 'Updated' },
    );
  });

  it('sends and accepts an interest to simulate match progression', async () => {
    matchesService.sendInterest.mockResolvedValue({
      _id: 'interest-1',
      senderId: 'user-1',
      receiverId: 'user-2',
    });
    matchesService.respondToInterest.mockResolvedValue({
      _id: 'match-1',
      users: ['user-1', 'user-2'],
      status: 'ACTIVE',
    });

    const send = await request(app.getHttpServer())
      .post('/matches/interest')
      .send({ receiverId: 'user-2' })
      .expect(201);

    const accept = await request(app.getHttpServer())
      .post('/matches/interest/respond')
      .send({ interestId: 'interest-1', action: 'ACCEPT' })
      .expect(200);

    expect(send.body.success).toBe(true);
    expect(accept.body.success).toBe(true);
    expect(matchesService.sendInterest).toHaveBeenCalledWith('user-1', 'user-2');
    expect(matchesService.respondToInterest).toHaveBeenCalledWith(
      'user-1',
      'interest-1',
      'ACCEPT',
    );
  });

  it('completes support ticket lifecycle create, reply, and close', async () => {
    supportService.createTicket.mockResolvedValue({ _id: 'ticket-1' });
    supportService.replyToTicket.mockResolvedValue({ _id: 'ticket-1' });
    supportService.closeTicket.mockResolvedValue({
      _id: 'ticket-1',
      status: 'closed',
    });

    const create = await request(app.getHttpServer())
      .post('/support/tickets')
      .send({
        subject: 'Need help',
        category: 'technical',
        message: 'App issue',
      })
      .expect(201);

    const reply = await request(app.getHttpServer())
      .post('/support/tickets/ticket-1/replies')
      .send({ message: 'Any update?' })
      .expect(200);

    const close = await request(app.getHttpServer())
      .patch('/support/tickets/ticket-1/close')
      .expect(200);

    expect(create.body.success).toBe(true);
    expect(reply.body.success).toBe(true);
    expect(close.body.success).toBe(true);
    expect(supportService.createTicket).toHaveBeenCalled();
    expect(supportService.replyToTicket).toHaveBeenCalled();
    expect(supportService.closeTicket).toHaveBeenCalledWith('user-1', 'ticket-1');
  });
});
