import { Types } from 'mongoose';
import { AdminAuditService } from './admin-audit.service';

const createListChain = (result: unknown) => {
  const chain = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };
  chain.sort.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  chain.exec.mockResolvedValue(result);
  return chain;
};

describe('AdminAuditService', () => {
  const auditModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  };

  let service: AdminAuditService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AdminAuditService(auditModel as never);
  });

  it('writes audit log with request context metadata', async () => {
    auditModel.create.mockResolvedValue({ _id: 'log-1' });

    await service.write({
      actorId: new Types.ObjectId().toString(),
      action: 'user.status_updated',
      resource: 'user',
      targetId: 'u1',
      req: {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest-agent' },
        requestId: 'r1',
        correlationId: 'c1',
      } as never,
      before: { status: 'active' },
      after: { status: 'blocked' },
    });

    expect(auditModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'user.status_updated',
        resource: 'user',
        targetId: 'u1',
        ipAddress: '127.0.0.1',
        userAgent: 'jest-agent',
        requestId: 'r1',
        correlationId: 'c1',
      }),
    );
  });

  it('lists audit logs with filtering and pagination', async () => {
    const itemsChain = createListChain([{ _id: 'log-1' }]);
    const countExec = jest.fn().mockResolvedValue(1);
    auditModel.find.mockReturnValue(itemsChain);
    auditModel.countDocuments.mockReturnValue({ exec: countExec });
    const actorId = new Types.ObjectId().toString();

    const result = await service.list({
      page: 2,
      limit: 10,
      actorId,
      resource: 'user',
      action: 'user.status_updated',
      targetId: 'u1',
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-06-25T00:00:00.000Z',
    });

    expect(auditModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: 'user',
        action: 'user.status_updated',
        targetId: 'u1',
      }),
    );
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
    expect(result.items).toHaveLength(1);
  });
});
