import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Role, Status } from '@/common/enums';
import {
  throwConflict,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toTenantObjectId,
} from '@/common/utils/tenant-scope.util';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import {
  CreateBranchDto,
  CreateCampusDto,
  CreateDepartmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTeamDto,
  CreateTenantUserDto,
  CreateTenantDto,
  UpsertChannelSettingDto,
  UpsertTenantBrandingDto,
  UpsertTenantUserDto,
} from '../dto/tenants.dto';
import {
  Branch,
  BranchDocument,
  Campus,
  CampusDocument,
  ChannelSetting,
  ChannelSettingDocument,
  Department,
  DepartmentDocument,
  LeadSource,
  LeadSourceDocument,
  LeadStage,
  LeadStageDocument,
  Team,
  TeamDocument,
  Tenant,
  TenantBranding,
  TenantBrandingDocument,
  TenantDocument,
} from '../schemas/tenants.schema';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenants: Model<TenantDocument>,
    @InjectModel(Branch.name)
    private readonly branches: Model<BranchDocument>,
    @InjectModel(Department.name)
    private readonly departments: Model<DepartmentDocument>,
    @InjectModel(Team.name)
    private readonly teams: Model<TeamDocument>,
    @InjectModel(Campus.name)
    private readonly campuses: Model<CampusDocument>,
    @InjectModel(TenantBranding.name)
    private readonly branding: Model<TenantBrandingDocument>,
    @InjectModel(ChannelSetting.name)
    private readonly channelSettings: Model<ChannelSettingDocument>,
    @InjectModel(LeadSource.name)
    private readonly sources: Model<LeadSourceDocument>,
    @InjectModel(LeadStage.name)
    private readonly stages: Model<LeadStageDocument>,
    @InjectModel(User.name)
    private readonly users: Model<UserDocument>,
    @InjectModel(UserMembership.name)
    private readonly memberships: Model<UserMembershipDocument>,
  ) {}

  async createTenant(dto: CreateTenantDto) {
    return this.tenants.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      { ...dto, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async findActiveTenantByCode(code: string) {
    return this.tenants.findOne({
      code: code.toUpperCase(),
      status: 'active',
    });
  }

  async listTenants() {
    return this.tenants.find({ status: 'active' }).sort({ name: 1 }).lean();
  }

  async createBranch(dto: CreateBranchDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.branches.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listBranches(tenantId: string) {
    return this.branches
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadSource(dto: CreateLeadSourceDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.sources.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadSources(tenantId: string) {
    return this.sources
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadStage(dto: CreateLeadStageDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.stages.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      { ...dto, tenantId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadStages(tenantId: string) {
    return this.stages
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.departments.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      {
        ...dto,
        tenantId,
        branchId: toOptionalObjectId(dto.branchId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listDepartments(tenantId: string) {
    return this.departments
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createTeam(dto: CreateTeamDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.teams.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      {
        ...dto,
        tenantId,
        code: dto.code.toUpperCase(),
        departmentId: toOptionalObjectId(dto.departmentId),
        managerId: toOptionalObjectId(dto.managerId),
        memberIds: dto.memberIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listTeams(tenantId: string) {
    return this.teams
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async createCampus(dto: CreateCampusDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.campuses.findOneAndUpdate(
      { tenantId, code: dto.code.toUpperCase() },
      {
        ...dto,
        tenantId,
        branchId: toOptionalObjectId(dto.branchId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listCampuses(tenantId: string) {
    return this.campuses
      .find({ tenantId: toTenantObjectId(tenantId), status: 'active' })
      .sort({ name: 1 })
      .lean();
  }

  async upsertBranding(dto: UpsertTenantBrandingDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.branding.findOneAndUpdate(
      { tenantId },
      { ...dto, tenantId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async getBranding(tenantId: string) {
    return this.branding
      .findOneAndUpdate(
        { tenantId: toTenantObjectId(tenantId) },
        { tenantId: toTenantObjectId(tenantId) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();
  }

  async upsertChannelSetting(dto: UpsertChannelSettingDto) {
    const tenantId = toTenantObjectId(dto.tenantId);
    return this.channelSettings.findOneAndUpdate(
      { tenantId, channel: dto.channel },
      { ...dto, tenantId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listChannelSettings(tenantId: string) {
    return this.channelSettings
      .find({ tenantId: toTenantObjectId(tenantId) })
      .sort({ channel: 1 })
      .lean();
  }

  async upsertTenantUser(dto: UpsertTenantUserDto) {
    const userId = toRequiredObjectId(dto.userId);
    const tenantId = toTenantObjectId(dto.tenantId);
    const user = await this.users.exists({ _id: userId });
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

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

  async listTenantUsers(tenantId: string) {
    return this.memberships
      .find({ tenantId: toTenantObjectId(tenantId) })
      .populate('userId', 'email phone status roles permissions lastLoginAt')
      .populate('branchIds', 'name code city state status')
      .sort({ role: 1, createdAt: -1 })
      .lean();
  }

  async createTenantUser(dto: CreateTenantUserDto, actorId?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.users.findOne({ email: normalizedEmail });
    if (existingUser) return throwConflict(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);

    const tenantId = toTenantObjectId(dto.tenantId);
    const tenant = await this.tenants.exists({
      _id: tenantId,
      status: 'active',
    });
    if (!tenant) return throwNotFound(ErrorCode.INVALID_REQUEST);

    const user = await this.users.create({
      authAccounts: [
        {
          provider: AuthProvider.EMAIL,
          providerId: normalizedEmail,
          passwordHash: await bcrypt.hash(dto.password, 10),
          isVerified: true,
          isPrimary: true,
        },
      ],
      createdBy: actorId,
      email: normalizedEmail,
      isEmailVerified: true,
      phone: dto.phone
        ? {
            countryCode: dto.countryCode ?? '+91',
            phone: dto.phone,
          }
        : undefined,
      roles: [this.toSystemRole(dto.role)],
      status: dto.status ?? Status.ACTIVE,
      updatedBy: actorId,
    });

    const membership = await this.upsertTenantUser({
      branchIds: dto.branchIds,
      departmentIds: dto.departmentIds,
      permissions: dto.permissions,
      role: dto.role,
      settings: dto.settings,
      status: dto.status,
      tenantId: dto.tenantId,
      userId: String(user._id),
    });

    return {
      membership,
      user: await this.users
        .findById(user._id)
        .select('-authAccounts.passwordHash')
        .lean(),
    };
  }

  private toSystemRole(role: string): Role {
    if (role === 'super_admin') return Role.SUPER_ADMIN;
    if (role === 'finance') return Role.FINANCE;
    if (role === 'marketing_executive') return Role.MARKETING_ADMIN;
    if (role === 'student') return Role.STUDENT;
    if (role === 'parent') return Role.PARENT;
    return Role.ADMIN;
  }
}
