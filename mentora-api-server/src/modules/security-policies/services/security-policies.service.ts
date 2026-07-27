import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { UpdateTenantSecurityPolicyDto } from '../dto/security-policies.dto';
import {
  TenantSecurityPolicy,
  TenantSecurityPolicyDocument,
} from '../schemas/security-policies.schema';

@Injectable()
export class SecurityPoliciesService {
  constructor(
    @InjectModel(TenantSecurityPolicy.name)
    private readonly policies: Model<TenantSecurityPolicyDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  getPolicy(tenantId: string) {
    return this.policies
      .findOneAndUpdate(
        { tenantId: toTenantObjectId(tenantId) },
        { tenantId: toTenantObjectId(tenantId) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();
  }

  async updatePolicy(userId: string, dto: UpdateTenantSecurityPolicyDto) {
    const policy = await this.policies.findOneAndUpdate(
      { tenantId: toTenantObjectId(dto.tenantId) },
      {
        ...dto,
        tenantId: toTenantObjectId(dto.tenantId),
        updatedBy: toRequiredObjectId(userId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await this.auditService.write({
      actorId: userId,
      action: 'crm_security_policy.updated',
      resource: 'crm_security_policy',
      targetId: String(policy._id),
      after: JSON.parse(JSON.stringify(policy.toObject())) as Record<
        string,
        unknown
      >,
      metadata: { tenantId: dto.tenantId },
    });
    return policy;
  }
}
