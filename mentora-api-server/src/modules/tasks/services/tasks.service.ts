import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { CreateTaskDto } from '../dto/tasks.dto';
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
    });
  }

  async listTasks(tenantId: string) {
    return this.tasks
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(50)
      .lean();
  }
}
