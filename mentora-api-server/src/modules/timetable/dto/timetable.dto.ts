import {
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateTimetableDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsMongoId()
  branchId?: string;

  @IsMongoId()
  subjectId!: string;

  @IsOptional()
  @IsMongoId()
  gradeId?: string;

  @IsOptional()
  @IsString()
  sectionLabel?: string;

  @IsOptional()
  @IsString()
  roomLabel?: string;

  @IsMongoId()
  staffUserId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm format' })
  endTime!: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsMongoId()
  academicSessionId?: string;
}

export class UpdateTimetableDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  sectionLabel?: string;

  @IsOptional()
  @IsString()
  roomLabel?: string;

  @IsOptional()
  @IsMongoId()
  staffUserId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsIn(['active', 'cancelled'])
  status?: string;
}
