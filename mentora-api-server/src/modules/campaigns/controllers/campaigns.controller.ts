import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateCampaignDto } from '../dto/campaigns.dto';
import { CampaignsService } from '../services/campaigns.service';

@UseGuards(JwtAuthGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return successResponse(
      await this.service.createCampaign(dto),
      'EDUCATION_PLATFORM_CAMPAIGN_CREATED',
      'CRM campaign created',
    );
  }

  @Get()
  async listCampaigns(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCampaigns(tenantId),
      'EDUCATION_PLATFORM_CAMPAIGNS_FETCHED',
      'CRM campaigns fetched',
    );
  }
}
