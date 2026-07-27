import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  ExportLedgerDto,
  ReconcileLedgerDto,
} from '../dto/finance-ledgers.dto';
import {
  FinanceLedgerEntry,
  FinanceLedgerEntryDocument,
} from '../schemas/finance-ledgers.schema';

@Injectable()
export class FinanceLedgersService extends CrmDomainRecordService<FinanceLedgerEntryDocument> {
  constructor(
    @InjectModel(FinanceLedgerEntry.name)
    model: Model<FinanceLedgerEntryDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_finance_ledger');
  }

  async reconcile(userId: string, recordId: string, dto: ReconcileLedgerDto) {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        status: 'completed',
        $set: {
          'payload.reconciliation': {
            ...(dto.reconciliation ?? {}),
            externalReference: dto.externalReference,
            reconciledAt: new Date().toISOString(),
            reconciledBy: userId,
          },
        },
      },
      { new: true },
    );
    return record;
  }

  async exportLedger(dto: ExportLedgerDto) {
    const rows = await this.list(dto.tenantId);
    return {
      format: dto.format ?? 'csv',
      rows,
      summary: {
        exportedAt: new Date().toISOString(),
        rowCount: rows.length,
      },
    };
  }
}
