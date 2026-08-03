import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Role, Status } from '@/common/enums';
import {
  throwConflict,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { toRequiredObjectId } from '@/common/utils/organization-scope.util';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import {
  UserSession,
  UserSessionDocument,
} from '@/modules/auth/schemas/user-session.schema';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import {
  CreateAdminUserDto,
  ListAdminUsersDto,
  UpdateAdminUserDto,
} from '../dto/admin-iam.dto';

type AdminApiObject = Record<string, unknown>;

@Injectable()
export class AdminIamService {
  constructor(
    @InjectModel(User.name)
    private readonly users: Model<UserDocument>,
    @InjectModel(UserSession.name)
    private readonly sessions: Model<UserSessionDocument>,
    @InjectModel(UserMembership.name)
    private readonly memberships: Model<UserMembershipDocument>,
  ) {}

  async listUsers(
    query: ListAdminUsersDto,
    actorId?: string,
  ): Promise<AdminApiObject> {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveUserSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const actorScope = await this.resolveActorScope(actorId);
    const allowedOrganizationIds = actorScope.organizationIds;
    const shouldRestrictOrganizations = !actorScope.isSuperAdmin;
    if (shouldRestrictOrganizations && allowedOrganizationIds.length === 0) {
      throw new ForbiddenException('No active organization access');
    }
    if (
      query.organizationId &&
      shouldRestrictOrganizations &&
      !allowedOrganizationIds.some((id) => id.equals(query.organizationId))
    ) {
      throw new ForbiddenException('Organization access denied');
    }
    const membershipFilter: FilterQuery<UserMembershipDocument> = {
      ...(query.organizationId
        ? { organizationId: toRequiredObjectId(query.organizationId) }
        : shouldRestrictOrganizations
          ? { organizationId: { $in: allowedOrganizationIds } }
          : {}),
      ...(query.branchId
        ? { branchIds: toRequiredObjectId(query.branchId) }
        : {}),
      ...(query.role ? { role: query.role } : {}),
    };
    const membershipUserIds =
      query.organizationId ||
      query.branchId ||
      query.role ||
      shouldRestrictOrganizations
        ? (
            await this.memberships
              .find(membershipFilter)
              .select('userId')
              .lean()
              .exec()
          ).map((item) => item.userId)
        : undefined;
    const search = query.search?.trim();
    const userFilter: FilterQuery<UserDocument> = {
      deletedAt: { $exists: false },
      ...(query.status ? { status: query.status } : {}),
      ...(membershipUserIds ? { _id: { $in: membershipUserIds } } : {}),
      ...(search
        ? {
            $or: [
              { email: { $regex: search, $options: 'i' } },
              { roles: { $regex: search, $options: 'i' } },
              { 'phone.phone': { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.users
        .find(userFilter)
        .select('-authAccounts.passwordHash')
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.users.countDocuments(userFilter),
    ]);
    const userIds = items.map((item) => item._id);
    const [memberships, sessionCounts] = await Promise.all([
      this.memberships
        .find({ userId: { $in: userIds } })
        .populate('organizationId', 'name code status')
        .populate('branchIds', 'name code city state status')
        .populate('departmentIds', 'name code function status')
        .populate('teamIds', 'name code status')
        .lean()
        .exec(),
      this.sessions.aggregate<{ _id: Types.ObjectId; activeSessions: number }>([
        { $match: { userId: { $in: userIds }, isActive: true } },
        { $group: { _id: '$userId', activeSessions: { $sum: 1 } } },
      ]),
    ]);
    const membershipMap = new Map<string, unknown[]>();
    memberships.forEach((membership) => {
      const key = String(membership.userId);
      membershipMap.set(key, [...(membershipMap.get(key) ?? []), membership]);
    });
    const sessionMap = new Map(
      sessionCounts.map((item) => [String(item._id), item.activeSessions]),
    );

    return {
      items: items.map((user) => ({
        ...user,
        activeSessions: sessionMap.get(String(user._id)) ?? 0,
        memberships: membershipMap.get(String(user._id)) ?? [],
      })),
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async createUser(
    dto: CreateAdminUserDto,
    actorId?: string,
  ): Promise<AdminApiObject> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.users.findOne({ email }).lean().exec();
    if (existing) return throwConflict(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);

    const user = await this.users.create({
      authAccounts: [
        {
          provider: AuthProvider.EMAIL,
          providerId: email,
          passwordHash: await bcrypt.hash(dto.password, 10),
          isVerified: true,
          isPrimary: true,
        },
      ],
      createdBy: actorId,
      email,
      isEmailVerified: true,
      phone: dto.phone
        ? { countryCode: dto.countryCode ?? '+91', phone: dto.phone }
        : undefined,
      roles: [this.toSystemRole(dto.role)],
      status: Status.ACTIVE,
      updatedBy: actorId,
    });

    const membership = await this.memberships.create({
      branchIds: dto.branchIds?.map((id) => toRequiredObjectId(id)) ?? [],
      departmentIds:
        dto.departmentIds?.map((id) => toRequiredObjectId(id)) ?? [],
      organizationId: toRequiredObjectId(dto.organizationId),
      role: dto.role,
      status: 'active',
      teamIds: dto.teamIds?.map((id) => toRequiredObjectId(id)) ?? [],
      userId: user._id,
    });

    return {
      membership,
      user: await this.users
        .findById(user._id)
        .select('-authAccounts.passwordHash')
        .lean(),
    };
  }

  async updateUser(
    userId: string,
    dto: UpdateAdminUserDto,
    actorId?: string,
  ): Promise<AdminApiObject> {
    const user = await this.users.findById(userId).exec();
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    if (dto.status) user.status = dto.status;
    if (dto.role) user.roles = [this.toSystemRole(dto.role)];
    user.updatedBy = actorId;
    await user.save();

    if (dto.role && dto.organizationId) {
      await this.memberships.findOneAndUpdate(
        {
          organizationId: toRequiredObjectId(dto.organizationId),
          userId: toRequiredObjectId(userId),
        },
        {
          branchIds: dto.branchIds?.map((id) => toRequiredObjectId(id)) ?? [],
          departmentIds:
            dto.departmentIds?.map((id) => toRequiredObjectId(id)) ?? [],
          organizationId: toRequiredObjectId(dto.organizationId),
          role: dto.role,
          status: dto.status === Status.SUSPENDED ? 'suspended' : 'active',
          teamIds: dto.teamIds?.map((id) => toRequiredObjectId(id)) ?? [],
          userId: toRequiredObjectId(userId),
        },
        { new: true, setDefaultsOnInsert: true, upsert: true },
      );
    }

    if (dto.status && [Status.SUSPENDED, Status.BLOCKED].includes(dto.status)) {
      await this.revokeUserSessions(userId);
    }

    return this.getUser(userId);
  }

  async getUser(userId: string): Promise<AdminApiObject> {
    const user = await this.users
      .findById(userId)
      .select('-authAccounts.passwordHash')
      .lean()
      .exec();
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    const [memberships, sessions] = await Promise.all([
      this.memberships
        .find({ userId: toRequiredObjectId(userId) })
        .populate('organizationId', 'name code status')
        .populate('branchIds', 'name code city state status')
        .populate('departmentIds', 'name code function status')
        .populate('teamIds', 'name code status')
        .lean()
        .exec(),
      this.sessions
        .find({ userId: toRequiredObjectId(userId) })
        .select('-refreshTokenHash -refreshToken')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
    ]);

    return { ...user, memberships, sessions };
  }

  async revokeUserSessions(userId: string): Promise<AdminApiObject> {
    const result = await this.sessions.updateMany(
      { userId: toRequiredObjectId(userId), isActive: true },
      { $set: { isActive: false, loggedOutAt: new Date() } },
    );
    return { revoked: result.modifiedCount };
  }

  async getAuthOverview(organizationId?: string): Promise<AdminApiObject> {
    const membershipUserIds = organizationId
      ? (
          await this.memberships
            .find({ organizationId: toRequiredObjectId(organizationId) })
            .select('userId')
            .lean()
            .exec()
        ).map((item) => item.userId)
      : undefined;
    const userFilter: FilterQuery<UserDocument> = {
      deletedAt: { $exists: false },
      ...(membershipUserIds ? { _id: { $in: membershipUserIds } } : {}),
    };
    const now = new Date();
    const [totalUsers, activeUsers, suspendedUsers, activeSessions, expiring] =
      await Promise.all([
        this.users.countDocuments(userFilter),
        this.users.countDocuments({ ...userFilter, status: Status.ACTIVE }),
        this.users.countDocuments({
          ...userFilter,
          status: { $in: [Status.SUSPENDED, Status.BLOCKED] },
        }),
        this.sessions.countDocuments({
          ...(membershipUserIds ? { userId: { $in: membershipUserIds } } : {}),
          expiresAt: { $gt: now },
          isActive: true,
        }),
        this.sessions
          .find({
            ...(membershipUserIds
              ? { userId: { $in: membershipUserIds } }
              : {}),
            expiresAt: { $gt: now },
            isActive: true,
          })
          .select('-refreshTokenHash -refreshToken')
          .sort({ expiresAt: 1 })
          .limit(10)
          .lean()
          .exec(),
      ]);

    return {
      activeSessions,
      activeUsers,
      controls: [
        { control: 'Password login', status: 'active', provider: 'email' },
        { control: 'MFA policy', status: 'configured', provider: 'otp' },
        { control: 'Google SSO', status: 'sandbox', provider: 'google' },
        { control: 'Microsoft SSO', status: 'sandbox', provider: 'microsoft' },
      ],
      expiringSessions: expiring,
      suspendedUsers,
      totalUsers,
    };
  }

  private resolveUserSortBy(value?: string) {
    const allowed = new Set(['createdAt', 'email', 'lastLoginAt', 'status']);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private toSystemRole(role: string): Role {
    if (role === 'super_admin') return Role.SUPER_ADMIN;
    if (role === 'finance') return Role.FINANCE;
    if (role === 'marketing_executive') return Role.MARKETING_ADMIN;
    if (role === 'student') return Role.STUDENT;
    if (role === 'parent') return Role.PARENT;
    return Role.ADMIN;
  }

  private async resolveActorScope(actorId?: string): Promise<{
    isSuperAdmin: boolean;
    organizationIds: Types.ObjectId[];
  }> {
    if (!actorId) return { isSuperAdmin: false, organizationIds: [] };
    const actor = await this.users
      .findById(actorId)
      .select('roles')
      .lean()
      .exec();
    const roles = (actor?.roles ?? []).map(String);
    if (roles.includes(Role.SUPER_ADMIN)) {
      return { isSuperAdmin: true, organizationIds: [] };
    }
    const memberships = await this.memberships
      .find({ userId: toRequiredObjectId(actorId), status: 'active' })
      .select('organizationId')
      .lean()
      .exec();
    return {
      isSuperAdmin: false,
      organizationIds: memberships.map((membership) =>
        toRequiredObjectId(String(membership.organizationId)),
      ),
    };
  }
}
