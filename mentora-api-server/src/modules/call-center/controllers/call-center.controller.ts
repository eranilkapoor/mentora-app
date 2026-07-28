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
import { CallCenterService } from '../services/call-center.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('call-center')
export class CallCenterController {
  constructor(private readonly service: CallCenterService) {}
  @Post() @Permissions(Permission.CRM_MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_CALL_CREATED',
      'CRM call created',
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
      'CRM_CALLS_FETCHED',
      'CRM calls fetched',
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
      'CRM_CALL_ARCHIVED',
      'CRM call archived',
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
      'CRM_CALL_UPDATED',
      'CRM call updated',
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
      'CRM_CALL_COMPLETED',
      'CRM call completed',
    );
  }
}
