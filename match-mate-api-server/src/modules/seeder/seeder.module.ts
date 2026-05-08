import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Permission,
  PermissionSchema,
} from 'src/modules/rbac/schemas/permission.schema';
import { Role, RoleSchema } from 'src/modules/rbac/schemas/role.schema';
import { MasterSeederService } from './services/master-seeder.service';
import { Plan, PlanSchema } from '../plan/schemas/plan.schema';
import { Feature, FeatureSchema } from '../plan/schemas/feature.schema';
import {
  PlanFeature,
  PlanFeatureSchema,
} from '../plan/schemas/plan-feature.schema';
import {
  NotificationTemplates,
  NotificationTemplatesSchema,
} from 'src/modules/notification/schemas/notification-templates.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Permission.name,
        schema: PermissionSchema,
      },

      {
        name: Role.name,
        schema: RoleSchema,
      },

      {
        name: Plan.name,
        schema: PlanSchema,
      },

      {
        name: Feature.name,
        schema: FeatureSchema,
      },

      {
        name: PlanFeature.name,
        schema: PlanFeatureSchema,
      },
      {
        name: NotificationTemplates.name,
        schema: NotificationTemplatesSchema,
      },
    ]),
  ],

  providers: [MasterSeederService],

  exports: [MasterSeederService],
})
export class SeederModule {}
