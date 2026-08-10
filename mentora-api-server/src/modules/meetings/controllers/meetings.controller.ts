import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import {
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
  CompleteCrmDomainRecordDto,
  BulkUpdateCrmDomainRecordStatusDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { MeetingsService } from '../services/meetings.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}
  @Post() @Permissions(Permission.MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'MEETING_CREATED',
      'Meeting created',
    );
  }
  @Get() @Permissions(Permission.MODULE_RECORD_VIEW) async list(
    @Query('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    return successResponse(
      await this.service.list({
        limit,
        page,
        priority,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'MEETINGS_FETCHED',
      'Meetings fetched',
    );
  }
  @Get('operations/export')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'MEETINGS_EXPORTED',
      'Meetings exported',
    );
  }
  @Get(':recordId') @Permissions(Permission.MODULE_RECORD_VIEW) async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, organizationId),
      'MEETING_FETCHED',
      'Meeting fetched',
    );
  }
  @Post('operations/bulk-status')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateCrmDomainRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(req.user.sub, dto),
      'MEETINGS_BULK_STATUS_UPDATED',
      'Meetings updated',
    );
  }
  @Delete(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archive(req.user.sub, recordId, organizationId),
      'MEETING_ARCHIVED',
      'Meeting archived',
    );
  }
  @Post(':recordId/restore')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async restore(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restore(req.user.sub, recordId, organizationId),
      'MEETING_RESTORED',
      'Meeting restored',
    );
  }
  @Post(':recordId') @Permissions(Permission.MODULE_RECORD_MANAGE) async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'MEETING_UPDATED',
      'Meeting updated',
    );
  }
  @Post(':recordId/complete')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: CompleteCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.complete(req.user.sub, recordId, dto),
      'MEETING_COMPLETED',
      'Meeting completed',
    );
  }
}
