import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
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
  tenantId: string;
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
      tenantId: toTenantObjectId(dto.tenantId),
      ownerId: toOptionalObjectId(dto.ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      createdBy,
    });
    await this.writeAudit(
      userId,
      'crm_module_record.created',
      dto.tenantId,
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
      tenantId: toTenantObjectId(options.tenantId),
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
    const update = {
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      ownerId: toOptionalObjectId(dto.ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    };
    const record = await this.moduleRecords.findOneAndUpdate(
      { _id: toRequiredObjectId(recordId), tenantId: update.tenantId },
      update,
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'crm_module_record.updated',
      dto.tenantId,
      record._id,
      {
        after: this.toAuditRecord(record.toObject()),
        metadata: { moduleKey: record.moduleKey },
      },
    );
    return record;
  }

  async getModuleRecord(recordId: string, tenantId: string) {
    const record = await this.moduleRecords.findOne({
      _id: toRequiredObjectId(recordId),
      tenantId: toTenantObjectId(tenantId),
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
    const tenantId = toTenantObjectId(dto.tenantId);
    const record = await this.moduleRecords.findOneAndUpdate(
      { _id: toRequiredObjectId(recordId), tenantId },
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
      'crm_module_record.executed',
      dto.tenantId,
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
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: { status: dto.status, updatedAt: new Date() } },
    );
    await this.writeAudit(
      userId,
      'crm_module_record.bulk_status_updated',
      dto.tenantId,
      toRequiredObjectId(dto.recordIds[0]),
      {
        after: {
          matched: result.matchedCount,
          modified: result.modifiedCount,
          status: dto.status,
        },
        metadata: { recordIds: dto.recordIds },
      },
    );
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status: dto.status,
    };
  }

  async exportModuleRecords(tenantId: string, moduleKey?: string) {
    const result = await this.listModuleRecords({
      limit: '1000',
      moduleKey,
      tenantId,
    });
    const records = result.items;
    const headers = ['id', 'moduleKey', 'title', 'status', 'priority', 'dueAt'];
    const csv = [
      headers.join(','),
      ...records.map((record) =>
        [
          record._id,
          record.moduleKey,
          record.title,
          record.status,
          record.priority,
          record.dueAt,
        ]
          .map((value) => this.csvValue(value))
          .join(','),
      ),
    ].join('\n');

    return {
      filename: `mentora-${moduleKey ?? 'module-records'}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      contentType: 'text/csv',
      rows: records,
      csv,
    };
  }

  async deleteModuleRecord(
    userId: string | undefined,
    recordId: string,
    tenantId: string,
  ) {
    const record = await this.moduleRecords.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'crm_module_record.archived',
      tenantId,
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
    tenantId: string,
  ) {
    const record = await this.moduleRecords.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(tenantId),
      },
      { $set: { status: 'open' } },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Education CRM module record not found');
    }
    await this.writeAudit(
      userId,
      'crm_module_record.restored',
      tenantId,
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
    tenantId: string,
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
      resource: 'crm_module_record',
      targetId: String(targetId),
      after: details.after,
      metadata: { tenantId, ...(details.metadata ?? {}) },
    });
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object') return null;
    return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
  }

  private csvValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return `"${value.toISOString()}"`;
    if (typeof value === 'number' || typeof value === 'boolean') {
      return `"${value.toString()}"`;
    }
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    return `"${text.replaceAll('"', '""')}"`;
  }
}
