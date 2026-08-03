import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Lead, LeadSchema } from '../leads/schemas/leads.schema';
import {
  UserMembership,
  UserMembershipSchema,
} from '../contexts/schemas/contexts.schema';
import { OrganizationsController } from './controllers/organizations.controller';
import {
  Branch,
  BranchSchema,
  Department,
  DepartmentSchema,
  Team,
  TeamSchema,
} from './schemas/organization-structure.schema';
import {
  ChannelSetting,
  ChannelSettingSchema,
  OrganizationBranding,
  OrganizationBrandingSchema,
} from './schemas/organization-settings.schema';
import {
  Organization,
  OrganizationSchema,
} from './schemas/organization.schema';
import {
  LeadSource,
  LeadSourceSchema,
  LeadStage,
  LeadStageSchema,
} from '@/common/crm/schemas/crm-taxonomy.schema';
import { OrganizationsService } from './services/organizations.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Team.name, schema: TeamSchema },
      { name: OrganizationBranding.name, schema: OrganizationBrandingSchema },
      { name: ChannelSetting.name, schema: ChannelSettingSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: User.name, schema: UserSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
