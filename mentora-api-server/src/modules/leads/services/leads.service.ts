import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  AddLeadActivityDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
} from '../dto/leads.dto';
import {
  Lead,
  LeadActivity,
  LeadActivityDocument,
  LeadAssignment,
  LeadAssignmentDocument,
  LeadDocument,
} from '../schemas/leads.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leads: Model<LeadDocument>,
    @InjectModel(LeadActivity.name)
    private readonly activities: Model<LeadActivityDocument>,
    @InjectModel(LeadAssignment.name)
    private readonly assignments: Model<LeadAssignmentDocument>,
  ) {}

  async createLead(userId: string | undefined, dto: CreateLeadDto) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    const lead = await this.leads.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      sourceId: toOptionalObjectId(dto.sourceId),
      stageId: toOptionalObjectId(dto.stageId),
      branchId: toOptionalObjectId(dto.branchId),
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

  async listLeads(tenantId: string) {
    return this.leads
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async getLead(tenantId: string, leadId: string) {
    const lead = await this.leads
      .findOne({
        _id: toRequiredObjectId(leadId),
        tenantId: toTenantObjectId(tenantId),
      })
      .lean();
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    return lead;
  }

  async assignLead(userId: string, leadId: string, dto: AssignLeadDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: toRequiredObjectId(leadId), tenantId },
      { assignedTo: toRequiredObjectId(dto.assignedTo), status: 'open' },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.assignments.create({
      tenantId: lead.tenantId,
      leadId: lead._id,
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
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
    dto: ChangeLeadStageDto,
  ) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: toRequiredObjectId(leadId), tenantId },
      { stageId: toRequiredObjectId(dto.stageId) },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
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
    dto: AddLeadActivityDto,
  ) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const lead = await this.leads
      .findOne({ _id: toRequiredObjectId(leadId), tenantId })
      .lean();
    if (!lead) throw new NotFoundException('Education CRM lead not found');
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
        tenantId: toTenantObjectId(tenantId),
        leadId: toRequiredObjectId(leadId),
      })
      .sort({ occurredAt: -1 })
      .lean();
  }
}
