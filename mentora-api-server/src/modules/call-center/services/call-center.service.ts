import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  CallCenterCall,
  CallCenterCallDocument,
} from '../schemas/call-center.schema';

@Injectable()
export class CallCenterService extends CrmDomainRecordService<CallCenterCallDocument> {
  constructor(
    @InjectModel(CallCenterCall.name) model: Model<CallCenterCallDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_call_center');
  }
}
