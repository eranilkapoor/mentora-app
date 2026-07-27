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
  CreateModuleRecordDto,
  ExecuteModuleRecordDto,
  UpdateModuleRecordDto,
} from '../dto/module-records.dto';
import {
  ModuleRecord,
  ModuleRecordDocument,
} from '../schemas/module-records.schema';

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

  async listModuleRecords(
    tenantId: string,
    moduleKey?: string,
    status?: string,
  ) {
    return this.moduleRecords
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(moduleKey ? { moduleKey } : {}),
        ...(status ? { status } : {}),
      })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(100)
      .lean();
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
          payload: {
            execution: {
              executedAt: new Date().toISOString(),
              executedBy: userId,
              outcome: dto.outcome ?? 'completed',
              result: dto.result ?? {},
            },
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

  async exportModuleRecords(tenantId: string, moduleKey?: string) {
    const records = await this.listModuleRecords(tenantId, moduleKey);
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
