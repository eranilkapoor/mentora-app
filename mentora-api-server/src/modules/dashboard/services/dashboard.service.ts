import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toTenantObjectId } from '@/common/utils/tenant-scope.util';
import { ContextsService } from '@/modules/contexts/services/contexts.service';
import { ModuleCoverageService } from '@/modules/module-records/services/module-coverage.service';
import { TenantsService } from '@/modules/tenants/services/tenants.service';
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
    private readonly contextsService: ContextsService,
    private readonly moduleCoverageService: ModuleCoverageService,
    private readonly tenantsService: TenantsService,
  ) {}

  async getBootstrap(userId: string, tenantId?: string) {
    const [contexts, tenantResult] = await Promise.all([
      this.contextsService.listUserContexts(userId),
      this.tenantsService.listTenants({ limit: '100', status: 'active' }),
    ]);
    const tenants = tenantResult.items;
    const moduleCoverage = this.moduleCoverageService.getModuleCoverage();
    const activeTenantId =
      tenantId ??
      this.getContextTenantId(contexts[0]) ??
      this.getRecordId(tenants[0]);

    return {
      activeTenantId,
      contexts,
      tenants,
      moduleCoverage,
      dashboard: activeTenantId
        ? await this.getDashboard(activeTenantId)
        : {
            applications: 0,
            campaigns: 0,
            communications: 0,
            hotLeads: 0,
            newLeads: 0,
            openTasks: 0,
            tenantId: '',
          },
    };
  }

  async getDashboard(tenantId: string) {
    const tenantObjectId = toTenantObjectId(tenantId);
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

  private getContextTenantId(context: unknown) {
    if (!context || typeof context !== 'object') return undefined;
    const tenant = (context as { tenantId?: unknown }).tenantId;
    return this.getRecordId(tenant) || this.getRecordId(context);
  }

  private getRecordId(record: unknown) {
    if (!record || typeof record !== 'object') return undefined;
    const value =
      (record as { _id?: unknown; id?: unknown })._id ??
      (record as { id?: unknown }).id;
    if (typeof value === 'string') return value;
    if (
      value &&
      typeof value === 'object' &&
      'toHexString' in value &&
      typeof (value as { toHexString?: unknown }).toHexString === 'function'
    ) {
      return (value as { toHexString: () => string }).toHexString();
    }
    return undefined;
  }
}
