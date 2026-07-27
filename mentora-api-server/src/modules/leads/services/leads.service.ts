import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    return lead;
  }

  async assignLead(userId: string, leadId: string, dto: AssignLeadDto) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), tenantId },
      { assignedTo: new Types.ObjectId(dto.assignedTo), status: 'open' },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
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
    dto: ChangeLeadStageDto,
  ) {
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: new Types.ObjectId(leadId), tenantId },
      { stageId: new Types.ObjectId(dto.stageId) },
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
    const tenantId = new Types.ObjectId(dto.tenantId);
    const lead = await this.leads
      .findOne({ _id: new Types.ObjectId(leadId), tenantId })
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
        tenantId: new Types.ObjectId(tenantId),
        leadId: new Types.ObjectId(leadId),
      })
      .sort({ occurredAt: -1 })
      .lean();
  }
}
