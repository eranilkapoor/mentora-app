import { Test, TestingModule } from '@nestjs/testing';
import { RbacController } from '../rbac.controller';
import { RbacService } from './rbac.service';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';

const mockRbacService = () => ({
  createPermission: jest.fn(),
  getPermissions: jest.fn(),
  deletePermission: jest.fn(),
  createRole: jest.fn(),
  getRoles: jest.fn(),
  updateRole: jest.fn(),
  deleteRole: jest.fn(),
  assignRoles: jest.fn(),
});

describe('RbacController', () => {
  let controller: RbacController;
  let service: ReturnType<typeof mockRbacService>;

  beforeEach(async () => {
    service = mockRbacService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [{ provide: RbacService, useValue: service }],
    })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RbacController>(RbacController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createPermission()', () => {
    it('should create a permission', () => {
      const perm = { _id: 'perm-1', action: 'ADMIN_MANAGE' };
      service.createPermission.mockReturnValue(perm);
      const result = controller.createPermission({
        action: 'ADMIN_MANAGE',
      } as any);
      expect(result).toEqual(perm);
    });
  });

  describe('getPermissions()', () => {
    it('should return all permissions', () => {
      service.getPermissions.mockReturnValue([{ action: 'ADMIN_MANAGE' }]);
      const result = controller.getPermissions();
      expect(result).toEqual([{ action: 'ADMIN_MANAGE' }]);
    });
  });

  describe('deletePermission()', () => {
    it('should delete a permission by id', () => {
      service.deletePermission.mockReturnValue(undefined);
      controller.deletePermission('perm-1');
      expect(service.deletePermission).toHaveBeenCalledWith('perm-1');
    });
  });

  describe('createRole()', () => {
    it('should create a role', () => {
      const role = { _id: 'role-1', name: 'admin' };
      service.createRole.mockReturnValue(role);
      const result = controller.createRole({ name: 'admin' } as any);
      expect(result).toEqual(role);
    });
  });

  describe('getRoles()', () => {
    it('should return all roles with permissions', () => {
      service.getRoles.mockReturnValue([{ name: 'admin', permissions: [] }]);
      const result = controller.getRoles();
      expect(result).toEqual([{ name: 'admin', permissions: [] }]);
    });
  });

  describe('updateRole()', () => {
    it('should update a role by id', () => {
      const updated = { _id: 'role-1', name: 'SUPER_ADMIN' };
      service.updateRole.mockReturnValue(updated);
      const result = controller.updateRole('role-1', {
        name: 'SUPER_ADMIN',
      } as any);
      expect(result).toEqual(updated);
      expect(service.updateRole).toHaveBeenCalledWith('role-1', {
        name: 'SUPER_ADMIN',
      });
    });
  });

  describe('deleteRole()', () => {
    it('should delete a role by id', () => {
      service.deleteRole.mockReturnValue(undefined);
      controller.deleteRole('role-1');
      expect(service.deleteRole).toHaveBeenCalledWith('role-1');
    });
  });

  describe('assignRoles()', () => {
    it('should assign roles to a user', () => {
      const user = { _id: 'user-1', roles: ['role-1'] };
      service.assignRoles.mockReturnValue(user);
      const result = controller.assignRoles('user-1', {
        roleIds: ['role-1'],
      } as any);
      expect(result).toEqual(user);
      expect(service.assignRoles).toHaveBeenCalledWith('user-1', ['role-1']);
    });
  });
});
