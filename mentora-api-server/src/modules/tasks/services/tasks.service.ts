import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
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
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  tenantId: string;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly tasks: Model<TaskDocument>,
  ) {}

  async createTask(userId: string, dto: CreateTaskDto) {
    return this.tasks.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      entityId: toRequiredObjectId(dto.entityId),
      assignedTo: toRequiredObjectId(dto.assignedTo),
      assignedBy: toRequiredObjectId(userId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : undefined,
    });
  }

  async listTasks(options: TaskListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      tenantId: toTenantObjectId(options.tenantId),
      ...(options.assignedTo
        ? { assignedTo: toRequiredObjectId(options.assignedTo) }
        : {}),
      ...(options.priority ? { priority: options.priority } : {}),
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
    const [items, total] = await Promise.all([
      this.tasks
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.tasks.countDocuments(filter),
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

  listTaskBoard(tenantId: string) {
    return this.tasks
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ boardColumn: 1, dueAt: 1, priority: -1 })
      .lean();
  }

  updateWorkflow(userId: string, taskId: string, dto: UpdateTaskWorkflowDto) {
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

    return this.tasks.findOneAndUpdate(
      {
        _id: toRequiredObjectId(taskId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.boardColumn ? { boardColumn: dto.boardColumn } : {}),
        ...(dto.slaStatus ? { slaStatus: dto.slaStatus } : {}),
        ...(Object.keys(push).length ? { $push: push } : {}),
      },
      { new: true },
    );
  }

  updateTask(taskId: string, dto: UpdateTaskDto) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.assignedTo
        ? { assignedTo: toRequiredObjectId(dto.assignedTo) }
        : {}),
      ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}),
      ...(dto.reminderAt ? { reminderAt: new Date(dto.reminderAt) } : {}),
    };
    delete update.tenantId;
    return this.tasks.findOneAndUpdate(
      {
        _id: toRequiredObjectId(taskId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  archiveTask(taskId: string, tenantId: string) {
    return this.tasks.findOneAndUpdate(
      {
        _id: toRequiredObjectId(taskId),
        tenantId: toTenantObjectId(tenantId),
      },
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
}
