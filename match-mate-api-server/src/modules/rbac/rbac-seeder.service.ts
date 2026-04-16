import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Permission,
  PermissionDocument,
} from './schemas/permission.schema';
import {
  Role,
  RoleDocument,
} from './schemas/role.schema';
import { Permission as AppPermission } from 'src/common/enums';

@Injectable()
export class RbacSeederService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.RBAC_SYNC === 'true') {
      await this.syncPermissions();
      await this.syncRoles();
    }
  }

  private async syncPermissions() {
    const enumPermissions = Object.values(AppPermission);

    for (const perm of enumPermissions) {
      await this.permissionModel.updateOne(
        { name: perm },
        {
          name: perm,
          module: this.extractModule(perm),
          description: this.generateDescription(perm),
          isActive: true,
        },
        { upsert: true },
      );
    }

    console.log(`✅ Permissions synced: ${enumPermissions.length}`);
  }

  private async syncRoles() {
    const adminPermissions = await this.permissionModel
      .find({ module: 'admin' })
      .select('_id');

    await this.roleModel.updateOne(
      { name: 'ADMIN' },
      {
        name: 'ADMIN',
        permissions: adminPermissions.map(p => p._id),
      },
      { upsert: true },
    );

    console.log(`✅ Role synced with : ${adminPermissions.length} : permissions`);
  }

  // ================= HELPERS =================
  private extractModule(permission: string): string {
    return permission.split(':')[0]; // admin:manage → admin
  }

  private generateDescription(permission: string): string {
    return permission.replace(/[:_]/g, ' ');
  }
}