import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  ServiceCatalogItem,
  ServiceCatalogItemDocument,
} from '../schemas/service-catalog-item.schema';

@Injectable()
export class ServiceCatalogService extends CrmDomainRecordService<ServiceCatalogItemDocument> {
  constructor(
    @InjectModel(ServiceCatalogItem.name)
    model: Model<ServiceCatalogItemDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'service-catalog');
  }
}
