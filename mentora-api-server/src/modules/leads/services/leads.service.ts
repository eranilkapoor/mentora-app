import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  AddLeadActivityDto,
  AddLeadAttachmentDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
  FindLeadDuplicatesDto,
  ImportLeadsDto,
  ListLeadsDto,
  MergeLeadsDto,
  ScoreLeadDto,
  TransferLeadDto,
  UpdateLeadDto,
  UpdateLeadTagsDto,
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
    private readonly auditService: AdminAuditService,
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
      tags: this.normalizeTags(dto.tags),
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
    await this.writeAudit(userId, 'crm_lead.created', dto.tenantId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
    });
    return lead;
  }

  async listLeads(query: ListLeadsDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveLeadSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const filter: FilterQuery<LeadDocument> = {
      tenantId: toTenantObjectId(query.tenantId),
      ...(query.assignedTo
        ? { assignedTo: toRequiredObjectId(query.assignedTo) }
        : {}),
      ...(query.branchId
        ? { branchId: toRequiredObjectId(query.branchId) }
        : {}),
      ...(query.sourceId
        ? { sourceId: toRequiredObjectId(query.sourceId) }
        : {}),
      ...(query.stageId ? { stageId: toRequiredObjectId(query.stageId) } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.tag ? { tags: query.tag.trim().toLowerCase() } : {}),
      ...(query.temperature ? { temperature: query.temperature } : {}),
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { interestedPrograms: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.leads
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.leads.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async updateLead(userId: string, leadId: string, dto: UpdateLeadDto) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.branchId ? { branchId: toRequiredObjectId(dto.branchId) } : {}),
      ...(dto.sourceId ? { sourceId: toRequiredObjectId(dto.sourceId) } : {}),
      ...(dto.stageId ? { stageId: toRequiredObjectId(dto.stageId) } : {}),
      ...(dto.assignedTo
        ? { assignedTo: toRequiredObjectId(dto.assignedTo) }
        : {}),
      ...(dto.tags ? { tags: this.normalizeTags(dto.tags) } : {}),
      ...(dto.nextFollowUpAt
        ? { nextFollowUpAt: new Date(dto.nextFollowUpAt) }
        : {}),
    };
    delete update.tenantId;
    const lead = await this.leads.findOneAndUpdate(
      {
        _id: toRequiredObjectId(leadId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'note_added',
      subject: 'Lead updated',
      metadata: { fields: Object.keys(update) },
    });
    await this.writeAudit(userId, 'crm_lead.updated', dto.tenantId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
      metadata: { fields: Object.keys(update) },
    });
    return lead;
  }

  async archiveLead(userId: string, leadId: string, tenantId: string) {
    const lead = await this.leads.findOneAndUpdate(
      {
        _id: toRequiredObjectId(leadId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'archived' } },
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      tenantId,
      type: 'note_added',
      subject: 'Lead archived',
    });
    await this.writeAudit(userId, 'crm_lead.archived', tenantId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
    });
    return lead;
  }

  async updateTags(userId: string, leadId: string, dto: UpdateLeadTagsDto) {
    const lead = await this.leads.findOneAndUpdate(
      {
        _id: toRequiredObjectId(leadId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { tags: this.normalizeTags(dto.tags) },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'note_added',
      subject: 'Lead tags updated',
      metadata: { tags: lead.tags },
    });
    await this.writeAudit(
      userId,
      'crm_lead.tags_updated',
      dto.tenantId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        metadata: { tags: lead.tags },
      },
    );
    return lead;
  }

  async addAttachment(
    userId: string,
    leadId: string,
    dto: AddLeadAttachmentDto,
  ) {
    const attachment = {
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      size: dto.size ?? 0,
      type: dto.type ?? 'document',
      url: dto.url,
    };
    const field =
      attachment.type === 'voice_note' ? 'voiceNotes' : 'attachments';
    const lead = await this.leads.findOneAndUpdate(
      {
        _id: toRequiredObjectId(leadId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $push: { [field]: attachment } },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'note_added',
      subject:
        attachment.type === 'voice_note'
          ? 'Lead voice note added'
          : 'Lead attachment added',
      metadata: attachment,
    });
    await this.writeAudit(
      userId,
      'crm_lead.attachment_added',
      dto.tenantId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        metadata: attachment,
      },
    );
    return lead;
  }

  async scoreLead(userId: string, leadId: string, dto: ScoreLeadDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const lead = await this.leads.findOne({
      _id: toRequiredObjectId(leadId),
      tenantId,
    });
    if (!lead) throw new NotFoundException('Education CRM lead not found');

    const programCount = lead.interestedPrograms?.length ?? 0;
    const hasContact = Boolean(lead.email || lead.phone);
    const hasFollowUp = Boolean(lead.nextFollowUpAt);
    const engagement =
      typeof dto.signals?.engagement === 'number' ? dto.signals.engagement : 0;
    const score = Math.min(
      100,
      Math.max(
        0,
        30 +
          (hasContact ? 20 : 0) +
          Math.min(programCount * 8, 24) +
          (hasFollowUp ? 12 : 0) +
          Math.min(engagement, 14),
      ),
    );
    const temperature = score >= 75 ? 'hot' : score >= 45 ? 'warm' : 'cold';

    lead.set({
      score,
      scoreBreakdown: {
        engagement,
        hasContact,
        hasFollowUp,
        programCount,
        source: 'rules_v1',
      },
      temperature,
    });
    await lead.save();
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'note_added',
      subject: 'Lead score recalculated',
      metadata: { score, temperature },
    });
    await this.writeAudit(userId, 'crm_lead.scored', dto.tenantId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
      metadata: { score, temperature },
    });
    return lead;
  }

  async transferLead(userId: string, leadId: string, dto: TransferLeadDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const lead = await this.leads.findOneAndUpdate(
      { _id: toRequiredObjectId(leadId), tenantId },
      {
        assignedTo: toRequiredObjectId(dto.assignedTo),
        branchId: toOptionalObjectId(dto.branchId),
        status: 'open',
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.assignments.create({
      tenantId: lead.tenantId,
      leadId: lead._id,
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
      assignmentMethod: 'manual',
    });
    await this.addLeadActivity(userId, leadId, {
      tenantId: dto.tenantId,
      type: 'assignment_changed',
      subject: 'Lead transferred',
      description: dto.reason,
      metadata: { assignedTo: dto.assignedTo, branchId: dto.branchId },
    });
    await this.writeAudit(
      userId,
      'crm_lead.transferred',
      dto.tenantId,
      lead._id,
      {
        reason: dto.reason,
        after: this.toAuditRecord(lead.toObject()),
        metadata: { assignedTo: dto.assignedTo, branchId: dto.branchId },
      },
    );
    return lead;
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
    await this.writeAudit(userId, 'crm_lead.assigned', dto.tenantId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
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
    await this.writeAudit(
      userId,
      'crm_lead.stage_changed',
      dto.tenantId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        reason: dto.reason,
        metadata: { stageId: dto.stageId },
      },
    );
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

  async findDuplicates(dto: FindLeadDuplicatesDto) {
    const conditions: FilterQuery<LeadDocument>[] = [];
    if (dto.email) conditions.push({ email: dto.email.toLowerCase().trim() });
    if (dto.phone) conditions.push({ phone: dto.phone.trim() });

    if (conditions.length === 0) {
      throw new BadRequestException('Email or phone is required');
    }

    return this.leads
      .find({
        tenantId: toTenantObjectId(dto.tenantId),
        $or: conditions,
      })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
  }

  async mergeLeads(userId: string, masterLeadId: string, dto: MergeLeadsDto) {
    if (masterLeadId === dto.sourceLeadId) {
      throw new BadRequestException('Master and source lead must be different');
    }

    const tenantId = toTenantObjectId(dto.tenantId);
    const [masterLead, sourceLead] = await Promise.all([
      this.leads.findOne({ _id: toRequiredObjectId(masterLeadId), tenantId }),
      this.leads.findOne({
        _id: toRequiredObjectId(dto.sourceLeadId),
        tenantId,
      }),
    ]);

    if (!masterLead || !sourceLead) {
      throw new NotFoundException('Education CRM lead not found');
    }

    const beforeMaster = this.toAuditRecord(masterLead.toObject());
    const beforeSource = this.toAuditRecord(sourceLead.toObject());
    const mergedPrograms = [
      ...new Set([
        ...masterLead.interestedPrograms,
        ...sourceLead.interestedPrograms,
      ]),
    ];

    masterLead.set({
      lastName: masterLead.lastName ?? sourceLead.lastName,
      email: masterLead.email ?? sourceLead.email,
      phone: masterLead.phone ?? sourceLead.phone,
      city: masterLead.city ?? sourceLead.city,
      state: masterLead.state ?? sourceLead.state,
      sourceId: masterLead.sourceId ?? sourceLead.sourceId,
      branchId: masterLead.branchId ?? sourceLead.branchId,
      interestedPrograms: mergedPrograms,
      score: Math.max(masterLead.score, sourceLead.score),
      temperature:
        masterLead.temperature === 'hot' || sourceLead.temperature === 'hot'
          ? 'hot'
          : masterLead.temperature,
      customFields: {
        ...sourceLead.customFields,
        ...masterLead.customFields,
        ...(dto.fieldOverrides ?? {}),
        mergedLeadIds: [
          ...this.toStringArray(masterLead.customFields?.mergedLeadIds),
          String(sourceLead._id),
        ],
      },
    });

    sourceLead.set({
      status: 'duplicate',
      customFields: {
        ...sourceLead.customFields,
        duplicateOfLeadId: String(masterLead._id),
        duplicateReason: dto.reason,
      },
    });

    await Promise.all([masterLead.save(), sourceLead.save()]);
    await this.activities.updateMany(
      { tenantId, leadId: sourceLead._id },
      { $set: { leadId: masterLead._id } },
    );
    await this.addLeadActivity(userId, String(masterLead._id), {
      tenantId: dto.tenantId,
      type: 'note_added',
      subject: 'Duplicate lead merged',
      description: dto.reason,
      metadata: { sourceLeadId: String(sourceLead._id) },
    });
    await this.writeAudit(
      userId,
      'crm_lead.merged',
      dto.tenantId,
      masterLead._id,
      {
        reason: dto.reason,
        before: { masterLead: beforeMaster, sourceLead: beforeSource },
        after: {
          masterLead: this.toAuditRecord(masterLead.toObject()),
          sourceLead: this.toAuditRecord(sourceLead.toObject()),
        },
        metadata: { sourceLeadId: String(sourceLead._id) },
      },
    );

    return { masterLead, sourceLead };
  }

  async importLeads(userId: string, dto: ImportLeadsDto) {
    const results = [];

    for (const row of dto.rows) {
      const duplicateMatches = await this.findDuplicates({
        tenantId: dto.tenantId,
        email: row.email,
        phone: row.phone,
      }).catch(() => []);

      if (duplicateMatches.length > 0) {
        results.push({
          status: 'duplicate',
          email: row.email,
          phone: row.phone,
          duplicateLeadIds: duplicateMatches.map((lead) => String(lead._id)),
        });
        continue;
      }

      const lead = await this.createLead(userId, {
        ...row,
        tenantId: dto.tenantId,
      });
      results.push({ status: 'created', leadId: String(lead._id) });
    }

    await this.writeAudit(
      userId,
      'crm_lead.imported',
      dto.tenantId,
      undefined,
      {
        metadata: {
          totalRows: dto.rows.length,
          created: results.filter((row) => row.status === 'created').length,
          duplicates: results.filter((row) => row.status === 'duplicate')
            .length,
        },
      },
    );

    return { totalRows: dto.rows.length, results };
  }

  async exportLeads(userId: string, tenantId: string) {
    const leadResult = await this.listLeads({ tenantId, limit: '1000' });
    const leads = leadResult.items;
    const headers = [
      'id',
      'firstName',
      'lastName',
      'email',
      'phone',
      'city',
      'state',
      'status',
      'temperature',
      'score',
    ];
    const csv = [
      headers.join(','),
      ...leads.map((lead) =>
        headers
          .map((header) => this.csvValue(lead[header as keyof typeof lead]))
          .join(','),
      ),
    ].join('\n');

    await this.writeAudit(userId, 'crm_lead.exported', tenantId, undefined, {
      metadata: { exportedRows: leads.length },
    });

    return {
      filename: `mentora-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      contentType: 'text/csv',
      rows: leads,
      csv,
    };
  }

  private async writeAudit(
    userId: string | undefined,
    action: string,
    tenantId: string,
    targetId: Types.ObjectId | undefined,
    details: {
      reason?: string;
      before?: Record<string, unknown> | null;
      after?: Record<string, unknown> | null;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return;
    }

    await this.auditService.write({
      actorId: userId,
      action,
      resource: 'crm_lead',
      targetId: targetId ? String(targetId) : undefined,
      reason: details.reason,
      before: details.before,
      after: details.after,
      metadata: { tenantId, ...(details.metadata ?? {}) },
    });
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  private toStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string')
      : [];
  }

  private normalizeTags(tags: string[] | undefined): string[] {
    return [
      ...new Set(
        (tags ?? [])
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0),
      ),
    ];
  }

  private resolveLeadSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'lastContactedAt',
      'nextFollowUpAt',
      'score',
      'slaDueAt',
      'status',
      'temperature',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private csvValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const text = Array.isArray(value)
      ? value.map((item) => this.csvScalar(item)).join('; ')
      : this.csvScalar(value);
    return `"${text.replaceAll('"', '""')}"`;
  }

  private csvScalar(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    return JSON.stringify(value);
  }
}
