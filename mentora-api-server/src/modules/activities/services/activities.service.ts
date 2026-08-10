import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import {
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { CreateActivityDto, UpdateActivityDto } from '../dto/activities.dto';
import { Activity, ActivityDocument } from '../schemas/activity.schema';

type ActivityListOptions = {
  activityType?: string;
  channel?: string;
  limit?: string;
  ownerId?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

const ACTIVITY_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'ownerId',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
  teamField: 'teamId',
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name)
    private readonly activities: Model<ActivityDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async createActivity(userId: string, dto: CreateActivityDto) {
    const ownerId = dto.ownerId ?? userId;
    const ownerScope = await this.actorScope.resolveActorScope(
      ownerId,
      dto.organizationId,
    );
    return this.activities.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      entityId: dto.entityId ? toRequiredObjectId(dto.entityId) : undefined,
      ownerId: toRequiredObjectId(ownerId),
      createdBy: toRequiredObjectId(userId),
      branchId: ownerScope.branchIds[0],
      departmentId: ownerScope.departmentIds[0],
      teamId: ownerScope.teamIds[0],
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
    });
  }

  async listActivities(options: ActivityListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.activityType ? { activityType: options.activityType } : {}),
      ...(options.channel ? { channel: options.channel } : {}),
      ...(options.ownerId
        ? { ownerId: toRequiredObjectId(options.ownerId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
        { outcome: { $regex: search, $options: 'i' } },
      ];
    }
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.activities
        .find(scopedFilter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.activities.countDocuments(scopedFilter),
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

  async updateActivity(
    activityId: string,
    dto: UpdateActivityDto,
    actorId?: string,
  ) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.entityId ? { entityId: toRequiredObjectId(dto.entityId) } : {}),
      ...(dto.ownerId ? { ownerId: toRequiredObjectId(dto.ownerId) } : {}),
      ...(dto.occurredAt ? { occurredAt: new Date(dto.occurredAt) } : {}),
    };
    delete update.organizationId;
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(activityId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    return this.activities.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  async archiveActivity(
    activityId: string,
    organizationId: string,
    actorId?: string,
  ) {
    return this.updateStatus(activityId, organizationId, 'archived', actorId);
  }

  async restoreActivity(
    activityId: string,
    organizationId: string,
    actorId?: string,
  ) {
    return this.updateStatus(activityId, organizationId, 'completed', actorId);
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
    const result = await this.activities.updateMany(filter, {
      $set: { status },
    });
    return { matched: result.matchedCount, modified: result.modifiedCount };
  }

  async exportActivities(organizationId: string, actorId?: string) {
    const { items } = await this.listActivities(
      { organizationId, limit: '1000' },
      actorId,
    );
    return buildCsvExportFile(
      'activities',
      ['id', 'title', 'entityType', 'activityType', 'channel', 'status'],
      items.map((item) => withStringId(item)),
    );
  }

  private async updateStatus(
    activityId: string,
    organizationId: string,
    status: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(activityId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    return this.activities.findOneAndUpdate(
      filter,
      { $set: { status } },
      { new: true },
    );
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set(['createdAt', 'occurredAt', 'status', 'title']);
    return value && allowed.has(value) ? value : 'occurredAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<ActivityDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<ActivityDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<ActivityDocument>(
      scope,
      ACTIVITY_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
