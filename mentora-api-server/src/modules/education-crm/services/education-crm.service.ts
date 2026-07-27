import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddCrmLeadActivityDto,
  AssignCrmLeadDto,
  ChangeCrmLeadStageDto,
  CreateCrmBranchDto,
  CreateCrmCampaignDto,
  CreateCrmCommunicationDto,
  CreateCrmApplicationDto,
  CreateCrmLeadDto,
  CreateCrmLeadSourceDto,
  CreateCrmLeadStageDto,
  CreateCrmModuleRecordDto,
  CreateCrmTaskDto,
  CreateCrmTenantDto,
  PublicCrmLeadCaptureDto,
  SelectCrmContextDto,
  UpdateCrmModuleRecordDto,
  UpsertCrmUserMembershipDto,
} from '../dto/education-crm.dto';
import {
  CrmApplication,
  CrmApplicationDocument,
  CrmBranch,
  CrmBranchDocument,
  CrmCampaign,
  CrmCampaignDocument,
  CrmCommunication,
  CrmCommunicationDocument,
  CrmLead,
  CrmLeadActivity,
  CrmLeadActivityDocument,
  CrmLeadAssignment,
  CrmLeadAssignmentDocument,
  CrmLeadDocument,
  CrmLeadSource,
  CrmLeadSourceDocument,
  CrmLeadStage,
  CrmLeadStageDocument,
  CrmModuleRecord,
  CrmModuleRecordDocument,
  CrmTask,
  CrmTaskDocument,
  CrmTenant,
  CrmTenantDocument,
  CrmUserMembership,
  CrmUserMembershipDocument,
} from '../schemas/education-crm.schemas';

@Injectable()
export class EducationCrmService {
  constructor(
    @InjectModel(CrmTenant.name)
    private readonly tenants: Model<CrmTenantDocument>,
    @InjectModel(CrmBranch.name)
    private readonly branches: Model<CrmBranchDocument>,
    @InjectModel(CrmLeadSource.name)
    private readonly sources: Model<CrmLeadSourceDocument>,
    @InjectModel(CrmLeadStage.name)
    private readonly stages: Model<CrmLeadStageDocument>,
    @InjectModel(CrmLead.name)
    private readonly leads: Model<CrmLeadDocument>,
    @InjectModel(CrmLeadActivity.name)
    private readonly activities: Model<CrmLeadActivityDocument>,
    @InjectModel(CrmLeadAssignment.name)
    private readonly assignments: Model<CrmLeadAssignmentDocument>,
    @InjectModel(CrmApplication.name)
    private readonly applications: Model<CrmApplicationDocument>,
    @InjectModel(CrmTask.name)
    private readonly tasks: Model<CrmTaskDocument>,
    @InjectModel(CrmCampaign.name)
    private readonly campaigns: Model<CrmCampaignDocument>,
    @InjectModel(CrmCommunication.name)
    private readonly communications: Model<CrmCommunicationDocument>,
    @InjectModel(CrmModuleRecord.name)
    private readonly moduleRecords: Model<CrmModuleRecordDocument>,
    @InjectModel(CrmUserMembership.name)
    private readonly memberships: Model<CrmUserMembershipDocument>,
  ) {}

  getModuleCoverage() {
    return [
      ['authentication', 'Authentication'],
      ['user_management', 'User Management'],
      ['organization_management', 'Organization Management'],
      ['lead_management', 'Lead Management'],
      ['application_management', 'Application Management'],
      ['admission_management', 'Admission Management'],
      ['marketing_automation', 'Marketing Automation'],
      ['communication', 'Communication Module'],
      ['call_center', 'Call Center'],
      ['whatsapp_crm', 'WhatsApp CRM'],
      ['email_crm', 'Email CRM'],
      ['sms', 'SMS Module'],
      ['mobile_crm', 'Mobile App CRM'],
      ['calendar', 'Calendar'],
      ['task_management', 'Task Management'],
      ['document_management', 'Document Management'],
      ['payment', 'Payment Module'],
      ['finance', 'Finance Module'],
      ['scholarship', 'Scholarship'],
      ['interview', 'Interview Module'],
      ['event_management', 'Event Management'],
      ['field_force_automation', 'Field Force Automation'],
      ['reports', 'Reports'],
      ['dashboard', 'Dashboard'],
      ['analytics', 'Analytics'],
      ['ai_features', 'AI Features'],
      ['integrations', 'Integrations'],
      ['security', 'Security'],
    ].map(([moduleKey, title]) => ({
      moduleKey,
      title,
      status: 'mvp_foundation',
      storage: 'crm_module_records',
    }));
  }

