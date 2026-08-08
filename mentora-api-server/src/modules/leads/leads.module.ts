import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import {
  LeadStage,
  LeadStageSchema,
} from '@/common/crm/schemas/lead-stage.schema';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { LeadCaptureController } from './controllers/lead-capture.controller';
import { LeadsController } from './controllers/leads.controller';
import {
  Lead,
  LeadActivity,
  LeadActivitySchema,
  LeadAssignment,
  LeadAssignmentSchema,
  LeadSchema,
} from './schemas/leads.schema';
import { LeadsService } from './services/leads.service';
import { LeadCaptureService } from './services/lead-capture.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    OrganizationsModule,
    RbacModule,
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: LeadActivity.name, schema: LeadActivitySchema },
      { name: LeadAssignment.name, schema: LeadAssignmentSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
    ]),
  ],
  controllers: [LeadsController, LeadCaptureController],
  providers: [LeadsService, LeadCaptureService],
  exports: [LeadsService],
})
export class LeadsModule {}
