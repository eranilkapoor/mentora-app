import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  ImportExportJob,
  ImportExportJobDocument,
} from '../schemas/imports-exports.schema';

@Injectable()
export class ImportsExportsService extends CrmDomainRecordService<ImportExportJobDocument> {
  constructor(
    @InjectModel(ImportExportJob.name) model: Model<ImportExportJobDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'import_export_job');
  }
}
