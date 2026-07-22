import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AnalyticsEventType,
  AnalyticsFunnelStage,
  AnalyticsPlatform,
} from '../enums/analytics-event.enum';

export class TrackEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userId?: string;

  @IsEnum(AnalyticsEventType)
  eventType!: AnalyticsEventType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  sessionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profileId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  matchId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  chatId?: string;

  @IsOptional()
  @IsEnum(AnalyticsFunnelStage)
  funnelStage?: AnalyticsFunnelStage;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  medium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  screen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationMs?: number;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  appVersion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ipAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(AnalyticsPlatform)
  platform?: AnalyticsPlatform;
}
