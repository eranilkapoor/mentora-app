import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CountryGuide,
  CountryGuideDocument,
} from '../schemas/country-guide.schema';

@Injectable()
export class CountriesService extends CrmDomainRecordService<CountryGuideDocument> {
  constructor(
    @InjectModel(CountryGuide.name) model: Model<CountryGuideDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'country');
  }
}
