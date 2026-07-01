import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { MatchesController } from '@/modules/matches/controllers/matches.controller';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { MatchesService } from '@/modules/matches/services/matches.service';
import { MatchRepository } from '@/modules/matches/repositories/match.repository';
import { MatchDiscoveryService } from '@/modules/matches/services/match-discovery.service';
import { PremiumMatchCuratorService } from '@/modules/matches/services/premium-match-curator.service';
import { MatchNotificationService } from '@/modules/matches/services/match-notification.service';
import { FeatureService } from '@/modules/subscriptions/services/feature.service';
import { MatchCompatibilityService } from '@/modules/matches/services/match-compatibility.service';
import { SettingsService } from '@/modules/settings/services/settings.service';
import { ConfigService } from '@nestjs/config';
import { Interest, InterestSchema } from '@/modules/matches/schemas/interest.schema';
import { Match, MatchSchema } from '@/modules/matches/schemas/match.schema';
import { Profile, ProfileSchema } from '@/modules/profiles/schemas/profile/profile.schema';
import { Preference, PreferenceSchema } from '@/modules/profiles/schemas/preference/preference.schema';
import { Media, MediaSchema } from '@/modules/profiles/schemas/media/media.schema';
import { Interaction, InteractionSchema } from '@/modules/profiles/schemas/interaction/interaction.schema';

class HeaderUserGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const userId = req.headers['x-test-user'] as string | undefined;
    req.user = { sub: userId ?? '507f1f77bcf86cd799439012' };
    return true;
  }
}

describe('Matches interest lifecycle DB-backed (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  const settingsService = {
    isBlockedBetween: jest.fn(async () => false),
    isHiddenBetween: jest.fn(async () => false),
    getUnavailableRelationUserIds: jest.fn(async () => []),
  };

  const featureService = {
    checkAccess: jest.fn(async () => ({ allowed: true })),
  };

  const matchNotificationService = {
    notifyInterestSent: jest.fn(async () => undefined),
    notifyInterestResponded: jest.fn(async () => undefined),
    notifyUnmatched: jest.fn(async () => undefined),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: mongoServer.getUri() }),
        }),
        MongooseModule.forFeature([
          { name: Interest.name, schema: InterestSchema },
          { name: Match.name, schema: MatchSchema },
          { name: Profile.name, schema: ProfileSchema },
          { name: Preference.name, schema: PreferenceSchema },
          { name: Media.name, schema: MediaSchema },
          { name: Interaction.name, schema: InteractionSchema },
        ]),
      ],
      controllers: [MatchesController],
      providers: [
        MatchesService,
        MatchRepository,
        { provide: SettingsService, useValue: settingsService },
        { provide: MatchNotificationService, useValue: matchNotificationService },
        { provide: FeatureService, useValue: featureService },
        { provide: MatchCompatibilityService, useValue: {} },
        { provide: MatchDiscoveryService, useValue: {} },
        { provide: PremiumMatchCuratorService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string, fallback?: unknown) => (key === 'matches.expiryEnabled' ? false : fallback)) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(HeaderUserGuardStub)
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

    connection = app.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await connection?.db?.dropDatabase();
  });

  afterAll(async () => {
    await app?.close();
    await mongoServer?.stop();
  });

  it('persists send, accept, and list match lifecycle', async () => {
    const senderId = '507f1f77bcf86cd799439012';
    const receiverId = '507f1f77bcf86cd799439013';

    const send = await request(app.getHttpServer())
      .post('/matches/interest')
      .set('x-test-user', senderId)
      .send({ receiverId })
      .expect(201);

    expect(send.body.success).toBe(true);
    const interestId = send.body.data._id as string;

    const accept = await request(app.getHttpServer())
      .post('/matches/interest/respond')
      .set('x-test-user', receiverId)
      .send({ interestId, action: 'ACCEPT' })
      .expect(200);

    expect(accept.body.success).toBe(true);
    expect(accept.body.data.status).toBe('accepted');

    const myMatches = await request(app.getHttpServer())
      .get('/matches/my?page=1&limit=20')
      .set('x-test-user', senderId)
      .expect(200);

    expect(myMatches.body.success).toBe(true);
    expect(myMatches.body.data).toHaveLength(1);
    expect(myMatches.body.data[0].matchedUserId).toBe(receiverId);
    expect(myMatches.body.meta.total).toBe(1);
  });
});
