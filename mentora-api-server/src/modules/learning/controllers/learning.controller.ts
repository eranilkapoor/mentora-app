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
  CreateAcademicCatalogDto,
  CreateAiTutorSessionDto,
  CreateAssessmentDto,
  CreateCurriculumDto,
  CreateEntitlementDto,
  CreateLearningRecommendationDto,
  CreateQuestionBankDto,
  CreateQuestionDto,
  CreateSubjectDto,
  CreateTopicDto,
  RescheduleScheduleDto,
  SendAiTutorMessageDto,
  StartAssessmentAttemptDto,
  SubmitAssessmentAnswerDto,
} from '../dto/learning.dto';
import { LearningService } from '../services/learning.service';

@Controller()
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get('academic-catalog/:type')
  async listCatalog(@Param('type') type: string) {
    return successResponse(
      await this.service.listCatalogItems(type as never),
      'ACADEMIC_CATALOG_FETCHED',
      'Academic catalog fetched',
    );
  }

  @Post('academic-catalog/:type')
  @HttpCode(HttpStatus.CREATED)
  async createCatalog(
    @Param('type') type: string,
    @Body() dto: CreateAcademicCatalogDto,
  ) {
    return successResponse(
      await this.service.createCatalogItem(type as never, dto),
      'ACADEMIC_CATALOG_CREATED',
      'Academic catalog item created',
    );
  }

  @Get('subjects')
  async listSubjects() {
    return successResponse(
      await this.service.listSubjects(),
      'SUBJECTS_FETCHED',
      'Subjects fetched',
    );
  }

  @Get('topics')
  async listTopics(@Query('subjectId') subjectId?: string) {
    return successResponse(
      await this.service.listTopics(subjectId),
      'TOPICS_FETCHED',
      'Topics fetched',
    );
  }

  @Post('topics')
  @HttpCode(HttpStatus.CREATED)
  async createTopic(@Body() dto: CreateTopicDto) {
    return successResponse(
      await this.service.createTopic(dto),
      'TOPIC_CREATED',
      'Topic created',
    );
  }

  @Get('curriculums')
  async listCurriculums() {
    return successResponse(
      await this.service.listCurriculums(),
      'CURRICULUMS_FETCHED',
      'Curriculums fetched',
    );
  }

  @Post('curriculums')
  @HttpCode(HttpStatus.CREATED)
  async createCurriculum(@Body() dto: CreateCurriculumDto) {
    return successResponse(
      await this.service.createCurriculum(dto),
      'CURRICULUM_CREATED',
      'Curriculum created',
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

  @Post('schedules/:scheduleId/reschedule')
  async rescheduleSchedule(
    @Req() req: AuthenticatedRequest,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: RescheduleScheduleDto,
  ) {
    return successResponse(
      await this.service.rescheduleSchedule(req.user.sub, scheduleId, dto),
      'LEARNING_SCHEDULE_RESCHEDULED',
      'Learning schedule rescheduled',
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

  @Get('ai-tutor/sessions/:sessionId/context')
  async getAiTutorSessionContext(
    @Req() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return successResponse(
      await this.service.getAiTutorSessionContext(req.user.sub, sessionId),
      'AI_TUTOR_CONTEXT_FETCHED',
      'AI tutor context fetched',
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

  @Get('question-banks')
  async listQuestionBanks(@Query('subjectId') subjectId?: string) {
    return successResponse(
      await this.service.listQuestionBanks(subjectId),
      'QUESTION_BANKS_FETCHED',
      'Question banks fetched',
    );
  }

  @Post('question-banks')
  @HttpCode(HttpStatus.CREATED)
  async createQuestionBank(@Body() dto: CreateQuestionBankDto) {
    return successResponse(
      await this.service.createQuestionBank(dto),
      'QUESTION_BANK_CREATED',
      'Question bank created',
    );
  }

  @Get('questions')
  async listQuestions(@Query('questionBankId') questionBankId?: string) {
    return successResponse(
      await this.service.listQuestions(questionBankId),
      'QUESTIONS_FETCHED',
      'Questions fetched',
    );
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() dto: CreateQuestionDto) {
    return successResponse(
      await this.service.createQuestion(dto),
      'QUESTION_CREATED',
      'Question created',
    );
  }

  @Get('assessments')
  async listAssessments(@Query('subjectId') subjectId?: string) {
    return successResponse(
      await this.service.listAssessments(subjectId),
      'ASSESSMENTS_FETCHED',
      'Assessments fetched',
    );
  }

  @Post('assessments')
  @HttpCode(HttpStatus.CREATED)
  async createAssessment(@Body() dto: CreateAssessmentDto) {
    return successResponse(
      await this.service.createAssessment(dto),
      'ASSESSMENT_CREATED',
      'Assessment created',
    );
  }

  @Post('assessments/:assessmentId/attempts')
  @HttpCode(HttpStatus.CREATED)
  async startAssessmentAttempt(
    @Req() req: AuthenticatedRequest,
    @Param('assessmentId') assessmentId: string,
    @Body() dto: StartAssessmentAttemptDto,
  ) {
    return successResponse(
      await this.service.startAssessmentAttempt(
        req.user.sub,
        assessmentId,
        dto,
      ),
      'ASSESSMENT_ATTEMPT_STARTED',
      'Assessment attempt started',
    );
  }

  @Post('assessment-attempts/:attemptId/answers')
  async submitAssessmentAnswer(
    @Req() req: AuthenticatedRequest,
    @Param('attemptId') attemptId: string,
    @Body() dto: SubmitAssessmentAnswerDto,
  ) {
    return successResponse(
      await this.service.submitAssessmentAnswer(req.user.sub, attemptId, dto),
      'ASSESSMENT_ANSWER_SAVED',
      'Assessment answer saved',
    );
  }

  @Post('assessment-attempts/:attemptId/complete')
  async completeAssessmentAttempt(
    @Req() req: AuthenticatedRequest,
    @Param('attemptId') attemptId: string,
  ) {
    return successResponse(
      await this.service.completeAssessmentAttempt(req.user.sub, attemptId),
      'ASSESSMENT_ATTEMPT_COMPLETED',
      'Assessment attempt completed',
    );
  }

  @Post('learning-recommendations')
  @HttpCode(HttpStatus.CREATED)
  async createLearningRecommendation(
    @Body() dto: CreateLearningRecommendationDto,
  ) {
    return successResponse(
      await this.service.createLearningRecommendation(dto),
      'LEARNING_RECOMMENDATION_CREATED',
      'Learning recommendation created',
    );
  }

  @Get('parents/progress-dashboard')
  async getParentProgressDashboard(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.service.getParentProgressDashboard(req.user.sub),
      'PARENT_PROGRESS_DASHBOARD_FETCHED',
      'Parent progress dashboard fetched',
    );
  }
}
