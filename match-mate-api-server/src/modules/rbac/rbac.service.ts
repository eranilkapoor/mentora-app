import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { Permission, PermissionDocument } from './schemas/permission.schema';

import { Role, RoleDocument } from './schemas/role.schema';

import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // ===== PERMISSIONS =====
  createPermission(dto: any) {
    return this.permissionModel.create(dto);
  }

  getPermissions() {
    return this.permissionModel.find();
  }

  deletePermission(id: string) {
    return this.permissionModel.findByIdAndDelete(id);
  }

  // ===== ROLES =====
  createRole(dto: any) {
    return this.roleModel.create(dto);
  }

  getRoles() {
    return this.roleModel.find().populate('permissions');
  }

  updateRole(id: string, dto: UpdateQuery<RoleDocument>) {
    return this.roleModel.findByIdAndUpdate(id, dto, { new: true });
  }

  deleteRole(id: string) {
    return this.roleModel.findByIdAndDelete(id);
  }

  // ===== USER ROLES =====
  async assignRoles(userId: string, roleIds: string[]) {
    const roles = await this.roleModel
      .find({
        _id: { $in: roleIds },
      })
      .populate<{ permissions: Permission[] }>('permissions');

    // flatten permissions
    const permissions = roles.flatMap((role) =>
      role.permissions.map((p: Permission) => p.name),
    );

    return this.userModel.findByIdAndUpdate(
      userId,
      {
        roles: roleIds,
        permissions: [...new Set(permissions)],
      },
      { new: true },
    );
  }
}
