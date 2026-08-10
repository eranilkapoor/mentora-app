import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

const PROGRAM_LEVELS = [
  'school',
  'undergraduate',
  'postgraduate',
  'diploma',
  'certificate',
  'competitive_exam',
  'skill_course',
];

export class CreateProgramDto {
  @IsMongoId()
  organizationId!: string;

  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsIn(PROGRAM_LEVELS)
  level?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  intakeCapacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seatsAvailable?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive'])
  status?: string;
}

export class UpdateProgramDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(PROGRAM_LEVELS)
  level?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsString()
  eligibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  intakeCapacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seatsAvailable?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  feeAmount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'inactive', 'archived'])
  status?: string;
}

export class BulkUpdateProgramStatusDto {
  @IsMongoId()
  organizationId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  recordIds!: string[];

  @IsIn(['active', 'draft', 'inactive', 'archived'])
  status!: string;
}
