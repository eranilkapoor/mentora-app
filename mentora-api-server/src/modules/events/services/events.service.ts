import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { CrmEvent, CrmEventDocument } from '../schemas/events.schema';

@Injectable()
export class EventsService extends CrmDomainRecordService<CrmEventDocument> {
  constructor(
    @InjectModel(CrmEvent.name) model: Model<CrmEventDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_event');
  }
}
