import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { FilterQuery, Model } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { Permission, Status } from '@/common/enums';
import {
  throwBadRequest,
  throwConflict,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import {
  isPlatformRole,
  resolveSystemRoleForOrgRole,
} from '@/common/rbac/role-catalog';
import { resolveOrgRolePermissions } from '@/common/rbac/org-role-permissions';
import {
  toOptionalObjectId,
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { JwtUser } from '@/modules/auth/interfaces/jwt-user.interface';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { Lead, LeadDocument } from '@/modules/leads/schemas/leads.schema';
import {
  UserMembership,
  UserMembershipDocument,
} from '@/modules/contexts/schemas/contexts.schema';
import {
  CreateBranchDto,
  CreateDepartmentDto,
  CreateLeadSourceDto,
  CreateLeadStageDto,
  CreateTeamDto,
  CreateOrganizationUserDto,
  CreateOrganizationDto,
  ListOrganizationStructureDto,
  ListOrganizationsDto,
  ListOrganizationUsersDto,
  UpdateBranchDto,
  UpdateDepartmentDto,
  UpdateOrganizationDto,
  UpdateTeamDto,
  UpsertChannelSettingDto,
  UpsertOrganizationBrandingDto,
  UpsertOrganizationUserDto,
} from '../dto/organizations.dto';
import { Branch, BranchDocument } from '../schemas/branch.schema';
import {
  ChannelSetting,
  ChannelSettingDocument,
} from '../schemas/channel-setting.schema';
import { Department, DepartmentDocument } from '../schemas/department.schema';
import {
  OrganizationBranding,
  OrganizationBrandingDocument,
} from '../schemas/organization-branding.schema';
import { Team, TeamDocument } from '../schemas/team.schema';
import {
  Organization,
  OrganizationDocument,
} from '../schemas/organization.schema';
import {
  LeadSource,
  LeadSourceDocument,
  LeadStage,
  LeadStageDocument,
} from '@/common/crm/schemas/crm-taxonomy.schema';
import { OrganizationFieldPolicyService } from './organization-field-policy.service';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizations: Model<OrganizationDocument>,
    @InjectModel(Branch.name)
    private readonly branches: Model<BranchDocument>,
    @InjectModel(Department.name)
    private readonly departments: Model<DepartmentDocument>,
    @InjectModel(Team.name)
    private readonly teams: Model<TeamDocument>,
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
    @InjectModel(Lead.name)
    private readonly leads: Model<LeadDocument>,
    @InjectModel(UserMembership.name)
    private readonly memberships: Model<UserMembershipDocument>,
    private readonly fieldPolicy: OrganizationFieldPolicyService,
  ) {}

  async createOrganization(dto: CreateOrganizationDto) {
    const organization = await this.organizations.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      {
        ...this.toOrganizationUpdate(dto),
        code: dto.code.toUpperCase(),
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

  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto,
    actor?: JwtUser,
  ) {
    this.fieldPolicy.assertCanUpdateOrganization(actor, { ...dto });
    const update = this.toOrganizationUpdate(dto);
    if (dto.code) update.code = dto.code.toUpperCase();
    if (actor?.sub) update.updatedBy = toRequiredObjectId(actor.sub);
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

  async listOrganizations(query: ListOrganizationsDto = {}): Promise<unknown> {
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
    const organizationIds = items.map((item) => item._id);
    const [userCounts, leadCounts] = await Promise.all([
      this.memberships.aggregate<{ _id: unknown; count: number }>([
        { $match: { organizationId: { $in: organizationIds } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
      this.leads.aggregate<{ _id: unknown; count: number }>([
        { $match: { organizationId: { $in: organizationIds } } },
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
    ]);
    const userCountMap = new Map(
      userCounts.map((item) => [String(item._id), item.count]),
    );
    const leadCountMap = new Map(
      leadCounts.map((item) => [String(item._id), item.count]),
    );
    return {
      items: items.map((item) => ({
        ...item,
        leadUsage: leadCountMap.get(String(item._id)) ?? 0,
        storageUsage: this.getStorageUsage(item),
        subscriptionStatus:
          item.subscription?.status ?? item.status ?? 'active',
        userCount: userCountMap.get(String(item._id)) ?? 0,
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

  async exportOrganizations() {
    const { items } = (await this.listOrganizations({})) as {
      items: Array<Record<string, unknown>>;
    };
    const headers = ['id', 'name', 'code', 'type', 'status', 'userCount'];
    return buildCsvExportFile(
      'organizations',
      headers,
      items.map((item) => withStringId(item)),
    );
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
        code: dto.code.toUpperCase(),
        managerId: toOptionalObjectId(dto.managerId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateBranch(id: string, dto: UpdateBranchDto, actor?: JwtUser) {
    const update = this.toBranchUpdate(dto);
    if (actor?.sub) update.updatedBy = toRequiredObjectId(actor.sub);
    const branch = await this.branches.findOneAndUpdate(
      {
        _id: toRequiredObjectId(id),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!branch) {
      throwNotFound(ErrorCode.INVALID_REQUEST, { branchId: id });
    }
    return branch;
  }

  async listBranches(query: ListOrganizationStructureDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveStructureSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const filter: FilterQuery<BranchDocument> = {
      organizationId: toOrganizationObjectId(query.organizationId),
      status: query.status ?? 'active',
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.branches
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.branches.countDocuments(filter),
    ]);
    return this.toPaginatedResult(items, total, page, limit, sortBy, sortOrder);
  }

  async exportBranches(organizationId: string) {
    const { items } = await this.listBranches({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'code', 'city', 'state', 'status'];
    return buildCsvExportFile(
      'branches',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async updateBranchStatus(id: string, organizationId: string, status: string) {
    return this.branches
      .findOneAndUpdate(
        {
          _id: toRequiredObjectId(id),
          organizationId: toOrganizationObjectId(organizationId),
        },
        { status },
        { new: true },
      )
      .lean();
  }
  async createLeadSource(dto: CreateLeadSourceDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.sources.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        code: dto.code.toUpperCase(),
        parentSourceId: toOptionalObjectId(dto.parentSourceId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadSources(organizationId: string): Promise<unknown> {
    const sources = await this.sources
      .find({
        organizationId: toOrganizationObjectId(organizationId),
      })
      .sort({ name: 1 })
      .lean();
    const sourceIds = sources.map((source) => source._id);
    const counts = await this.leads.aggregate<{
      _id: unknown;
      active: number;
      converted: number;
      total: number;
    }>([
      {
        $match: {
          organizationId: toOrganizationObjectId(organizationId),
          sourceId: { $in: sourceIds },
        },
      },
      {
        $group: {
          _id: '$sourceId',
          active: {
            $sum: {
              $cond: [{ $in: ['$status', ['new', 'open']] }, 1, 0],
            },
          },
          converted: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));
    return sources.map((source) => {
      const count = countMap.get(String(source._id));
      const total = count?.total ?? 0;
      return {
        ...source,
        activeLeads: count?.active ?? 0,
        conversionRate:
          total > 0 ? Math.round(((count?.converted ?? 0) / total) * 100) : 0,
      };
    });
  }

  async exportLeadSources(organizationId: string) {
    const sources = (await this.listLeadSources(organizationId)) as Array<
      Record<string, unknown>
    >;
    const headers = ['id', 'name', 'code', 'category', 'activeLeads'];
    return buildCsvExportFile(
      'lead-sources',
      headers,
      sources.map((item) => withStringId(item)),
    );
  }

  async createLeadStage(dto: CreateLeadStageDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.stages.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        allowedNextStageIds:
          dto.allowedNextStageIds?.map((id) => toRequiredObjectId(id)) ?? [],
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listLeadStages(organizationId: string): Promise<unknown> {
    const stages = await this.stages
      .find({
        organizationId: toOrganizationObjectId(organizationId),
      })
      .sort({ order: 1, name: 1 })
      .lean();
    const stageIds = stages.map((stage) => stage._id);
    const counts = await this.leads.aggregate<{ _id: unknown; count: number }>([
      {
        $match: {
          organizationId: toOrganizationObjectId(organizationId),
          stageId: { $in: stageIds },
          status: { $in: ['new', 'open'] },
        },
      },
      { $group: { _id: '$stageId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((item) => [String(item._id), item.count]),
    );
    return stages.map((stage) => ({
      ...stage,
      activeLeadCount: countMap.get(String(stage._id)) ?? 0,
      conversionStage: stage.isConverted,
      lostStage: stage.isLost,
      sla: `${stage.slaDurationHours ?? 24}h`,
    }));
  }

  async exportLeadStages(organizationId: string) {
    const stages = (await this.listLeadStages(organizationId)) as Array<
      Record<string, unknown>
    >;
    const headers = ['id', 'name', 'code', 'order', 'activeLeadCount'];
    return buildCsvExportFile(
      'lead-stages',
      headers,
      stages.map((item) => withStringId(item)),
    );
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.departments.findOneAndUpdate(
      { organizationId, code: dto.code.toUpperCase() },
      {
        ...dto,
        organizationId,
        branchId: toOptionalObjectId(dto.branchId),
        headId: toOptionalObjectId(dto.headId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
    actor?: JwtUser,
  ) {
    const update = this.toDepartmentUpdate(dto);
    if (actor?.sub) update.updatedBy = toRequiredObjectId(actor.sub);
    const department = await this.departments.findOneAndUpdate(
      {
        _id: toRequiredObjectId(id),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!department) {
      throwNotFound(ErrorCode.INVALID_REQUEST, { departmentId: id });
    }
    return department;
  }

  async listDepartments(query: ListOrganizationStructureDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveStructureSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const filter: FilterQuery<DepartmentDocument> = {
      organizationId: toOrganizationObjectId(query.organizationId),
      ...(query.branchId
        ? { branchId: toRequiredObjectId(query.branchId) }
        : {}),
      status: query.status ?? 'active',
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { function: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.departments
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.departments.countDocuments(filter),
    ]);
    return this.toPaginatedResult(items, total, page, limit, sortBy, sortOrder);
  }

  async exportDepartments(organizationId: string) {
    const { items } = await this.listDepartments({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'code', 'function', 'status'];
    return buildCsvExportFile(
      'departments',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async updateDepartmentStatus(
    id: string,
    organizationId: string,
    status: string,
  ) {
    return this.departments
      .findOneAndUpdate(
        {
          _id: toRequiredObjectId(id),
          organizationId: toOrganizationObjectId(organizationId),
        },
        { status },
        { new: true },
      )
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
        branchId: toOptionalObjectId(dto.branchId),
        departmentId: toOptionalObjectId(dto.departmentId),
        managerId: toOptionalObjectId(dto.managerId),
        memberIds: dto.memberIds?.map((id) => toRequiredObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateTeam(id: string, dto: UpdateTeamDto, actor?: JwtUser) {
    const update = this.toTeamUpdate(dto);
    if (actor?.sub) update.updatedBy = toRequiredObjectId(actor.sub);
    const team = await this.teams.findOneAndUpdate(
      {
        _id: toRequiredObjectId(id),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!team) {
      throwNotFound(ErrorCode.INVALID_REQUEST, { teamId: id });
    }
    return team;
  }

  async listTeams(query: ListOrganizationStructureDto) {
    const page = this.toPositiveInt(query.page, 1);
    const limit = Math.min(this.toPositiveInt(query.limit, 10), 100);
    const sortBy = this.resolveStructureSortBy(query.sortBy);
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const filter: FilterQuery<TeamDocument> = {
      organizationId: toOrganizationObjectId(query.organizationId),
      ...(query.departmentId
        ? { departmentId: toRequiredObjectId(query.departmentId) }
        : {}),
      status: query.status ?? 'active',
    };
    const search = query.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.teams
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.teams.countDocuments(filter),
    ]);
    return this.toPaginatedResult(items, total, page, limit, sortBy, sortOrder);
  }

  async exportTeams(organizationId: string) {
    const { items } = await this.listTeams({
      organizationId,
      limit: '1000',
    });
    const headers = ['id', 'name', 'code', 'status'];
    return buildCsvExportFile(
      'teams',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async updateTeamStatus(id: string, organizationId: string, status: string) {
    return this.teams
      .findOneAndUpdate(
        {
          _id: toRequiredObjectId(id),
          organizationId: toOrganizationObjectId(organizationId),
        },
        { status },
        { new: true },
      )
      .lean();
  }

  async upsertBranding(dto: UpsertOrganizationBrandingDto, actor?: JwtUser) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    return this.branding.findOneAndUpdate(
      { organizationId },
      {
        ...dto,
        organizationId,
        updatedBy: actor?.sub ? toRequiredObjectId(actor.sub) : undefined,
      },
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

  async upsertChannelSetting(dto: UpsertChannelSettingDto, actor?: JwtUser) {
    this.fieldPolicy.assertCanUpdateChannelSetting(actor, { ...dto });
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const branchId = toOptionalObjectId(dto.branchId);
    return this.channelSettings.findOneAndUpdate(
      { organizationId, branchId, channel: dto.channel },
      {
        ...dto,
        branchId,
        organizationId,
        updatedBy: actor?.sub ? toRequiredObjectId(actor.sub) : undefined,
      },
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
    const search = query.search?.trim().toLowerCase();

    // Search matches against populated fields (e.g. the user's email),
    // which Mongo cannot filter on before population. Fetching the whole
    // matching set (capped) and paginating in memory keeps `total` correct
    // and lets search reach beyond the first page, instead of only
    // filtering whatever page skip/limit happened to fetch.
    if (search) {
      const allItems = await this.memberships
        .find(filter)
        .populate('userId', 'email phone status roles permissions lastLoginAt')
        .populate('branchIds', 'name code city state status')
        .populate('departmentIds', 'name code branchId function status')
        .populate('teamIds', 'name code departmentId status')
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .limit(1000)
        .lean();
      const filteredItems = allItems.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(search),
      );
      const total = filteredItems.length;
      const pageItems = filteredItems.slice(
        (page - 1) * limit,
        (page - 1) * limit + limit,
      );
      return {
        items: pageItems,
        pagination: {
          limit,
          page,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        sort: { sortBy, sortOrder: sortOrder === 1 ? 'asc' : 'desc' },
      };
    }

    const [items, total] = await Promise.all([
      this.memberships
        .find(filter)
        .populate('userId', 'email phone status roles permissions lastLoginAt')
        .populate('branchIds', 'name code city state status')
        .populate('departmentIds', 'name code branchId function status')
        .populate('teamIds', 'name code departmentId status')
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.memberships.countDocuments(filter),
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

    if (dto.phone) {
      const existingPhone = await this.users.findOne({
        'phone.phone': dto.phone,
      });
      if (existingPhone) {
        return throwConflict(ErrorCode.AUTH_PHONE_ALREADY_EXISTS);
      }
    }

    const organizationId = toOrganizationObjectId(dto.organizationId);
    const organization = await this.organizations.exists({
      _id: organizationId,
      status: 'active',
    });
    if (!organization) return throwNotFound(ErrorCode.INVALID_REQUEST);

    const assignment = this.resolveOrgRoleAssignment(dto.role);
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
      permissions: [
        ...new Set([
          ...assignment.permissions,
          ...((dto.permissions ?? []) as Permission[]),
        ]),
      ],
      phone: dto.phone
        ? {
            countryCode: dto.countryCode ?? '+91',
            phone: dto.phone,
          }
        : undefined,
      roles: assignment.roles,
      status: dto.status ?? Status.ACTIVE,
      updatedBy: actorId,
    });

    const membership = await this.upsertOrganizationUser({
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
    const [organization, branches, departments, teams, users] =
      await Promise.all([
        this.organizations
          .findById(toOrganizationObjectId(organizationId))
          .lean(),
        this.listBranches({ organizationId, limit: '100' }),
        this.listDepartments({ organizationId, limit: '100' }),
        this.listTeams({ organizationId, limit: '100' }),
        this.listOrganizationUsers({ organizationId, limit: '100' }),
      ]);

    return {
      organization,
      branches: branches.items,
      departments: departments.items,
      teams: teams.items,
      users: users.items,
    };
  }

  private resolveOrgRoleAssignment(role: string): {
    roles: ReturnType<typeof resolveSystemRoleForOrgRole>[];
    permissions: Permission[];
  } {
    if (isPlatformRole(role)) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'platform_role_not_assignable_via_organization_membership',
        role,
      });
    }
    return {
      roles: [resolveSystemRoleForOrgRole(role)],
      permissions: resolveOrgRolePermissions(role),
    };
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

  private toOrganizationUpdate(
    dto: Partial<CreateOrganizationDto & UpdateOrganizationDto>,
  ): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    const directFields: Array<
      keyof (CreateOrganizationDto & UpdateOrganizationDto)
    > = [
      'academicYear',
      'currency',
      'customDomain',
      'dateFormat',
      'financialYear',
      'legalName',
      'locale',
      'logoUrl',
      'name',
      'primaryDomain',
      'primaryEmail',
      'primaryPhone',
      'registrationNumber',
      'status',
      'subdomain',
      'taxNumber',
      'timezone',
      'type',
      'website',
    ];
    directFields.forEach((field) => {
      if (dto[field] !== undefined) update[field] = dto[field];
    });
    if (dto.address) update.address = dto.address;
    if (dto.subscription) update.subscription = dto.subscription;
    return update;
  }

  private toBranchUpdate(dto: UpdateBranchDto): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    const directFields: Array<keyof UpdateBranchDto> = [
      'addressLine1',
      'addressLine2',
      'city',
      'country',
      'email',
      'name',
      'phone',
      'postalCode',
      'settings',
      'state',
      'status',
      'timezone',
    ];
    directFields.forEach((field) => {
      if (dto[field] !== undefined) update[field] = dto[field];
    });
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.managerId !== undefined) {
      update.managerId = toOptionalObjectId(dto.managerId);
    }
    if (dto.status === 'archived') update.archivedAt = new Date();
    return update;
  }

  private toDepartmentUpdate(
    dto: UpdateDepartmentDto,
  ): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    const directFields: Array<keyof UpdateDepartmentDto> = [
      'description',
      'email',
      'function',
      'name',
      'phone',
      'settings',
      'status',
    ];
    directFields.forEach((field) => {
      if (dto[field] !== undefined) update[field] = dto[field];
    });
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.branchId !== undefined) {
      update.branchId = toOptionalObjectId(dto.branchId);
    }
    if (dto.headId !== undefined)
      update.headId = toOptionalObjectId(dto.headId);
    if (dto.status === 'archived') update.archivedAt = new Date();
    return update;
  }

  private toTeamUpdate(dto: UpdateTeamDto): Record<string, unknown> {
    const update: Record<string, unknown> = {};
    const directFields: Array<keyof UpdateTeamDto> = [
      'assignmentRules',
      'capacityRules',
      'description',
      'name',
      'status',
      'workingHours',
    ];
    directFields.forEach((field) => {
      if (dto[field] !== undefined) update[field] = dto[field];
    });
    if (dto.code) update.code = dto.code.toUpperCase();
    if (dto.branchId !== undefined) {
      update.branchId = toOptionalObjectId(dto.branchId);
    }
    if (dto.departmentId !== undefined) {
      update.departmentId = toOptionalObjectId(dto.departmentId);
    }
    if (dto.managerId !== undefined) {
      update.managerId = toOptionalObjectId(dto.managerId);
    }
    if (dto.memberIds) {
      update.memberIds = dto.memberIds.map((id) => toRequiredObjectId(id));
    }
    if (dto.status === 'archived') update.archivedAt = new Date();
    return update;
  }

  private getStorageUsage(organization: {
    settings?: Record<string, unknown>;
  }): number {
    const usage = organization.settings?.storageUsageGb;
    return typeof usage === 'number' ? usage : 0;
  }

  private resolveOrganizationUserSortBy(value?: string) {
    const allowed = new Set(['createdAt', 'role', 'status', 'updatedAt']);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private resolveStructureSortBy(value?: string) {
    const allowed = new Set([
      'code',
      'createdAt',
      'name',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'name';
  }

  private toPaginatedResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 1 | -1,
  ) {
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

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
