import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddCrmLeadActivityDto,
  AssignCrmLeadDto,
  ChangeCrmLeadStageDto,
  CreateCrmApplicationDto,
  CreateCrmLeadDto,
  CreateCrmTaskDto,
  CreateCrmTenantDto,
} from '../dto/education-crm.dto';
import {
  CrmApplication,
  CrmApplicationDocument,
  CrmLead,
  CrmLeadActivity,
  CrmLeadActivityDocument,
  CrmLeadAssignment,
  CrmLeadAssignmentDocument,
  CrmLeadDocument,
  CrmTask,
  CrmTaskDocument,
  CrmTenant,
  CrmTenantDocument,
} from '../schemas/education-crm.schemas';

@Injectable()
export class EducationCrmService {
  constructor(
    @InjectModel(CrmTenant.name)
    private readonly tenants: Model<CrmTenantDocument>,
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
  ) {}

  async createTenant(dto: CreateCrmTenantDto) {
    return this.tenants.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      { ...dto, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listTenants() {
    return this.tenants.find({ status: 'active' }).sort({ name: 1 }).lean();
  }

  async createLead(userId: string, dto: CreateCrmLeadDto) {
    const lead = await this.leads.create({
      ...dto,
      tenantId: new Types.ObjectId(dto.tenantId),
      sourceId: dto.sourceId ? new Types.ObjectId(dto.sourceId) : undefined,
      stageId: dto.stageId ? new Types.ObjectId(dto.stageId) : undefined,
      branchId: dto.branchId ? new Types.ObjectId(dto.branchId) : undefined,
      nextFollowUpAt: dto.nextFollowUpAt
        ? new Date(dto.nextFollowUpAt)
        : undefined,
      createdBy: new Types.ObjectId(userId),
    });
    await this.addLeadActivity(userId, String(lead._id), {
      tenantId: dto.tenantId,
      type: 'lead_created',
      subject: 'Lead created',
      metadata: { source: dto.sourceId },
    });
    return lead;
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
    userId: string,
    leadId: string,
    dto: AddCrmLeadActivityDto,
  ) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads
      .findOne({ _id: new Types.ObjectId(leadId), tenantId })
      .lean();
    if (!lead) throw new NotFoundException('CRM lead not found');
    return this.activities.create({
      ...dto,
      tenantId: lead.tenantId,
      leadId: lead._id,
      performedBy: new Types.ObjectId(userId),
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

  async getDashboard(tenantId: string) {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const [newLeads, openTasks, applications, hotLeads] = await Promise.all([
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
    ]);
    return { tenantId, newLeads, openTasks, applications, hotLeads };
  }
}
