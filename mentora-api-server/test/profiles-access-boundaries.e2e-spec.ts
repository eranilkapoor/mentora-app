import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ProfilesController } from '@/modules/profiles/controllers/profiles.controller';
import { ProfilesService } from '@/modules/profiles/services/profiles.service';
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

describe('Profiles access boundaries (e2e)', () => {
  let app: INestApplication;

  const profilesService = {
    getMyProfile: jest.fn(),
    updatePersonalInfo: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [{ provide: ProfilesService, useValue: profilesService }],
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
    profilesService.getMyProfile.mockResolvedValue({ profileId: 'profile-1' });
    profilesService.updatePersonalInfo.mockResolvedValue({ updated: true });
  });

  it('returns 403 when jwt guard blocks profiles routes', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/profiles/me').expect(403);

    expect(profilesService.getMyProfile).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid personal profile payload', async () => {
    await request(app.getHttpServer())
      .put('/profiles/personal')
      .send({
        profileFor: 'SELF',
        firstName: 'Sam',
        gender: 'MALE',
        dateOfBirth: '2026/01/01',
      })
      .expect(400);

    expect(profilesService.updatePersonalInfo).not.toHaveBeenCalled();
  });

  it('returns success for authorized profile fetch route', async () => {
    const response = await request(app.getHttpServer())
      .get('/profiles/me')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(profilesService.getMyProfile).toHaveBeenCalledWith('user-1');
  });
});
