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
import { WhatsappService } from '../services/whatsapp.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/whatsapp')
export class WhatsappController {
  constructor(private readonly service: WhatsappService) {}
  @Post() @Permissions(Permission.COMMUNICATION_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'WHATSAPP_CREATED',
      'WhatsApp conversation created',
    );
  }
  @Get() @Permissions(Permission.COMMUNICATION_VIEW) async list(
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
      'WHATSAPP_FETCHED',
      'WhatsApp conversations fetched',
    );
  }
  @Get(':recordId')
  @Permissions(Permission.COMMUNICATION_VIEW)
  async getById(
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(recordId, organizationId),
      'WHATSAPP_RECORD_FETCHED',
      'WhatsApp conversation fetched',
    );
  }
  @Post('operations/bulk-status')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async bulkUpdateStatus(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateCrmDomainRecordStatusDto,
  ) {
    return successResponse(
      await this.service.bulkUpdateStatus(req.user.sub, dto),
      'WHATSAPP_BULK_STATUS_UPDATED',
      'WhatsApp conversations bulk status updated',
    );
  }
  @Delete(':recordId')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async archive(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archive(req.user.sub, recordId, organizationId),
      'WHATSAPP_ARCHIVED',
      'WhatsApp conversation archived',
    );
  }
  @Post(':recordId/restore')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async restore(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.restore(req.user.sub, recordId, organizationId),
      'WHATSAPP_RESTORED',
      'WhatsApp conversation restored',
    );
  }
  @Post(':recordId')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.update(req.user.sub, recordId, dto),
      'WHATSAPP_UPDATED',
      'WhatsApp conversation updated',
    );
  }
  @Post(':recordId/complete')
  @Permissions(Permission.COMMUNICATION_MANAGE)
  async complete(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: CompleteCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.complete(req.user.sub, recordId, dto),
      'WHATSAPP_COMPLETED',
      'WhatsApp conversation completed',
    );
  }
}
