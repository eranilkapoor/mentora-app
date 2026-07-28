import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  CreateCampaignDto,
  UpdateCampaignMetricsDto,
} from '../dto/campaigns.dto';
import { CampaignsService } from '../services/campaigns.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_CAMPAIGN_MANAGE)
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return successResponse(
      await this.service.createCampaign(dto),
      'EDUCATION_PLATFORM_CAMPAIGN_CREATED',
      'CRM campaign created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_CAMPAIGN_VIEW)
  async listCampaigns(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCampaigns(tenantId),
      'EDUCATION_PLATFORM_CAMPAIGNS_FETCHED',
      'CRM campaigns fetched',
    );
  }

  @Post(':campaignId/metrics')
  @Permissions(Permission.CRM_CAMPAIGN_MANAGE)
  async updateMetrics(
    @Param('campaignId') campaignId: string,
    @Body() dto: UpdateCampaignMetricsDto,
  ) {
    return successResponse(
      await this.service.updateMetrics(campaignId, dto),
      'EDUCATION_PLATFORM_CAMPAIGN_METRICS_UPDATED',
      'CRM campaign metrics updated',
    );
  }
}
