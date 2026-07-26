import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationCrmController } from './controllers/education-crm.controller';
import { EducationCrmService } from './services/education-crm.service';
import {
  CrmApplication,
  CrmApplicationSchema,
  CrmBranch,
  CrmBranchSchema,
  CrmCampaign,
  CrmCampaignSchema,
  CrmCommunication,
  CrmCommunicationSchema,
  CrmLead,
  CrmLeadActivity,
  CrmLeadActivitySchema,
  CrmLeadAssignment,
  CrmLeadAssignmentSchema,
  CrmLeadSchema,
  CrmLeadSource,
  CrmLeadSourceSchema,
  CrmLeadStage,
  CrmLeadStageSchema,
  CrmTask,
  CrmTaskSchema,
  CrmTenant,
  CrmTenantSchema,
} from './schemas/education-crm.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrmTenant.name, schema: CrmTenantSchema },
      { name: CrmBranch.name, schema: CrmBranchSchema },
      { name: CrmLeadSource.name, schema: CrmLeadSourceSchema },
      { name: CrmLeadStage.name, schema: CrmLeadStageSchema },
      { name: CrmLead.name, schema: CrmLeadSchema },
      { name: CrmLeadActivity.name, schema: CrmLeadActivitySchema },
      { name: CrmLeadAssignment.name, schema: CrmLeadAssignmentSchema },
      { name: CrmApplication.name, schema: CrmApplicationSchema },
      { name: CrmTask.name, schema: CrmTaskSchema },
      { name: CrmCampaign.name, schema: CrmCampaignSchema },
      { name: CrmCommunication.name, schema: CrmCommunicationSchema },
    ]),
  ],
  controllers: [EducationCrmController],
  providers: [EducationCrmService],
  exports: [EducationCrmService],
})
export class EducationCrmModule {}
