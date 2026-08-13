import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

const STAFF_ATTENDANCE_STATUSES = [
  'present',
  'absent',
  'late',
  'half_day',
  'on_leave',
  'work_from_home',
] as const;

const ATTENDANCE_METHODS = [
  'manual',
  'biometric',
  'rfid',
  'qr',
  'self',
] as const;

export class CreateStaffAttendanceDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsDateString()
  date!: string;

  @IsIn(STAFF_ATTENDANCE_STATUSES)
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

export class UpdateStaffAttendanceDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsIn(STAFF_ATTENDANCE_STATUSES)
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
