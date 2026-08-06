import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  MinLength,
  Min,
} from 'class-validator';

export class CreateStudentDto {
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  studentEmail?: string;

  @IsOptional()
  @MinLength(12)
  @MaxLength(64)
  @IsString()
  studentPassword?: string;

  @IsOptional()
  @IsIn(['self_managed', 'parent_managed', 'jointly_managed'])
  ownershipType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];
}

export class CreateStudentBulkDto {
  @IsArray()
  students!: CreateStudentDto[];
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;
}

export class UpdateStudentProfileSectionDto {
  @IsObject()
  data!: Record<string, unknown>;
}

export class SubmitStudentEligibilityDocumentsDto {
  @IsString()
  documentType!: string;

  @IsString()
  idProofUrl!: string;

  @IsOptional()
  @IsString()
  selfieUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateParentProfileDto {
  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsIn(['push', 'email', 'sms', 'whatsapp'])
  preferredCommunicationChannel?: string;

  @IsOptional()
  @IsIn(['after_each_session', 'daily', 'weekly', 'monthly'])
  notificationSummaryFrequency?: string;

  @IsOptional()
  @IsBoolean()
  billingContact?: boolean;

  @IsOptional()
  @IsBoolean()
  emergencyContact?: boolean;
}

export class AddParentDto {
  @IsMongoId()
  parentUserId!: string;

  @IsOptional()
  @IsIn([
    'father',
    'mother',
    'guardian',
    'grandparent',
    'sibling',
    'sponsor',
    'other',
  ])
  relationship?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;
}

export class CreateStudentInvitationDto {
  @IsEmail()
  inviteeEmail!: string;

  @IsOptional()
  @IsIn([
    'father',
    'mother',
    'guardian',
    'grandparent',
    'sibling',
    'sponsor',
    'other',
  ])
  relationship?: string;

  @IsOptional()
  @IsObject()
  permissions?: Record<string, boolean>;
}

export class AcceptStudentInvitationDto {
  @IsString()
  token!: string;
}

export class UpdateParentalControlsDto {
  @IsOptional()
  @IsBoolean()
  aiTutorEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  assessmentEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  externalLinksEnabled?: boolean;

  @IsOptional()
  @IsString()
  allowedStartTime?: string;

  @IsOptional()
  @IsString()
  allowedEndTime?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  dailyLearningLimitMinutes?: number;

  @IsOptional()
  @IsBoolean()
  requireApprovalForScheduling?: boolean;

  @IsOptional()
  @IsBoolean()
  requireApprovalForPurchase?: boolean;

  @IsOptional()
  @IsIn(['strict', 'age_appropriate', 'standard'])
  contentRestrictionLevel?: string;
}

export class CreateAcademicRecordDto {
  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsString()
  educationBoard?: string;

  @IsOptional()
  @IsString()
  universityName?: string;

  @IsOptional()
  @IsIn([
    'school',
    'undergraduate',
    'postgraduate',
    'diploma',
    'certificate',
    'competitive_exam',
    'other',
  ])
  academicLevel?: string;

  @IsOptional()
  @IsString()
  gradeOrYear?: string;

  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @IsIn(['current', 'completed', 'discontinued', 'transferred'])
  status?: string;

  @IsOptional()
  @IsString()
  resultValue?: string;
}

export class CreateSubjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn([
    'core',
    'elective',
    'language',
    'competitive',
    'skill',
    'professional',
    'other',
  ])
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAcademicCatalogDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsMongoId()
  academicLevelId?: string;

  @IsOptional()
  @IsMongoId()
  streamId?: string;

  @IsOptional()
  @IsMongoId()
  boardId?: string;

  @IsOptional()
  @IsMongoId()
  universityId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateTopicDto {
  @IsMongoId()
  subjectId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeIds?: string[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateCurriculumDto {
  @IsOptional()
  @IsMongoId()
  boardId?: string;

  @IsMongoId()
  gradeId!: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicIds?: string[];

  @IsString()
  code!: string;
}

export class CreateStudyPlanDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn([
    'school',
    'competitive_exam',
    'college',
    'university',
    'skill_course',
    'professional',
    'other',
  ])
  category?: string;

  @IsIn([
    'jee',
    'neet',
    'upsc',
    'nda',
    'olympiad',
    'board_exam',
    'foundation',
    'skill',
    'other',
  ])
  target!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subjectIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  curriculumIds?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(['ai', 'human', 'hybrid'], { each: true })
  tutorTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(['chat', 'audio', 'video', 'offline', 'in_person'], { each: true })
  deliveryModes?: string[];

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'custom'])
  scheduleFrequency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sessionsPerWeek?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sessionDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxConcurrentSessions?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDevicesPerStudent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  includedAiMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  includedHumanTutorMinutes?: number;

