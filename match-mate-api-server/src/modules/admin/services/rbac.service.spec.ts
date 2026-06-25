import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { RbacService } from './rbac.service';

const createQueryChain = (result: unknown) => {
  const chain = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    populate: jest.fn(),
    select: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  chain.find.mockReturnValue(chain);
  chain.findOne.mockReturnValue(chain);
  chain.findById.mockReturnValue(chain);
  chain.findByIdAndDelete.mockReturnValue(chain);
  chain.findByIdAndUpdate.mockReturnValue(chain);
  chain.populate.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);
  chain.exec.mockResolvedValue(result);

  return chain;
};

describe('RbacService', () => {
  const permissionModel = {
    ...createQueryChain(null),
    create: jest.fn(),
  };
  const roleModel = {
    ...createQueryChain(null),
    create: jest.fn(),
  };
  const userModel = {
    ...createQueryChain(null),
  };

  let service: RbacService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RbacService(
      permissionModel as never,
      roleModel as never,
      userModel as never,
    );
  });

  it('creates permission when name is unique', async () => {
    permissionModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });
    permissionModel.create.mockResolvedValue({
      toObject: () => ({ _id: new Types.ObjectId(), name: 'ADMIN_MANAGE' }),
    });

    const result = await service.createPermission({
      name: 'ADMIN_MANAGE',
      module: 'admin',
    });

    expect(result.name).toBe('ADMIN_MANAGE');
  });

  it('rejects duplicate permission create', async () => {
    permissionModel.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'p1' }),
    });

    await expect(
      service.createPermission({ name: 'ADMIN_MANAGE', module: 'admin' }),
    ).rejects.toMatchObject({ code: ErrorCode.ADMIN_OPERATION_FAILED });
  });

  it('deletes permission when not attached to active role', async () => {
    roleModel.findOne.mockReturnValue(createQueryChain(null));
    permissionModel.findByIdAndDelete.mockReturnValue(
      createQueryChain({ _id: 'p1' }),
    );

    const result = await service.deletePermission('p1');

    expect(result).toEqual({ deleted: true });
  });

  it('creates role after validating permission ids', async () => {
    roleModel.findOne
      .mockReturnValueOnce(createQueryChain(null))
      .mockReturnValueOnce(createQueryChain(null));
    permissionModel.find.mockReturnValue(
      createQueryChain([{ _id: new Types.ObjectId() }]),
    );
    roleModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    roleModel.findById.mockReturnValue(
      createQueryChain({
        _id: new Types.ObjectId(),
        name: 'moderator',
        permissions: [],
      }),
    );

    const permissionId = new Types.ObjectId().toString();
    const result = await service.createRole({
      name: 'moderator',
      permissions: [permissionId],
    });

    expect(result.name).toBe('moderator');
  });

  it('rejects role fetch when id is missing', async () => {
    roleModel.findById.mockReturnValue(createQueryChain(null));

    await expect(service.getRoleById('missing')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
  });

  it('assigns user roles and deduplicates permissions', async () => {
    const roleId = new Types.ObjectId().toString();
    userModel.findById.mockReturnValue(createQueryChain({ _id: 'u1' }));
    roleModel.find.mockReturnValue(
      createQueryChain([
        {
          _id: roleId,
          permissions: [{ name: 'PAYMENT_VIEW' }, { name: 'PAYMENT_REFUND' }],
        },
        {
          _id: new Types.ObjectId().toString(),
          permissions: [{ name: 'PAYMENT_VIEW' }],
        },
      ]),
    );
    userModel.findByIdAndUpdate.mockReturnValue(
      createQueryChain({
        _id: 'u1',
        permissions: ['PAYMENT_VIEW', 'PAYMENT_REFUND'],
      }),
    );

    const result = await service.assignRoles('u1', [
      roleId,
      new Types.ObjectId().toString(),
    ]);

    expect(result).toMatchObject({ _id: 'u1' });
    const updateCalls = userModel.findByIdAndUpdate.mock.calls as unknown[];
    const firstUpdateCall = updateCalls[0] as unknown[];
    const userIdArg = firstUpdateCall[0];
    const updateArg = firstUpdateCall[1] as Record<string, unknown>;
    const optionsArg = firstUpdateCall[2];
    const setArg = updateArg.$set as Record<string, unknown>;

    expect(userIdArg).toBe('u1');
    expect(Array.isArray(setArg.roles)).toBe(true);
    expect(setArg.permissions).toEqual(['PAYMENT_VIEW', 'PAYMENT_REFUND']);
    expect(optionsArg).toEqual({ new: true, runValidators: true });
  });

  it('rejects revoke roles when user is missing', async () => {
    userModel.findById.mockReturnValue(createQueryChain(null));

    await expect(service.revokeRoles('missing')).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
  });
});
