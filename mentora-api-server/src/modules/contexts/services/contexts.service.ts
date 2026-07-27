import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { SelectContextDto, UpsertUserMembershipDto } from '../dto/contexts.dto';
import {
  UserMembership,
  UserMembershipDocument,
} from '../schemas/contexts.schema';

@Injectable()
export class ContextsService {
  constructor(
    @InjectModel(UserMembership.name)
    private readonly memberships: Model<UserMembershipDocument>,
  ) {}

  async upsertMembership(dto: UpsertUserMembershipDto) {
    const userId = toRequiredObjectId(dto.userId);
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.memberships.findOneAndUpdate(
      { userId, tenantId, role: dto.role },
      {
        ...dto,
        userId,
        tenantId,
        branchIds: dto.branchIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listUserContexts(userId: string) {
    return this.memberships
      .find({ userId: toRequiredObjectId(userId), status: 'active' })
      .populate('tenantId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .sort({ role: 1, createdAt: 1 })
      .lean();
  }

  async selectContext(userId: string, dto: SelectContextDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    const membership = await this.memberships
      .findOne({
        userId: toRequiredObjectId(userId),
        tenantId,
        role: dto.role,
        status: 'active',
      })
      .populate('tenantId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .lean();

    if (!membership) {
      throw new ForbiddenException(
        'Education CRM context is not available for this user',
      );
    }

    if (
      dto.branchId &&
      membership.branchIds.length > 0 &&
      !membership.branchIds.some(
        (branch) => String(branch._id) === dto.branchId,
      )
    ) {
      throw new ForbiddenException(
        'Education CRM branch is not available for this user',
      );
    }

    return {
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      role: membership.role,
      permissions: membership.permissions,
      tenant: membership.tenantId,
      branches: membership.branchIds,
    };
  }
}
