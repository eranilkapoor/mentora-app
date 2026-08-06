import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { FieldVisit, FieldVisitDocument } from '../schemas/field-force.schema';

@Injectable()
export class FieldForceService extends CrmDomainRecordService<FieldVisitDocument> {
  constructor(
    @InjectModel(FieldVisit.name) model: Model<FieldVisitDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'field_force');
  }
}
