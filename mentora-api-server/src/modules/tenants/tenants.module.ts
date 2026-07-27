import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import {
  UserMembership,
  UserMembershipSchema,
} from '../contexts/schemas/contexts.schema';
import { TenantsController } from './controllers/tenants.controller';
import {
  Branch,
  BranchSchema,
  Campus,
  CampusSchema,
  ChannelSetting,
  ChannelSettingSchema,
  Department,
  DepartmentSchema,
  LeadSource,
  LeadSourceSchema,
  LeadStage,
  LeadStageSchema,
  Team,
  TeamSchema,
  Tenant,
  TenantBranding,
  TenantBrandingSchema,
  TenantSchema,
} from './schemas/tenants.schema';
import { TenantsService } from './services/tenants.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: TenantBranding.name, schema: TenantBrandingSchema },
      { name: ChannelSetting.name, schema: ChannelSettingSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
      { name: UserMembership.name, schema: UserMembershipSchema },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
