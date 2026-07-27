import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { Admission, AdmissionDocument } from '../schemas/admissions.schema';

@Injectable()
export class AdmissionsService extends CrmDomainRecordService<AdmissionDocument> {
  constructor(
    @InjectModel(Admission.name) model: Model<AdmissionDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_admission');
  }
}