  async createTenant(dto: CreateCrmTenantDto) {
    return this.tenants.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      { ...dto, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async upsertMembership(dto: UpsertCrmUserMembershipDto) {
    const userId = new Types.ObjectId(dto.userId);
    const tenantId = new Types.ObjectId(dto.tenantId);
    return this.memberships.findOneAndUpdate(
      { userId, tenantId, role: dto.role },
      {
        ...dto,
        userId,
        tenantId,
        branchIds: dto.branchIds?.map((id) => new Types.ObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listUserContexts(userId: string) {
    return this.memberships
      .find({ userId: new Types.ObjectId(userId), status: 'active' })
      .populate('tenantId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .sort({ role: 1, createdAt: 1 })
      .lean();
  }

  async selectContext(userId: string, dto: SelectCrmContextDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const membership = await this.memberships
      .findOne({
        userId: new Types.ObjectId(userId),
        tenantId,
        role: dto.role,
        status: 'active',
      })
      .populate('tenantId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .lean();

    if (!membership) {
      throw new ForbiddenException(
        'CRM context is not available for this user',
      );
    }

    if (
      dto.branchId &&
      membership.branchIds.length > 0 &&
      !membership.branchIds.some(
        (branch) => String(branch._id) === dto.branchId,
      )
    ) {
      throw new ForbiddenException('CRM branch is not available for this user');
    }

    return {
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      role: membership.role,
      permissions: membership.permissions,
      tenant: membership.tenantId,
      branches: membership.branchIds,
    };
  }

  async listTenants() {
    return this.tenants.find({ status: 'active' }).sort({ name: 1 }).lean();
  }

  async createBranch(dto: CreateCrmBranchDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    return this.branches.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listBranches(tenantId: string) {
    return this.branches
      .find({ tenantId: new Types.ObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadSource(dto: CreateCrmLeadSourceDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    return this.sources.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadSources(tenantId: string) {
    return this.sources
      .find({ tenantId: new Types.ObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadStage(dto: CreateCrmLeadStageDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    return this.stages.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadStages(tenantId: string) {
    return this.stages
      .find({ tenantId: new Types.ObjectId(tenantId), status: 'active' })
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async createLead(userId: string | undefined, dto: CreateCrmLeadDto) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    const lead = await this.leads.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      sourceId: dto.sourceId ? new Types.ObjectId(dto.sourceId) : undefined,
      stageId: dto.stageId ? new Types.ObjectId(dto.stageId) : undefined,
      branchId: dto.branchId ? new Types.ObjectId(dto.branchId) : undefined,
      nextFollowUpAt: dto.nextFollowUpAt
        ? new Date(dto.nextFollowUpAt)
        : undefined,
      createdBy,
    });
    await this.addLeadActivity(userId, String(lead._id), {
      tenantId: dto.tenantId,
      type: 'lead_created',
      subject: 'Lead created',
      metadata: { source: dto.sourceId },
    });
    return lead;
  }

  async capturePublicLead(dto: PublicCrmLeadCaptureDto) {
    const tenant = await this.tenants.findOne({
      code: dto.tenantCode.toUpperCase(),
      status: 'active',
    });
    if (!tenant) throw new NotFoundException('CRM tenant not found');
    return this.createLead(undefined, {
      tenantId: String(tenant._id),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      interestedPrograms: dto.program ? [dto.program] : [],
      temperature: 'warm',
      utm: dto.utm,
    });
  }

  async listLeads(tenantId: string) {
    return this.leads
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getLead(tenantId: string, leadId: string) {
    const lead = await this.leads
      .findOne({
        _id: new Types.ObjectId(leadId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean();
    if (!lead) throw new NotFoundException('CRM lead not found');
    return lead;
  }

  async assignLead(userId: string, leadId: string, dto: AssignCrmLeadDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), tenantId },
      { assignedTo: new Types.ObjectId(dto.assignedTo), status: 'open' },
      { new: true },
    );
    if (!lead) throw new NotFoundException('CRM lead not found');
    await this.assignments.create({
      tenantId: lead.tenantId,
      leadId: lead._id,
      assignedTo: new Types.ObjectId(dto.assignedTo),
      assignedBy: new Types.ObjectId(userId),
      assignmentMethod: dto.assignmentMethod ?? 'manual',
    });
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'assignment_changed',
      subject: 'Lead assigned',
      metadata: { assignedTo: dto.assignedTo },
    });
    return lead;
  }

  async changeLeadStage(
    userId: string,
    leadId: string,
    dto: ChangeCrmLeadStageDto,
  ) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), tenantId },
      { stageId: new Types.ObjectId(dto.stageId) },
      { new: true },
    );
    if (!lead) throw new NotFoundException('CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'stage_changed',
      subject: 'Lead stage changed',
      description: dto.reason,
      metadata: { stageId: dto.stageId },
    });
    return lead;
  }

  async addLeadActivity(
    userId: string | undefined,
    leadId: string,
    dto: AddCrmLeadActivityDto,
  ) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads
      .findOne({ _id: new Types.ObjectId(leadId), tenantId })
      .lean();
    if (!lead) throw new NotFoundException('CRM lead not found');
    const performedBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    return this.activities.create({
      ...dto,
      tenantId: lead.tenantId,
      leadId: lead._id,
      performedBy,
      occurredAt: new Date(),
    });
  }

  async listLeadTimeline(tenantId: string, leadId: string) {
    return this.activities
      .find({
        tenantId: new Types.ObjectId(tenantId),
        leadId: new Types.ObjectId(leadId),
      })
      .sort({ occurredAt: -1 })
      .lean();
  }

  async listApplications(tenantId: string) {
    return this.applications
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async createApplication(dto: CreateCrmApplicationDto) {
    const count = await this.applications.countDocuments({
      tenantId: new Types.ObjectId(dto.tenantId),
    });
    return this.applications.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      leadId: dto.leadId ? new Types.ObjectId(dto.leadId) : undefined,
      applicationNumber: `APP-${String(count + 1).padStart(6, '0')}`,
    });
  }

  async createTask(userId: string, dto: CreateCrmTaskDto) {
    return this.tasks.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      entityId: new Types.ObjectId(dto.entityId),
      assignedTo: new Types.ObjectId(dto.assignedTo),
      assignedBy: new Types.ObjectId(userId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });
  }

  async listTasks(tenantId: string) {
    return this.tasks
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(50)
      .lean();
  }

  async createCampaign(dto: CreateCrmCampaignDto) {
    return this.campaigns.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
    });
  }

  async listCampaigns(tenantId: string) {
    return this.campaigns
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async createCommunication(dto: CreateCrmCommunicationDto) {
    return this.communications.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      entityId: new Types.ObjectId(dto.entityId),
    });
  }

  async listCommunications(tenantId: string) {
    return this.communications
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async createModuleRecord(
    userId: string | undefined,
    dto: CreateCrmModuleRecordDto,
  ) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    return this.moduleRecords.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      ownerId: dto.ownerId ? new Types.ObjectId(dto.ownerId) : undefined,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      createdBy,
    });
  }

  async listModuleRecords(
    tenantId: string,
    moduleKey?: string,
    status?: string,
  ) {
    return this.moduleRecords
      .find({
        tenantId: new Types.ObjectId(tenantId),
        ...(moduleKey ? { moduleKey } : {}),
        ...(status ? { status } : {}),
      })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(100)
      .lean();
  }

  async updateModuleRecord(recordId: string, dto: UpdateCrmModuleRecordDto) {
    const update = {
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      ownerId: dto.ownerId ? new Types.ObjectId(dto.ownerId) : undefined,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    };
    const record = await this.moduleRecords.findOneAndUpdate(
      { _id: new Types.ObjectId(recordId), tenantId: update.tenantId },
      update,
      { new: true },
    );
    if (!record) throw new NotFoundException('CRM module record not found');
    return record;
  }

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
