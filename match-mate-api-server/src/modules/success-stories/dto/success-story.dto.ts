import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  SUCCESS_STORY_STATUSES,
  SuccessStoryStatus,
} from '../success-story.constants';

export class SubmitSuccessStoryDto {
  @IsString()
  @MinLength(4)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(100)
  @MaxLength(5000)
  story!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  partnerName!: string;

  @IsDateString()
  marriageDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  photoUrls?: string[];

  @IsBoolean()
  publicationConsent!: boolean;
}

export class ListSuccessStoriesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class AdminListSuccessStoriesDto extends ListSuccessStoriesDto {
  @IsOptional()
  @IsEnum(SUCCESS_STORY_STATUSES)
  status?: SuccessStoryStatus;
}

export class ReviewSuccessStoryDto {
  @IsEnum(['published', 'rejected', 'archived'])
  status!: Extract<SuccessStoryStatus, 'published' | 'rejected' | 'archived'>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
