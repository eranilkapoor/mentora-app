import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  StudyMaterial,
  StudyMaterialDocument,
} from '../schemas/study-material.schema';

@Injectable()
export class StudyMaterialsService extends CrmDomainRecordService<StudyMaterialDocument> {
  constructor(
    @InjectModel(StudyMaterial.name) model: Model<StudyMaterialDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'study-material');
  }
}
