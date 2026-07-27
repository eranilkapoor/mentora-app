import {
  IsDateString,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsMongoId()
  tenantId!: string;

  @IsIn(['lead', 'application', 'student', 'payment', 'campaign', 'general'])
  entityType!: string;

  @IsMongoId()
  entityId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  assignedTo!: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;
}
