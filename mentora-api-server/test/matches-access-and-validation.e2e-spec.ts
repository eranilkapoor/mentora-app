import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { MatchesController } from '@/modules/matches/controllers/matches.controller';
import { MatchesService } from '@/modules/matches/services/matches.service';
import { MatchDiscoveryService } from '@/modules/matches/services/match-discovery.service';
import { PremiumMatchCuratorService } from '@/modules/matches/services/premium-match-curator.service';
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

describe('Matches access and validation (e2e)', () => {
  let app: INestApplication;

  const matchesService = {
    getMyMatches: jest.fn(),
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        { provide: MatchesService, useValue: matchesService },
        { provide: MatchDiscoveryService, useValue: discoveryService },
        { provide: PremiumMatchCuratorService, useValue: curatorService },
      ],
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
    matchesService.getMyMatches.mockResolvedValue({ items: [] });
    matchesService.sendInterest.mockResolvedValue({ interestId: 'interest-1' });
  });

  it('returns 403 when jwt guard blocks matches routes', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/matches/my').expect(403);

    expect(matchesService.getMyMatches).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid interest payload', async () => {
    await request(app.getHttpServer())
      .post('/matches/interest')
      .send({ receiverId: 'invalid-id' })
      .expect(400);

    expect(matchesService.sendInterest).not.toHaveBeenCalled();
  });

  it('returns success for authorized list and valid interest flow', async () => {
    const list = await request(app.getHttpServer())
      .get('/matches/my?page=1&limit=20')
      .expect(200);

    const send = await request(app.getHttpServer())
      .post('/matches/interest')
      .send({ receiverId: '507f1f77bcf86cd799439011' })
      .expect(201);

    expect(list.body.success).toBe(true);
    expect(send.body.success).toBe(true);
    expect(matchesService.getMyMatches).toHaveBeenCalledWith('user-1', 1, 20);
    expect(matchesService.sendInterest).toHaveBeenCalledWith(
      'user-1',
      '507f1f77bcf86cd799439011',
    );
  });
});
