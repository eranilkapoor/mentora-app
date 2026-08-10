import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { CrmTag, CrmTagDocument } from '../schemas/tags.schema';

@Injectable()
export class TagsService extends CrmDomainRecordService<CrmTagDocument> {
  constructor(
    @InjectModel(CrmTag.name) model: Model<CrmTagDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'tag');
  }
}
