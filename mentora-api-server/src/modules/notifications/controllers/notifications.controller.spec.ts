import { NotificationsController } from './notifications.controller';
import { SuccessCode } from '@/common/constants';

describe('NotificationsController', () => {
  const userId = 'user-1';

  const service = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    registerDeviceToken: jest.fn(),
    revokeDeviceToken: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  };

  let controller: NotificationsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new NotificationsController(service as never);
  });

  it('lists notifications and unread count for the current user', async () => {
    const query = { page: 1, limit: 20 } as never;
    service.getUserNotifications.mockResolvedValue({ items: [] });
    service.getUnreadCount.mockResolvedValue(3);

    const list = await controller.getMyNotifications(userId, query);
    const unread = await controller.getUnreadCount(userId);

    expect(service.getUserNotifications).toHaveBeenCalledWith(userId, query);
    expect(service.getUnreadCount).toHaveBeenCalledWith(userId);
    expect(list.code).toBe(SuccessCode.NOTIFICATION_FETCHED);
    expect(unread).toMatchObject({
      code: SuccessCode.NOTIFICATION_FETCHED,
      data: { unreadCount: 3 },
    });
  });

  it('registers and revokes device tokens', async () => {
    const dto = {
      token: 'device-token',
      platform: 'android',
      deviceId: 'device-1',
    } as never;
    service.registerDeviceToken.mockResolvedValue({ registered: true });
    service.revokeDeviceToken.mockResolvedValue({ revoked: true });

    const registered = await controller.registerDeviceToken(userId, dto);
    const revoked = await controller.revokeDeviceToken(userId, dto);

    expect(service.registerDeviceToken).toHaveBeenCalledWith(userId, dto);
    expect(service.revokeDeviceToken).toHaveBeenCalledWith(userId, dto);
    expect(registered.code).toBe(
      SuccessCode.NOTIFICATION_DEVICE_TOKEN_REGISTERED,
    );
    expect(revoked.code).toBe(SuccessCode.NOTIFICATION_DEVICE_TOKEN_REMOVED);
  });

  it('marks one notification or all notifications as read', async () => {
    service.markRead.mockResolvedValue({ read: true });
    service.markAllRead.mockResolvedValue({ modifiedCount: 2 });

    const single = await controller.markRead(userId, 'notification-1');
    const all = await controller.markAllRead(userId);

    expect(service.markRead).toHaveBeenCalledWith(userId, 'notification-1');
    expect(service.markAllRead).toHaveBeenCalledWith(userId);
    expect(single.code).toBe(SuccessCode.NOTIFICATION_READ);
    expect(all.code).toBe(SuccessCode.NOTIFICATION_ALL_READ);
  });
});
