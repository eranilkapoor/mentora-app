import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignMetricsDto,
} from '../dto/campaigns.dto';
import { Campaign, CampaignDocument } from '../schemas/campaigns.schema';

type CampaignListOptions = {
  channel?: string;
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaigns: Model<CampaignDocument>,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    return this.campaigns.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
  }

  async listCampaigns(options: CampaignListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.channel ? { channel: options.channel } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { channel: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.campaigns
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.campaigns.countDocuments(filter),
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

  async updateCampaign(campaignId: string, dto: UpdateCampaignDto) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.scheduledAt ? { scheduledAt: new Date(dto.scheduledAt) } : {}),
    };
    delete update.organizationId;
    return this.campaigns.findOneAndUpdate(
      {
        _id: toRequiredObjectId(campaignId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
  }

  async archiveCampaign(campaignId: string, organizationId: string) {
    return this.campaigns.findOneAndUpdate(
      {
        _id: toRequiredObjectId(campaignId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
  }

  async updateMetrics(campaignId: string, dto: UpdateCampaignMetricsDto) {
    return this.campaigns.findOneAndUpdate(
      {
        _id: toRequiredObjectId(campaignId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.metrics ? { metrics: dto.metrics } : {}),
        ...(dto.roi ? { roi: dto.roi } : {}),
      },
      { new: true },
    );
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'name',
      'scheduledAt',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
