import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  toOptionalObjectId,
  toOrganizationObjectId,
  toRequiredObjectId,
} from '@/common/utils/organization-scope.util';
import { ActorScopeService } from '@/common/rbac/actor-scope.service';
import { buildScopeFilter, ScopeFieldMap } from '@/common/rbac/data-scope.util';
import { CreateTimetableDto, UpdateTimetableDto } from '../dto/timetable.dto';
import { Timetable, TimetableDocument } from '../schemas/timetable.schema';

type TimetableListOptions = {
  organizationId: string;
  branchId?: string;
  subjectId?: string;
  gradeId?: string;
  staffUserId?: string;
  roomLabel?: string;
  dayOfWeek?: string;
  status?: string;
  page?: string;
  limit?: string;
};

const TIMETABLE_SCOPE_FIELDS: ScopeFieldMap = {
  ownerField: 'staffUserId',
  organizationField: 'organizationId',
  branchField: 'branchId',
};

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(Timetable.name)
    private readonly timetables: Model<TimetableDocument>,
    private readonly actorScope: ActorScopeService,
  ) {}

  async create(userId: string, dto: CreateTimetableDto) {
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
    const organizationId = toOrganizationObjectId(dto.organizationId);
    await this.assertNoConflict(organizationId, dto);
    return this.timetables.create({
      organizationId,
      branchId: toOptionalObjectId(dto.branchId),
      subjectId: toRequiredObjectId(dto.subjectId),
      gradeId: toOptionalObjectId(dto.gradeId),
      sectionLabel: dto.sectionLabel,
      roomLabel: dto.roomLabel,
      staffUserId: toRequiredObjectId(dto.staffUserId),
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
      academicSessionId: toOptionalObjectId(dto.academicSessionId),
      createdBy: toRequiredObjectId(userId),
    });
  }

  async list(options: TimetableListOptions, actorId?: string) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 50), 500);
    const filter: FilterQuery<TimetableDocument> = {
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
      ...(options.staffUserId
        ? { staffUserId: toRequiredObjectId(options.staffUserId) }
        : {}),
      ...(options.roomLabel ? { roomLabel: options.roomLabel } : {}),
      ...(options.dayOfWeek !== undefined
        ? { dayOfWeek: Number.parseInt(options.dayOfWeek, 10) }
        : {}),
      status: options.status ?? 'active',
    };

    const scopedFilter = await this.applyScope(
      filter,
      actorId,
      options.organizationId,
    );
    const [items, total] = await Promise.all([
      this.timetables
        .find(scopedFilter)
        .sort({ dayOfWeek: 1, startTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.timetables.countDocuments(scopedFilter),
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

  async update(timetableId: string, dto: UpdateTimetableDto, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(timetableId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      actorId,
      dto.organizationId,
    );
    const existing = await this.timetables.findOne(filter);
    if (!existing) throw new NotFoundException('Timetable slot not found');

    const merged = {
      staffUserId: dto.staffUserId ?? existing.staffUserId.toString(),
      roomLabel: dto.roomLabel ?? existing.roomLabel,
      dayOfWeek: dto.dayOfWeek ?? existing.dayOfWeek,
      startTime: dto.startTime ?? existing.startTime,
      endTime: dto.endTime ?? existing.endTime,
    };
    if (merged.startTime >= merged.endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }
    await this.assertNoConflict(
      existing.organizationId,
      merged,
      existing._id.toString(),
    );

    existing.set({
      ...(dto.sectionLabel !== undefined
        ? { sectionLabel: dto.sectionLabel }
        : {}),
      ...(dto.roomLabel !== undefined ? { roomLabel: dto.roomLabel } : {}),
      ...(dto.staffUserId
        ? { staffUserId: toRequiredObjectId(dto.staffUserId) }
        : {}),
      ...(dto.dayOfWeek !== undefined ? { dayOfWeek: dto.dayOfWeek } : {}),
      ...(dto.startTime ? { startTime: dto.startTime } : {}),
      ...(dto.endTime ? { endTime: dto.endTime } : {}),
      ...(dto.effectiveFrom
        ? { effectiveFrom: new Date(dto.effectiveFrom) }
        : {}),
      ...(dto.effectiveTo ? { effectiveTo: new Date(dto.effectiveTo) } : {}),
      ...(dto.status ? { status: dto.status } : {}),
    });
    return existing.save();
  }

  async cancel(timetableId: string, organizationId: string, actorId?: string) {
    const filter = await this.applyScope(
      {
        _id: toRequiredObjectId(timetableId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      actorId,
      organizationId,
    );
    const record = await this.timetables.findOneAndUpdate(
      filter,
      { $set: { status: 'cancelled' } },
      { new: true },
    );
    if (!record) throw new NotFoundException('Timetable slot not found');
    return record;
  }

  private async assertNoConflict(
    organizationId: TimetableDocument['organizationId'],
    slot: {
      staffUserId: string;
      roomLabel?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    },
    excludeId?: string,
  ) {
    const overlap = {
      status: 'active',
      dayOfWeek: slot.dayOfWeek,
      startTime: { $lt: slot.endTime },
      endTime: { $gt: slot.startTime },
      ...(excludeId ? { _id: { $ne: toRequiredObjectId(excludeId) } } : {}),
    };

    const staffConflict = await this.timetables.exists({
      organizationId,
      staffUserId: toRequiredObjectId(slot.staffUserId),
      ...overlap,
    });
    if (staffConflict) {
      throw new BadRequestException(
        'This staff member already has an overlapping timetable slot',
      );
    }

    if (slot.roomLabel) {
      const roomConflict = await this.timetables.exists({
        organizationId,
        roomLabel: slot.roomLabel,
        ...overlap,
      });
      if (roomConflict) {
        throw new BadRequestException(
          'This room is already booked for an overlapping slot',
        );
      }
    }
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private async applyScope(
    filter: FilterQuery<TimetableDocument>,
    actorId: string | undefined,
    organizationId: string,
  ): Promise<FilterQuery<TimetableDocument>> {
    if (!actorId) return filter;
    const scope = await this.actorScope.resolveActorScope(
      actorId,
      organizationId,
    );
    const scopeFilter = buildScopeFilter<TimetableDocument>(
      scope,
      TIMETABLE_SCOPE_FIELDS,
    );
    if (Object.keys(scopeFilter).length === 0) return filter;
    return { $and: [filter, scopeFilter] };
  }
}
