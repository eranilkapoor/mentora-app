import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Application,
  ApplicationSchema,
} from '../applications/schemas/applications.schema';
import {
  Campaign,
  CampaignSchema,
} from '../campaigns/schemas/campaigns.schema';
import {
  Communication,
  CommunicationSchema,
} from '../communications/schemas/communications.schema';
import { Lead, LeadSchema } from '../leads/schemas/leads.schema';
import { Task, TaskSchema } from '../tasks/schemas/tasks.schema';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Communication.name, schema: CommunicationSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
