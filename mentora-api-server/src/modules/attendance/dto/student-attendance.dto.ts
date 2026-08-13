import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const STUDENT_ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'half_day',
  'excused',
  'on_leave',
] as const;

const ATTENDANCE_METHODS = [
  'manual',
  'biometric',
  'rfid',
  'qr',
  'self',
] as const;

export class CreateStudentAttendanceDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  studentId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  timetableId?: string;

  @IsDateString()
  date!: string;

  @IsIn(STUDENT_ATTENDANCE_STATUSES)
  status!: string;

  @IsOptional()
  @IsIn(ATTENDANCE_METHODS)
  method?: string;

  @IsOptional()
  @IsDateString()
  checkInTime?: string;

  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class StudentAttendanceEntryDto {
  @IsMongoId()
  studentId!: string;

  @IsIn(STUDENT_ATTENDANCE_STATUSES)
  status!: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkMarkStudentAttendanceDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsOptional()
  @IsMongoId()
  timetableId?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsIn(ATTENDANCE_METHODS)
  method?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceEntryDto)
  entries!: StudentAttendanceEntryDto[];
}

export class UpdateStudentAttendanceDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(STUDENT_ATTENDANCE_STATUSES)
  status?: string;

  @IsOptional()
  @IsDateString()
  checkInTime?: string;

  @IsOptional()
  @IsDateString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
