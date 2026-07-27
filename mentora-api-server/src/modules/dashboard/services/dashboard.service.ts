import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Application,
  ApplicationDocument,
} from '../../applications/schemas/applications.schema';
import {
  Campaign,
  CampaignDocument,
} from '../../campaigns/schemas/campaigns.schema';
import {
  Communication,
  CommunicationDocument,
} from '../../communications/schemas/communications.schema';
import { Lead, LeadDocument } from '../../leads/schemas/leads.schema';
import { Task, TaskDocument } from '../../tasks/schemas/tasks.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leads: Model<LeadDocument>,
    @InjectModel(Task.name)
    private readonly tasks: Model<TaskDocument>,
    @InjectModel(Application.name)
    private readonly applications: Model<ApplicationDocument>,
    @InjectModel(Campaign.name)
    private readonly campaigns: Model<CampaignDocument>,
    @InjectModel(Communication.name)
    private readonly communications: Model<CommunicationDocument>,
  ) {}

  async getDashboard(tenantId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const [
      newLeads,
      openTasks,
      applications,
      hotLeads,
      campaigns,
      communications,
    ] = await Promise.all([
      this.leads.countDocuments({ tenantId: tenantObjectId, status: 'new' }),
      this.tasks.countDocuments({
        tenantId: tenantObjectId,
        status: { $in: ['open', 'in_progress'] },
      }),
      this.applications.countDocuments({ tenantId: tenantObjectId }),
      this.leads.countDocuments({
        tenantId: tenantObjectId,
        temperature: 'hot',
      }),
      this.campaigns.countDocuments({ tenantId: tenantObjectId }),
      this.communications.countDocuments({ tenantId: tenantObjectId }),
    ]);
    return {
      tenantId,
      newLeads,
      openTasks,
      applications,
      hotLeads,
      campaigns,
      communications,
    };
  }
}
