import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

const mockAdminRepository = () => ({
  findUsers: jest.fn(),
  updateUserStatus: jest.fn(),
});

describe('AdminService', () => {
  let service: AdminService;
  let repo: ReturnType<typeof mockAdminRepository>;

  beforeEach(async () => {
    repo = mockAdminRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: AdminRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getUsers()', () => {
    it('should call repo.findUsers with no filter when no search', () => {
      repo.findUsers.mockReturnValue({ items: [], total: 0 });
      service.getUsers({ page: 1, limit: 10 });
      expect(repo.findUsers).toHaveBeenCalledWith({}, 0, 10);
    });

    it('should add $or filter when search is provided', () => {
      repo.findUsers.mockReturnValue({ items: [], total: 0 });
      service.getUsers({ search: 'john', page: 2, limit: 5 });

      expect(repo.findUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            expect.objectContaining({ email: expect.objectContaining({ $regex: 'john' }) }),
          ]),
        }),
        5, // offset = (2-1)*5
        5,
      );
    });

    it('should use default page=1 and limit=20 when not provided', () => {
      repo.findUsers.mockReturnValue({ items: [], total: 0 });
      service.getUsers({});
      expect(repo.findUsers).toHaveBeenCalledWith({}, 0, 20);
    });
  });

  describe('updateUserStatus()', () => {
    it('should delegate to repo.updateUserStatus', () => {
      const updated = { _id: 'user-1', isBlocked: true };
      repo.updateUserStatus.mockReturnValue(updated);

      const result = service.updateUserStatus({
        userId: 'user-1',
        isBlocked: true,
        isVerified: false,
      } as any);

      expect(result).toEqual(updated);
      expect(repo.updateUserStatus).toHaveBeenCalledWith('user-1', {
        isBlocked: true,
        isVerified: false,
      });
    });
  });

  describe('broadcast()', () => {
    it('should return success response', () => {
      const result = service.broadcast({ title: 'Test', body: 'Hello' } as any);
      expect(result).toEqual({ success: true, message: 'Broadcast sent' });
    });
  });
});
