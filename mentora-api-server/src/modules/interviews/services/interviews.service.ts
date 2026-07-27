import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { Interview, InterviewDocument } from '../schemas/interviews.schema';

@Injectable()
export class InterviewsService extends CrmDomainRecordService<InterviewDocument> {
  constructor(
    @InjectModel(Interview.name) model: Model<InterviewDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_interview');
  }
}
