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
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import { MentorsService } from '../services/mentors.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/mentors')
export class MentorsController {
  constructor(private readonly service: MentorsService) {}
  @Post() @Permissions(Permission.MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'MENTOR_CREATED',
      'Mentor record created',
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
        organizationId,
        page,
        limit,
        search,
        status,
        priority,
        sortBy,
        sortOrder,
      }),
      'MENTORS_FETCHED',
      'Mentors fetched',
    );
  }
  @Get('operations/export')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'MENTORS_EXPORTED',
      'Mentors exported',
    );
  }
  @Get(':recordId') @Permissions(Permission.MODULE_RECORD_VIEW) async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, organizationId),
      'MENTOR_FETCHED',
      'Mentor fetched',
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
      'MENTORS_BULK_STATUS_UPDATED',
      'Mentors updated',
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
      'MENTOR_ARCHIVED',
      'Mentor archived',
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
      'MENTOR_RESTORED',
      'Mentor restored',
    );
  }
  @Post(':recordId') @Permissions(Permission.MODULE_RECORD_MANAGE) async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'MENTOR_UPDATED',
      'Mentor updated',
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
      'MENTOR_REVIEW_COMPLETED',
      'Mentor review completed',
    );
  }
}
