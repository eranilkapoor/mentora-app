import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import {
  CreateCampaignDto,
  UpdateCampaignMetricsDto,
} from '../dto/campaigns.dto';
import { Campaign, CampaignDocument } from '../schemas/campaigns.schema';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel(Campaign.name)
    private readonly campaigns: Model<CampaignDocument>,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    return this.campaigns.create({
      ...dto,
      tenantId: toTenantObjectId(dto.tenantId),
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
  }

  async listCampaigns(tenantId: string) {
    return this.campaigns
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }

  async updateMetrics(campaignId: string, dto: UpdateCampaignMetricsDto) {
    return this.campaigns.findOneAndUpdate(
      {
        _id: toRequiredObjectId(campaignId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.metrics ? { metrics: dto.metrics } : {}),
        ...(dto.roi ? { roi: dto.roi } : {}),
      },
      { new: true },
    );
  }
}
