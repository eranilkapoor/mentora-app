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
    @Query('status') status?: string,
  ) {
    return successResponse(
      await this.service.list(tenantId, status),
      'CRM_LEDGER_ENTRIES_FETCHED',
      'CRM ledger entries fetched',
    );
  }
  @Post(':recordId([a-fA-F0-9]{24})')
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
  @Post(':recordId([a-fA-F0-9]{24})/complete')
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

  @Post(':recordId([a-fA-F0-9]{24})/reconcile')
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

  @Post('operations/export')
  @Permissions(Permission.CRM_MODULE_RECORD_VIEW)
  async exportLedger(@Body() dto: ExportLedgerDto) {
    return successResponse(
      await this.service.exportLedger(dto),
      'CRM_LEDGER_EXPORTED',
      'CRM ledger exported',
    );
  }
}
