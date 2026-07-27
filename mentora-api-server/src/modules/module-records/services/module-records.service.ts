import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  CreateModuleRecordDto,
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
  ) {}

  async createModuleRecord(
    userId: string | undefined,
    dto: CreateModuleRecordDto,
  ) {
    const createdBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;
    return this.moduleRecords.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      ownerId: toOptionalObjectId(dto.ownerId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      createdBy,
    });
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

  async updateModuleRecord(recordId: string, dto: UpdateModuleRecordDto) {
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
    return record;
  }
}
