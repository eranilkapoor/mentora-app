import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Permission as AppPermission, Role as AdminRole } from 'src/common/enums';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/common/logger/logger.service';

@Injectable()
export class RbacSeederService implements OnApplicationBootstrap {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,

    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get<string>('rbacSync') === 'true') {
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

    this.logger.log(`✅ Permissions synced: ${enumPermissions.length}`);
  }

  private async syncRoles() {
    const adminPermissions = await this.permissionModel
      .find({ module: 'admin' })
      .select('_id');

    await this.roleModel.updateOne(
      { name: AdminRole.ADMIN },
      {
        name: AdminRole.ADMIN,
        permissions: adminPermissions.map((p) => p._id),
      },
      { upsert: true },
    );

    this.logger.log(
      `✅ Role synced with : ${adminPermissions.length} : permissions`,
    );
  }

  // ================= HELPERS =================
  private extractModule(permission: string): string {
    return permission.split(':')[0]; // admin:manage → admin
  }

  private generateDescription(permission: string): string {
    return permission.replace(/[:_]/g, ' ');
  }
}
