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
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
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

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly service: AdmissionsService) {}
  @Post()
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_ADMISSION_CREATED',
      'CRM admission created',
    );
  }
  @Get()
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async list(
    @Query('tenantId') tenantId: string,
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
        tenantId,
      }),
      'CRM_ADMISSIONS_FETCHED',
      'CRM admissions fetched',
    );
  }
  @Get(':recordId')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async getById(
    @Param('recordId') recordId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, tenantId),
      'CRM_ADMISSION_FETCHED',
      'CRM admission fetched',
    );
  }
  @Post('operations/bulk-status')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateCrmDomainRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(req.user.sub, dto),
      'CRM_ADMISSIONS_BULK_STATUS_UPDATED',
      'CRM admissions bulk status updated',
    );
  }
  @Post(':recordId')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'CRM_ADMISSION_UPDATED',
      'CRM admission updated',
    );
  }
  @Delete(':recordId')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.archive(req.user.sub, recordId, tenantId),
      'CRM_ADMISSION_ARCHIVED',
      'CRM admission archived',
    );
  }
  @Post(':recordId/restore')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async restore(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.restore(req.user.sub, recordId, tenantId),
      'CRM_ADMISSION_RESTORED',
      'CRM admission restored',
    );
  }
  @Post(':recordId/complete')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: CompleteCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.complete(req.user.sub, recordId, dto),
      'CRM_ADMISSION_COMPLETED',
      'CRM admission completed',
    );
  }

  @Post(':recordId/allocate')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async allocate(
    @Param('recordId') recordId: string,
    @Body() dto: AllocateAdmissionDto,
  ) {
    return successResponse(
      await this.service.allocate(recordId, dto),
      'CRM_ADMISSION_ALLOCATED',
      'CRM admission allocated',
    );
  }

  @Post(':recordId/handoff')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async handoff(
    @Param('recordId') recordId: string,
    @Body() dto: HandoffAdmissionDto,
  ) {
    return successResponse(
      await this.service.handoff(recordId, dto),
      'CRM_ADMISSION_HANDOFF_QUEUED',
      'CRM admission handoff queued',
    );
  }
}
