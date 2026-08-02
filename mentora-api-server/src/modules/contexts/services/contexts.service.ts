import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
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
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.memberships.findOneAndUpdate(
      { userId, organizationId, role: dto.role },
      {
        ...dto,
        userId,
        organizationId,
        branchIds: dto.branchIds?.map((id) => toRequiredObjectId(id)) ?? [],
        departmentIds:
          dto.departmentIds?.map((id) => toRequiredObjectId(id)) ?? [],
        teamIds: dto.teamIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listUserContexts(userId: string) {
    return this.memberships
      .find({ userId: toRequiredObjectId(userId), status: 'active' })
      .populate('organizationId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .populate('departmentIds', 'name code branchId function status')
      .populate('teamIds', 'name code departmentId managerId status')
      .sort({ role: 1, createdAt: 1 })
      .lean();
  }

  async assertUserOrganizationAccess(userId: string, organizationId: string) {
    const membership = await this.memberships
      .findOne({
        userId: toRequiredObjectId(userId),
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .select('_id role permissions branchIds')
      .lean();

    if (!membership) {
      throw new ForbiddenException(
        'Education CRM organization context is not available for this user',
      );
    }

    return membership;
  }

  async selectContext(userId: string, dto: SelectContextDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const membership = await this.memberships
      .findOne({
        userId: toRequiredObjectId(userId),
        organizationId,
        role: dto.role,
        status: 'active',
      })
      .populate('organizationId', 'name code type status')
      .populate('branchIds', 'name code city state status')
      .populate('departmentIds', 'name code branchId function status')
      .populate('teamIds', 'name code departmentId managerId status')
      .lean();

    if (!membership) {
      throw new ForbiddenException(
        'Education CRM context is not available for this user',
      );
    }

    this.assertScopedId(
      membership.branchIds,
      dto.branchId,
      'Education CRM branch is not available for this user',
    );
    this.assertScopedId(
      membership.departmentIds,
      dto.departmentId,
      'Education CRM department is not available for this user',
    );
    this.assertScopedId(
      membership.teamIds,
      dto.teamId,
      'Education CRM team is not available for this user',
    );

    return {
      organizationId: dto.organizationId,
      branchId: dto.branchId,
      departmentId: dto.departmentId,
      teamId: dto.teamId,
      role: membership.role,
      permissions: membership.permissions,
      organization: membership.organizationId,
      branches: membership.branchIds,
      departments: membership.departmentIds,
      teams: membership.teamIds,
    };
  }

  private assertScopedId(
    records: Array<{ _id?: unknown }> | undefined,
    requestedId: string | undefined,
    message: string,
  ) {
    if (
      requestedId &&
      records?.length &&
      !records.some((record) => String(record._id) === requestedId)
    ) {
      throw new ForbiddenException(message);
    }
  }
}
