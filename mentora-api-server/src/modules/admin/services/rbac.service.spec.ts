/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  it('lists and fetches permissions with module/not-found paths', async () => {
    permissionModel.find.mockReturnValue(createQueryChain([{ name: 'VIEW' }]));
    await expect(service.getPermissions()).resolves.toEqual([{ name: 'VIEW' }]);
    expect(permissionModel.find).toHaveBeenLastCalledWith({ isActive: true });
    await service.getPermissions('admin');
    expect(permissionModel.find).toHaveBeenLastCalledWith({
      module: 'admin',
      isActive: true,
    });
    permissionModel.findById.mockReturnValue(createQueryChain({ _id: 'p1' }));
    await expect(service.getPermissionById('p1')).resolves.toMatchObject({
      _id: 'p1',
    });
    permissionModel.findById.mockReturnValue(createQueryChain(null));
    await expect(service.getPermissionById('missing')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
  });

  it('protects assigned permissions and reports missing deletes', async () => {
    const assignedService = new RbacService(
      permissionModel as never,
      {
        findOne: jest.fn(() => ({
          lean: () => ({
            exec: jest.fn().mockResolvedValue({ name: 'admin' }),
          }),
        })),
      } as never,
      userModel as never,
    );
    await expect(assignedService.deletePermission('p1')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    roleModel.findOne.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    permissionModel.findByIdAndDelete.mockReturnValue(createQueryChain(null));
    await expect(service.deletePermission('missing')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
  });

  it('creates roles without permissions and rejects duplicate/invalid permission roles', async () => {
    roleModel.findOne.mockReturnValue(createQueryChain({ name: 'admin' }));
    await expect(service.createRole({ name: 'admin' })).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    roleModel.findOne.mockReturnValue(createQueryChain(null));
    roleModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    roleModel.findById.mockReturnValue(
      createQueryChain({ name: 'member', permissions: [] }),
    );
    await expect(service.createRole({ name: 'member' })).resolves.toMatchObject(
      { name: 'member' },
    );
    permissionModel.find.mockReturnValue(createQueryChain([]));
    await expect(
      service.createRole({
        name: 'invalid',
        permissions: [new Types.ObjectId().toString()],
      }),
    ).rejects.toMatchObject({ code: ErrorCode.ADMIN_OPERATION_FAILED });
  });

  it('lists, updates, and validates role changes', async () => {
    roleModel.find.mockReturnValue(createQueryChain([{ name: 'admin' }]));
    await expect(service.getRoles()).resolves.toEqual([{ name: 'admin' }]);
    roleModel.findById.mockReturnValueOnce(createQueryChain(null));
    await expect(service.updateRole('missing', {})).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    roleModel.findById.mockReturnValueOnce(
      createQueryChain({ name: 'member' }),
    );
    roleModel.findOne.mockReturnValue(createQueryChain({ name: 'admin' }));
    await expect(
      service.updateRole('r1', { name: 'admin' }),
    ).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    roleModel.findById
      .mockReturnValueOnce(createQueryChain({ name: 'member' }))
      .mockReturnValueOnce(
        createQueryChain({ name: 'member', permissions: [] }),
      );
    roleModel.findByIdAndUpdate.mockReturnValue(createQueryChain({}));
    await expect(
      service.updateRole('r1', { name: 'member' }),
    ).resolves.toMatchObject({
      name: 'member',
    });
    const permissionId = new Types.ObjectId().toString();
    roleModel.findById
      .mockReturnValueOnce(createQueryChain({ name: 'member' }))
      .mockReturnValueOnce(
        createQueryChain({ name: 'member', permissions: [] }),
      );
    permissionModel.find.mockReturnValue(
      createQueryChain([{ _id: permissionId }]),
    );
    await service.updateRole('r1', { permissions: [permissionId] });
    expect(roleModel.findByIdAndUpdate).toHaveBeenLastCalledWith(
      'r1',
      expect.objectContaining({
        $set: expect.objectContaining({
          permissions: [new Types.ObjectId(permissionId)],
        }),
      }),
      { new: true, runValidators: true },
    );
  });

  it('protects assigned roles and deletes unassigned roles with not-found handling', async () => {
    userModel.findOne.mockReturnValue(createQueryChain({ _id: 'u1' }));
    await expect(service.deleteRole('r1')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    userModel.findOne.mockReturnValue(createQueryChain(null));
    roleModel.findByIdAndDelete.mockReturnValue(createQueryChain(null));
    await expect(service.deleteRole('missing')).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    roleModel.findByIdAndDelete.mockReturnValue(
      createQueryChain({ _id: 'r1' }),
    );
    await expect(service.deleteRole('r1')).resolves.toEqual({ deleted: true });
  });

  it('rejects missing users/invalid roles and ignores malformed populated permissions', async () => {
    userModel.findById.mockReturnValue(createQueryChain(null));
    await expect(service.assignRoles('missing', [])).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
    userModel.findById.mockReturnValue(createQueryChain({ _id: 'u1' }));
    roleModel.find.mockReturnValue(createQueryChain([]));
    await expect(service.assignRoles('u1', ['r1'])).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    const roleId = new Types.ObjectId().toString();
    roleModel.find.mockReturnValue(
      createQueryChain([
        { _id: roleId, permissions: [null, 'VIEW', { name: 'EDIT' }] },
      ]),
    );
    userModel.findByIdAndUpdate.mockReturnValue(
      createQueryChain({ _id: 'u1' }),
    );
    await service.assignRoles('u1', [roleId]);
    expect(userModel.findByIdAndUpdate).toHaveBeenLastCalledWith(
      'u1',
      expect.objectContaining({
        $set: expect.objectContaining({ permissions: ['EDIT'] }),
      }),
      expect.any(Object),
    );
  });

  it('gets and revokes user roles with success/not-found paths', async () => {
    userModel.findById.mockReturnValue(createQueryChain(null));
    await expect(service.getUserRoles('missing')).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
    userModel.findById.mockReturnValue(
      createQueryChain({ roles: [], permissions: [] }),
    );
    await expect(service.getUserRoles('u1')).resolves.toMatchObject({
      roles: [],
    });
    userModel.findById.mockReturnValueOnce(createQueryChain({ _id: 'u1' }));
    userModel.findByIdAndUpdate.mockReturnValue(
      createQueryChain({ roles: [], permissions: [] }),
    );
    await expect(service.revokeRoles('u1')).resolves.toMatchObject({
      roles: [],
    });
  });

  it('returns existing roles and permits conflict-free role renames', async () => {
    roleModel.findById.mockReturnValue(
      createQueryChain({ name: 'member', permissions: [] }),
    );
    await expect(service.getRoleById('r1')).resolves.toMatchObject({
      name: 'member',
    });

    roleModel.findById
      .mockReturnValueOnce(createQueryChain({ name: 'member' }))
      .mockReturnValueOnce(
        createQueryChain({ name: 'renamed', permissions: [] }),
      );
    roleModel.findOne.mockReturnValue(createQueryChain(null));
    roleModel.findByIdAndUpdate.mockReturnValue(createQueryChain({}));
    await expect(
      service.updateRole('r1', { name: 'renamed' }),
    ).resolves.toMatchObject({
      name: 'renamed',
    });
  });

  it('rejects updateRole when provided permissions contain inactive ids', async () => {
    const invalidPermissionId = new Types.ObjectId().toString();
    roleModel.findById.mockReturnValueOnce(
      createQueryChain({ name: 'member' }),
    );
    permissionModel.find.mockReturnValue(createQueryChain([]));

    await expect(
      service.updateRole('r1', { permissions: [invalidPermissionId] }),
    ).rejects.toMatchObject({
      code: ErrorCode.ADMIN_OPERATION_FAILED,
    });
    expect(permissionModel.find).toHaveBeenCalledWith({
      _id: { $in: [invalidPermissionId] },
      isActive: true,
    });
  });

  it('updates role with same name without checking conflict and clears permissions with empty array', async () => {
    roleModel.findById
      .mockReturnValueOnce(createQueryChain({ name: 'member' }))
      .mockReturnValueOnce(
        createQueryChain({ name: 'member', permissions: [] }),
      );
    roleModel.findByIdAndUpdate.mockReturnValue(createQueryChain({}));

    await expect(
      service.updateRole('r1', { name: 'member', permissions: [] }),
    ).resolves.toMatchObject({
      name: 'member',
    });
    expect(roleModel.findOne).not.toHaveBeenCalledWith({ name: 'member' });
    expect(roleModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({
        $set: expect.objectContaining({ permissions: [] }),
      }),
      { new: true, runValidators: true },
    );
  });

  it('queries only active roles when assigning roles', async () => {
    const roleId = new Types.ObjectId().toString();
    userModel.findById.mockReturnValue(createQueryChain({ _id: 'u1' }));
    roleModel.find.mockReturnValue(
      createQueryChain([
        { _id: roleId, permissions: [{ name: 'ADMIN_VIEW' }] },
      ]),
    );
    userModel.findByIdAndUpdate.mockReturnValue(
      createQueryChain({ _id: 'u1' }),
    );

    await service.assignRoles('u1', [roleId]);

    expect(roleModel.find).toHaveBeenCalledWith({
      _id: { $in: [roleId] },
      isActive: true,
    });
  });
});
