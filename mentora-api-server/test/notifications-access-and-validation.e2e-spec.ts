import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NotificationsController } from '@/modules/notifications/controllers/notifications.controller';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
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

describe('Notifications access and validation (e2e)', () => {
  let app: INestApplication;

  const notificationsService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    registerDeviceToken: jest.fn(),
    revokeDeviceToken: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: notificationsService },
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
    notificationsService.getUserNotifications.mockResolvedValue({ items: [] });
    notificationsService.registerDeviceToken.mockResolvedValue({
      registered: true,
    });
  });

  it('returns 403 when jwt guard blocks notifications routes', async () => {
    ToggleJwtGuardStub.allowed = false;

    await request(app.getHttpServer()).get('/notifications').expect(403);

    expect(notificationsService.getUserNotifications).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid device token payload', async () => {
    await request(app.getHttpServer())
      .post('/notifications/device-tokens')
      .send({
        token: 'short',
        deviceId: 'device-1',
        platform: 'android',
      })
      .expect(400);

    expect(notificationsService.registerDeviceToken).not.toHaveBeenCalled();
  });

  it('returns success for authorized notifications list and valid device token registration', async () => {
    const list = await request(app.getHttpServer())
      .get('/notifications?page=1&limit=20&unreadOnly=false')
      .expect(200);

    const register = await request(app.getHttpServer())
      .post('/notifications/device-tokens')
      .send({
        token: 'abcdefghijklmnopqrstuvwxyz1234567890',
        deviceId: 'device-1',
        platform: 'android',
      })
      .expect(201);

    expect(list.body.success).toBe(true);
    expect(register.body.success).toBe(true);
    expect(notificationsService.getUserNotifications).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ page: 1, limit: 20, unreadOnly: false }),
    );
    expect(notificationsService.registerDeviceToken).toHaveBeenCalledWith(
      'user-1',
      {
        token: 'abcdefghijklmnopqrstuvwxyz1234567890',
        deviceId: 'device-1',
        platform: 'android',
      },
    );
  });
});
