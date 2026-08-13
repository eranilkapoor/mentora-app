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
  BulkMarkStudentAttendanceDto,
  CreateStudentAttendanceDto,
  UpdateStudentAttendanceDto,
} from '../dto/student-attendance.dto';
import {
  StudentAttendance,
  StudentAttendanceDocument,
} from '../schemas/student-attendance.schema';

type StudentAttendanceListOptions = {
  organizationId: string;
  studentId?: string;
  subjectId?: string;
  branchId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
};

const STUDENT_ATTENDANCE_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'markedBy',
  organizationField: 'organizationId',
  branchField: 'branchId',
};

@Injectable()
export class StudentAttendanceService {
  constructor(
    @InjectModel(StudentAttendance.name)
    private readonly attendance: Model<StudentAttendanceDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async create(userId: string, dto: CreateStudentAttendanceDto) {
    return this.attendance.create({
      organizationId: toOrganizationObjectId(dto.organizationId),
      studentId: toRequiredObjectId(dto.studentId),
      branchId: toOptionalObjectId(dto.branchId),
      subjectId: toOptionalObjectId(dto.subjectId),
      timetableId: toOptionalObjectId(dto.timetableId),
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

  async bulkMark(userId: string, dto: BulkMarkStudentAttendanceDto) {
    const date = new Date(dto.date);
    const markedBy = toRequiredObjectId(userId);
    const markedAt = new Date();
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const branchId = toOptionalObjectId(dto.branchId);
    const subjectId = toOptionalObjectId(dto.subjectId);
    const timetableId = toOptionalObjectId(dto.timetableId);

    const operations = dto.entries.map((entry) => ({
      updateOne: {
        filter: {
          organizationId,
          studentId: toRequiredObjectId(entry.studentId),
          date,
          ...(timetableId ? { timetableId } : { subjectId: subjectId ?? null }),
        },
        update: {
          $set: {
            organizationId,
            studentId: toRequiredObjectId(entry.studentId),
            branchId,
            subjectId,
            timetableId,
            date,
            status: entry.status,
            method: dto.method ?? 'manual',
            remarks: entry.remarks,
            markedBy,
            markedAt,
          },
        },
        upsert: true,
      },
    }));

    const result = await this.attendance.bulkWrite(operations);
    return {
      matched: result.matchedCount,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
      total: dto.entries.length,
    };
  }

  async list(options: StudentAttendanceListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 20), 200);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: FilterQuery<StudentAttendanceDocument> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.studentId
        ? { studentId: toRequiredObjectId(options.studentId) }
        : {}),
      ...(options.subjectId
        ? { subjectId: toRequiredObjectId(options.subjectId) }
        : {}),
      ...(options.branchId
        ? { branchId: toRequiredObjectId(options.branchId) }
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
    const headers = ['id', 'studentId', 'date', 'status', 'method'];
    return buildCsvExportFile(
      'student-attendance',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async getSummary(
    organizationId: string,
    studentId: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const match: FilterQuery<StudentAttendanceDocument> = {
      organizationId: toOrganizationObjectId(organizationId),
      studentId: toRequiredObjectId(studentId),
    };
    if (dateFrom || dateTo) {
      match.date = {
        ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { $lte: new Date(dateTo) } : {}),
      };
    }
    const rows = await this.attendance.aggregate<{
      _id: string;
      count: number;
    }>([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);

    const byStatus = Object.fromEntries(
      rows.map((row) => [row._id, row.count]),
    );
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    const present = (byStatus.present ?? 0) + (byStatus.late ?? 0);
    const percentage =
      total > 0 ? Math.round((present / total) * 10000) / 100 : 0;
    return { byStatus, total, presentCount: present, percentage };
  }

  async update(
    attendanceId: string,
    dto: UpdateStudentAttendanceDto,
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
    filter: FilterQuery<StudentAttendanceDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<StudentAttendanceDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<StudentAttendanceDocument>(
      scope,
      STUDENT_ATTENDANCE_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
