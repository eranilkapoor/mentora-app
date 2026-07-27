import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  ScholarshipApplication,
  ScholarshipApplicationDocument,
} from '../schemas/scholarships.schema';

@Injectable()
export class ScholarshipsService extends CrmDomainRecordService<ScholarshipApplicationDocument> {
  constructor(
    @InjectModel(ScholarshipApplication.name)
    model: Model<ScholarshipApplicationDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_scholarship');
  }
}
