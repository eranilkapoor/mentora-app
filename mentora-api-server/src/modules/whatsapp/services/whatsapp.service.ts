import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  WhatsappConversation,
  WhatsappConversationDocument,
} from '../schemas/whatsapp.schema';

@Injectable()
export class WhatsappService extends CrmDomainRecordService<WhatsappConversationDocument> {
  constructor(
    @InjectModel(WhatsappConversation.name)
    model: Model<WhatsappConversationDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'whatsapp');
  }
}
