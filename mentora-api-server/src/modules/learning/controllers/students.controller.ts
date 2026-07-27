import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import {
  AcceptStudentInvitationDto,
  AddParentDto,
  CreateAcademicRecordDto,
  CreateScheduleDto,
  CreateStudentDto,
  CreateStudentInvitationDto,
  EnrollSubjectDto,
  SubmitStudentEligibilityDocumentsDto,
  UpdateParentalControlsDto,
  UpdateParentProfileDto,
  UpdateStudentDto,
  UpdateStudentProfileSectionDto,
  UpsertTopicProgressDto,
} from '../dto/learning.dto';
import { LearningService } from '../services/learning.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly service: LearningService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateStudentDto,
  ) {
    return successResponse(
      await this.service.createStudent(req.user.sub, dto),
      'STUDENT_CREATED',
      'Student profile created',
    );
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.service.listStudents(req.user.sub),
      'STUDENTS_FETCHED',
      'Students fetched',
    );
  }

  @Get(':studentId')
  async get(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.getStudentForUser(req.user.sub, studentId),
      'STUDENT_FETCHED',
      'Student fetched',
    );
  }

  @Patch(':studentId')
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return successResponse(
      await this.service.updateStudent(req.user.sub, studentId, dto),
      'STUDENT_UPDATED',
      'Student updated',
    );
  }

  @Patch(':studentId/profile-sections/:section')
  async updateProfileSection(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Param('section') section: string,
    @Body() dto: UpdateStudentProfileSectionDto,
  ) {
    return successResponse(
      await this.service.updateStudentProfileSection(
        req.user.sub,
        studentId,
        section,
        dto,
      ),
      'STUDENT_PROFILE_SECTION_UPDATED',
      'Student profile section updated',
    );
  }

  @Get('parents/me/profile')
  async getParentProfile(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.service.getParentProfile(req.user.sub),
      'PARENT_PROFILE_FETCHED',
      'Parent profile fetched',
    );
  }

  @Patch('parents/me/profile')
  async updateParentProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateParentProfileDto,
  ) {
    return successResponse(
      await this.service.updateParentProfile(req.user.sub, dto),
      'PARENT_PROFILE_UPDATED',
      'Parent profile updated',
    );
  }

  @Post(':studentId/parents')
  async addParent(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: AddParentDto,
  ) {
    return successResponse(
      await this.service.addParent(req.user.sub, studentId, dto),
      'STUDENT_PARENT_LINKED',
      'Parent linked to student',
    );
  }

  @Patch(':studentId/parental-controls')
  async updateParentalControls(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateParentalControlsDto,
  ) {
    return successResponse(
      await this.service.updateParentalControls(req.user.sub, studentId, dto),
      'PARENTAL_CONTROLS_UPDATED',
      'Parental controls updated',
    );
  }

  @Get(':studentId/parental-controls')
  async getParentalControls(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.getParentalControls(req.user.sub, studentId),
      'PARENTAL_CONTROLS_FETCHED',
      'Parental controls fetched',
    );
  }

  @Post(':studentId/invitations')
  @HttpCode(HttpStatus.CREATED)
  async createInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: CreateStudentInvitationDto,
  ) {
    return successResponse(
      await this.service.createStudentInvitation(req.user.sub, studentId, dto),
      'STUDENT_INVITATION_CREATED',
      'Student invitation created',
    );
  }

  @Get(':studentId/invitations')
  async listInvitations(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.listStudentInvitations(req.user.sub, studentId),
      'STUDENT_INVITATIONS_FETCHED',
      'Student invitations fetched',
    );
  }

  @Post(':studentId/invitations/:invitationId/revoke')
  async revokeInvitation(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return successResponse(
      await this.service.revokeStudentInvitation(
        req.user.sub,
        studentId,
        invitationId,
      ),
      'STUDENT_INVITATION_REVOKED',
      'Student invitation revoked',
    );
  }

  @Post('invitations/accept')
  async acceptInvitation(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AcceptStudentInvitationDto,
  ) {
    return successResponse(
      await this.service.acceptStudentInvitation(req.user.sub, dto),
      'STUDENT_INVITATION_ACCEPTED',
      'Student invitation accepted',
    );
  }

  @Post(':studentId/academic-records')
  @HttpCode(HttpStatus.CREATED)
  async createAcademicRecord(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: CreateAcademicRecordDto,
  ) {
    return successResponse(
      await this.service.createAcademicRecord(req.user.sub, studentId, dto),
      'ACADEMIC_RECORD_CREATED',
      'Academic record created',
    );
  }

  @Get(':studentId/academic-records')
  async listAcademicRecords(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.listAcademicRecords(req.user.sub, studentId),
      'ACADEMIC_RECORDS_FETCHED',
      'Academic records fetched',
    );
  }

  @Patch(':studentId/previous-education')
  async updatePreviousEducation(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentProfileSectionDto,
  ) {
    return successResponse(
      await this.service.updatePreviousEducation(req.user.sub, studentId, dto),
      'PREVIOUS_EDUCATION_UPDATED',
      'Previous education updated',
    );
  }

  @Patch(':studentId/exam-scores')
  async updateExamScores(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentProfileSectionDto,
  ) {
    return successResponse(
      await this.service.updateExamScores(req.user.sub, studentId, dto),
      'EXAM_SCORES_UPDATED',
      'Exam scores updated',
    );
  }

  @Patch(':studentId/course-preference')
  async updateCoursePreference(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentProfileSectionDto,
  ) {
    return successResponse(
      await this.service.updateCoursePreference(req.user.sub, studentId, dto),
      'COURSE_PREFERENCE_UPDATED',
      'Course preference updated',
    );
  }

  @Patch(':studentId/documents')
  async updateDocuments(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentProfileSectionDto,
  ) {
    return successResponse(
      await this.service.updateDocuments(req.user.sub, studentId, dto),
      'STUDENT_DOCUMENTS_UPDATED',
      'Student documents updated',
    );
  }

  @Post(':studentId/eligibility-documents')
  @HttpCode(HttpStatus.CREATED)
  async submitEligibilityDocuments(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: SubmitStudentEligibilityDocumentsDto,
  ) {
    return successResponse(
      await this.service.submitEligibilityDocuments(
        req.user.sub,
        studentId,
        dto,
      ),
      'STUDENT_ELIGIBILITY_DOCUMENTS_SUBMITTED',
      'Student eligibility documents submitted',
    );
  }

  @Post(':studentId/subjects')
  async enrollSubject(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: EnrollSubjectDto,
  ) {
    return successResponse(
      await this.service.enrollSubject(req.user.sub, studentId, dto),
      'STUDENT_SUBJECT_ENROLLED',
      'Student subject enrolled',
    );
  }

  @Post(':studentId/schedules')
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return successResponse(
      await this.service.createSchedule(req.user.sub, studentId, dto),
      'LEARNING_SCHEDULE_CREATED',
      'Learning schedule created',
    );
  }

  @Get(':studentId/schedules')
  async listSchedules(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.listSchedules(req.user.sub, studentId),
      'LEARNING_SCHEDULES_FETCHED',
      'Learning schedules fetched',
    );
  }

  @Get(':studentId/ai-history')
  async aiHistory(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ): Promise<unknown> {
    return successResponse(
      await this.service.listAiHistory(req.user.sub, studentId),
      'AI_HISTORY_FETCHED',
      'AI tutor history fetched',
    );
  }

  @Get(':studentId/progress')
  async progress(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.getStudentProgress(req.user.sub, studentId),
      'STUDENT_PROGRESS_FETCHED',
      'Student progress fetched',
    );
  }

  @Get(':studentId/topic-progress')
  async topicProgress(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.listTopicProgress(req.user.sub, studentId),
      'STUDENT_TOPIC_PROGRESS_FETCHED',
      'Student topic progress fetched',
    );
  }

  @Patch(':studentId/topic-progress')
  async upsertTopicProgress(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
    @Body() dto: UpsertTopicProgressDto,
  ) {
    return successResponse(
      await this.service.upsertTopicProgress(req.user.sub, studentId, dto),
      'STUDENT_TOPIC_PROGRESS_UPDATED',
      'Student topic progress updated',
    );
  }

  @Get(':studentId/recommendations')
  async recommendations(
    @Req() req: AuthenticatedRequest,
    @Param('studentId') studentId: string,
  ) {
    return successResponse(
      await this.service.listRecommendations(req.user.sub, studentId),
      'LEARNING_RECOMMENDATIONS_FETCHED',
      'Learning recommendations fetched',
    );
  }
}
