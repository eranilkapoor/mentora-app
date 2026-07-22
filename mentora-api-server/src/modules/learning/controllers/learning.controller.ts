import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import {
  CreateAiTutorSessionDto,
  CreateEntitlementDto,
  CreateSubjectDto,
  SendAiTutorMessageDto,
} from '../dto/learning.dto';
import { LearningService } from '../services/learning.service';

@Controller()
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get('subjects')
  async listSubjects() {
    return successResponse(
      await this.service.listSubjects(),
      'SUBJECTS_FETCHED',
      'Subjects fetched',
    );
  }

  @Post('subjects')
  @HttpCode(HttpStatus.CREATED)
  async createSubject(@Body() dto: CreateSubjectDto) {
    return successResponse(
      await this.service.createSubject(dto),
      'SUBJECT_CREATED',
      'Subject created',
    );
  }

  @Post('learning-entitlements')
  @HttpCode(HttpStatus.CREATED)
  async createEntitlement(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateEntitlementDto,
  ) {
    return successResponse(
      await this.service.createEntitlement(req.user.sub, dto),
      'LEARNING_ENTITLEMENT_CREATED',
      'Learning entitlement created',
    );
  }

  @Get('learning-entitlements')
  async listEntitlements(
    @Req() req: AuthenticatedRequest,
    @Query('studentProfileId') studentProfileId: string,
  ) {
    return successResponse(
      await this.service.listEntitlements(req.user.sub, studentProfileId),
      'LEARNING_ENTITLEMENTS_FETCHED',
      'Learning entitlements fetched',
    );
  }

  @Post('schedules/:scheduleId/cancel')
  async cancelSchedule(
    @Req() req: AuthenticatedRequest,
    @Param('scheduleId') scheduleId: string,
  ) {
    return successResponse(
      await this.service.cancelSchedule(req.user.sub, scheduleId),
      'LEARNING_SCHEDULE_CANCELLED',
      'Learning schedule cancelled',
    );
  }

  @Post('ai-tutor/sessions')
  @HttpCode(HttpStatus.CREATED)
  async createAiTutorSession(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAiTutorSessionDto,
  ) {
    return successResponse(
      await this.service.createAiTutorSession(req.user.sub, dto),
      'AI_TUTOR_SESSION_CREATED',
      'AI tutor session created',
    );
  }

  @Get('ai-tutor/sessions/:sessionId')
  async getAiTutorSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return successResponse(
      await this.service.getAiTutorSession(req.user.sub, sessionId),
      'AI_TUTOR_SESSION_FETCHED',
      'AI tutor session fetched',
    );
  }

  @Post('ai-tutor/sessions/:sessionId/messages')
  async sendAiTutorMessage(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendAiTutorMessageDto,
  ) {
    return successResponse(
      await this.service.sendAiTutorMessage(req.user.sub, sessionId, dto),
      'AI_TUTOR_MESSAGE_SENT',
      'AI tutor message sent',
    );
  }

  @Post('ai-tutor/sessions/:sessionId/complete')
  async completeAiTutorSession(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return successResponse(
      await this.service.completeAiTutorSession(req.user.sub, sessionId),
      'AI_TUTOR_SESSION_COMPLETED',
      'AI tutor session completed',
    );
  }
}
