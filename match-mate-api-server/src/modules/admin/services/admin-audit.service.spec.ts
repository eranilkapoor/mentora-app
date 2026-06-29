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

  it('writes optional audit fields as undefined without request context', async () => {
    auditModel.create.mockResolvedValue({ _id: 'log-2' });

    await service.write({
      actorId: new Types.ObjectId().toString(),
      action: 'user.viewed',
      resource: 'user',
      before: null,
      after: null,
    });

    expect(auditModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        before: undefined,
        after: undefined,
        ipAddress: undefined,
        userAgent: undefined,
        requestId: undefined,
        correlationId: undefined,
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

  it('uses pagination defaults and ignores an invalid actor ID', async () => {
    const itemsChain = createListChain([]);
    auditModel.find.mockReturnValue(itemsChain);
    auditModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    const result = await service.list({ actorId: 'invalid' });

    expect(auditModel.find).toHaveBeenCalledWith({});
    expect(itemsChain.skip).toHaveBeenCalledWith(0);
    expect(itemsChain.limit).toHaveBeenCalledWith(25);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 25,
      total: 0,
      totalPages: 0,
    });
  });

  it.each([
    [{ from: '2026-06-01T00:00:00.000Z' }, '$gte'],
    [{ to: '2026-06-25T00:00:00.000Z' }, '$lte'],
  ])('supports one-sided date filters', async (query, operator) => {
    auditModel.find.mockReturnValue(createListChain([]));
    auditModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });

    await service.list(query);

    const findCalls = auditModel.find.mock.calls as unknown[][];
    const filter = findCalls[0]?.[0] as {
      createdAt: Record<string, Date>;
    };
    expect(filter.createdAt[operator]).toBeInstanceOf(Date);
  });
});
