import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
  toOptionalObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskWorkflowDto,
} from '../dto/tasks.dto';
import { Task, TaskDocument } from '../schemas/tasks.schema';

type TaskListOptions = {
  assignedTo?: string;
  limit?: string;
  page?: string;
  priority?: string;
  branchId?: string;
  departmentId?: string;
  teamId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

const TASK_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'assignedTo',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
  teamField: 'teamId',
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly tasks: Model<TaskDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async createTask(userId: string, dto: CreateTaskDto) {
    const assigneeScope = await this.actorScope.resolveActorScope(
      dto.assignedTo,
      dto.organizationId,
    );
    return this.tasks.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      entityId: toRequiredObjectId(dto.entityId),
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
      branchId: toOptionalObjectId(dto.branchId) ?? assigneeScope.branchIds[0],
      departmentId:
        toOptionalObjectId(dto.departmentId) ?? assigneeScope.departmentIds[0],
      teamId: toOptionalObjectId(dto.teamId) ?? assigneeScope.teamIds[0],
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : undefined,
    });
  }

  async listTasks(options: TaskListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.assignedTo
        ? { assignedTo: toRequiredObjectId(options.assignedTo) }
        : {}),
      ...(options.priority ? { priority: options.priority } : {}),
      ...(options.branchId
        ? { branchId: toRequiredObjectId(options.branchId) }
        : {}),
      ...(options.departmentId
        ? { departmentId: toRequiredObjectId(options.departmentId) }
        : {}),
      ...(options.teamId ? { teamId: toRequiredObjectId(options.teamId) } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
      ];
    }
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.tasks
        .find(scopedFilter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.tasks.countDocuments(scopedFilter),
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

  async exportTasks(organizationId: string) {
    const { items } = await this.listTasks({ organizationId, limit: '1000' });
    const headers = ['id', 'title', 'status', 'priority', 'dueAt'];
    return buildCsvExportFile(
      'tasks',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async listTaskBoard(organizationId: string, actorId?: string) {
    const filter = await this.applyScope(
      { organizationId: toOrganizationObjectId(organizationId) },
      actorId,
      organizationId,
    );
    return this.tasks
      .find(filter)
      .sort({ boardColumn: 1, dueAt: 1, priority: -1 })
      .lean();
  }

  async updateWorkflow(
    userId: string,
    taskId: string,
    dto: UpdateTaskWorkflowDto,
  ) {
    const push: Record<string, unknown> = {};
    if (dto.comment) {
      push.comments = {
        comment: dto.comment,
        createdAt: new Date(),
        createdBy: userId,
      };
    }
    if (dto.escalation) {
      push.escalations = {
        ...dto.escalation,
        createdAt: new Date(),
        createdBy: userId,
      };
    }

    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(taskId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      userId,
      dto.organizationId,
    );
    return this.tasks.findOneAndUpdate(
      filter,
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.boardColumn ? { boardColumn: dto.boardColumn } : {}),
        ...(dto.slaStatus ? { slaStatus: dto.slaStatus } : {}),
        ...(Object.keys(push).length ? { $push: push } : {}),
      },
      { new: true },
    );
  }

  async updateTask(taskId: string, dto: UpdateTaskDto, actorId?: string) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.assignedTo
        ? { assignedTo: toRequiredObjectId(dto.assignedTo) }
        : {}),
      ...(dto.branchId ? { branchId: toRequiredObjectId(dto.branchId) } : {}),
      ...(dto.departmentId
        ? { departmentId: toRequiredObjectId(dto.departmentId) }
        : {}),
      ...(dto.teamId ? { teamId: toRequiredObjectId(dto.teamId) } : {}),
      ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}),
      ...(dto.reminderAt ? { reminderAt: new Date(dto.reminderAt) } : {}),
    };
    delete update.organizationId;
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(taskId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    return this.tasks.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  async archiveTask(taskId: string, organizationId: string, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(taskId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    return this.tasks.findOneAndUpdate(
      filter,
      { $set: { status: 'cancelled', boardColumn: 'done' } },
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

  // See LeadsService.applyScope for the same pattern: $and-merges the
  // caller's DataScope filter so it never overwrites an existing field.
  private async applyScope(
    filter: FilterQuery<TaskDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<TaskDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<TaskDocument>(
      scope,
      TASK_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
