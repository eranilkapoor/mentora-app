import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

const mockNotificationService = () => ({
  getUserNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
  notify: jest.fn(),
  sendTemplateNotification: jest.fn(),
  listTemplates: jest.fn(),
  getAnalytics: jest.fn(),
  listDeadLetterJobs: jest.fn(),
  getDeadLetterJob: jest.fn(),
  replayDeadLetterJob: jest.fn(),
  replayAllDeadLetterJobs: jest.fn(),
  purgeDeadLetterJobs: jest.fn(),
  upsertTemplate: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
});

const USER_ID = 'user-id-1';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: ReturnType<typeof mockNotificationService>;

  beforeEach(async () => {
    service = mockNotificationService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getMyNotifications()', () => {
    it('should return paginated notifications', async () => {
      const data = { items: [], total: 0 };
      service.getUserNotifications.mockResolvedValue(data);

      const result = await controller.getMyNotifications(USER_ID, {} as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('getUnreadCount()', () => {
    it('should return unread notification count', async () => {
      service.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(USER_ID);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ unreadCount: 5 });
    });
  });

  describe('getSettings()', () => {
    it('should return notification settings', async () => {
      const settings = { email: true, push: true, sms: false };
      service.getSettings.mockResolvedValue(settings);

      const result = await controller.getSettings(USER_ID);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(settings);
    });
  });

  describe('updateSettings()', () => {
    it('should update and return notification settings', async () => {
      const updated = { email: false, push: true };
      service.updateSettings.mockResolvedValue(updated);

      const result = await controller.updateSettings(USER_ID, {
        email: false,
      } as any);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(updated);
    });
  });

  describe('create()', () => {
    it('should queue a new notification', async () => {
      const queued = { jobId: 'job-1' };
      service.notify.mockResolvedValue(queued);

      const result = await controller.create({ userId: USER_ID } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('dispatchTemplate()', () => {
    it('should dispatch a template notification', async () => {
      service.sendTemplateNotification.mockResolvedValue({ jobId: 'job-2' });

      const result = await controller.dispatchTemplate({
        userId: USER_ID,
        templateKey: 'welcome',
      } as any);
      expect(result.success).toBe(true);
    });
  });

  describe('listTemplates()', () => {
    it('should list active templates by default', async () => {
      service.listTemplates.mockResolvedValue([{ key: 'welcome' }]);

      const result = await controller.listTemplates();
      expect(result.success).toBe(true);
      expect(service.listTemplates).toHaveBeenCalledWith(false);
    });

    it('should include inactive templates when param is "true"', async () => {
      service.listTemplates.mockResolvedValue([
        { key: 'welcome', isActive: false },
      ]);

      await controller.listTemplates('true');
      expect(service.listTemplates).toHaveBeenCalledWith(true);
    });
  });

  describe('markRead()', () => {
    it('should mark single notification as read', async () => {
      service.markRead.mockResolvedValue(undefined);

      const result = await controller.markRead(USER_ID, 'notif-1');
      expect(service.markRead).toHaveBeenCalledWith(USER_ID, 'notif-1');
    });
  });

  describe('markAllRead()', () => {
    it('should mark all notifications as read', async () => {
      service.markAllRead.mockResolvedValue(undefined);

      await controller.markAllRead(USER_ID);
      expect(service.markAllRead).toHaveBeenCalledWith(USER_ID);
    });
  });
});
