import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { ReconcileLedgerDto } from '../dto/finance-ledgers.dto';
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
    super(model, auditService, 'finance_ledger');
  }

  async reconcile(userId: string, recordId: string, dto: ReconcileLedgerDto) {
    const record = await this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(dto.organizationId),
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
}
