import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toTenantObjectId } from '@/common/utils/tenant-scope.util';
import {
  CreateBranchDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTenantDto,
} from '../dto/tenants.dto';
import {
  Branch,
  BranchDocument,
  LeadSource,
  LeadSourceDocument,
  LeadStage,
  LeadStageDocument,
  Tenant,
  TenantDocument,
} from '../schemas/tenants.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenants: Model<TenantDocument>,
    @InjectModel(Branch.name)
    private readonly branches: Model<BranchDocument>,
    @InjectModel(LeadSource.name)
    private readonly sources: Model<LeadSourceDocument>,
    @InjectModel(LeadStage.name)
    private readonly stages: Model<LeadStageDocument>,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    return this.tenants.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      { ...dto, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async findActiveTenantByCode(code: string) {
    return this.tenants.findOne({
      code: code.toUpperCase(),
      status: 'active',
    });
  }

  async listTenants() {
    return this.tenants.find({ status: 'active' }).sort({ name: 1 }).lean();
  }

  async createBranch(dto: CreateBranchDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.branches.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listBranches(tenantId: string) {
    return this.branches
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadSource(dto: CreateLeadSourceDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.sources.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadSources(tenantId: string) {
    return this.sources
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadStage(dto: CreateLeadStageDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.stages.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadStages(tenantId: string) {
    return this.stages
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ order: 1, name: 1 })
      .lean();
  }
}
