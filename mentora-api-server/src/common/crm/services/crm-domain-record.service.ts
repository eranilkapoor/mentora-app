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
      relatedLeadId: toOptionalObjectId(dto.relatedLeadId),
      relatedApplicationId: toOptionalObjectId(dto.relatedApplicationId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
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
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
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
