import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateTranscriptDto,
  UpdateTranscriptDto,
} from '../dto/transcript.dto';
import { TranscriptsService } from '../services/transcripts.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/transcripts')
export class TranscriptsController {
  constructor(private readonly service: TranscriptsService) {}

  @Post()
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTranscriptDto,
  ) {
    return successResponse(
      await this.service.create(req.user.sub, dto),
      'TRANSCRIPT_CREATED',
      'Transcript created',
    );
  }

  @Get()
  @Permissions(Permission.ACADEMIC_RECORD_VIEW)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('organizationId') organizationId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.service.list(
        { organizationId, studentId, status, page, limit },
        req.user.sub,
      ),
      'TRANSCRIPTS_FETCHED',
      'Transcripts fetched',
    );
  }

  @Get(':transcriptId')
  @Permissions(Permission.ACADEMIC_RECORD_VIEW)
  async getById(
    @Req() req: AuthenticatedRequest,
    @Param('transcriptId') transcriptId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.getById(transcriptId, organizationId, req.user.sub),
      'TRANSCRIPT_FETCHED',
      'Transcript fetched',
    );
  }

  @Put(':transcriptId')
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('transcriptId') transcriptId: string,
    @Body() dto: UpdateTranscriptDto,
  ) {
    return successResponse(
      await this.service.update(transcriptId, dto, req.user.sub),
      'TRANSCRIPT_UPDATED',
      'Transcript updated',
    );
  }

  @Post(':transcriptId/issue')
  @Permissions(Permission.ACADEMIC_RECORD_MANAGE)
  async issue(
    @Req() req: AuthenticatedRequest,
    @Param('transcriptId') transcriptId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.issue(
        transcriptId,
        req.user.sub,
        organizationId,
        req.user.sub,
      ),
      'TRANSCRIPT_ISSUED',
      'Transcript issued',
    );
  }
}
