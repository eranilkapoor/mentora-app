import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './controllers/tenants.controller';
import {
  Branch,
  BranchSchema,
  LeadSource,
  LeadSourceSchema,
  LeadStage,
  LeadStageSchema,
  Tenant,
  TenantSchema,
} from './schemas/tenants.schema';
import { TenantsService } from './services/tenants.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: Branch.name, schema: BranchSchema },
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
    ]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
