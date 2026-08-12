import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  BulkUpdateModuleRecordStatusDto,
  CreateModuleRecordDto,
  ExecuteModuleRecordDto,
  UpdateModuleRecordDto,
} from '../dto/module-records.dto';
import {
  ModuleRecord,
  ModuleRecordDocument,
} from '../schemas/module-records.schema';

type ListModuleRecordOptions = {
  limit?: string;
  moduleKey?: string;
  page?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

@Injectable()
export class ModuleRecordsService {
  constructor(
    @InjectModel(ModuleRecord.name)
    private readonly moduleRecords: Model<ModuleRecordDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  async createModuleRecord(
    userId: string | undefined,
    dto: CreateModuleRecordDto,
  ) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    const record = await this.moduleRecords.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      ownerId: toOptionalObjectId(dto.ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      createdBy,
    });
    await this.writeAudit(
      userId,
      'module_record.created',
      dto.organizationId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: dto.moduleKey },
      },
    );
    return record;
  }

  async listModuleRecords(options: ListModuleRecordOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.moduleKey ? { moduleKey: options.moduleKey } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(options.priority ? { priority: options.priority } : {}),
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
      this.moduleRecords
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.moduleRecords.countDocuments(filter),
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

  async updateModuleRecord(
    userId: string | undefined,
    recordId: string,
    dto: UpdateModuleRecordDto,
  ) {
    const { moduleKey, ...updateDto } = dto;
    const update = {
      ...updateDto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      ownerId: toOptionalObjectId(dto.ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    };
    const record = await this.moduleRecords.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        ...(moduleKey ? { moduleKey } : {}),
        organizationId: update.organizationId,
      },
      update,
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'module_record.updated',
      dto.organizationId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: record.moduleKey },
      },
    );
    return record;
  }

  async getModuleRecord(recordId: string, organizationId: string) {
    const record = await this.moduleRecords.findOne({
      _id: toRequiredObjectId(recordId),
      organizationId: toOrganizationObjectId(organizationId),
    });
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    return record;
  }

  async executeModuleRecord(
    userId: string,
    recordId: string,
    dto: ExecuteModuleRecordDto,
  ) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const record = await this.moduleRecords.findOneAndUpdate(
      { _id: toRequiredObjectId(recordId), organizationId },
      {
        $set: {
          status: dto.outcome === 'failed' ? 'blocked' : 'completed',
          'payload.execution': {
            executedAt: new Date().toISOString(),
            executedBy: userId,
            outcome: dto.outcome ?? 'completed',
            result: dto.result ?? {},
          },
        },
      },
      { new: true },
    );

    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }

    await this.writeAudit(
      userId,
      'module_record.executed',
      dto.organizationId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: record.moduleKey, outcome: dto.outcome },
      },
    );

    return record;
  }

  async bulkUpdateStatus(
    userId: string | undefined,
    dto: BulkUpdateModuleRecordStatusDto,
  ) {
    const recordIds = dto.recordIds.map((recordId) =>
      toRequiredObjectId(recordId),
    );
    const result = await this.moduleRecords.updateMany(
      {
        _id: { $in: recordIds },
        ...(dto.moduleKey ? { moduleKey: dto.moduleKey } : {}),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: { status: dto.status, updatedAt: new Date() } },
    );
    await this.writeAudit(
      userId,
      'module_record.bulk_status_updated',
      dto.organizationId,
      toRequiredObjectId(dto.recordIds[0]),
      {
        after: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          status: dto.status,
        },
        metadata: { moduleKey: dto.moduleKey, recordIds: dto.recordIds },
      },
    );
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status: dto.status,
    };
  }

  async exportModuleRecords(organizationId: string, moduleKey?: string) {
    const result = await this.listModuleRecords({
      limit: '1000',
      moduleKey,
      organizationId,
    });
    const records = (
      result.items as unknown as Array<Record<string, unknown>>
    ).map((record) => withStringId(record));
    const headers = ['id', 'moduleKey', 'title', 'status', 'priority', 'dueAt'];

    return buildCsvExportFile(moduleKey ?? 'module-records', headers, records);
  }

  async deleteModuleRecord(
    userId: string | undefined,
    recordId: string,
    organizationId: string,
  ) {
    const record = await this.moduleRecords.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'module_record.archived',
      organizationId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: record.moduleKey },
      },
    );
    return record;
  }

  async restoreModuleRecord(
    userId: string | undefined,
    recordId: string,
    organizationId: string,
  ) {
    const record = await this.moduleRecords.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'open' } },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'module_record.restored',
      organizationId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: record.moduleKey },
      },
    );
    return record;
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
    userId: string | undefined,
    action: string,
    organizationId: string,
    targetId: Types.ObjectId,
    details: {
      after?: Record<string, unknown> | null;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!userId || !Types.ObjectId.isValid(userId)) return;
    await this.auditService.write({
      actorId: userId,
      action,
      resource: 'module_record',
      targetId: String(targetId),
      after: details.after,
      metadata: { organizationId, ...(details.metadata ?? {}) },
    });
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }
}
