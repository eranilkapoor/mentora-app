import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  AllocateAdmissionDto,
  HandoffAdmissionDto,
} from '../dto/admissions.dto';
import { Admission, AdmissionDocument } from '../schemas/admissions.schema';

@Injectable()
export class AdmissionsService extends CrmDomainRecordService<AdmissionDocument> {
  constructor(
    @InjectModel(Admission.name) model: Model<AdmissionDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_admission');
  }

  allocate(recordId: string, dto: AllocateAdmissionDto) {
    return this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        $set: {
          'payload.batchAllocation': {
            ...(dto.allocation ?? {}),
            allocatedAt: new Date().toISOString(),
            batchId: dto.batchId,
            cohortName: dto.cohortName,
          },
        },
        status: 'in_progress',
      },
      { new: true },
    );
  }

  handoff(recordId: string, dto: HandoffAdmissionDto) {
    return this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        tenantId: toTenantObjectId(dto.tenantId),
      },
      {
        $set: {
          'payload.handoff': {
            payload: dto.payload ?? {},
            status: 'queued',
            targetSystem: dto.targetSystem,
            triggeredAt: new Date().toISOString(),
          },
        },
      },
      { new: true },
    );
  }
}
