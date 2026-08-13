import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { CmsEntry, CmsEntryDocument } from '../schemas/cms-entry.schema';

@Injectable()
export class CmsService extends CrmDomainRecordService<CmsEntryDocument> {
  constructor(
    @InjectModel(CmsEntry.name) model: Model<CmsEntryDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'cms');
  }
}
