import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { Tag, TagDocument } from '../schemas/tags.schema';

@Injectable()
export class TagsService extends CrmDomainRecordService<TagDocument> {
  constructor(
    @InjectModel(Tag.name) model: Model<TagDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'tag');
  }
}
