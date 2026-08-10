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
import { CreateFollowUpDto, UpdateFollowUpDto } from '../dto/follow-ups.dto';
import { FollowUpsService } from '../services/follow-ups.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/follow-ups')
export class FollowUpsController {
  constructor(private readonly service: FollowUpsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.FOLLOW_UP_MANAGE)
  async createFollowUp(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateFollowUpDto,
  ) {
    return successResponse(
      await this.service.createFollowUp(req.user.sub, dto),
      'FOLLOW_UP_CREATED',
      'Follow-up created',
    );
  }

  @Get()
  @Permissions(Permission.FOLLOW_UP_VIEW)
  async listFollowUps(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('followUpType') followUpType?: string,
    @Query('ownerId') ownerId?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.listFollowUps(
        {
          followUpType,
          limit,
          ownerId,
          page,
          priority,
          search,
          sortBy,
          sortOrder,
          status,
          organizationId,
        },
        req.user.sub,
      ),
      'FOLLOW_UPS_FETCHED',
      'Follow-ups fetched',
    );
  }

  @Get('operations/export')
  @Permissions(Permission.FOLLOW_UP_VIEW)
  async exportFollowUps(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.exportFollowUps(organizationId, req.user.sub),
      'FOLLOW_UPS_EXPORTED',
      'Follow-ups exported',
    );
  }

  @Post('operations/bulk-status')
  @Permissions(Permission.FOLLOW_UP_MANAGE)
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
      'FOLLOW_UPS_BULK_STATUS_UPDATED',
      'Follow-ups updated',
    );
  }

  @Put(':followUpId')
  @Permissions(Permission.FOLLOW_UP_MANAGE)
  async updateFollowUp(
    @Req() req: AuthenticatedRequest,
    @Param('followUpId') followUpId: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return successResponse(
      await this.service.updateFollowUp(followUpId, dto, req.user.sub),
      'FOLLOW_UP_UPDATED',
      'Follow-up updated',
    );
  }

  @Delete(':followUpId')
  @Permissions(Permission.FOLLOW_UP_MANAGE)
  async archiveFollowUp(
    @Req() req: AuthenticatedRequest,
    @Param('followUpId') followUpId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveFollowUp(
        followUpId,
        organizationId,
        req.user.sub,
      ),
      'FOLLOW_UP_ARCHIVED',
      'Follow-up archived',
    );
  }

  @Post(':followUpId/restore')
  @Permissions(Permission.FOLLOW_UP_MANAGE)
  async restoreFollowUp(
    @Req() req: AuthenticatedRequest,
    @Param('followUpId') followUpId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restoreFollowUp(
        followUpId,
        organizationId,
        req.user.sub,
      ),
      'FOLLOW_UP_RESTORED',
      'Follow-up restored',
    );
  }
}
