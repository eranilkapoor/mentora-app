import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FlattenMaps } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { User, UserDocument } from 'src/modules/auth/schemas/user.schema';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ErrorCode } from 'src/common/constants';
import {
  throwBadRequest,
  throwConflict,
  throwNotFound,
} from 'src/common/exceptions/throw-app-exception';

//  Lean return types
// .lean() strips Mongoose Document methods and returns plain objects.
// Using FlattenMaps<T> is the correct type for lean results.

type LeanPermission = FlattenMaps<PermissionDocument> &
  Required<{ _id: Types.ObjectId }>;

// Populated Role: permissions field is an array of lean Permission objects
type LeanRolePopulated = FlattenMaps<Omit<RoleDocument, 'permissions'>> &
  Required<{ _id: Types.ObjectId }> & {
    permissions: LeanPermission[];
  };

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  //  Permissions

  async createPermission(dto: CreatePermissionDto): Promise<LeanPermission> {
    const existing = await this.permissionModel
      .findOne({ name: dto.name })
      .lean();
    if (existing) {
      return throwConflict(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'permission_already_exists',
        permission: dto.name,
      });
    }
    const created = await this.permissionModel.create(dto);
    return created.toObject() as LeanPermission;
  }

  getPermissions(module?: string): Promise<LeanPermission[]> {
    const filter = module ? { module, isActive: true } : { isActive: true };
    return this.permissionModel
      .find(filter)
      .sort({ module: 1, name: 1 })
      .lean<LeanPermission[]>()
      .exec();
  }

  async getPermissionById(id: string): Promise<LeanPermission> {
    const permission = await this.permissionModel
      .findById(id)
      .lean<LeanPermission>()
      .exec();
    if (!permission)
      return throwNotFound(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'permission_not_found',
      });
    return permission;
  }

  async deletePermission(id: string): Promise<{ deleted: boolean }> {
    const roleUsing = await this.roleModel
      .findOne({ permissions: id, isActive: true })
      .lean()
      .exec();

    if (roleUsing) {
      return throwBadRequest(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'permission_assigned_to_role',
        role: String(roleUsing.name),
      });
    }

    const result = await this.permissionModel
      .findByIdAndDelete(id)
      .lean()
      .exec();
    if (!result)
      return throwNotFound(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'permission_not_found',
      });
    return { deleted: true };
  }

  //  Roles

  async createRole(dto: CreateRoleDto): Promise<LeanRolePopulated> {
    const existing = await this.roleModel
      .findOne({ name: dto.name })
      .lean()
      .exec();
    if (existing) {
      return throwConflict(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'role_already_exists',
        role: dto.name,
      });
    }

    if (dto.permissions?.length) {
      await this.validatePermissionIds(dto.permissions);
    }

    const created = await this.roleModel.create({
      ...dto,
      permissions: dto.permissions?.map((id) => new Types.ObjectId(id)) ?? [],
    });

    // Return populated version so response shape is consistent
    const populated = await this.roleModel
      .findById(created._id)
      .populate<{ permissions: LeanPermission[] }>('permissions')
      .lean<LeanRolePopulated>()
      .exec();

    return populated!;
  }

  getRoles(): Promise<LeanRolePopulated[]> {
    return this.roleModel
      .find({ isActive: true })
      .populate<{ permissions: LeanPermission[] }>('permissions')
      .sort({ name: 1 })
      .lean<LeanRolePopulated[]>()
      .exec();
  }

  async getRoleById(id: string): Promise<LeanRolePopulated> {
    const role = await this.roleModel
      .findById(id)
      .populate<{ permissions: LeanPermission[] }>('permissions')
      .lean<LeanRolePopulated>()
      .exec();

    if (!role)
      return throwNotFound(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'role_not_found',
      });
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<LeanRolePopulated> {
    const role = await this.roleModel.findById(id).lean().exec();
    if (!role)
      return throwNotFound(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'role_not_found',
      });

    if (dto.name && dto.name !== role.name) {
      const nameConflict = await this.roleModel
        .findOne({ name: dto.name })
        .lean()
        .exec();
      if (nameConflict) {
        return throwConflict(ErrorCode.ADMIN_OPERATION_FAILED, {
          reason: 'role_already_exists',
          role: dto.name,
        });
      }
    }

    if (dto.permissions?.length) {
      await this.validatePermissionIds(dto.permissions);
    }

    await this.roleModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...dto,
            ...(dto.permissions
              ? {
                  permissions: dto.permissions.map(
                    (p) => new Types.ObjectId(p),
                  ),
                }
              : {}),
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    // Return populated version
    const updated = await this.roleModel
      .findById(id)
      .populate<{ permissions: LeanPermission[] }>('permissions')
      .lean<LeanRolePopulated>()
      .exec();

    return updated!;
  }

  async deleteRole(id: string): Promise<{ deleted: boolean }> {
    const userWithRole = await this.userModel
      .findOne({ roles: id })
      .lean()
      .exec();

    if (userWithRole) {
      return throwBadRequest(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'role_assigned_to_users',
      });
    }

    const result = await this.roleModel.findByIdAndDelete(id).lean().exec();
    if (!result)
      return throwNotFound(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'role_not_found',
      });
    return { deleted: true };
  }

  //  User Roles

  async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    const roles = await this.roleModel
      .find({ _id: { $in: roleIds }, isActive: true })
      .populate<{ permissions: LeanPermission[] }>('permissions')
      .lean<LeanRolePopulated[]>()
      .exec();

    if (roles.length !== roleIds.length) {
      return throwBadRequest(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'invalid_or_inactive_role_ids',
      });
    }

    // Flatten and deduplicate permission names
    const permissionNames = Array.from(
      new Set(
        roles.flatMap((role) =>
          role.permissions
            .filter(
              (p): p is LeanPermission =>
                typeof p === 'object' && p !== null && 'name' in p,
            )
            .map((p) => p.name),
        ),
      ),
    );

    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            roles: roleIds.map((id) => new Types.ObjectId(id)),
            permissions: permissionNames,
          },
        },
        { new: true, runValidators: true },
      )
      .select('-password -refreshToken')
      .lean()
      .exec();
  }

  async getUserRoles(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('roles permissions')
      .populate('roles')
      .lean()
      .exec();

    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  async revokeRoles(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { roles: [], permissions: [] } },
        { new: true },
      )
      .select('-password -refreshToken')
      .lean()
      .exec();
  }

  //  Helpers

  private async validatePermissionIds(ids: string[]): Promise<void> {
    const found = await this.permissionModel
      .find({ _id: { $in: ids }, isActive: true })
      .select('_id')
      .lean()
      .exec();

    if (found.length !== ids.length) {
      return throwBadRequest(ErrorCode.ADMIN_OPERATION_FAILED, {
        reason: 'invalid_or_inactive_permission_ids',
      });
    }
  }
}
