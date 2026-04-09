import { IsMongoId, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsEnum(['MATCH', 'CHAT', 'SYSTEM', 'PAYMENT'])
  type?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
