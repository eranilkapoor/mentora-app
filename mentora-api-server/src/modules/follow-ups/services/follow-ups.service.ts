import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import {
  toOptionalObjectId,
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { CreateFollowUpDto, UpdateFollowUpDto } from '../dto/follow-ups.dto';
import { FollowUp, FollowUpDocument } from '../schemas/follow-up.schema';

type FollowUpListOptions = {
  followUpType?: string;
  limit?: string;
  ownerId?: string;
  page?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

const FOLLOW_UP_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'ownerId',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
  teamField: 'teamId',
};

@Injectable()
export class FollowUpsService {
  constructor(
    @InjectModel(FollowUp.name)
    private readonly followUps: Model<FollowUpDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async createFollowUp(userId: string, dto: CreateFollowUpDto) {
    const ownerId = dto.ownerId ?? userId;
    const ownerScope = await this.actorScope.resolveActorScope(
      ownerId,
      dto.organizationId,
    );
    return this.followUps.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      entityId: dto.entityId ? toRequiredObjectId(dto.entityId) : undefined,
      ownerId: toRequiredObjectId(ownerId),
      createdBy: toRequiredObjectId(userId),
      branchId: toOptionalObjectId(dto.branchId) ?? ownerScope.branchIds[0],
      departmentId:
        toOptionalObjectId(dto.departmentId) ?? ownerScope.departmentIds[0],
      teamId: toOptionalObjectId(dto.teamId) ?? ownerScope.teamIds[0],
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : undefined,
      completedAt: dto.status === 'completed' ? new Date() : undefined,
    });
  }

  async listFollowUps(options: FollowUpListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.followUpType ? { followUpType: options.followUpType } : {}),
      ...(options.ownerId
        ? { ownerId: toRequiredObjectId(options.ownerId) }
        : {}),
      ...(options.priority ? { priority: options.priority } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { escalationRule: { $regex: search, $options: 'i' } },
      ];
    }
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.followUps
        .find(scopedFilter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.followUps.countDocuments(scopedFilter),
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

  async updateFollowUp(
    followUpId: string,
    dto: UpdateFollowUpDto,
    actorId?: string,
  ) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.entityId ? { entityId: toRequiredObjectId(dto.entityId) } : {}),
      ...(dto.ownerId ? { ownerId: toRequiredObjectId(dto.ownerId) } : {}),
      ...(dto.branchId ? { branchId: toRequiredObjectId(dto.branchId) } : {}),
      ...(dto.departmentId
        ? { departmentId: toRequiredObjectId(dto.departmentId) }
        : {}),
      ...(dto.teamId ? { teamId: toRequiredObjectId(dto.teamId) } : {}),
      ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}),
      ...(dto.reminderAt ? { reminderAt: new Date(dto.reminderAt) } : {}),
      ...(dto.status === 'completed' ? { completedAt: new Date() } : {}),
    };
    delete update.organizationId;
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(followUpId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    return this.followUps.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  async archiveFollowUp(
    followUpId: string,
    organizationId: string,
    actorId?: string,
  ) {
    return this.updateStatus(followUpId, organizationId, 'archived', actorId);
  }

  async restoreFollowUp(
    followUpId: string,
    organizationId: string,
    actorId?: string,
  ) {
    return this.updateStatus(followUpId, organizationId, 'open', actorId);
  }

  async bulkUpdateStatus(
    organizationId: string,
    recordIds: string[],
    status: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: { $in: recordIds.map((id) => new Types.ObjectId(id)) },
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const result = await this.followUps.updateMany(filter, {
      $set: {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
    });
    return { matched: result.matchedCount, modified: result.modifiedCount };
  }

  async exportFollowUps(organizationId: string, actorId?: string) {
    const { items } = await this.listFollowUps(
      { organizationId, limit: '1000' },
      actorId,
    );
    return buildCsvExportFile(
      'follow-ups',
      ['id', 'title', 'entityType', 'followUpType', 'priority', 'status'],
      items.map((item) => withStringId(item)),
    );
  }

  private async updateStatus(
    followUpId: string,
    organizationId: string,
    status: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(followUpId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    return this.followUps.findOneAndUpdate(
      filter,
      {
        $set: {
          status,
          ...(status === 'completed' ? { completedAt: new Date() } : {}),
        },
      },
      { new: true },
    );
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'dueAt',
      'priority',
      'status',
      'title',
    ]);
    return value && allowed.has(value) ? value : 'dueAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<FollowUpDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<FollowUpDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<FollowUpDocument>(
      scope,
      FOLLOW_UP_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
