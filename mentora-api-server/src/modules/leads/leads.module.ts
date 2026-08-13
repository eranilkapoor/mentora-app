import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import {
  LeadStage,
  LeadStageSchema,
} from '@/common/crm/schemas/lead-stage.schema';
import {
  LeadSource,
  LeadSourceSchema,
} from '@/common/crm/schemas/lead-source.schema';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { LeadCaptureController } from './controllers/lead-capture.controller';
import { LeadsController } from './controllers/leads.controller';
import { Lead, LeadSchema } from './schemas/lead.schema';
import {
  LeadActivity,
  LeadActivitySchema,
} from './schemas/lead-activity.schema';
import {
  LeadAssignment,
  LeadAssignmentSchema,
} from './schemas/lead-assignment.schema';
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
      { name: LeadSource.name, schema: LeadSourceSchema },
      { name: LeadStage.name, schema: LeadStageSchema },
    ]),
  ],
  controllers: [LeadsController, LeadCaptureController],
  providers: [LeadsService, LeadCaptureService],
  exports: [LeadsService],
})
export class LeadsModule {}
