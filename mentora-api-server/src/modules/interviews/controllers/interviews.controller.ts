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
  CompleteCrmDomainRecordDto,
  CreateCrmDomainRecordDto,
  UpdateCrmDomainRecordDto,
} from '@/common/crm/dto/crm-domain-record.dto';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import { InterviewsService } from '../services/interviews.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly service: InterviewsService) {}
  @Post() @Permissions(Permission.CRM_MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_INTERVIEW_CREATED',
      'CRM interview created',
    );
  }
  @Get() @Permissions(Permission.CRM_MODULE_RECORD_VIEW) async list(
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
      'CRM_INTERVIEWS_FETCHED',
      'CRM interviews fetched',
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
      'CRM_INTERVIEW_UPDATED',
      'CRM interview updated',
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
      'CRM_INTERVIEW_ARCHIVED',
      'CRM interview archived',
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
      'CRM_INTERVIEW_COMPLETED',
      'CRM interview completed',
    );
  }
}
