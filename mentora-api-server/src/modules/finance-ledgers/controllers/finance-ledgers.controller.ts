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
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  ExportLedgerDto,
  ReconcileLedgerDto,
} from '../dto/finance-ledgers.dto';
import { FinanceLedgersService } from '../services/finance-ledgers.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('finance-ledgers')
export class FinanceLedgersController {
  constructor(private readonly service: FinanceLedgersService) {}
  @Post() @Permissions(Permission.CRM_MODULE_RECORD_MANAGE) async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDomainRecordDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'CRM_LEDGER_ENTRY_CREATED',
      'CRM ledger entry created',
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
      'CRM_LEDGER_ENTRIES_FETCHED',
      'CRM ledger entries fetched',
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
      'CRM_LEDGER_ENTRY_FETCHED',
      'CRM ledger entry fetched',
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
      'CRM_LEDGER_ENTRY_ARCHIVED',
      'CRM ledger entry archived',
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
      'CRM_LEDGER_ENTRY_RESTORED',
      'CRM ledger entry restored',
    );
  }

  @Post('operations/export')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async exportLedger(@Body() dto: ExportLedgerDto) {
    return successResponse(
      await this.service.exportLedger(dto),
      'CRM_LEDGER_EXPORTED',
      'CRM ledger exported',
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
      'CRM_LEDGER_ENTRIES_BULK_STATUS_UPDATED',
      'CRM ledger entries bulk status updated',
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
      'CRM_LEDGER_ENTRY_UPDATED',
      'CRM ledger entry updated',
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
      'CRM_LEDGER_ENTRY_COMPLETED',
      'CRM ledger entry completed',
    );
  }

  @Post(':recordId/reconcile')
  @Permissions(Permission.CRM_MODULE_RECORD_MANAGE)
  async reconcile(
    @Req() req: AuthenticatedRequest,
    @Param('recordId') recordId: string,
    @Body() dto: ReconcileLedgerDto,
  ) {
    return successResponse(
      await this.service.reconcile(req.user.sub, recordId, dto),
      'CRM_LEDGER_ENTRY_RECONCILED',
      'CRM ledger entry reconciled',
    );
  }
}
