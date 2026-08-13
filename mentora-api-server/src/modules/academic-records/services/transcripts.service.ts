import { randomBytes } from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import { ReportCard, ReportCardDocument } from '../schemas/report-card.schema';
import {
  CreateTranscriptDto,
  UpdateTranscriptDto,
} from '../dto/transcript.dto';
import { Transcript, TranscriptDocument } from '../schemas/transcript.schema';

type TranscriptListOptions = {
  organizationId: string;
  studentId?: string;
  status?: string;
  page?: string;
  limit?: string;
};

const TRANSCRIPT_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'issuedBy',
  organizationField: 'organizationId',
};

@Injectable()
export class TranscriptsService {
  constructor(
    @InjectModel(Transcript.name)
    private readonly transcripts: Model<TranscriptDocument>,
    @InjectModel(ReportCard.name)
    private readonly reportCards: Model<ReportCardDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async create(userId: string, dto: CreateTranscriptDto) {
    const organizationId = toOrganizationObjectId(dto.organizationId);
    const studentId = toRequiredObjectId(dto.studentId);
    const reportCardIds = dto.reportCardIds.map((id) => toRequiredObjectId(id));

    const linkedReportCards = await this.reportCards
      .find({
        _id: { $in: reportCardIds },
        organizationId,
        studentId,
      })
      .lean();
    if (linkedReportCards.length !== reportCardIds.length) {
      throw new BadRequestException(
        'One or more report cards do not belong to this student',
      );
    }

    const { cumulativePercentage } = this.computeCumulative(linkedReportCards);

    return this.transcripts.create({
      organizationId,
      studentId,
      transcriptType: dto.transcriptType ?? 'full_academic_history',
      reportCardIds,
      cumulativePercentage,
      purpose: dto.purpose,
      issuedBy: toRequiredObjectId(userId),
    });
  }

  async list(options: TranscriptListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 20), 200);
    const filter: FilterQuery<TranscriptDocument> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.studentId
        ? { studentId: toRequiredObjectId(options.studentId) }
        : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.transcripts
        .find(scopedFilter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.transcripts.countDocuments(scopedFilter),
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
    transcriptId: string,
    organizationId: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(transcriptId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const record = await this.transcripts.findOne(filter).lean();
    if (!record) throw new NotFoundException('Transcript not found');
    return record;
  }

  async update(
    transcriptId: string,
    dto: UpdateTranscriptDto,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(transcriptId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const record = await this.transcripts.findOneAndUpdate(
      filter,
      {
        $set: {
          ...(dto.purpose !== undefined ? { purpose: dto.purpose } : {}),
          ...(dto.status ? { status: dto.status } : {}),
        },
      },
      { new: true, runValidators: true },
    );
    if (!record) throw new NotFoundException('Transcript not found');
    return record;
  }

  async issue(
    transcriptId: string,
    userId: string,
    organizationId: string,
    actorId?: string,
  ) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(transcriptId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const record = await this.transcripts.findOneAndUpdate(
      filter,
      {
        $set: {
          status: 'issued',
          issuedAt: new Date(),
          issuedBy: toRequiredObjectId(userId),
          verificationCode: this.generateVerificationCode(),
        },
      },
      { new: true },
    );
    if (!record) throw new NotFoundException('Transcript not found');
    return record;
  }

  private computeCumulative(reportCards: Array<{ percentage: number }>) {
    const withPercentage = reportCards.filter(
      (card) => typeof card.percentage === 'number',
    );
    const cumulativePercentage = withPercentage.length
      ? Math.round(
          (withPercentage.reduce((sum, card) => sum + card.percentage, 0) /
            withPercentage.length) *
            100,
        ) / 100
      : undefined;
    return { cumulativePercentage };
  }

  private generateVerificationCode() {
    return randomBytes(8).toString('hex').toUpperCase();
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<TranscriptDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<TranscriptDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<TranscriptDocument>(
      scope,
      TRANSCRIPT_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
