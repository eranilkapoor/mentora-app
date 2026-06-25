import { SuccessCode } from '@/common/constants';
import { AdminController } from './admin.controller';

describe('AdminController', () => {
  const adminService = {
    getDashboard: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUserStatus: jest.fn(),
    broadcast: jest.fn(),
  };

  const auditService = {
    list: jest.fn(),
  };

  let controller: AdminController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminController(
      adminService as never,
      auditService as never,
    );
  });

  it('gets dashboard data', async () => {
    adminService.getDashboard.mockResolvedValue({ users: 1 });

    const response = await controller.getDashboard({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-25T00:00:00.000Z',
    });

    expect(adminService.getDashboard).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.ADMIN_DASHBOARD_FETCHED);
  });

  it('gets audit logs', async () => {
    auditService.list.mockResolvedValue({ items: [] });

    const response = await controller.getAuditLogs({ page: 1, limit: 10 });

    expect(auditService.list).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(response.code).toBe(SuccessCode.ADMIN_AUDIT_LOGS_FETCHED);
  });

  it('gets users', async () => {
    adminService.getUsers.mockResolvedValue({ data: [] });

    const response = await controller.getUsers({ page: 1, limit: 20 });

    expect(adminService.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(response.code).toBe(SuccessCode.ADMIN_USERS_FETCHED);
  });

  it('gets single user by id', async () => {
    adminService.getUserById.mockResolvedValue({ user: { _id: 'u1' } });

    const response = await controller.getUserById('u1');

    expect(adminService.getUserById).toHaveBeenCalledWith('u1');
    expect(response.code).toBe(SuccessCode.ADMIN_USER_FETCHED);
  });

  it('updates user status with actor context', async () => {
    adminService.updateUserStatus.mockResolvedValue({ status: 'blocked' });
    const req = { user: { sub: 'admin-1' } };

    const response = await controller.updateUserStatus(req as never, {
      userId: 'u1',
      isBlocked: true,
      reason: 'abuse',
    });

    expect(adminService.updateUserStatus).toHaveBeenCalledWith(
      { userId: 'u1', isBlocked: true, reason: 'abuse' },
      'admin-1',
      req,
    );
    expect(response.code).toBe(SuccessCode.ADMIN_USER_UPDATED);
  });

  it('broadcasts notifications', () => {
    adminService.broadcast.mockReturnValue({ success: true });
    const req = { user: { sub: 'admin-1' } };

    const response = controller.broadcast(req as never, {
      title: 'Update',
      message: 'Hello users',
    });

    expect(adminService.broadcast).toHaveBeenCalledWith(
      { title: 'Update', message: 'Hello users' },
      'admin-1',
      req,
    );
    expect(response.code).toBe(SuccessCode.ADMIN_BROADCAST_SENT);
  });
});
