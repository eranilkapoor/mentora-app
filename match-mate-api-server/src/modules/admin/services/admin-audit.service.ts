import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  AdminAuditLog,
  AdminAuditLogDocument,
} from '../schemas/admin-audit-log.schema';
import { AdminAuditQueryDto } from '../dto/admin-audit-query.dto';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';

interface WriteAuditLogInput {
  req?: AuthenticatedRequest;
  actorId: string;
  action: string;
  resource: string;
  targetId?: string;
  reason?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AdminAuditService {
  constructor(
    @InjectModel(AdminAuditLog.name)
    private readonly auditModel: Model<AdminAuditLogDocument>,
  ) {}

  write(input: WriteAuditLogInput) {
    return this.auditModel.create({
      actorId: new Types.ObjectId(input.actorId),
      action: input.action,
      resource: input.resource,
      targetId: input.targetId,
      reason: input.reason,
      before: input.before ?? undefined,
      after: input.after ?? undefined,
      metadata: input.metadata,
      ipAddress: input.req?.ip,
      userAgent: input.req?.headers?.['user-agent'],
      requestId: input.req?.requestId,
      correlationId: input.req?.correlationId,
    });
  }

  async list(query: AdminAuditQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const filter: FilterQuery<AdminAuditLogDocument> = {};

    if (query.actorId && Types.ObjectId.isValid(query.actorId)) {
      filter.actorId = new Types.ObjectId(query.actorId);
    }

    if (query.resource) filter.resource = query.resource;
    if (query.action) filter.action = query.action;
    if (query.targetId) filter.targetId = query.targetId;

    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) {
        (filter.createdAt as Record<string, unknown>).$gte = new Date(
          query.from,
        );
      }
      if (query.to) {
        (filter.createdAt as Record<string, unknown>).$lte = new Date(query.to);
      }
    }

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
