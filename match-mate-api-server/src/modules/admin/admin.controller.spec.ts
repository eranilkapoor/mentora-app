import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

const mockAdminService = () => ({
  getUsers: jest.fn(),
  updateUserStatus: jest.fn(),
  broadcast: jest.fn(),
});

describe('AdminController', () => {
  let controller: AdminController;
  let service: ReturnType<typeof mockAdminService>;

  beforeEach(async () => {
    service = mockAdminService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUsers()', () => {
    it('should return paginated users', () => {
      const users = { items: [{ _id: 'user-1' }], total: 1 };
      service.getUsers.mockReturnValue(users);

      const result = controller.getUsers({ page: 1, limit: 20 } as any);
      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should pass search filter to service', () => {
      service.getUsers.mockReturnValue({ items: [], total: 0 });
      controller.getUsers({ search: 'john', page: 1, limit: 10 } as any);
      expect(service.getUsers).toHaveBeenCalledWith({ search: 'john', page: 1, limit: 10 });
    });
  });

  describe('updateUser()', () => {
    it('should update user status', () => {
      const updated = { _id: 'user-1', isBlocked: true };
      service.updateUserStatus.mockReturnValue(updated);

      const dto = { userId: 'user-1', isBlocked: true, isVerified: false };
      const result = controller.updateUser(dto as any);
      expect(result).toEqual(updated);
      expect(service.updateUserStatus).toHaveBeenCalledWith(dto);
    });
  });

  describe('broadcast()', () => {
    it('should broadcast a message and return success', () => {
      const response = { success: true, message: 'Broadcast sent' };
      service.broadcast.mockReturnValue(response);

      const result = controller.broadcast({ title: 'Test', body: 'Hello all' } as any);
      expect(result).toEqual(response);
    });
  });
});
