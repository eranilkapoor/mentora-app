import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { toTenantObjectId } from '@/common/utils/tenant-scope.util';
import { CreateCampaignDto } from '../dto/campaigns.dto';
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
    });
  }

  async listCampaigns(tenantId: string) {
    return this.campaigns
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
