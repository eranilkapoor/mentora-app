import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
      tenantId: new Types.ObjectId(dto.tenantId),
    });
  }

  async listCampaigns(tenantId: string) {
    return this.campaigns
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}
