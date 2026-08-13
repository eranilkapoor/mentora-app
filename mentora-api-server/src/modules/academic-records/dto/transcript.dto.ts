import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

const TRANSCRIPT_TYPES = [
  'full_academic_history',
  'provisional',
  'migration',
  'custom',
] as const;

const TRANSCRIPT_STATUSES = ['draft', 'issued', 'revoked'] as const;

export class CreateTranscriptDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  studentId!: string;

  @IsOptional()
  @IsIn(TRANSCRIPT_TYPES)
  transcriptType?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  reportCardIds!: string[];

  @IsOptional()
  @IsString()
  purpose?: string;
}

export class UpdateTranscriptDto {
  @IsMongoId()
  organizationId!: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsIn(TRANSCRIPT_STATUSES)
  status?: string;
}

export class IssueTranscriptDto {
  @IsMongoId()
  organizationId!: string;
}
