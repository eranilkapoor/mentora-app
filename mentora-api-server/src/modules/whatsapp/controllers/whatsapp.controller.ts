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
import { WhatsappService } from '../services/whatsapp.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}
  @Post() @Permissions(Permission.CRM_COMMUNICATION_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_WHATSAPP_CREATED',
      'CRM WhatsApp conversation created',
    );
  }
  @Get() @Permissions(Permission.CRM_COMMUNICATION_VIEW) async list(
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
      'CRM_WHATSAPP_FETCHED',
      'CRM WhatsApp conversations fetched',
    );
  }
  @Delete(':recordId')
  @Permissions(Permission.CRM_COMMUNICATION_MANAGE)
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return successResponse(
      await this.service.archive(req.user.sub, recordId, tenantId),
      'CRM_WHATSAPP_ARCHIVED',
      'CRM WhatsApp conversation archived',
    );
  }
  @Post(':recordId')
  @Permissions(Permission.CRM_COMMUNICATION_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'CRM_WHATSAPP_UPDATED',
      'CRM WhatsApp conversation updated',
    );
  }
  @Post(':recordId/complete')
  @Permissions(Permission.CRM_COMMUNICATION_MANAGE)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: CompleteCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.complete(req.user.sub, recordId, dto),
      'CRM_WHATSAPP_COMPLETED',
      'CRM WhatsApp conversation completed',
    );
  }
}
