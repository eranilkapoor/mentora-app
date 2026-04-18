import { IsMongoId, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @IsMongoId()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsEnum([
    'info',
    'success',
    'warning',
    'error',
    'match',
    'chat',
    'system',
    'payment',
  ])
  type?:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'match'
    | 'chat'
    | 'system'
    | 'payment';

  @IsOptional()
  metadata?: Record<string, any>;
}
