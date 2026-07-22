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
import { ProfilesController } from '@/modules/profiles/controllers/profiles.controller';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';
import { ProfileRepository } from '@/modules/profiles/repositories/profile.repository';
import {
  Profile,
  ProfileSchema,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  ActivityLog,
  ActivityLogSchema,
} from '@/modules/profiles/schemas/settings/activity-logs.schema';
import {
  Verification,
  VerificationSchema,
} from '@/modules/safety/schemas/verification.schema';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';
import { UserRepository } from '@/modules/auth/repositories/user.repository';
import { MediaService } from '@/modules/profiles/services/media.service';
import { PreferenceService } from '@/modules/profiles/services/preference.service';
import { ProfileScoringService } from '@/modules/profiles/services/profile-scoring.service';
import { SettingsService } from '@/modules/settings/services/settings.service';
import { AppLogger } from '@/common/logger/logger.service';

class AuthenticatedGuardStub implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { sub: '507f1f77bcf86cd799439012' };
    return true;
  }
}

describe('Profile journey DB-backed (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  const cacheStore = new Map<string, unknown>();
  const cacheService = {
    get: jest.fn(async (key: string) => cacheStore.get(key) ?? null),
    set: jest.fn(async (key: string, value: unknown) => {
      cacheStore.set(key, value);
    }),
    del: jest.fn(async (key: string) => {
      cacheStore.delete(key);
    }),
  };

  const userRepo = {
    findById: jest.fn(async () => ({ isEmailVerified: true, isPhoneVerified: false })),
  };

  const mediaService = {
    getImages: jest.fn(async () => []),
    getVideos: jest.fn(async () => []),
  };

  const analyticsService = {
    trackEvent: jest.fn(async () => undefined),
  };

  const notificationsService = {
    notify: jest.fn(async () => undefined),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: mongoServer.getUri() }),
        }),
        MongooseModule.forFeature([
          { name: Profile.name, schema: ProfileSchema },
          { name: ActivityLog.name, schema: ActivityLogSchema },
          { name: Verification.name, schema: VerificationSchema },
        ]),
      ],
      controllers: [ProfilesController],
      providers: [
        ProfilesService,
        ProfileRepository,
        ProfileScoringService,
        { provide: CACHE_SERVICE, useValue: cacheService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: UserRepository, useValue: userRepo },
        { provide: MediaService, useValue: mediaService },
        { provide: PreferenceService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        {
          provide: AppLogger,
          useValue: {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AuthenticatedGuardStub)
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
    cacheStore.clear();
    await connection?.db?.dropDatabase();
  });

  afterAll(async () => {
    await app?.close();
    await mongoServer?.stop();
  });

  it('persists create, update, and get profile journey', async () => {
    const create = await request(app.getHttpServer())
      .post('/profiles')
      .send({
        personal: {
          profileFor: 'self',
          firstName: 'Aman',
          gender: 'male',
          dateOfBirth: '1995-01-15',
          religion: 'hindu',
          maritalStatus: 'never_married',
        },
        physical: {
          height: 175,
        },
        education: {
          qualification: 'btech',
          occupation: 'Engineer',
        },
      })
      .expect(201);

    expect(create.body.success).toBe(true);
    expect(create.body.data.personal.firstName).toBe('Aman');

    const update = await request(app.getHttpServer())
      .put('/profiles/personal')
      .set('x-platform', 'web')
      .send({
        profileFor: 'self',
        firstName: 'Aman Updated',
        gender: 'male',
        dateOfBirth: '1995-01-15',
        religion: 'hindu',
        maritalStatus: 'never_married',
      })
      .expect(200);

    expect(update.body.success).toBe(true);
    expect(update.body.data.personal.firstName).toBe('Aman Updated');

    const profile = await request(app.getHttpServer())
      .get('/profiles/me')
      .expect(200);

    expect(profile.body.success).toBe(true);
    expect(profile.body.data.personal.firstName).toBe('Aman Updated');
    expect(profile.body.data.accountVerification).toMatchObject({
      emailVerified: true,
      phoneVerified: false,
    });
  });
});
