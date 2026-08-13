import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  UniversityPartner,
  UniversityPartnerDocument,
} from '../schemas/university-partner.schema';

@Injectable()
export class UniversityPartnersService extends CrmDomainRecordService<UniversityPartnerDocument> {
  constructor(
    @InjectModel(UniversityPartner.name)
    model: Model<UniversityPartnerDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'university-partner');
  }
}
