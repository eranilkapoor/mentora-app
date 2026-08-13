import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  ChannelPartner,
  ChannelPartnerDocument,
} from '../schemas/channel-partner.schema';

@Injectable()
export class ChannelPartnersService extends CrmDomainRecordService<ChannelPartnerDocument> {
  constructor(
    @InjectModel(ChannelPartner.name) model: Model<ChannelPartnerDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'channel-partner');
  }
}
