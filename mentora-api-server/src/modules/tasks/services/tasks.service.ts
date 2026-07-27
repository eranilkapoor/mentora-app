import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { CreateTaskDto, UpdateTaskWorkflowDto } from '../dto/tasks.dto';
import { Task, TaskDocument } from '../schemas/tasks.schema';

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

  async listTasks(tenantId: string) {
    return this.tasks
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(50)
      .lean();
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
}
