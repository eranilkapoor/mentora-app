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
  CreateExamDto,
  RecordExamResultsDto,
  UpdateExamDto,
} from '../dto/exam.dto';
import { Exam, ExamDocument, ExamResultEntry } from '../schemas/exam.schema';

type ExamListOptions = {
  organizationId: string;
  branchId?: string;
  subjectId?: string;
  gradeId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
};

const EXAM_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'createdBy',
  organizationField: 'organizationId',
  branchField: 'branchId',
};

@Injectable()
export class ExamsService {
  constructor(
    @InjectModel(Exam.name)
    private readonly exams: Model<ExamDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async create(userId: string, dto: CreateExamDto) {
    return this.exams.create({
      organizationId: toOrganizationObjectId(dto.organizationId),
      branchId: toOptionalObjectId(dto.branchId),
      title: dto.title,
      examType: dto.examType ?? 'unit_test',
      subjectId: toRequiredObjectId(dto.subjectId),
      gradeId: toOptionalObjectId(dto.gradeId),
      academicSessionId: toOptionalObjectId(dto.academicSessionId),
      examDate: new Date(dto.examDate),
      startTime: dto.startTime,
      durationMinutes: dto.durationMinutes ?? 0,
      maxMarks: dto.maxMarks ?? 100,
      passingMarks: dto.passingMarks ?? 0,
      venue: dto.venue,
      invigilatorUserId: toOptionalObjectId(dto.invigilatorUserId),
      instructions: dto.instructions,
      createdBy: toRequiredObjectId(userId),
    });
  }

  async list(options: ExamListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 20), 200);
    const filter: FilterQuery<ExamDocument> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.branchId
        ? { branchId: toRequiredObjectId(options.branchId) }
        : {}),
      ...(options.subjectId
        ? { subjectId: toRequiredObjectId(options.subjectId) }
        : {}),
      ...(options.gradeId
        ? { gradeId: toRequiredObjectId(options.gradeId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    if (options.dateFrom || options.dateTo) {
      filter.examDate = {
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
      this.exams
        .find(scopedFilter)
        .sort({ examDate: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.exams.countDocuments(scopedFilter),
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
    const { items } = await this.list({ organizationId, limit: '1000' });
    const headers = [
      'id',
      'title',
      'examType',
      'examDate',
      'status',
      'maxMarks',
    ];
    return buildCsvExportFile(
      'exams',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async getById(examId: string, organizationId: string, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(examId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const exam = await this.exams.findOne(filter).lean();
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  async update(examId: string, dto: UpdateExamDto, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(examId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const record = await this.exams.findOneAndUpdate(
      filter,
      {
        $set: {
          ...(dto.title ? { title: dto.title } : {}),
          ...(dto.examType ? { examType: dto.examType } : {}),
          ...(dto.examDate ? { examDate: new Date(dto.examDate) } : {}),
          ...(dto.startTime !== undefined ? { startTime: dto.startTime } : {}),
          ...(dto.durationMinutes !== undefined
            ? { durationMinutes: dto.durationMinutes }
            : {}),
          ...(dto.maxMarks !== undefined ? { maxMarks: dto.maxMarks } : {}),
          ...(dto.passingMarks !== undefined
            ? { passingMarks: dto.passingMarks }
            : {}),
          ...(dto.venue !== undefined ? { venue: dto.venue } : {}),
          ...(dto.invigilatorUserId
            ? { invigilatorUserId: toRequiredObjectId(dto.invigilatorUserId) }
            : {}),
          ...(dto.instructions !== undefined
            ? { instructions: dto.instructions }
            : {}),
          ...(dto.status ? { status: dto.status } : {}),
        },
      },
      { new: true, runValidators: true },
    );
    if (!record) throw new NotFoundException('Exam not found');
    return record;
  }

  async recordResults(
    examId: string,
    userId: string,
    dto: RecordExamResultsDto,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(examId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const exam = await this.exams.findOne(filter);
    if (!exam) throw new NotFoundException('Exam not found');

    const enteredBy = toRequiredObjectId(userId);
    const enteredAt = new Date();
    const byStudent = new Map<string, ExamResultEntry>(
      exam.results.map((entry) => [entry.studentId.toString(), entry]),
    );
    for (const entry of dto.results) {
      byStudent.set(entry.studentId, {
        studentId: toRequiredObjectId(entry.studentId),
        marksObtained: entry.isAbsent ? 0 : (entry.marksObtained ?? 0),
        isAbsent: entry.isAbsent ?? false,
        grade: entry.grade,
        remarks: entry.remarks,
        enteredBy,
        enteredAt,
      });
    }
    exam.results = Array.from(byStudent.values());
    if (exam.status === 'scheduled' || exam.status === 'ongoing') {
      exam.status = 'completed';
    }
    return exam.save();
  }

  async publishResults(
    examId: string,
    organizationId: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(examId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const record = await this.exams.findOneAndUpdate(
      filter,
      { $set: { status: 'results_published' } },
      { new: true },
    );
    if (!record) throw new NotFoundException('Exam not found');
    return record;
  }

  /** Used by academic-records to roll exam marks up into report cards. */
  async listResultsForStudent(
    organizationId: string,
    studentId: string,
    academicSessionId?: string,
  ) {
    const filter: FilterQuery<ExamDocument> = {
      organizationId: toOrganizationObjectId(organizationId),
      status: 'results_published',
      'results.studentId': toRequiredObjectId(studentId),
      ...(academicSessionId
        ? { academicSessionId: toRequiredObjectId(academicSessionId) }
        : {}),
    };
    const exams = await this.exams.find(filter).lean();
    return exams.map((exam) => {
      const result = exam.results.find(
        (entry) => entry.studentId.toString() === studentId,
      );
      return {
        examId: exam._id,
        subjectId: exam.subjectId,
        title: exam.title,
        examType: exam.examType,
        examDate: exam.examDate,
        maxMarks: exam.maxMarks,
        marksObtained: result?.marksObtained ?? 0,
        isAbsent: result?.isAbsent ?? false,
      };
    });
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<ExamDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<ExamDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<ExamDocument>(
      scope,
      EXAM_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
