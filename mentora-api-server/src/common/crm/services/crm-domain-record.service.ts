import { NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '../dto/crm-domain-record.dto';

type CrmDomainRecordDocument = {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  title: string;
  status: string;
  payload?: Record<string, unknown>;
  toObject(): Record<string, unknown>;
};

type CrmDomainRecordLean = Record<string, unknown>;

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
      tenantId: toTenantObjectId(dto.tenantId),
      ownerId: toOptionalObjectId(dto.ownerId),
      relatedLeadId: toOptionalObjectId(dto.relatedLeadId),
      relatedApplicationId: toOptionalObjectId(dto.relatedApplicationId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      createdBy: toRequiredObjectId(userId),
    });
    await this.writeAudit(
      userId,
      `${this.resource}.created`,
      dto.tenantId,
      record,
    );
    return record as TDocument;
  }

  async list(
    tenantId: string,
    status?: string,
  ): Promise<CrmDomainRecordLean[]> {
    const records = await this.model
      .find({
        tenantId: toTenantObjectId(tenantId),
        ...(status ? { status } : {}),
      })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(100)
      .lean();

    return records;
  }

  async update(
    userId: string,
    recordId: string,
    dto: UpdateCrmDomainRecordDto,
  ): Promise<TDocument> {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        ...dto,
        tenantId: toTenantObjectId(dto.tenantId),
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
      dto.tenantId,
      record,
    );
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
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        $set: {
          status: dto.outcome === 'failed' ? 'rejected' : 'completed',
          completedAt: new Date(),
          payload: {
            completion: {
              completedAt: new Date().toISOString(),
              completedBy: userId,
              outcome: dto.outcome ?? 'completed',
              score: dto.score,
              result: dto.result ?? {},
            },
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
      dto.tenantId,
      record,
    );
    return record;
  }

  private async writeAudit(
    userId: string,
    action: string,
    tenantId: string,
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
      metadata: { tenantId },
    });
  }
}
