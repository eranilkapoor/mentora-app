import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SupportTicket,
  SupportTicketDocument,
} from '../schemas/support-ticket.schema';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '../support.constants';

@Injectable()
export class SupportTicketRepository {
  constructor(
    @InjectModel(SupportTicket.name)
    private readonly ticketModel: Model<SupportTicketDocument>,
  ) {}

  async create(input: {
    userId: string;
    assignedTo?: string;
    branchId?: string;
    subject: string;
    category: SupportTicketCategory;
    dueAt?: Date;
    organizationId?: string;
    priority: SupportTicketPriority;
    message: string;
  }) {
    const now = new Date();
    return this.ticketModel.create({
      userId: new Types.ObjectId(input.userId),
      assignedTo: input.assignedTo
        ? new Types.ObjectId(input.assignedTo)
        : undefined,
      branchId: input.branchId ? new Types.ObjectId(input.branchId) : undefined,
      dueAt: input.dueAt,
      organizationId: input.organizationId
        ? new Types.ObjectId(input.organizationId)
        : undefined,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: 'open',
      lastUserReplyAt: now,
      messages: [
        {
          authorId: new Types.ObjectId(input.userId),
          authorType: 'user',
          message: input.message,
          attachments: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
    });
  }

  async listForUser(
    userId: string,
    page: number,
    limit: number,
    status?: SupportTicketStatus,
  ) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.ticketModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async listAll(
    page: number,
    limit: number,
    filters: {
      priority?: SupportTicketPriority;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      status?: SupportTicketStatus;
      organizationId?: string;
    },
  ) {
    const filter: Record<string, unknown> = {};
    if (filters.organizationId) {
      filter.organizationId = new Types.ObjectId(filters.organizationId);
    }
    if (filters.status) {
      filter.status = filters.status;
    }
    if (filters.priority) {
      filter.priority = filters.priority;
    }
    const search = filters.search?.trim();
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { priority: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sortBy = this.resolveSortBy(filters.sortBy);
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const [items, total] = await Promise.all([
      this.ticketModel
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.ticketModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async findForUser(ticketId: string, userId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    return this.ticketModel
      .findOne({
        _id: new Types.ObjectId(ticketId),
        userId: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
  }

  async addUserReply(ticketId: string, userId: string, message: string) {
    const now = new Date();
    return this.ticketModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ticketId),
          userId: new Types.ObjectId(userId),
          status: { $in: ['open', 'pending', 'resolved'] },
        },
        {
          $push: {
            messages: {
              authorId: new Types.ObjectId(userId),
              authorType: 'user',
              message,
              attachments: [],
              createdAt: now,
              updatedAt: now,
            },
          },
          $set: {
            status: 'open',
            lastUserReplyAt: now,
            resolvedAt: undefined,
            closedAt: undefined,
          },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async closeForUser(ticketId: string, userId: string) {
    return this.ticketModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ticketId),
          userId: new Types.ObjectId(userId),
          status: { $ne: 'closed' },
        },
        {
          $set: {
            status: 'closed',
            closedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async addAgentReply(ticketId: string, agentId: string, message: string) {
    const now = new Date();
    return this.ticketModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(ticketId),
          status: { $ne: 'closed' },
        },
        {
          $push: {
            messages: {
              authorId: new Types.ObjectId(agentId),
              authorType: 'agent',
              message,
              attachments: [],
              createdAt: now,
              updatedAt: now,
            },
          },
          $set: {
            status: 'pending',
            lastAgentReplyAt: now,
          },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async updateStatus(ticketId: string, status: SupportTicketStatus) {
    const now = new Date();
    const set: Record<string, unknown> = { status };
    if (status === 'resolved') {
      set.resolvedAt = now;
    }
    if (status === 'closed') {
      set.closedAt = now;
    }

    return this.ticketModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(ticketId) },
        { $set: set },
        { new: true },
      )
      .lean()
      .exec();
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'category',
      'createdAt',
      'lastAgentReplyAt',
      'lastUserReplyAt',
      'priority',
      'status',
      'subject',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'updatedAt';
  }
}
