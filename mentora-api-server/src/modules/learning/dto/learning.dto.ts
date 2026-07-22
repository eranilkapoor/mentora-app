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
