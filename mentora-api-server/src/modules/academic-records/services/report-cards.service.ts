import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  toOptionalObjectId,
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import { LearningService } from '@/modules/learning/services/learning.service';
import { ExamsService } from '@/modules/exams/services/exams.service';
import { StudentAttendanceService } from '@/modules/attendance/services/student-attendance.service';
import {
  CreateReportCardDto,
  GenerateReportCardDto,
  ReportCardSubjectEntryDto,
  UpdateReportCardDto,
} from '../dto/report-card.dto';
import { ReportCard, ReportCardDocument } from '../schemas/report-card.schema';

type ReportCardListOptions = {
  organizationId: string;
  studentId?: string;
  gradeId?: string;
  term?: string;
  status?: string;
  page?: string;
  limit?: string;
};

const REPORT_CARD_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'generatedBy',
  organizationField: 'organizationId',
  branchField: 'branchId',
};

@Injectable()
export class ReportCardsService {
  constructor(
    @InjectModel(ReportCard.name)
    private readonly reportCards: Model<ReportCardDocument>,
    private readonly actorScope: ActorScopeService,
    private readonly learningService: LearningService,
    private readonly examsService: ExamsService,
    private readonly studentAttendanceService: StudentAttendanceService,
  ) {}

  async create(userId: string, dto: CreateReportCardDto) {
    const totals = this.computeTotals(dto.subjects);
    return this.reportCards.create({
      organizationId: toOrganizationObjectId(dto.organizationId),
      studentId: toRequiredObjectId(dto.studentId),
      branchId: toOptionalObjectId(dto.branchId),
      academicSessionId: toOptionalObjectId(dto.academicSessionId),
      gradeId: toOptionalObjectId(dto.gradeId),
      term: dto.term,
      subjects: dto.subjects.map((entry) => this.toSubjectEntry(entry)),
      ...totals,
      attendancePercentage: dto.attendancePercentage,
      overallGrade: dto.overallGrade,
      teacherRemarks: dto.teacherRemarks,
      principalRemarks: dto.principalRemarks,
      generatedBy: toRequiredObjectId(userId),
    });
  }

  /**
   * Auto-builds a report card from published exam results for the given
   * academic session, plus the student's attendance percentage over the
   * supplied date window. Falls back to an empty subject list if no exam
   * results have been published yet — the caller can still edit/add
   * subjects afterwards via update().
   */
  async generate(userId: string, dto: GenerateReportCardDto) {
    const [examResults, subjects, attendance] = await Promise.all([
      this.examsService.listResultsForStudent(
        dto.organizationId,
        dto.studentId,
        dto.academicSessionId,
      ),
      this.learningService.listSubjects(),
      this.studentAttendanceService.getSummary(
        dto.organizationId,
        dto.studentId,
        dto.attendanceDateFrom,
        dto.attendanceDateTo,
      ),
    ]);

    const subjectNames = new Map<string, string>(
      subjects.map((subject) => [subject._id.toString(), subject.name]),
    );

    const bySubject = new Map<
      string,
      { marksObtained: number; maxMarks: number }
    >();
    for (const result of examResults) {
      const key = result.subjectId.toString();
      const existing = bySubject.get(key) ?? { marksObtained: 0, maxMarks: 0 };
      bySubject.set(key, {
        marksObtained: existing.marksObtained + result.marksObtained,
        maxMarks: existing.maxMarks + result.maxMarks,
      });
    }

    const subjectEntries: ReportCardSubjectEntryDto[] = Array.from(
      bySubject.entries(),
    ).map(([subjectId, totals]) => ({
      subjectId,
      subjectName: subjectNames.get(subjectId) ?? 'Unknown Subject',
      marksObtained: totals.marksObtained,
      maxMarks: totals.maxMarks,
    }));

    const totals = this.computeTotals(subjectEntries);
    return this.reportCards.create({
      organizationId: toOrganizationObjectId(dto.organizationId),
      studentId: toRequiredObjectId(dto.studentId),
      branchId: toOptionalObjectId(dto.branchId),
      academicSessionId: toOptionalObjectId(dto.academicSessionId),
      gradeId: toOptionalObjectId(dto.gradeId),
      term: dto.term,
      subjects: subjectEntries.map((entry) => this.toSubjectEntry(entry)),
      ...totals,
      attendancePercentage: attendance.percentage,
      teacherRemarks: dto.teacherRemarks,
      generatedBy: toRequiredObjectId(userId),
    });
  }

  async list(options: ReportCardListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 20), 200);
    const filter: FilterQuery<ReportCardDocument> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.studentId
        ? { studentId: toRequiredObjectId(options.studentId) }
        : {}),
      ...(options.gradeId
        ? { gradeId: toRequiredObjectId(options.gradeId) }
        : {}),
      ...(options.term ? { term: options.term } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.reportCards
        .find(scopedFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reportCards.countDocuments(scopedFilter),
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

  async getById(
    reportCardId: string,
    organizationId: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(reportCardId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const record = await this.reportCards.findOne(filter).lean();
    if (!record) throw new NotFoundException('Report card not found');
    return record;
  }

  async update(
    reportCardId: string,
    dto: UpdateReportCardDto,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(reportCardId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const record = await this.reportCards.findOne(filter);
    if (!record) throw new NotFoundException('Report card not found');

    if (dto.subjects) {
      record.subjects = dto.subjects.map((entry) => this.toSubjectEntry(entry));
      const totals = this.computeTotals(dto.subjects);
      record.totalMarksObtained = totals.totalMarksObtained;
      record.totalMaxMarks = totals.totalMaxMarks;
      record.percentage = totals.percentage;
    }
    if (dto.overallGrade !== undefined) record.overallGrade = dto.overallGrade;
    if (dto.teacherRemarks !== undefined)
      record.teacherRemarks = dto.teacherRemarks;
    if (dto.principalRemarks !== undefined)
      record.principalRemarks = dto.principalRemarks;
    if (dto.rank !== undefined) record.rank = dto.rank;
    if (dto.status) {
      record.status = dto.status;
      if (dto.status === 'published' && !record.publishedAt) {
        record.publishedAt = new Date();
      }
    }
    return record.save();
  }

  private computeTotals(subjects: ReportCardSubjectEntryDto[]) {
    const totalMarksObtained = subjects.reduce(
      (sum, entry) => sum + (entry.marksObtained ?? 0),
      0,
    );
    const totalMaxMarks = subjects.reduce(
      (sum, entry) => sum + (entry.maxMarks ?? 100),
      0,
    );
    const percentage =
      totalMaxMarks > 0
        ? Math.round((totalMarksObtained / totalMaxMarks) * 10000) / 100
        : 0;
    return { totalMarksObtained, totalMaxMarks, percentage };
  }

  private toSubjectEntry(entry: ReportCardSubjectEntryDto) {
    return {
      subjectId: toRequiredObjectId(entry.subjectId),
      subjectName: entry.subjectName,
      marksObtained: entry.marksObtained ?? 0,
      maxMarks: entry.maxMarks ?? 100,
      grade: entry.grade,
      remarks: entry.remarks,
    };
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<ReportCardDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<ReportCardDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<ReportCardDocument>(
      scope,
      REPORT_CARD_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
