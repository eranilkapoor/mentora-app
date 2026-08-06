import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  UpdateCampaignMetricsDto,
} from '../dto/campaigns.dto';
import { CampaignsService } from '../services/campaigns.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CAMPAIGN_MANAGE)
  async createCampaign(@Body() dto: CreateCampaignDto) {
    return successResponse(
      await this.service.createCampaign(dto),
      'EDUCATION_PLATFORM_CAMPAIGN_CREATED',
      'Campaign created',
    );
  }

  @Get()
  @Permissions(Permission.CAMPAIGN_VIEW)
  async listCampaigns(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listCampaigns({
        channel,
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'EDUCATION_PLATFORM_CAMPAIGNS_FETCHED',
      'Campaigns fetched',
    );
  }

  @Put(':campaignId')
  @Permissions(Permission.CAMPAIGN_MANAGE)
  async updateCampaign(
    @Param('campaignId') campaignId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return successResponse(
      await this.service.updateCampaign(campaignId, dto),
      'EDUCATION_PLATFORM_CAMPAIGN_UPDATED',
      'Campaign updated',
    );
  }

  @Delete(':campaignId')
  @Permissions(Permission.CAMPAIGN_MANAGE)
  async archiveCampaign(
    @Param('campaignId') campaignId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveCampaign(campaignId, organizationId),
      'EDUCATION_PLATFORM_CAMPAIGN_ARCHIVED',
      'Campaign archived',
    );
  }

  @Post(':campaignId/metrics')
  @Permissions(Permission.CAMPAIGN_MANAGE)
  async updateMetrics(
    @Param('campaignId') campaignId: string,
    @Body() dto: UpdateCampaignMetricsDto,
  ) {
    return successResponse(
      await this.service.updateMetrics(campaignId, dto),
      'EDUCATION_PLATFORM_CAMPAIGN_METRICS_UPDATED',
      'Campaign metrics updated',
    );
  }
}
