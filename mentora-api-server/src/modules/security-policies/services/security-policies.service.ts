import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import { UpdateOrganizationSecurityPolicyDto } from '../dto/security-policies.dto';
import {
  OrganizationSecurityPolicy,
  OrganizationSecurityPolicyDocument,
} from '../schemas/security-policies.schema';

@Injectable()
export class SecurityPoliciesService {
  constructor(
    @InjectModel(OrganizationSecurityPolicy.name)
    private readonly policies: Model<OrganizationSecurityPolicyDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  getPolicy(organizationId: string) {
    return this.policies
      .findOneAndUpdate(
        { organizationId: toOrganizationObjectId(organizationId) },
        { organizationId: toOrganizationObjectId(organizationId) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();
  }

  async updatePolicy(userId: string, dto: UpdateOrganizationSecurityPolicyDto) {
    const policy = await this.policies.findOneAndUpdate(
      { organizationId: toOrganizationObjectId(dto.organizationId) },
      {
        ...dto,
        organizationId: toOrganizationObjectId(dto.organizationId),
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
      metadata: { organizationId: dto.organizationId },
    });
    return policy;
  }
}
