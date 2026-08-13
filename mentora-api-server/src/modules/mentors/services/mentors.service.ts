import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  MentorRecord,
  MentorRecordDocument,
} from '../schemas/mentor-record.schema';

@Injectable()
export class MentorsService extends CrmDomainRecordService<MentorRecordDocument> {
  constructor(
    @InjectModel(MentorRecord.name) model: Model<MentorRecordDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'mentor');
  }
}
