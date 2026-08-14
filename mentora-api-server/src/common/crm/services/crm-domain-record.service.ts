import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '../dto/crm-domain-record.dto';

type CrmDomainRecordDocument = {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  title: string;
  status: string;
  payload?: Record<string, unknown>;
  toObject(): Record<string, unknown>;
};

type CrmDomainRecordLean = Record<string, unknown>;

export type CrmDomainRecordListOptions = {
  limit?: string;
  page?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

export class CrmDomainRecordService<TDocument extends CrmDomainRecordDocument> {
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly auditService: AdminAuditService,
    protected readonly resource: string,
  ) {}

  async create(
    userId: string,
    dto: CreateCrmDomainRecordDto,
  ): Promise<TDocument> {
    const record = await this.model.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      ownerId: toOptionalObjectId(dto.ownerId),
      branchId: toOptionalObjectId(dto.branchId),
      departmentId: toOptionalObjectId(dto.departmentId),
      teamId: toOptionalObjectId(dto.teamId),
      relatedLeadId: toOptionalObjectId(dto.relatedLeadId),
      relatedApplicationId: toOptionalObjectId(dto.relatedApplicationId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      ...this.toRecordSpecificFields(dto.payload),
      createdBy: toRequiredObjectId(userId),
    });
    await this.writeAudit(
      userId,
      `${this.resource}.created`,
      dto.organizationId,
      record,
    );
    return record as TDocument;
  }

  async list(options: CrmDomainRecordListOptions): Promise<{
    items: CrmDomainRecordLean[];
    pagination: {
      limit: number;
      page: number;
      total: number;
      totalPages: number;
    };
    sort: { sortBy: string; sortOrder: 'asc' | 'desc' };
  }> {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.priority ? { priority: options.priority } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
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

  async update(
    userId: string,
    recordId: string,
    dto: UpdateCrmDomainRecordDto,
  ): Promise<TDocument> {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        ...dto,
        organizationId: toOrganizationObjectId(dto.organizationId),
        ownerId: toOptionalObjectId(dto.ownerId),
        branchId: toOptionalObjectId(dto.branchId),
        departmentId: toOptionalObjectId(dto.departmentId),
        teamId: toOptionalObjectId(dto.teamId),
        relatedLeadId: toOptionalObjectId(dto.relatedLeadId),
        relatedApplicationId: toOptionalObjectId(dto.relatedApplicationId),
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        ...this.toRecordSpecificFields(dto.payload),
      },
      { new: true },
    );
    if (!record)
      throw new NotFoundException(`${this.resource} record not found`);
    await this.writeAudit(
      userId,
      `${this.resource}.updated`,
      dto.organizationId,
      record,
    );
    return record;
  }

  async getById(recordId: string, organizationId: string): Promise<TDocument> {
    const record = await this.model.findOne({
      _id: toRequiredObjectId(recordId),
      organizationId: toOrganizationObjectId(organizationId),
    });
    if (!record)
      throw new NotFoundException(`${this.resource} record not found`);
    return record;
  }

  async complete(
    userId: string,
    recordId: string,
    dto: CompleteCrmDomainRecordDto,
  ): Promise<TDocument> {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        $set: {
          status: dto.outcome === 'failed' ? 'rejected' : 'completed',
          completedAt: new Date(),
          'payload.completion': {
            completedAt: new Date().toISOString(),
            completedBy: userId,
            outcome: dto.outcome ?? 'completed',
            score: dto.score,
            result: dto.result ?? {},
          },
        },
      },
      { new: true },
    );
    if (!record)
      throw new NotFoundException(`${this.resource} record not found`);
    await this.writeAudit(
      userId,
      `${this.resource}.completed`,
      dto.organizationId,
      record,
    );
    return record;
  }

  async restore(
    userId: string,
    recordId: string,
    organizationId: string,
  ): Promise<TDocument> {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'open' } },
      { new: true },
    );
    if (!record)
      throw new NotFoundException(`${this.resource} record not found`);
    await this.writeAudit(
      userId,
      `${this.resource}.restored`,
      organizationId,
      record,
    );
    return record;
  }

  async bulkUpdateStatus(
    userId: string,
    dto: BulkUpdateCrmDomainRecordStatusDto,
  ): Promise<{ matched: number; modified: number; status: string }> {
    const recordIds = dto.recordIds.map((recordId) =>
      toRequiredObjectId(recordId),
    );
    const result = await this.model.updateMany(
      {
        _id: { $in: recordIds },
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        $set: {
          status: dto.status,
          updatedAt: new Date(),
        },
      },
    );
    await this.auditService.write({
      actorId: userId,
      action: `${this.resource}.bulk_status_updated`,
      resource: this.resource,
      after: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        status: dto.status,
      },
      metadata: {
        recordIds: dto.recordIds,
        organizationId: dto.organizationId,
      },
    });
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status: dto.status,
    };
  }

  async archive(
    userId: string,
    recordId: string,
    organizationId: string,
  ): Promise<TDocument> {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!record)
      throw new NotFoundException(`${this.resource} record not found`);
    await this.writeAudit(
      userId,
      `${this.resource}.archived`,
      organizationId,
      record,
    );
    return record;
  }

  async exportRecords(organizationId: string) {
    const { items } = await this.list({ organizationId, limit: '1000' });
    const headers = [
      'id',
      'title',
      'description',
      'status',
      'priority',
      'ownerId',
      'dueAt',
      'createdAt',
    ];
    return buildCsvExportFile(
      this.resource,
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'dueAt',
      'priority',
      'status',
      'title',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toRecordSpecificFields(
    payload: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    if (!payload) return {};
    const result: Record<string, unknown> = {};
    const stringFields = [
      'accessLevel',
      'agreementStatus',
      'academicYear',
      'batchName',
      'calendarEventId',
      'category',
      'code',
      'color',
      'commissionType',
      'contactEmail',
      'contactName',
      'contentType',
      'country',
      'countryCode',
      'countryName',
      'courseName',
      'currency',
      'deliveryStatus',
      'direction',
      'disposition',
      'eligibility',
      'eligibilityStatus',
      'entryType',
      'errorPolicy',
      'eventType',
      'exportStatus',
      'fileName',
      'fileUrl',
      'feeStatus',
      'format',
      'ledgerType',
      'location',
      'level',
      'meetingType',
      'meetingUrl',
      'module',
      'moduleKey',
      'name',
      'onboardingStatus',
      'operation',
      'optInStatus',
      'outcome',
      'partnerCode',
      'partnerName',
      'partnerType',
      'phone',
      'phoneNumber',
      'providerCallId',
      'providerMessageId',
      'paymentStatus',
      'provisioningStatus',
      'publishStatus',
      'queue',
      'recommendation',
      'recordingUrl',
      'result',
      'resultUrl',
      'schemeName',
      'provider',
      'seoDescription',
      'seoTitle',
      'settlementStatus',
      'slug',
      'scope',
      'specializationName',
      'stream',
      'templateName',
      'territory',
      'url',
      'verificationStatus',
      'visibility',
      'visaRequirement',
      'website',
      'workRights',
      'correlationId',
    ];
    stringFields.forEach((field) => {
      if (typeof payload[field] === 'string' && payload[field]) {
        result[field] = payload[field];
      }
    });
    const startAt = this.toOptionalDate(payload.startAt);
    const endAt = this.toOptionalDate(payload.endAt);
    if (startAt) result.startAt = startAt;
    if (endAt) result.endAt = endAt;
    [
      'approvedAt',
      'awardDate',
      'checkInAt',
      'checkOutAt',
      'dueDate',
      'endedAt',
      'enrolledAt',
      'followUpAt',
      'lastAccessedAt',
      'lastMessageAt',
      'offerAcceptedAt',
      'paidAt',
      'publishedAt',
      'scheduledAt',
      'startedAt',
      'expiresAt',
    ].forEach((field) => {
      const date = this.toOptionalDate(payload[field]);
      if (date) result[field] = date;
    });
    [
      'approvedBy',
      'branchId',
      'departmentId',
      'hostId',
      'invoiceId',
      'leadStageId',
      'ownerId',
      'parentId',
      'paymentId',
      'programId',
      'relatedApplicationId',
      'relatedLeadId',
      'reportsToUserId',
      'sourceId',
      'studentId',
      'subjectId',
      'teamId',
      'userId',
    ].forEach((field) => {
      const value = payload[field];
      const objectId =
        typeof value === 'string' ? toOptionalObjectId(value) : undefined;
      if (objectId) result[field] = objectId;
    });
    [
      'amount',
      'approvalLevel',
      'approvedAmount',
      'capacity',
      'commissionRate',
      'discountPercent',
      'durationSeconds',
      'hourlyRate',
      'price',
      'ranking',
      'rating',
      'registrationCount',
      'requestedAmount',
      'score',
      'seats',
      'unreadCount',
      'usageCount',
      'version',
      'totalRows',
      'processedRows',
      'successRows',
      'failedRows',
      'executionLimitPerHour',
      'durationMs',
      'rowCount',
      'fileSize',
    ].forEach((field) => {
      const value = payload[field];
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[field] = value;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) result[field] = parsed;
      }
    });
    [
      'auditLoggingEnabled',
      'dataExportRestricted',
      'enabled',
      'isAddon',
      'isSystem',
      'rawSecretAccessBlocked',
      'requiredForAdmission',
      'requiresApproval',
    ].forEach((field) => {
      const value = payload[field];
      if (typeof value === 'boolean') result[field] = value;
      if (typeof value === 'string' && value.trim()) {
        result[field] = value.toLowerCase() === 'true';
      }
    });
    if (Array.isArray(payload.attendeeIds)) {
      result.attendeeIds = payload.attendeeIds
        .filter((id): id is string => typeof id === 'string')
        .map((id) => toRequiredObjectId(id));
    }
    if (Array.isArray(payload.panelistIds)) {
      result.panelistIds = payload.panelistIds
        .filter((id): id is string => typeof id === 'string')
        .map((id) => toRequiredObjectId(id));
    }
    if (Array.isArray(payload.externalAttendees)) {
      result.externalAttendees = payload.externalAttendees
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean);
    }
    [
      'enabledModules',
      'intakeMonths',
      'languages',
      'subjects',
      'conversionTags',
      'columns',
      'recipients',
    ].forEach((field) => {
      const value = payload[field];
      if (Array.isArray(value)) {
        result[field] = value
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    });
    [
      'actions',
      'availability',
      'conditions',
      'filters',
      'geo',
      'input',
      'output',
      'parameters',
      'result',
      'retryPolicy',
      'schedule',
      'seo',
      'slaPolicy',
      'testMode',
      'usageLimits',
    ].forEach((field) => {
      const value = payload[field];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[field] = value;
      }
    });
    if (payload.usageRule && typeof payload.usageRule === 'object') {
      result.usageRule = payload.usageRule;
    }
    if (typeof payload.usageCount === 'number') {
      result.usageCount = payload.usageCount;
    }
    return result;
  }

  private toOptionalDate(value: unknown): Date | undefined {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value);
    }
    return undefined;
  }

  private async writeAudit(
    userId: string,
    action: string,
    organizationId: string,
    record: TDocument,
  ): Promise<void> {
    await this.auditService.write({
      actorId: userId,
      action,
      resource: this.resource,
      targetId: String(record._id),
      after: JSON.parse(JSON.stringify(record.toObject())) as Record<
        string,
        unknown
      >,
      metadata: { organizationId },
    });
  }
}
