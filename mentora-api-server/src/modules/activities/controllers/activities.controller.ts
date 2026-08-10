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
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { CreateActivityDto, UpdateActivityDto } from '../dto/activities.dto';
import { ActivitiesService } from '../services/activities.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/activities')
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.ACTIVITY_MANAGE)
  async createActivity(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateActivityDto,
  ) {
    return successResponse(
      await this.service.createActivity(req.user.sub, dto),
      'ACTIVITY_CREATED',
      'Activity created',
    );
  }

  @Get()
  @Permissions(Permission.ACTIVITY_VIEW)
  async listActivities(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('activityType') activityType?: string,
    @Query('channel') channel?: string,
    @Query('ownerId') ownerId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listActivities(
        {
          activityType,
          channel,
          limit,
          ownerId,
          page,
          search,
          sortBy,
          sortOrder,
          status,
          organizationId,
        },
        req.user.sub,
      ),
      'ACTIVITIES_FETCHED',
      'Activities fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.ACTIVITY_VIEW)
  async exportActivities(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.exportActivities(organizationId, req.user.sub),
      'ACTIVITIES_EXPORTED',
      'Activities exported',
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.ACTIVITY_MANAGE)
  async bulkStatus(
    @Req() req: AuthenticatedRequest,
    @Body()
    dto: {
      organizationId: string;
      recordIds: string[];
      status: string;
    },
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(
        dto.organizationId,
        dto.recordIds,
        dto.status,
        req.user.sub,
      ),
      'ACTIVITIES_BULK_STATUS_UPDATED',
      'Activities updated',
    );
  }

  @Put(':activityId')
  @Permissions(Permission.ACTIVITY_MANAGE)
  async updateActivity(
    @Req() req: AuthenticatedRequest,
    @Param('activityId') activityId: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return successResponse(
      await this.service.updateActivity(activityId, dto, req.user.sub),
      'ACTIVITY_UPDATED',
      'Activity updated',
    );
  }

  @Delete(':activityId')
  @Permissions(Permission.ACTIVITY_MANAGE)
  async archiveActivity(
    @Req() req: AuthenticatedRequest,
    @Param('activityId') activityId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveActivity(
        activityId,
        organizationId,
        req.user.sub,
      ),
      'ACTIVITY_ARCHIVED',
      'Activity archived',
    );
  }

  @Post(':activityId/restore')
  @Permissions(Permission.ACTIVITY_MANAGE)
  async restoreActivity(
    @Req() req: AuthenticatedRequest,
    @Param('activityId') activityId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restoreActivity(
        activityId,
        organizationId,
        req.user.sub,
      ),
      'ACTIVITY_RESTORED',
      'Activity restored',
    );
  }
}
