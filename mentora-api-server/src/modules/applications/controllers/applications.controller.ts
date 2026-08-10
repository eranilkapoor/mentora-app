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
  ApproveApplicationDto,
  BulkUpdateApplicationStatusDto,
  CreateApplicationDto,
  UpdateApplicationDto,
  UpdateApplicationReviewDto,
} from '../dto/applications.dto';
import { ApplicationsService } from '../services/applications.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.APPLICATION_MANAGE)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return successResponse(
      await this.service.createApplication(dto),
      'EDUCATION_PLATFORM_APPLICATION_CREATED',
      'Application created',
    );
  }

  @Get()
  @Permissions(Permission.APPLICATION_VIEW)
  async listApplications(
    @Query('organizationId') organizationId: string,
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
        organizationId,
      }),
      'EDUCATION_PLATFORM_APPLICATIONS_FETCHED',
      'Applications fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.APPLICATION_VIEW)
  async exportApplications(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportApplications(organizationId),
      'EDUCATION_PLATFORM_APPLICATIONS_EXPORTED',
      'Applications exported',
    );
  }

  @Put(':applicationId')
  @Permissions(Permission.APPLICATION_MANAGE)
  async updateApplication(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return successResponse(
      await this.service.updateApplication(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_UPDATED',
      'Application updated',
    );
  }

  @Delete(':applicationId')
  @Permissions(Permission.APPLICATION_MANAGE)
  async archiveApplication(
    @Param('applicationId') applicationId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveApplication(applicationId, organizationId),
      'EDUCATION_PLATFORM_APPLICATION_ARCHIVED',
      'Application archived',
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.APPLICATION_MANAGE)
  async bulkStatus(@Body() dto: BulkUpdateApplicationStatusDto) {
    return successResponse(
      await this.service.bulkUpdateStatus(dto),
      'EDUCATION_PLATFORM_APPLICATIONS_BULK_STATUS_UPDATED',
      'Applications updated',
    );
  }

  @Post(':applicationId/restore')
  @Permissions(Permission.APPLICATION_MANAGE)
  async restoreApplication(
    @Param('applicationId') applicationId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restoreApplication(applicationId, organizationId),
      'EDUCATION_PLATFORM_APPLICATION_RESTORED',
      'Application restored',
    );
  }

  @Post(':applicationId/review')
  @Permissions(Permission.APPLICATION_MANAGE)
  async updateReview(
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateApplicationReviewDto,
  ) {
    return successResponse(
      await this.service.updateReview(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_REVIEW_UPDATED',
      'Application review updated',
    );
  }

  @Post(':applicationId/decision')
  @Permissions(Permission.APPLICATION_MANAGE)
  async decideApplication(
    @Param('applicationId') applicationId: string,
    @Body() dto: ApproveApplicationDto,
  ) {
    return successResponse(
      await this.service.decideApplication(applicationId, dto),
      'EDUCATION_PLATFORM_APPLICATION_DECIDED',
      'Application decision saved',
    );
  }
}
