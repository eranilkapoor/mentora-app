import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { RbacController } from './controllers/rbac.controller';
import { RbacService } from './services/rbac.service';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
})
export class RbacModule {}
