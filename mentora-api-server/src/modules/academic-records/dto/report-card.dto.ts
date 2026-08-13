import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

const REPORT_CARD_STATUSES = ['draft', 'published', 'revised'] as const;

export class ReportCardSubjectEntryDto {
  @IsMongoId()
  subjectId!: string;

  @IsString()
  subjectName!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marksObtained?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMarks?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateReportCardDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  studentId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  academicSessionId?: string;

  @IsOptional()
  @IsMongoId()
  gradeId?: string;

  @IsString()
  term!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReportCardSubjectEntryDto)
  subjects!: ReportCardSubjectEntryDto[];

  @IsOptional()
  @IsNumber()
  attendancePercentage?: number;

  @IsOptional()
  @IsString()
  overallGrade?: string;

  @IsOptional()
  @IsString()
  teacherRemarks?: string;

  @IsOptional()
  @IsString()
  principalRemarks?: string;
}

export class UpdateReportCardDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportCardSubjectEntryDto)
  subjects?: ReportCardSubjectEntryDto[];

  @IsOptional()
  @IsString()
  overallGrade?: string;

  @IsOptional()
  @IsString()
  teacherRemarks?: string;

  @IsOptional()
  @IsString()
  principalRemarks?: string;

  @IsOptional()
  @IsNumber()
  rank?: number;

  @IsOptional()
  @IsIn(REPORT_CARD_STATUSES)
  status?: string;
}

export class GenerateReportCardDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  studentId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  // Report-card "term" is caller-defined; exams are rolled up by
  // academicSessionId, so pass one academic session per term.
  @IsOptional()
  @IsMongoId()
  academicSessionId?: string;

  @IsOptional()
  @IsMongoId()
  gradeId?: string;

  @IsString()
  term!: string;

  @IsOptional()
  @IsDateString()
  attendanceDateFrom?: string;

  @IsOptional()
  @IsDateString()
  attendanceDateTo?: string;

  @IsOptional()
  @IsString()
  teacherRemarks?: string;
}
