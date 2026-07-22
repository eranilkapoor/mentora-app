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
  AddParentDto,
  CreateAcademicRecordDto,
  CreateScheduleDto,
  CreateStudentDto,
  EnrollSubjectDto,
  UpdateParentalControlsDto,
  UpdateStudentDto,
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
  ) {
    return successResponse(
      await this.service.listAiHistory(req.user.sub, studentId),
      'AI_HISTORY_FETCHED',
      'AI tutor history fetched',
    );
  }
}
