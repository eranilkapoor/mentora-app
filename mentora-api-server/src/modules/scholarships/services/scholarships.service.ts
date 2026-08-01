import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CrmDomainRecordService } from '@/common/crm/services/crm-domain-record.service';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  DecideScholarshipDto,
  EvaluateScholarshipDto,
} from '../dto/scholarships.dto';
import {
  ScholarshipApplication,
  ScholarshipApplicationDocument,
} from '../schemas/scholarships.schema';

@Injectable()
export class ScholarshipsService extends CrmDomainRecordService<ScholarshipApplicationDocument> {
  constructor(
    @InjectModel(ScholarshipApplication.name)
    model: Model<ScholarshipApplicationDocument>,
    auditService: AdminAuditService,
  ) {
    super(model, auditService, 'crm_scholarship');
  }

  async evaluate(recordId: string, dto: EvaluateScholarshipDto) {
    const criteria = dto.criteria ?? {};
    const score =
      Number(criteria.academicScore ?? 0) * 0.5 +
      Number(criteria.needScore ?? 0) * 0.3 +
      Number(criteria.entranceScore ?? 0) * 0.2;
    const eligible = score >= 60;
    return this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        $set: {
          'payload.eligibility': {
            criteria,
            eligible,
            evaluatedAt: new Date().toISOString(),
            score,
          },
        },
        status: eligible ? 'in_progress' : 'rejected',
      },
      { new: true },
    );
  }

  async decide(recordId: string, dto: DecideScholarshipDto) {
    return this.model.findOneAndUpdate(
      {
        _id: toRequiredObjectId(recordId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      {
        $set: {
          'payload.approval': {
            award: dto.award ?? {},
            decidedAt: new Date().toISOString(),
            decision: dto.decision,
            reason: dto.reason,
          },
        },
        status: dto.decision,
      },
      { new: true },
    );
  }
}
