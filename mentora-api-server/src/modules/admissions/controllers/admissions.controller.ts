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
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import {
  AllocateAdmissionDto,
  HandoffAdmissionDto,
} from '../dto/admissions.dto';
import { AdmissionsService } from '../services/admissions.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/admissions')
export class AdmissionsController {
  constructor(private readonly service: AdmissionsService) {}
  @Post()
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'ADMISSION_CREATED',
      'Admission created',
    );
  }
  @Get()
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async list(
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
      'ADMISSIONS_FETCHED',
      'Admissions fetched',
    );
  }
  @Get('operations/export')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async exportRecords(@Query('organizationId') organizationId: string) {
    return successResponse(
      await this.service.exportRecords(organizationId),
      'ADMISSIONS_EXPORTED',
      'Admissions exported',
    );
  }
  @Get(':recordId')
  @Permissions(Permission.MODULE_RECORD_VIEW)
  async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, organizationId),
      'ADMISSION_FETCHED',
      'Admission fetched',
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
      'ADMISSIONS_BULK_STATUS_UPDATED',
      'Admissions bulk status updated',
    );
  }
  @Post(':recordId')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'ADMISSION_UPDATED',
      'Admission updated',
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
      'ADMISSION_ARCHIVED',
      'Admission archived',
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
      'ADMISSION_RESTORED',
      'Admission restored',
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
      'ADMISSION_COMPLETED',
      'Admission completed',
    );
  }

  @Post(':recordId/allocate')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async allocate(
    @Param('recordId') recordId: string,
    @Body() dto: AllocateAdmissionDto,
  ) {
    return successResponse(
      await this.service.allocate(recordId, dto),
      'ADMISSION_ALLOCATED',
      'Admission allocated',
    );
  }

  @Post(':recordId/handoff')
  @Permissions(Permission.MODULE_RECORD_MANAGE)
  async handoff(
    @Param('recordId') recordId: string,
    @Body() dto: HandoffAdmissionDto,
  ) {
    return successResponse(
      await this.service.handoff(recordId, dto),
      'ADMISSION_HANDOFF_QUEUED',
      'Admission handoff queued',
    );
  }
}
