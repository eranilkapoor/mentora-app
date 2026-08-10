import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { Meeting, MeetingDocument } from '../schemas/meetings.schema';

@Injectable()
export class MeetingsService extends CrmDomainRecordService<MeetingDocument> {
  constructor(
    @InjectModel(Meeting.name) model: Model<MeetingDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'meeting');
  }
}
