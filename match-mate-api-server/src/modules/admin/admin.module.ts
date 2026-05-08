import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controllers
import { AdminController } from './controllers/admin.controller';
import { RbacController } from './controllers/rbac.controller';

// Services
import { AdminService } from './services/admin.service';
import { RbacService } from './services/rbac.service';

// Repository
import { AdminRepository } from './repositories/admin.repository';

// Schemas
import { Permission, PermissionSchema } from './schemas/permission.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { User, UserSchema } from 'src/modules/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // User registered once — shared by both AdminService and RbacService
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [AdminController, RbacController],
  providers: [AdminService, RbacService, AdminRepository],
  exports: [
    RbacService, // export so other modules can check permissions if needed
  ],
})
export class AdminModule {}
