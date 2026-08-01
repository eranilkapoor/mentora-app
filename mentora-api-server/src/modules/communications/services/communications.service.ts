import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import {
  CreateCommunicationDto,
  UpdateCommunicationDto,
} from '../dto/communications.dto';
import {
  Communication,
  CommunicationDocument,
} from '../schemas/communications.schema';

type CommunicationListOptions = {
  channel?: string;
  direction?: string;
  entityId?: string;
  entityType?: string;
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

@Injectable()
export class CommunicationsService {
  constructor(
    @InjectModel(Communication.name)
    private readonly communications: Model<CommunicationDocument>,
  ) {}

  async createCommunication(dto: CreateCommunicationDto) {
    return this.communications.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      entityId: toRequiredObjectId(dto.entityId),
    });
  }

  async listCommunications(options: CommunicationListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.channel ? { channel: options.channel } : {}),
      ...(options.direction ? { direction: options.direction } : {}),
      ...(options.entityType ? { entityType: options.entityType } : {}),
      ...(options.entityId
        ? { entityId: toRequiredObjectId(options.entityId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { channel: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.communications
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.communications.countDocuments(filter),
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

  updateCommunication(communicationId: string, dto: UpdateCommunicationDto) {
    const update: Record<string, unknown> = { ...dto };
    delete update.organizationId;
    return this.communications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(communicationId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  archiveCommunication(communicationId: string, organizationId: string) {
    return this.communications.findOneAndUpdate(
      {
        _id: toRequiredObjectId(communicationId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set(['createdAt', 'status', 'subject', 'updatedAt']);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
