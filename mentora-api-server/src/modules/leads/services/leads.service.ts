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
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import {
  LeadSource,
  LeadSourceDocument,
} from '@/common/crm/schemas/lead-source.schema';
import {
  LeadStage,
  LeadStageDocument,
} from '@/common/crm/schemas/lead-stage.schema';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  AddLeadActivityDto,
  AddLeadAttachmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  AssignLeadDto,
  ChangeLeadStageDto,
  CreateLeadDto,
  FindLeadDuplicatesDto,
  ImportLeadsDto,
  LeadTaxonomyListDto,
  ListLeadAssignmentsDto,
  ListLeadsDto,
  MergeLeadsDto,
  ScoreLeadDto,
  TransferLeadDto,
  UpdateLeadSourceDto,
  UpdateLeadStageDto,
  UpdateLeadDto,
  UpdateLeadTagsDto,
} from '../dto/leads.dto';
import { Lead, LeadDocument } from '../schemas/lead.schema';
import {
  LeadActivity,
  LeadActivityDocument,
} from '../schemas/lead-activity.schema';
import {
  LeadAssignment,
  LeadAssignmentDocument,
} from '../schemas/lead-assignment.schema';

// A SELF-scoped counselor only reaches their own leads; a BRANCH-scoped
// branch admin reaches every lead assigned within their branch; and so on
// up to PLATFORM (unrestricted). See common/rbac/data-scope.util.ts.
const LEAD_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'assignedTo',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
  teamField: 'teamId',
};

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leads: Model<LeadDocument>,
    @InjectModel(LeadActivity.name)
    private readonly activities: Model<LeadActivityDocument>,
    @InjectModel(LeadAssignment.name)
    private readonly assignments: Model<LeadAssignmentDocument>,
    @InjectModel(LeadSource.name)
    private readonly sources: Model<LeadSourceDocument>,
    @InjectModel(LeadStage.name)
    private readonly stages: Model<LeadStageDocument>,
    private readonly auditService: AdminAuditService,
    private readonly actorScope: ActorScopeService,
  ) {}

  async createLeadSource(userId: string, dto: CreateLeadSourceDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.sources.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        code: dto.code.toUpperCase(),
        createdBy: toOptionalObjectId(userId),
        organizationId,
        parentSourceId: toOptionalObjectId(dto.parentSourceId),
        updatedBy: toOptionalObjectId(userId),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async listLeadSources(query: LeadTaxonomyListDto): Promise<{
    items: Array<Record<string, unknown>>;
    pagination: Record<string, number>;
    sort: Record<string, string>;
  }> {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveTaxonomySortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const organizationId = toOrganizationObjectId(query.organizationId);
    const filter: FilterQuery<LeadSourceDocument> = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.sources
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.sources.countDocuments(filter),
    ]);
    const sourceIds = items.map((item) => item._id);
    const counts = await this.leads.aggregate<{
      _id: unknown;
      active: number;
      converted: number;
      total: number;
    }>([
      { $match: { organizationId, sourceId: { $in: sourceIds } } },
      {
        $group: {
          _id: '$sourceId',
          active: {
            $sum: { $cond: [{ $in: ['$status', ['new', 'open']] }, 1, 0] },
          },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));
    return this.toPaginatedResult(
      items.map((item) => {
        const count = countMap.get(String(item._id));
        const totalLeads = count?.total ?? 0;
        return {
          ...item,
          activeLeads: count?.active ?? 0,
          conversionRate:
            totalLeads > 0
              ? Math.round(((count?.converted ?? 0) / totalLeads) * 100)
              : 0,
        };
      }),
      total,
      page,
      limit,
      sortBy,
      sortOrder,
    );
  }

  async updateLeadSource(
    userId: string,
    sourceId: string,
    dto: UpdateLeadSourceDto,
  ) {
    const update: Record<string, unknown> = { ...dto };
    delete update.organizationId;
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.parentSourceId !== undefined) {
      update.parentSourceId = toOptionalObjectId(dto.parentSourceId);
    }
    if (dto.status === 'archived') update.archivedAt = new Date();
    update.updatedBy = toOptionalObjectId(userId);
    const source = await this.sources.findOneAndUpdate(
      {
        _id: toRequiredObjectId(sourceId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!source) throw new NotFoundException('Lead source not found');
    return source;
  }

  async exportLeadSources(organizationId: string) {
    const { items } = await this.listLeadSources({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'code', 'category', 'status', 'activeLeads'];
    return buildCsvExportFile(
      'lead-sources',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async createLeadStage(userId: string, dto: CreateLeadStageDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.stages.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        allowedNextStageIds:
          dto.allowedNextStageIds?.map((id) => toRequiredObjectId(id)) ?? [],
        code: dto.code.toUpperCase(),
        createdBy: toOptionalObjectId(userId),
        organizationId,
        updatedBy: toOptionalObjectId(userId),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  async listLeadStages(query: LeadTaxonomyListDto): Promise<{
    items: Array<Record<string, unknown>>;
    pagination: Record<string, number>;
    sort: Record<string, string>;
  }> {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveTaxonomySortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const organizationId = toOrganizationObjectId(query.organizationId);
    const filter: FilterQuery<LeadStageDocument> = {
      organizationId,
      ...(query.status ? { status: query.status } : {}),
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.stages
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.stages.countDocuments(filter),
    ]);
    const stageIds = items.map((item) => item._id);
    const counts = await this.leads.aggregate<{ _id: unknown; count: number }>([
      {
        $match: {
          organizationId,
          stageId: { $in: stageIds },
          status: { $in: ['new', 'open'] },
        },
      },
      { $group: { _id: '$stageId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count]),
    );
    return this.toPaginatedResult(
      items.map((item) => ({
        ...item,
        activeLeadCount: countMap.get(String(item._id)) ?? 0,
        conversionStage: item.isConverted,
        lostStage: item.isLost,
        sla: `${item.slaDurationHours ?? 24}h`,
      })),
      total,
      page,
      limit,
      sortBy,
      sortOrder,
    );
  }

  async updateLeadStage(
    userId: string,
    stageId: string,
    dto: UpdateLeadStageDto,
  ) {
    const update: Record<string, unknown> = { ...dto };
    delete update.organizationId;
    delete update.overrideReason;
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.allowedNextStageIds) {
      update.allowedNextStageIds = dto.allowedNextStageIds.map((id) =>
        toRequiredObjectId(id),
      );
    }
    if (dto.status === 'archived') update.archivedAt = new Date();
    update.updatedBy = toOptionalObjectId(userId);
    const stage = await this.stages.findOneAndUpdate(
      {
        _id: toRequiredObjectId(stageId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!stage) throw new NotFoundException('Lead stage not found');
    return stage;
  }

  async exportLeadStages(organizationId: string) {
    const { items } = await this.listLeadStages({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'code', 'order', 'category', 'status'];
    return buildCsvExportFile(
      'lead-stages',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async createLead(userId: string | undefined, dto: CreateLeadDto) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    const stage = dto.stageId
      ? await this.getStageOrThrow(dto.organizationId, dto.stageId)
      : await this.findInitialStage(dto.organizationId);
    const normalizedEmail = dto.email?.trim().toLowerCase();
    const normalizedPhone = this.normalizePhone(dto.phone);
    const duplicateIndicator = await this.hasExistingDuplicate(
      dto.organizationId,
      normalizedEmail,
      normalizedPhone,
    );
    const lead = await this.leads.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      email: normalizedEmail,
      phone: normalizedPhone,
      sourceId: toOptionalObjectId(dto.sourceId),
      stageId: stage?._id,
      branchId: toOptionalObjectId(dto.branchId),
      assignedTo: toOptionalObjectId(dto.assignedTo),
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      departmentId: toOptionalObjectId(dto.departmentId),
      leadNumber: await this.generateLeadNumber(dto.organizationId),
      teamId: toOptionalObjectId(dto.teamId),
      tags: this.normalizeTags(dto.tags),
      duplicateIndicator,
      nextFollowUpAt: dto.nextFollowUpAt
        ? new Date(dto.nextFollowUpAt)
        : undefined,
      slaDueAt: this.resolveSlaDueAt(stage),
      createdBy,
    });
    await this.addLeadActivity(userId, String(lead._id), {
      organizationId: dto.organizationId,
      type: 'lead_created',
      subject: 'Lead created',
      metadata: { source: dto.sourceId },
    });
    await this.writeAudit(
      userId,
      'lead.created',
      dto.organizationId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
      },
    );
    return lead;
  }

  async listLeads(query: ListLeadsDto, actorId?: string): Promise<unknown> {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveLeadSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const filter: FilterQuery<LeadDocument> = {
      organizationId: toOrganizationObjectId(query.organizationId),
      ...(query.assignedTo
        ? { assignedTo: toRequiredObjectId(query.assignedTo) }
        : {}),
      ...(query.branchId
        ? { branchId: toRequiredObjectId(query.branchId) }
        : {}),
      ...(query.departmentId
        ? { departmentId: toRequiredObjectId(query.departmentId) }
        : {}),
      ...(query.teamId ? { teamId: toRequiredObjectId(query.teamId) } : {}),
      ...(query.sourceId
        ? { sourceId: toRequiredObjectId(query.sourceId) }
        : {}),
      ...(query.stageId ? { stageId: toRequiredObjectId(query.stageId) } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.leadType ? { leadType: query.leadType } : {}),
      ...(query.persona ? { persona: query.persona } : {}),
      ...(query.captureChannel ? { captureChannel: query.captureChannel } : {}),
      ...(query.campaign ? { campaign: query.campaign } : {}),
      ...(query.interestedCourse
        ? { interestedCourse: query.interestedCourse }
        : {}),
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
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      query.organizationId,
    );
    const [items, total] = await Promise.all([
      this.leads
        .find(scopedFilter)
        .populate('sourceId', 'name code category')
        .populate('stageId', 'name code order category')
        .populate('assignedTo', 'firstName lastName email')
        .populate('branchId', 'name code')
        .populate('teamId', 'name code')
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.leads.countDocuments(scopedFilter),
    ]);
    const duplicateKeys = this.getDuplicateKeys(items);
    return {
      items: items.map((item) => ({
        ...item,
        ageOfLead: this.getAgeInDays(
          (item as Record<string, unknown>).createdAt,
        ),
        duplicateIndicator: this.isDuplicateLead(item, duplicateKeys),
      })),
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async listAssignments(query: ListLeadAssignmentsDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const filter = {
      organizationId: toOrganizationObjectId(query.organizationId),
      ...(query.assignedTo
        ? { assignedTo: toRequiredObjectId(query.assignedTo) }
        : {}),
      ...(query.branchId
        ? { branchId: toRequiredObjectId(query.branchId) }
        : {}),
      ...(query.departmentId
        ? { departmentId: toRequiredObjectId(query.departmentId) }
        : {}),
      ...(query.teamId ? { teamId: toRequiredObjectId(query.teamId) } : {}),
      ...(query.assignmentMethod
        ? { assignmentMethod: query.assignmentMethod }
        : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.assignments
        .find(filter)
        .populate(
          'leadId',
          'leadNumber firstName middleName lastName email phone',
        )
        .populate('previousOwner', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('branchId', 'name code')
        .populate('departmentId', 'name code')
        .populate('teamId', 'name code')
        .populate('assignedBy', 'firstName lastName email')
        .sort({ assignedAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.assignments.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy: 'assignedAt', sortOrder: 'desc' },
    };
  }

  async exportAssignments(organizationId: string) {
    const { items } = await this.listAssignments({
      organizationId,
      limit: '1000',
    });
    const headers = [
      'id',
      'lead',
      'assignedTo',
      'assignmentMethod',
      'assignedAt',
    ];
    const rows = (items as Array<Record<string, unknown>>).map((item) => {
      const lead = item.leadId as
        | { leadNumber?: string; firstName?: string; lastName?: string }
        | undefined;
      const assignee = item.assignedTo as
        | { firstName?: string; lastName?: string; email?: string }
        | undefined;
      return {
        id: String(item._id),
        lead: lead
          ? `${lead.leadNumber ?? ''} ${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim()
          : '',
        assignedTo: assignee
          ? `${assignee.firstName ?? ''} ${assignee.lastName ?? ''} <${assignee.email ?? ''}>`.trim()
          : '',
        assignmentMethod: item.assignmentMethod,
        assignedAt: item.assignedAt,
      };
    });
    return buildCsvExportFile('lead-assignments', headers, rows);
  }

  async updateLead(userId: string, leadId: string, dto: UpdateLeadDto) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
      ...(dto.phone ? { phone: this.normalizePhone(dto.phone) } : {}),
      ...(dto.branchId ? { branchId: toRequiredObjectId(dto.branchId) } : {}),
      ...(dto.departmentId
        ? { departmentId: toRequiredObjectId(dto.departmentId) }
        : {}),
      ...(dto.sourceId ? { sourceId: toRequiredObjectId(dto.sourceId) } : {}),
      ...(dto.teamId ? { teamId: toRequiredObjectId(dto.teamId) } : {}),
      ...(dto.assignedTo
        ? { assignedTo: toRequiredObjectId(dto.assignedTo) }
        : {}),
      ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
      ...(dto.tags ? { tags: this.normalizeTags(dto.tags) } : {}),
      ...(dto.nextFollowUpAt
        ? { nextFollowUpAt: new Date(dto.nextFollowUpAt) }
        : {}),
    };
    if (dto.stageId) {
      const stage = await this.getStageOrThrow(dto.organizationId, dto.stageId);
      update.stageId = stage._id;
      update.slaDueAt = this.resolveSlaDueAt(stage);
      if (stage.isConverted) update.status = 'won';
      if (stage.isLost) update.status = 'lost';
    }
    delete update.organizationId;
    const updateFilter = await this.applyScope(
      {
        _id: toRequiredObjectId(leadId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      userId,
      dto.organizationId,
    );
    const lead = await this.leads.findOneAndUpdate(
      updateFilter,
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'note_added',
      subject: 'Lead updated',
      metadata: { fields: Object.keys(update) },
    });
    await this.writeAudit(
      userId,
      'lead.updated',
      dto.organizationId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        metadata: { fields: Object.keys(update) },
      },
    );
    return lead;
  }

  async archiveLead(userId: string, leadId: string, organizationId: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(leadId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      userId,
      organizationId,
    );
    const lead = await this.leads.findOneAndUpdate(
      filter,
      { $set: { status: 'archived' } },
      { new: true, runValidators: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      organizationId,
      type: 'note_added',
      subject: 'Lead archived',
    });
    await this.writeAudit(userId, 'lead.archived', organizationId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
    });
    return lead;
  }

  async updateTags(userId: string, leadId: string, dto: UpdateLeadTagsDto) {
    const lead = await this.leads.findOneAndUpdate(
      {
        _id: toRequiredObjectId(leadId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { tags: this.normalizeTags(dto.tags) },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'note_added',
      subject: 'Lead tags updated',
      metadata: { tags: lead.tags },
    });
    await this.writeAudit(
      userId,
      'lead.tags_updated',
      dto.organizationId,
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
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $push: { [field]: attachment } },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'note_added',
      subject:
        attachment.type === 'voice_note'
          ? 'Lead voice note added'
          : 'Lead attachment added',
      metadata: attachment,
    });
    await this.writeAudit(
      userId,
      'lead.attachment_added',
      dto.organizationId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        metadata: attachment,
      },
    );
    return lead;
  }

  async scoreLead(userId: string, leadId: string, dto: ScoreLeadDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const lead = await this.leads.findOne({
      _id: toRequiredObjectId(leadId),
      organizationId,
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
      organizationId: dto.organizationId,
      type: 'note_added',
      subject: 'Lead score recalculated',
      metadata: { score, temperature },
    });
    await this.writeAudit(userId, 'lead.scored', dto.organizationId, lead._id, {
      after: this.toAuditRecord(lead.toObject()),
      metadata: { score, temperature },
    });
    return lead;
  }

  async transferLead(userId: string, leadId: string, dto: TransferLeadDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const filter = await this.applyScope(
      { _id: toRequiredObjectId(leadId), organizationId },
      userId,
      dto.organizationId,
    );
    const previousLead = await this.leads
      .findOne(filter)
      .select('assignedTo')
      .lean();
    const lead = await this.leads.findOneAndUpdate(
      filter,
      {
        assignedTo: toRequiredObjectId(dto.assignedTo),
        branchId: toOptionalObjectId(dto.branchId),
        departmentId: toOptionalObjectId(dto.departmentId),
        teamId: toOptionalObjectId(dto.teamId),
        status: 'open',
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.assignments.create({
      organizationId: lead.organizationId,
      leadId: lead._id,
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
      branchId: toOptionalObjectId(dto.branchId),
      departmentId: toOptionalObjectId(dto.departmentId),
      previousOwner: previousLead?.assignedTo,
      assignmentMethod: 'manual',
      assignmentReason: dto.reason,
      teamId: toOptionalObjectId(dto.teamId),
    });
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'assignment_changed',
      subject: 'Lead transferred',
      description: dto.reason,
      metadata: {
        assignedTo: dto.assignedTo,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        teamId: dto.teamId,
      },
    });
    await this.writeAudit(
      userId,
      'lead.transferred',
      dto.organizationId,
      lead._id,
      {
        reason: dto.reason,
        after: this.toAuditRecord(lead.toObject()),
        metadata: { assignedTo: dto.assignedTo, branchId: dto.branchId },
      },
    );
    return lead;
  }

  async getLead(organizationId: string, leadId: string, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(leadId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const lead = await this.leads.findOne(filter).lean();
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    return lead;
  }

  async assignLead(userId: string, leadId: string, dto: AssignLeadDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const filter = await this.applyScope(
      { _id: toRequiredObjectId(leadId), organizationId },
      userId,
      dto.organizationId,
    );
    const previousLead = await this.leads
      .findOne(filter)
      .select('assignedTo')
      .lean();
    const lead = await this.leads.findOneAndUpdate(
      filter,
      {
        assignedTo: toRequiredObjectId(dto.assignedTo),
        branchId: toOptionalObjectId(dto.branchId),
        departmentId: toOptionalObjectId(dto.departmentId),
        status: 'open',
        teamId: toOptionalObjectId(dto.teamId),
      },
      { new: true },
    );
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    await this.assignments.create({
      organizationId: lead.organizationId,
      leadId: lead._id,
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
      assignmentReason: dto.assignmentReason,
      assignmentMethod: dto.assignmentMethod ?? 'manual',
      branchId: toOptionalObjectId(dto.branchId),
      departmentId: toOptionalObjectId(dto.departmentId),
      previousOwner: previousLead?.assignedTo,
      teamId: toOptionalObjectId(dto.teamId),
    });
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'assignment_changed',
      subject: 'Lead assigned',
      metadata: {
        assignedTo: dto.assignedTo,
        branchId: dto.branchId,
        departmentId: dto.departmentId,
        teamId: dto.teamId,
      },
    });
    await this.writeAudit(
      userId,
      'lead.assigned',
      dto.organizationId,
      lead._id,
      {
        after: this.toAuditRecord(lead.toObject()),
        metadata: { assignedTo: dto.assignedTo },
      },
    );
    return lead;
  }

  async changeLeadStage(
    userId: string,
    leadId: string,
    dto: ChangeLeadStageDto,
  ) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const filter = await this.applyScope(
      { _id: toRequiredObjectId(leadId), organizationId },
      userId,
      dto.organizationId,
    );
    const existingLead = await this.leads.findOne(filter);
    if (!existingLead) {
      throw new NotFoundException('Education CRM lead not found');
    }
    const nextStage = await this.getStageOrThrow(
      dto.organizationId,
      dto.stageId,
    );
    const currentStage = existingLead.stageId
      ? await this.stages.findOne({
          _id: existingLead.stageId,
          organizationId,
        })
      : null;
    this.validateStageTransition(
      existingLead,
      currentStage,
      nextStage,
      dto.reason,
    );
    existingLead.set({
      stageId: nextStage._id,
      slaDueAt: this.resolveSlaDueAt(nextStage),
      status: nextStage.isConverted
        ? 'won'
        : nextStage.isLost
          ? 'lost'
          : 'open',
    });
    await existingLead.save();
    await this.addLeadActivity(userId, leadId, {
      organizationId: dto.organizationId,
      type: 'stage_changed',
      subject: 'Lead stage changed',
      description: dto.reason,
      metadata: { stageId: dto.stageId },
    });
    await this.writeAudit(
      userId,
      'lead.stage_changed',
      dto.organizationId,
      existingLead._id,
      {
        after: this.toAuditRecord(existingLead.toObject()),
        reason: dto.reason,
        metadata: { stageId: dto.stageId },
      },
    );
    return existingLead;
  }

  async addLeadActivity(
    userId: string | undefined,
    leadId: string,
    dto: AddLeadActivityDto,
  ) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const lead = await this.leads
      .findOne({ _id: toRequiredObjectId(leadId), organizationId })
      .lean();
    if (!lead) throw new NotFoundException('Education CRM lead not found');
    const performedBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    return this.activities.create({
      ...dto,
      organizationId: lead.organizationId,
      leadId: lead._id,
      performedBy,
      occurredAt: new Date(),
    });
  }

  async listLeadTimeline(organizationId: string, leadId: string) {
    return this.activities
      .find({
        organizationId: toOrganizationObjectId(organizationId),
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
        organizationId: toOrganizationObjectId(dto.organizationId),
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

    const organizationId = toOrganizationObjectId(dto.organizationId);
    const [masterLead, sourceLead] = await Promise.all([
      this.leads.findOne({
        _id: toRequiredObjectId(masterLeadId),
        organizationId,
      }),
      this.leads.findOne({
        _id: toRequiredObjectId(dto.sourceLeadId),
        organizationId,
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
      { organizationId, leadId: sourceLead._id },
      { $set: { leadId: masterLead._id } },
    );
    await this.addLeadActivity(userId, String(masterLead._id), {
      organizationId: dto.organizationId,
      type: 'note_added',
      subject: 'Duplicate lead merged',
      description: dto.reason,
      metadata: { sourceLeadId: String(sourceLead._id) },
    });
    await this.writeAudit(
      userId,
      'lead.merged',
      dto.organizationId,
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
        organizationId: dto.organizationId,
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
        organizationId: dto.organizationId,
      });
      results.push({ status: 'created', leadId: String(lead._id) });
    }

    await this.writeAudit(
      userId,
      'lead.imported',
      dto.organizationId,
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

  async exportLeads(userId: string, organizationId: string): Promise<unknown> {
    const leadResult = await this.listLeads({ organizationId, limit: '1000' });
    const leads =
      (leadResult as { items?: Record<string, unknown>[] }).items ?? [];
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

    await this.writeAudit(userId, 'lead.exported', organizationId, undefined, {
      metadata: { exportedRows: leads.length },
    });

    return buildCsvExportFile(
      'leads',
      headers,
      leads.map((lead) => withStringId(lead)),
    );
  }

  private async writeAudit(
    userId: string | undefined,
    action: string,
    organizationId: string,
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
      resource: 'lead',
      targetId: targetId ? String(targetId) : undefined,
      reason: details.reason,
      before: details.before,
      after: details.after,
      metadata: { organizationId, ...(details.metadata ?? {}) },
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

  private normalizePhone(phone: string | undefined): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/[^\d+]/g, '').trim() || undefined;
  }

  private async hasExistingDuplicate(
    organizationId: string,
    email: string | undefined,
    phone: string | undefined,
  ): Promise<boolean> {
    const conditions: FilterQuery<LeadDocument>[] = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });
    if (conditions.length === 0) return false;

    return Boolean(
      await this.leads.exists({
        organizationId: toOrganizationObjectId(organizationId),
        status: { $ne: 'archived' },
        $or: conditions,
      }),
    );
  }

  private async findInitialStage(
    organizationId: string,
  ): Promise<LeadStageDocument | null> {
    return this.stages
      .findOne({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
        isInitial: true,
      })
      .sort({ order: 1, _id: 1 });
  }

  private async getStageOrThrow(
    organizationId: string,
    stageId: string,
  ): Promise<LeadStageDocument> {
    const stage = await this.stages.findOne({
      _id: toRequiredObjectId(stageId),
      organizationId: toOrganizationObjectId(organizationId),
      status: 'active',
    });
    if (!stage) throw new NotFoundException('Lead stage not found');
    return stage;
  }

  private resolveSlaDueAt(stage: LeadStageDocument | null): Date | undefined {
    if (!stage?.slaDurationHours || stage.slaDurationHours <= 0) {
      return undefined;
    }
    return new Date(Date.now() + stage.slaDurationHours * 60 * 60 * 1000);
  }

  private validateStageTransition(
    lead: LeadDocument,
    currentStage: LeadStageDocument | null,
    nextStage: LeadStageDocument,
    reason: string | undefined,
  ) {
    const allowedNextStageIds = Array.isArray(currentStage?.allowedNextStageIds)
      ? currentStage.allowedNextStageIds.map(String)
      : [];

    if (nextStage.requiresRemarks && !reason?.trim()) {
      throw new BadRequestException('Stage change remarks are required');
    }

    const missingFields = (nextStage.mandatoryFieldsBeforeEntry ?? []).filter(
      (field) => !this.hasLeadValue(lead, field),
    );
    if (missingFields.length > 0) {
      throw new BadRequestException(
        `Mandatory lead fields missing before stage change: ${missingFields.join(
          ', ',
        )}`,
      );
    }

    if (
      currentStage &&
      allowedNextStageIds.length > 0 &&
      !allowedNextStageIds.includes(String(nextStage._id))
    ) {
      throw new BadRequestException(
        'Lead cannot be moved to the requested stage from its current stage',
      );
    }
  }

  private hasLeadValue(lead: LeadDocument, field: string): boolean {
    const value = lead.get(field) as unknown;
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (value instanceof Date) return !Number.isNaN(value.getTime());
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number' || typeof value === 'boolean') return true;
    if (typeof value === 'object') return true;
    return false;
  }

  private async generateLeadNumber(organizationId: string): Promise<string> {
    const count = await this.leads.countDocuments({
      organizationId: toOrganizationObjectId(organizationId),
    });
    return `LEAD-${String(count + 1).padStart(6, '0')}`;
  }

  private getAgeInDays(createdAt: unknown): number {
    const created =
      createdAt instanceof Date ? createdAt : new Date(String(createdAt));
    if (Number.isNaN(created.getTime())) return 0;
    return Math.max(
      0,
      Math.floor((Date.now() - created.getTime()) / (24 * 60 * 60 * 1000)),
    );
  }

  private getDuplicateKeys(items: Array<Record<string, unknown>>) {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      [item.email, item.phone]
        .filter(
          (value): value is string =>
            typeof value === 'string' && value.length > 0,
        )
        .forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    });
    return counts;
  }

  private isDuplicateLead(
    item: Record<string, unknown>,
    counts: Map<string, number>,
  ): boolean {
    return [item.email, item.phone].some(
      (value) => typeof value === 'string' && (counts.get(value) ?? 0) > 1,
    );
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

  private resolveTaxonomySortBy(value?: string) {
    const allowed = new Set([
      'category',
      'code',
      'createdAt',
      'name',
      'order',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'name';
  }

  private toPaginatedResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 1 | -1,
  ) {
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

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  // Merges the caller's DataScope filter into an existing lead filter via
  // $and, so it never overwrites a field the caller already filtered on
  // (e.g. an explicit ?branchId= alongside a BRANCH-scoped actor).
  private async applyScope(
    filter: FilterQuery<LeadDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<LeadDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<LeadDocument>(
      scope,
      LEAD_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
