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
import { Branch, BranchSchema } from './schemas/branch.schema';
import {
  ChannelSetting,
  ChannelSettingSchema,
} from './schemas/channel-setting.schema';
import { Department, DepartmentSchema } from './schemas/department.schema';
import {
  OrganizationBranding,
  OrganizationBrandingSchema,
} from './schemas/organization-branding.schema';
import { Team, TeamSchema } from './schemas/team.schema';
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
import { OrganizationFieldPolicyService } from './services/organization-field-policy.service';
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
  providers: [OrganizationFieldPolicyService, OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
