import {
  Body,
  Controller,
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
    @Query('status') status?: string,
  ) {
    return successResponse(
      await this.service.list(tenantId, status),
      'CRM_ADMISSIONS_FETCHED',
      'CRM admissions fetched',
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
