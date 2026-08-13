import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '@/common/enums';
import { toOrganizationObjectId } from '@/common/utils/organization-scope.util';
import { ContextsService } from '@/modules/contexts/services/contexts.service';
import { ModuleCoverageService } from '@/modules/module-records/services/module-coverage.service';
import { OrganizationsService } from '@/modules/organizations/services/organizations.service';
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
import { Lead, LeadDocument } from '../../leads/schemas/lead.schema';
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
    private readonly organizationsService: OrganizationsService,
  ) {}

  async getBootstrap(
    userId: string,
    organizationId?: string,
    roles: Role[] = [],
  ): Promise<unknown> {
    const [contexts, organizationResult] = await Promise.all([
      this.contextsService.listUserContexts(userId),
      this.organizationsService.listOrganizations({
        limit: '100',
        status: 'active',
      }),
    ]);
    const organizations =
      (organizationResult as { items?: Record<string, unknown>[] }).items ?? [];
    const globalSuperAdminContext = {
      role: Role.SUPER_ADMIN,
      status: 'active',
      organizationId: null,
      branchIds: [],
      organization: {
        name: 'All Organizations',
        code: 'ALL',
        status: 'active',
      },
      branches: [],
      permissions: [],
    };
    const isSuperAdmin = roles.includes(Role.SUPER_ADMIN);
    const resolvedContexts = isSuperAdmin
      ? [
          globalSuperAdminContext,
          ...contexts.filter(
            (context) => this.getContextOrganizationId(context) !== '',
          ),
        ]
      : contexts;
    const moduleCoverage = this.moduleCoverageService.getModuleCoverage();
    const contextOrganizationId = this.getContextOrganizationId(
      resolvedContexts[0],
    );
    const activeOrganizationId =
      organizationId ??
      (isSuperAdmin
        ? ''
        : (contextOrganizationId ?? this.getRecordId(organizations[0])));

    return {
      activeOrganizationId,
      contexts: resolvedContexts,
      organizations,
      moduleCoverage,
      dashboard: activeOrganizationId
        ? await this.getDashboard(activeOrganizationId)
        : {
            applications: 0,
            campaigns: 0,
            communications: 0,
            hotLeads: 0,
            newLeads: 0,
            openTasks: 0,
            organizationId: '',
          },
    };
  }

  async getDashboard(organizationId: string) {
    const organizationObjectId = toOrganizationObjectId(organizationId);
    const [
      newLeads,
      openTasks,
      applications,
      hotLeads,
      campaigns,
      communications,
    ] = await Promise.all([
      this.leads.countDocuments({
        organizationId: organizationObjectId,
        status: 'new',
      }),
      this.tasks.countDocuments({
        organizationId: organizationObjectId,
        status: { $in: ['open', 'in_progress'] },
      }),
      this.applications.countDocuments({
        organizationId: organizationObjectId,
      }),
      this.leads.countDocuments({
        organizationId: organizationObjectId,
        temperature: 'hot',
      }),
      this.campaigns.countDocuments({ organizationId: organizationObjectId }),
      this.communications.countDocuments({
        organizationId: organizationObjectId,
      }),
    ]);
    return {
      organizationId,
      newLeads,
      openTasks,
      applications,
      hotLeads,
      campaigns,
      communications,
    };
  }

  private getContextOrganizationId(context: unknown) {
    if (!context || typeof context !== 'object') return undefined;
    const organization = (context as { organizationId?: unknown })
      .organizationId;
    return this.getRecordId(organization) || this.getRecordId(context);
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
