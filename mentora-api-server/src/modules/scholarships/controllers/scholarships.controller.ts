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
import {
  BulkUpdateCrmDomainRecordStatusDto,
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  DecideScholarshipDto,
  EvaluateScholarshipDto,
} from '../dto/scholarships.dto';
import { ScholarshipsService } from '../services/scholarships.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
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
      'CRM_SCHOLARSHIPS_FETCHED',
      'CRM scholarships fetched',
    );
  }
  @Get(':recordId')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, organizationId),
      'CRM_SCHOLARSHIP_FETCHED',
      'CRM scholarship fetched',
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
      'CRM_SCHOLARSHIPS_BULK_STATUS_UPDATED',
      'CRM scholarships bulk status updated',
    );
  }
  @Delete(':recordId')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archive(req.user.sub, recordId, organizationId),
      'CRM_SCHOLARSHIP_ARCHIVED',
      'CRM scholarship archived',
    );
  }
  @Post(':recordId/restore')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async restore(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restore(req.user.sub, recordId, organizationId),
      'CRM_SCHOLARSHIP_RESTORED',
      'CRM scholarship restored',
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
