import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { DataScope } from '@/common/enums';
import {
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import { getOrgRoleEntry, isPlatformRole } from './role-catalog';

export interface ActorScopeContext {
  dataScope: DataScope;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  branchIds: Types.ObjectId[];
  departmentIds: Types.ObjectId[];
  teamIds: Types.ObjectId[];
}

/**
 * Resolves the record-level DataScope an actor operates under for a given
 * organization: PLATFORM staff see everything, org-membership staff get the
 * scope tier their role carries in ORG_ROLE_CATALOG (plus the branch/
 * department/team ids their membership actually carries), and anyone with
 * no matching membership gets the narrowest possible (SELF, matching
 * nothing but their own records).
 */
@Injectable()
export class ActorScopeService {
  constructor(
    @InjectModel(User.name)
    private readonly users: Model<UserDocument>,
    @InjectModel(UserMembership.name)
    private readonly memberships: Model<UserMembershipDocument>,
  ) {}

  async resolveActorScope(
    actorId: string,
    organizationId?: string,
  ): Promise<ActorScopeContext> {
    const userId = toRequiredObjectId(actorId);
    const resolvedOrganizationId = organizationId
      ? toOrganizationObjectId(organizationId)
      : undefined;

    const actor = await this.users
      .findById(userId)
      .select('roles')
      .lean()
      .exec();
    const roles = (actor?.roles ?? []).map(String);
    if (roles.some(isPlatformRole)) {
      return {
        dataScope: DataScope.PLATFORM,
        userId,
        organizationId: resolvedOrganizationId,
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      };
    }

    const membershipFilter: FilterQuery<UserMembershipDocument> = {
      userId,
      status: 'active',
      ...(resolvedOrganizationId
        ? { organizationId: resolvedOrganizationId }
        : {}),
    };
    const membership = await this.memberships
      .findOne(membershipFilter)
      .lean()
      .exec();

    if (!membership) {
      return {
        dataScope: DataScope.SELF,
        userId,
        organizationId: resolvedOrganizationId,
        branchIds: [],
        departmentIds: [],
        teamIds: [],
      };
    }

    const catalogEntry = getOrgRoleEntry(membership.role);
    return {
      dataScope: catalogEntry?.dataScope ?? DataScope.SELF,
      userId,
      organizationId: membership.organizationId,
      branchIds: membership.branchIds ?? [],
      departmentIds: membership.departmentIds ?? [],
      teamIds: membership.teamIds ?? [],
    };
  }
}
