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
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  ApproveApplicationDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  UpdateApplicationReviewDto,
} from '../dto/applications.dto';
import { ApplicationsService } from '../services/applications.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return successResponse(
      await this.service.createApplication(dto),
      'EDUCATION_PLATFORM_APPLICATION_CREATED',
      'CRM application created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_APPLICATION_VIEW)
  async listApplications(
    @Query('tenantId') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('leadId') leadId?: string,
    @Query('courseOffering') courseOffering?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listApplications({
        limit,
        page,
        courseOffering,
        leadId,
        search,
        sortBy,
        sortOrder,
        status,
        tenantId,
      }),
      'EDUCATION_PLATFORM_APPLICATIONS_FETCHED',
      'CRM applications fetched',
    );
  }

  @Put(':applicationId')
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return successResponse(
      await this.service.updateApplication(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_UPDATED',
      'CRM application updated',
    );
  }

  @Delete(':applicationId')
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async archiveApplication(
    @Param('applicationId') applicationId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.archiveApplication(applicationId, tenantId),
      'EDUCATION_PLATFORM_APPLICATION_ARCHIVED',
      'CRM application archived',
    );
  }

  @Post(':applicationId/review')
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async updateReview(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationReviewDto,
  ) {
    return successResponse(
      await this.service.updateReview(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_REVIEW_UPDATED',
      'CRM application review updated',
    );
  }

  @Post(':applicationId/decision')
  @Permissions(Permission.CRM_APPLICATION_MANAGE)
  async decideApplication(
    @Param('applicationId') applicationId: string,
    @Body() dto: ApproveApplicationDto,
  ) {
    return successResponse(
      await this.service.decideApplication(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_DECIDED',
      'CRM application decision saved',
    );
  }
}
