import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const EXAM_TYPES = [
  'unit_test',
  'midterm',
  'final_term',
  'board',
  'entrance',
  'mock',
  'other',
] as const;

const EXAM_STATUSES = [
  'scheduled',
  'ongoing',
  'completed',
  'results_published',
  'cancelled',
] as const;

export class CreateExamDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsIn(EXAM_TYPES)
  examType?: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsMongoId()
  gradeId?: string;

  @IsOptional()
  @IsMongoId()
  academicSessionId?: string;

  @IsDateString()
  examDate!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingMarks?: number;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsMongoId()
  invigilatorUserId?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}

export class UpdateExamDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(EXAM_TYPES)
  examType?: string;

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingMarks?: number;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsMongoId()
  invigilatorUserId?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsIn(EXAM_STATUSES)
  status?: string;
}

export class ExamResultEntryDto {
  @IsMongoId()
  studentId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marksObtained?: number;

  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class RecordExamResultsDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamResultEntryDto)
  results!: ExamResultEntryDto[];
}
