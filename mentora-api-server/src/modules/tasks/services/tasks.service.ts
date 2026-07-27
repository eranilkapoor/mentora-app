import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      tenantId: new Types.ObjectId(dto.tenantId),
      entityId: new Types.ObjectId(dto.entityId),
      assignedTo: new Types.ObjectId(dto.assignedTo),
      assignedBy: new Types.ObjectId(userId),
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
    });
  }

  async listTasks(tenantId: string) {
    return this.tasks
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ dueAt: 1, createdAt: -1 })
      .limit(50)
      .lean();
  }
}
