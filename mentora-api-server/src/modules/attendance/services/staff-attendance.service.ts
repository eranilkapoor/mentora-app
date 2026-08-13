import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  toOptionalObjectId,
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import {
  CreateStaffAttendanceDto,
  UpdateStaffAttendanceDto,
} from '../dto/staff-attendance.dto';
import {
  StaffAttendance,
  StaffAttendanceDocument,
} from '../schemas/staff-attendance.schema';

type StaffAttendanceListOptions = {
  organizationId: string;
  userId?: string;
  branchId?: string;
  departmentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
};

const STAFF_ATTENDANCE_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'markedBy',
  organizationField: 'organizationId',
  branchField: 'branchId',
  departmentField: 'departmentId',
};

@Injectable()
export class StaffAttendanceService {
  constructor(
    @InjectModel(StaffAttendance.name)
    private readonly attendance: Model<StaffAttendanceDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async create(userId: string, dto: CreateStaffAttendanceDto) {
    return this.attendance.create({
      organizationId: toOrganizationObjectId(dto.organizationId),
      userId: toRequiredObjectId(dto.userId),
      branchId: toOptionalObjectId(dto.branchId),
      departmentId: toOptionalObjectId(dto.departmentId),
      date: new Date(dto.date),
      status: dto.status,
      method: dto.method ?? 'manual',
      remarks: dto.remarks,
      checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : undefined,
      checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : undefined,
      markedBy: toRequiredObjectId(userId),
      markedAt: new Date(),
    });
  }

  async list(options: StaffAttendanceListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 20), 200);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: FilterQuery<StaffAttendanceDocument> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.userId ? { userId: toRequiredObjectId(options.userId) } : {}),
      ...(options.branchId
        ? { branchId: toRequiredObjectId(options.branchId) }
        : {}),
      ...(options.departmentId
        ? { departmentId: toRequiredObjectId(options.departmentId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    if (options.dateFrom || options.dateTo) {
      filter.date = {
        ...(options.dateFrom ? { $gte: new Date(options.dateFrom) } : {}),
        ...(options.dateTo ? { $lte: new Date(options.dateTo) } : {}),
      };
    }

    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.attendance
        .find(scopedFilter)
        .sort({ date: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.attendance.countDocuments(scopedFilter),
    ]);
    return {
      items,
      pagination: {
        limit,
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async exportRecords(organizationId: string) {
    const { items } = await this.list({ organizationId, limit: '5000' });
    const headers = ['id', 'userId', 'date', 'status', 'method'];
    return buildCsvExportFile(
      'staff-attendance',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async update(
    attendanceId: string,
    dto: UpdateStaffAttendanceDto,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(attendanceId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const record = await this.attendance.findOneAndUpdate(
      filter,
      {
        $set: {
          ...(dto.status ? { status: dto.status } : {}),
          ...(dto.remarks !== undefined ? { remarks: dto.remarks } : {}),
          ...(dto.checkInTime
            ? { checkInTime: new Date(dto.checkInTime) }
            : {}),
          ...(dto.checkOutTime
            ? { checkOutTime: new Date(dto.checkOutTime) }
            : {}),
        },
      },
      { new: true, runValidators: true },
    );
    if (!record) throw new NotFoundException('Attendance record not found');
    return record;
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<StaffAttendanceDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<StaffAttendanceDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<StaffAttendanceDocument>(
      scope,
      STAFF_ATTENDANCE_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
