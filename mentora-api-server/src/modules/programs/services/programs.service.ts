import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  toRequiredObjectId,
  toOrganizationObjectId,
} from '@/common/utils/organization-scope.util';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import {
  BulkUpdateProgramStatusDto,
  CreateProgramDto,
  UpdateProgramDto,
} from '../dto/programs.dto';
import { Program, ProgramDocument } from '../schemas/programs.schema';

type ProgramListOptions = {
  level?: string;
  limit?: string;
  page?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  organizationId: string;
};

@Injectable()
export class ProgramsService {
  constructor(
    @InjectModel(Program.name)
    private readonly programs: Model<ProgramDocument>,
  ) {}

  async createProgram(dto: CreateProgramDto) {
    return this.programs.create({
      ...dto,
      organizationId: toOrganizationObjectId(dto.organizationId),
      code: dto.code.toUpperCase(),
    });
  }

  async listPrograms(options: ProgramListOptions) {
    const page = this.toPositiveInt(options.page, 1);
    const limit = Math.min(this.toPositiveInt(options.limit, 10), 100);
    const sortBy = this.resolveSortBy(options.sortBy);
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    const filter: Record<string, unknown> = {
      organizationId: toOrganizationObjectId(options.organizationId),
      ...(options.level ? { level: options.level } : {}),
      ...(options.status ? { status: options.status } : {}),
    };
    const search = options.search?.trim();
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.programs
        .find(filter)
        .sort({ [sortBy]: sortOrder, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.programs.countDocuments(filter),
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

  async exportPrograms(organizationId: string) {
    const { items } = await this.listPrograms({
      organizationId,
      limit: '1000',
    });
    const headers = [
      'id',
      'name',
      'code',
      'level',
      'durationMonths',
      'intakeCapacity',
      'seatsAvailable',
      'status',
    ];
    return buildCsvExportFile(
      'programs',
      headers,
      items.map((item) => withStringId(item)),
    );
  }

  async updateProgram(programId: string, dto: UpdateProgramDto) {
    const update: Record<string, unknown> = {
      ...dto,
      ...(dto.code ? { code: dto.code.toUpperCase() } : {}),
    };
    delete update.organizationId;
    const program = await this.programs.findOneAndUpdate(
      {
        _id: toRequiredObjectId(programId),
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async archiveProgram(programId: string, organizationId: string) {
    const program = await this.programs.findOneAndUpdate(
      {
        _id: toRequiredObjectId(programId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async restoreProgram(programId: string, organizationId: string) {
    const program = await this.programs.findOneAndUpdate(
      {
        _id: toRequiredObjectId(programId),
        organizationId: toOrganizationObjectId(organizationId),
      },
      { $set: { status: 'active' } },
      { new: true },
    );
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async bulkUpdateStatus(dto: BulkUpdateProgramStatusDto) {
    const result = await this.programs.updateMany(
      {
        _id: {
          $in: dto.recordIds.map((recordId) => new Types.ObjectId(recordId)),
        },
        organizationId: toOrganizationObjectId(dto.organizationId),
      },
      { $set: { status: dto.status } },
    );
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      status: dto.status,
    };
  }

  private resolveSortBy(value?: string) {
    const allowed = new Set([
      'createdAt',
      'name',
      'code',
      'level',
      'status',
      'updatedAt',
    ]);
    return value && allowed.has(value) ? value : 'createdAt';
  }

  private toPositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
