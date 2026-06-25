import { SuccessCode } from '@/common/constants';
import { RbacController } from './rbac.controller';

describe('RbacController', () => {
  const rbacService = {
    createPermission: jest.fn(),
    getPermissions: jest.fn(),
    getPermissionById: jest.fn(),
    deletePermission: jest.fn(),
    createRole: jest.fn(),
    getRoles: jest.fn(),
    getRoleById: jest.fn(),
    updateRole: jest.fn(),
    deleteRole: jest.fn(),
    getUserRoles: jest.fn(),
    assignRoles: jest.fn(),
    revokeRoles: jest.fn(),
  };

  let controller: RbacController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new RbacController(rbacService as never);
  });

  it('creates permission', async () => {
    rbacService.createPermission.mockResolvedValue({ _id: 'p1' });

    const response = await controller.createPermission({
      name: 'PAYMENT_VIEW',
      module: 'payments',
    });

    expect(rbacService.createPermission).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.ADMIN_PERMISSION_CREATED);
  });

  it('gets permissions by module', async () => {
    rbacService.getPermissions.mockResolvedValue([]);

    const response = await controller.getPermissions('payments');

    expect(rbacService.getPermissions).toHaveBeenCalledWith('payments');
    expect(response.code).toBe(SuccessCode.ADMIN_PERMISSIONS_FETCHED);
  });

  it('gets permission by id', async () => {
    rbacService.getPermissionById.mockResolvedValue({ _id: 'p1' });

    const response = await controller.getPermissionById('p1');

    expect(rbacService.getPermissionById).toHaveBeenCalledWith('p1');
    expect(response.code).toBe(SuccessCode.ADMIN_PERMISSIONS_FETCHED);
  });

  it('deletes permission', async () => {
    rbacService.deletePermission.mockResolvedValue({ deleted: true });

    const response = await controller.deletePermission('p1');

    expect(rbacService.deletePermission).toHaveBeenCalledWith('p1');
    expect(response.code).toBe(SuccessCode.ADMIN_PERMISSION_DELETED);
  });

  it('creates role', async () => {
    rbacService.createRole.mockResolvedValue({ _id: 'r1' });

    const response = await controller.createRole({ name: 'moderator' });

    expect(rbacService.createRole).toHaveBeenCalled();
    expect(response.code).toBe(SuccessCode.ADMIN_ROLE_CREATED);
  });

  it('gets and mutates roles', async () => {
    rbacService.getRoles.mockResolvedValue([]);
    rbacService.getRoleById.mockResolvedValue({ _id: 'r1' });
    rbacService.updateRole.mockResolvedValue({ _id: 'r1', name: 'admin' });
    rbacService.deleteRole.mockResolvedValue({ deleted: true });

    const roles = await controller.getRoles();
    const role = await controller.getRoleById('r1');
    const updated = await controller.updateRole('r1', { name: 'admin' });
    const deleted = await controller.deleteRole('r1');

    expect(roles.code).toBe(SuccessCode.ADMIN_ROLES_FETCHED);
    expect(role.code).toBe(SuccessCode.ADMIN_ROLES_FETCHED);
    expect(updated.code).toBe(SuccessCode.ADMIN_ROLE_UPDATED);
    expect(deleted.code).toBe(SuccessCode.ADMIN_ROLE_DELETED);
  });

  it('manages user roles', async () => {
    rbacService.getUserRoles.mockResolvedValue({ roles: [] });
    rbacService.assignRoles.mockResolvedValue({ _id: 'u1' });
    rbacService.revokeRoles.mockResolvedValue({ _id: 'u1' });

    const getResponse = await controller.getUserRoles('u1');
    const assignResponse = await controller.assignRoles('u1', {
      roleIds: ['r1'],
    });
    const revokeResponse = await controller.revokeRoles('u1');

    expect(rbacService.assignRoles).toHaveBeenCalledWith('u1', ['r1']);
    expect(getResponse.code).toBe(SuccessCode.ADMIN_USER_ROLES_FETCHED);
    expect(assignResponse.code).toBe(SuccessCode.ADMIN_USER_ROLES_UPDATED);
    expect(revokeResponse.code).toBe(SuccessCode.ADMIN_USER_ROLES_UPDATED);
  });
});
