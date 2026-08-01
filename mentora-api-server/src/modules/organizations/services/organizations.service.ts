import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, Model } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Role, Status } from '@/common/enums';
import {
  throwConflict,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import {
  CreateBranchDto,
  CreateBusinessUnitDto,
  CreateCampusDto,
  CreateDepartmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTeamDto,
  CreateOrganizationUserDto,
  CreateOrganizationDto,
  ListOrganizationsDto,
  ListOrganizationUsersDto,
  UpdateOrganizationDto,
  UpsertChannelSettingDto,
  UpsertOrganizationBrandingDto,
  UpsertOrganizationUserDto,
} from '../dto/organizations.dto';
import {
  Branch,
  BranchDocument,
  BusinessUnit,
  BusinessUnitDocument,
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
  Organization,
  OrganizationBranding,
  OrganizationBrandingDocument,
  OrganizationDocument,
} from '../schemas/organizations.schema';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizations: Model<OrganizationDocument>,
    @InjectModel(BusinessUnit.name)
    private readonly businessUnits: Model<BusinessUnitDocument>,
    @InjectModel(Branch.name)
    private readonly branches: Model<BranchDocument>,
    @InjectModel(Department.name)
    private readonly departments: Model<DepartmentDocument>,
    @InjectModel(Team.name)
    private readonly teams: Model<TeamDocument>,
    @InjectModel(Campus.name)
    private readonly campuses: Model<CampusDocument>,
    @InjectModel(OrganizationBranding.name)
    private readonly branding: Model<OrganizationBrandingDocument>,
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

  async createOrganization(dto: CreateOrganizationDto) {
    const organization = await this.organizations.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      {
        code: dto.code.toUpperCase(),
        name: dto.name,
        primaryDomain: dto.primaryDomain,
        type: dto.type,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const branch = await this.createBranch({
      city: dto.branchCity,
      code: dto.branchCode,
      name: dto.branchName,
      state: dto.branchState,
      organizationId: String(organization._id),
    });

    return { branch, organization };
  }

  async updateOrganization(id: string, dto: UpdateOrganizationDto) {
    const update: Record<string, unknown> = { ...dto };
    if (dto.code) update.code = dto.code.toUpperCase();
    const organization = await this.organizations.findByIdAndUpdate(
      toRequiredObjectId(id),
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!organization) {
      throwNotFound(ErrorCode.INVALID_REQUEST, { organizationId: id });
    }
    return organization;
  }

  async findActiveOrganizationByCode(code: string) {
    return this.organizations.findOne({
      code: code.toUpperCase(),
      status: 'active',
    });
  }

  async listOrganizations(query: ListOrganizationsDto = {}) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveOrganizationSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const filter: FilterQuery<OrganizationDocument> = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { primaryDomain: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.organizations
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.organizations.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async archiveOrganization(id: string) {
    const organization = await this.organizations.findByIdAndUpdate(
      toRequiredObjectId(id),
      { $set: { status: 'inactive' } },
      { new: true, runValidators: true },
    );
    if (!organization) {
      throwNotFound(ErrorCode.INVALID_REQUEST, { organizationId: id });
    }
    return organization;
  }

  async createBranch(dto: CreateBranchDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.branches.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        businessUnitId: toOptionalObjectId(dto.businessUnitId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async createBusinessUnit(dto: CreateBusinessUnitDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.businessUnits.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        code: dto.code.toUpperCase(),
        ownerId: toOptionalObjectId(dto.ownerId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listBusinessUnits(organizationId: string) {
    return this.businessUnits
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ name: 1 })
      .lean();
  }

  async listBranches(organizationId: string) {
    const organizationObjectId = toOrganizationObjectId(organizationId);
    const branches = await this.branches
      .find({ organizationId: organizationObjectId, status: 'active' })
      .sort({ name: 1 })
      .lean();

    if (branches.length > 0) {
      return branches;
    }

    const organization = await this.organizations
      .findById(organizationObjectId)
      .select('name code')
      .lean();
    if (!organization) {
      return [];
    }

    const branch = await this.branches.findOneAndUpdate(
      { organizationId: organizationObjectId, code: 'MAIN' },
      {
        code: 'MAIN',
        name: `${organization.name} Main Branch`,
        status: 'active',
        organizationId: organizationObjectId,
      },
      { new: true, setDefaultsOnInsert: true, upsert: true },
    );

    return [branch.toObject()];
  }
  async createLeadSource(dto: CreateLeadSourceDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.sources.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      { ...dto, organizationId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadSources(organizationId: string) {
    return this.sources
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ name: 1 })
      .lean();
  }

  async createLeadStage(dto: CreateLeadStageDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.stages.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      { ...dto, organizationId, code: dto.code.toUpperCase() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadStages(organizationId: string) {
    return this.stages
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.departments.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        businessUnitId: toOptionalObjectId(dto.businessUnitId),
        branchId: toOptionalObjectId(dto.branchId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listDepartments(organizationId: string) {
    return this.departments
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ name: 1 })
      .lean();
  }

  async createTeam(dto: CreateTeamDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.teams.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        code: dto.code.toUpperCase(),
        businessUnitId: toOptionalObjectId(dto.businessUnitId),
        departmentId: toOptionalObjectId(dto.departmentId),
        managerId: toOptionalObjectId(dto.managerId),
        memberIds: dto.memberIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listTeams(organizationId: string) {
    return this.teams
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ name: 1 })
      .lean();
  }

  async createCampus(dto: CreateCampusDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.campuses.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        businessUnitId: toOptionalObjectId(dto.businessUnitId),
        branchId: toOptionalObjectId(dto.branchId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listCampuses(organizationId: string) {
    return this.campuses
      .find({
        organizationId: toOrganizationObjectId(organizationId),
        status: 'active',
      })
      .sort({ name: 1 })
      .lean();
  }

  async upsertBranding(dto: UpsertOrganizationBrandingDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.branding.findOneAndUpdate(
      { organizationId },
      { ...dto, organizationId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async getBranding(organizationId: string) {
    return this.branding
      .findOneAndUpdate(
        { organizationId: toOrganizationObjectId(organizationId) },
        { organizationId: toOrganizationObjectId(organizationId) },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean();
  }

  async upsertChannelSetting(dto: UpsertChannelSettingDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.channelSettings.findOneAndUpdate(
      { organizationId, channel: dto.channel },
      { ...dto, organizationId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listChannelSettings(organizationId: string) {
    return this.channelSettings
      .find({ organizationId: toOrganizationObjectId(organizationId) })
      .sort({ channel: 1 })
      .lean();
  }

  async upsertOrganizationUser(dto: UpsertOrganizationUserDto) {
    const userId = toRequiredObjectId(dto.userId);
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const user = await this.users.exists({ _id: userId });
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    return this.memberships.findOneAndUpdate(
      { userId, organizationId, role: dto.role },
      {
        ...dto,
        userId,
        organizationId,
        businessUnitIds:
          dto.businessUnitIds?.map((id) => toRequiredObjectId(id)) ?? [],
        campusIds: dto.campusIds?.map((id) => toRequiredObjectId(id)) ?? [],
        branchIds: dto.branchIds?.map((id) => toRequiredObjectId(id)) ?? [],
        departmentIds:
          dto.departmentIds?.map((id) => toRequiredObjectId(id)) ?? [],
        teamIds: dto.teamIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listOrganizationUsers(query: ListOrganizationUsersDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveOrganizationUserSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const filter: FilterQuery<UserMembershipDocument> = {
      organizationId: toOrganizationObjectId(query.organizationId),
      ...(query.branchId
        ? { branchIds: toRequiredObjectId(query.branchId) }
        : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      this.memberships
        .find(filter)
        .populate('userId', 'email phone status roles permissions lastLoginAt')
        .populate('businessUnitIds', 'name code category status')
        .populate('campusIds', 'name code branchId address status')
        .populate('branchIds', 'name code city state status')
        .populate('departmentIds', 'name code branchId function status')
        .populate('teamIds', 'name code departmentId status')
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.memberships.countDocuments(filter),
    ]);
    const search = query.search?.trim().toLowerCase();
    const filteredItems = search
      ? items.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(search),
        )
      : items;
    return {
      items: filteredItems,
      pagination: {
        limit,
        page,
        total: search ? filteredItems.length : total,
        totalPages: Math.max(
          1,
          Math.ceil((search ? filteredItems.length : total) / limit),
        ),
      },
      sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
    };
  }

  async updateOrganizationUserStatus(
    organizationId: string,
    userId: string,
    status: string,
  ) {
    const membership = await this.memberships.findOneAndUpdate(
      {
        organizationId: toOrganizationObjectId(organizationId),
        userId: toRequiredObjectId(userId),
      },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!membership) return throwNotFound(ErrorCode.USER_NOT_FOUND);
    return membership;
  }

  async createOrganizationUser(
    dto: CreateOrganizationUserDto,
    actorId?: string,
  ) {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.users.findOne({ email: normalizedEmail });
    if (existingUser) return throwConflict(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);

    const organizationId = toOrganizationObjectId(dto.organizationId);
    const organization = await this.organizations.exists({
      _id: organizationId,
      status: 'active',
    });
    if (!organization) return throwNotFound(ErrorCode.INVALID_REQUEST);

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

    const membership = await this.upsertOrganizationUser({
      businessUnitIds: dto.businessUnitIds,
      campusIds: dto.campusIds,
      branchIds: dto.branchIds,
      departmentIds: dto.departmentIds,
      teamIds: dto.teamIds,
      permissions: dto.permissions,
      role: dto.role,
      settings: dto.settings,
      status: dto.status,
      organizationId: dto.organizationId,
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

  async getIdentityHierarchy(organizationId: string) {
    const [
      organization,
      businessUnits,
      campuses,
      branches,
      departments,
      teams,
      users,
    ] = await Promise.all([
      this.organizations
        .findById(toOrganizationObjectId(organizationId))
        .lean(),
      this.listBusinessUnits(organizationId),
      this.listCampuses(organizationId),
      this.listBranches(organizationId),
      this.listDepartments(organizationId),
      this.listTeams(organizationId),
      this.listOrganizationUsers({ organizationId, limit: '100' }),
    ]);

    return {
      organization,
      businessUnits,
      campuses,
      branches,
      departments,
      teams,
      users: users.items,
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

  private resolveOrganizationSortBy(value?: string) {
    const allowed = new Set([
      'code',
      'createdAt',
      'name',
      'status',
      'type',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'name';
  }

  private resolveOrganizationUserSortBy(value?: string) {
    const allowed = new Set(['createdAt', 'role', 'status', 'updatedAt']);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
