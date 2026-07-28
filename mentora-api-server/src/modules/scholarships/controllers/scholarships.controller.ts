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
import {
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  DecideScholarshipDto,
  EvaluateScholarshipDto,
} from '../dto/scholarships.dto';
import { ScholarshipsService } from '../services/scholarships.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly service: ScholarshipsService) {}
  @Post() @Permissions(Permission.CRM_MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_SCHOLARSHIP_CREATED',
      'CRM scholarship created',
    );
  }
  @Get() @Permissions(Permission.CRM_MODULE_RECORD_VIEW) async list(
    @Query('tenantId') tenantId: string,
    @Query('status') status?: string,
  ) {
    return successResponse(
      await this.service.list(tenantId, status),
      'CRM_SCHOLARSHIPS_FETCHED',
      'CRM scholarships fetched',
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
      'CRM_SCHOLARSHIP_UPDATED',
      'CRM scholarship updated',
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
      'CRM_SCHOLARSHIP_COMPLETED',
      'CRM scholarship completed',
    );
  }

  @Post(':recordId/evaluate')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async evaluate(
    @Param('recordId') recordId: string,
    @Body() dto: EvaluateScholarshipDto,
  ) {
    return successResponse(
      await this.service.evaluate(recordId, dto),
      'CRM_SCHOLARSHIP_EVALUATED',
      'CRM scholarship evaluated',
    );
  }

  @Post(':recordId/decision')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async decide(
    @Param('recordId') recordId: string,
    @Body() dto: DecideScholarshipDto,
  ) {
    return successResponse(
      await this.service.decide(recordId, dto),
      'CRM_SCHOLARSHIP_DECIDED',
      'CRM scholarship decision saved',
    );
  }
}
