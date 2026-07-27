import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
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
}
