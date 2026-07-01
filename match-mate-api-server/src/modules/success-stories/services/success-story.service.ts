import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { buildPaginationMeta } from '@/common/utils/pagination';
import { AdminAuditService } from '@/modules/admin/services/admin-audit.service';
import {
  AdminListSuccessStoriesDto,
  ListSuccessStoriesDto,
  ReviewSuccessStoryDto,
  SubmitSuccessStoryDto,
} from '../dto/success-story.dto';
import {
  SuccessStory,
  SuccessStoryDocument,
} from '../schemas/success-story.schema';

@Injectable()
export class SuccessStoryService {
  constructor(
    @InjectModel(SuccessStory.name)
    private readonly storyModel: Model<SuccessStoryDocument>,
    private readonly auditService: AdminAuditService,
  ) {}

  async submit(userId: string, dto: SubmitSuccessStoryDto) {
    if (!dto.publicationConsent) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'publication_consent_required',
      });
    }

    return this.storyModel.create({
      userId: new Types.ObjectId(userId),
      title: dto.title.trim(),
      story: dto.story.trim(),
      partnerName: dto.partnerName.trim(),
      marriageDate: new Date(dto.marriageDate),
      location: dto.location?.trim(),
      photoUrls: dto.photoUrls ?? [],
      publicationConsent: true,
      status: 'submitted',
    });
  }

  listMine(userId: string, query: ListSuccessStoriesDto) {
    return this.list(
      { userId: new Types.ObjectId(userId) },
      query.page ?? 1,
      query.limit ?? 20,
      { createdAt: -1 },
    );
  }

  listPublished(query: ListSuccessStoriesDto) {
    return this.list(
      { status: 'published', publicationConsent: true },
      query.page ?? 1,
      query.limit ?? 20,
      { publishedAt: -1 },
    );
  }

  listForReview(query: AdminListSuccessStoriesDto) {
    return this.list(
      query.status ? { status: query.status } : {},
      query.page ?? 1,
      query.limit ?? 20,
      { createdAt: -1 },
    );
  }

  async review(
    reviewerId: string,
    storyId: string,
    dto: ReviewSuccessStoryDto,
  ) {
    if (!Types.ObjectId.isValid(storyId)) {
      return throwNotFound(ErrorCode.INVALID_REQUEST, {
        reason: 'success_story_not_found',
      });
    }
    if (dto.status === 'rejected' && !dto.reason?.trim()) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'rejection_reason_required',
      });
    }

    const now = new Date();
    const story = await this.storyModel
      .findByIdAndUpdate(
        storyId,
        {
          $set: {
            status: dto.status,
            reviewedBy: new Types.ObjectId(reviewerId),
            reviewedAt: now,
            rejectionReason:
              dto.status === 'rejected' ? dto.reason?.trim() : undefined,
            publishedAt: dto.status === 'published' ? now : undefined,
          },
          ...(dto.status !== 'rejected'
            ? { $unset: { rejectionReason: 1 } }
            : {}),
          ...(dto.status !== 'published' ? { $unset: { publishedAt: 1 } } : {}),
        },
        { new: true },
      )
      .lean()
      .exec();

    if (!story) {
      return throwNotFound(ErrorCode.INVALID_REQUEST, {
        reason: 'success_story_not_found',
      });
    }
    await this.auditService.write({
      actorId: reviewerId,
      action: `success_story.${dto.status}`,
      resource: 'success_story',
      targetId: storyId,
      reason: dto.reason?.trim(),
      after: { status: dto.status },
    });
    return story;
  }

  private async list(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ) {
    const [items, total] = await Promise.all([
      this.storyModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.storyModel.countDocuments(filter),
    ]);

    return { items, ...buildPaginationMeta(total, page, limit) };
  }
}
