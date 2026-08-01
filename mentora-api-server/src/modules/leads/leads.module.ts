import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { LeadsController } from './controllers/leads.controller';
import { PublicLeadsController } from './controllers/public-leads.controller';
import {
  Lead,
  LeadActivity,
  LeadActivitySchema,
  LeadAssignment,
  LeadAssignmentSchema,
  LeadSchema,
} from './schemas/leads.schema';
import { LeadsService } from './services/leads.service';
import { PublicLeadsService } from './services/public-leads.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    OrganizationsModule,
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: LeadActivity.name, schema: LeadActivitySchema },
      { name: LeadAssignment.name, schema: LeadAssignmentSchema },
    ]),
  ],
  controllers: [LeadsController, PublicLeadsController],
  providers: [LeadsService, PublicLeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