  @IsOptional()
  @IsObject()
  eligibility?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  publiclyVisible?: boolean;
}

export class EnrollSubjectDto {
  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsIn(['subscription', 'one_time_purchase', 'free', 'promotional', 'admin'])
  accessSource?: string;

  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  proficiencyLevel?: string;

  @IsOptional()
  @IsString()
  learningGoal?: string;
}

export class CreateScheduleDto {
  @IsOptional()
  @IsIn([
    'ai_tutor',
    'live_class',
    'mentor_session',
    'assessment',
    'revision',
    'event',
  ])
  type?: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsIn(['scheduled_time_only', 'available_before_and_after', 'open_access'])
  accessRule?: string;

  @IsOptional()
  @IsNumber()
  earlyAccessMinutes?: number;

  @IsOptional()
  @IsNumber()
  lateAccessMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  reminderMinutesBefore?: number[];
}

export class RescheduleScheduleDto {
  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class CreateEntitlementDto {
  @IsMongoId()
  studentProfileId!: string;

  @IsIn([
    'subject_access',
    'ai_minutes',
    'scheduled_session',
    'assessment',
    'course_access',
  ])
  entitlementType!: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  scheduleId?: string;

  @IsOptional()
  @IsNumber()
  allocatedQuantity?: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  expiresAt!: string;
}

export class CreateAiTutorSessionDto {
  @IsMongoId()
  studentProfileId!: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsMongoId()
  scheduleId?: string;

  @IsOptional()
  @IsIn(['chat', 'audio', 'video'])
  deliveryMode?: string;
}

export class SendAiTutorMessageDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsIn(['text', 'question', 'answer', 'quiz', 'hint', 'explanation'])
  messageType?: string;
}

export class SendClassroomMessageDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsIn(['student', 'parent', 'tutor', 'ai', 'system'])
  senderRole?: string;

  @IsOptional()
  @IsIn(['text', 'file', 'whiteboard', 'system'])
  messageType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class AddClassroomFileDto {
  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsOptional()
  @IsString()
  originalName?: string;
}

export class CompleteClassroomSummaryDto {
  @IsString()
  summary!: string;

  @IsOptional()
  @IsIn(['present', 'late', 'absent', 'excused'])
  attendanceStatus?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  homework?: string[];
}

export class CreateQuestionBankDto {
  @IsString()
  name!: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsMongoId()
  topicId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['school', 'exam_prep', 'skill', 'diagnostic'])
  category?: string;
}

export class CreateQuestionDto {
  @IsMongoId()
  questionBankId!: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsMongoId()
  topicId?: string;

  @IsOptional()
  @IsIn(['mcq_single', 'mcq_multi', 'short_answer', 'long_answer', 'coding'])
  type?: string;

  @IsString()
  prompt!: string;

  @IsOptional()
  @IsArray()
  options?: Record<string, unknown>[];

  @IsOptional()
  @IsObject()
  answerKey?: Record<string, unknown>;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  points?: number;
}

export class CreateAssessmentDto {
  @IsString()
  title!: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  topicIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  questionIds?: string[];

  @IsOptional()
  @IsIn(['diagnostic', 'practice', 'homework', 'quiz', 'exam'])
  assessmentType?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  passingScorePercentage?: number;
}

export class StartAssessmentAttemptDto {
  @IsMongoId()
  studentProfileId!: string;

  @IsOptional()
  @IsMongoId()
  scheduleId?: string;
}

export class SubmitAssessmentAnswerDto {
  @IsMongoId()
  questionId!: string;

  @IsObject()
  response!: Record<string, unknown>;
}

export class UpsertTopicProgressDto {
  @IsMongoId()
  subjectId!: string;

  @IsMongoId()
  topicId!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  masteryPercentage!: number;

  @IsOptional()
  @IsNumber()
  practiceCount?: number;
}

export class CreateLearningRecommendationDto {
  @IsMongoId()
  studentProfileId!: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  topicId?: string;

  @IsIn(['topic_revision', 'assessment', 'ai_session', 'parent_review'])
  type!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;
}
