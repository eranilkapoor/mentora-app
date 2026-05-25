import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum MatchFeedType {
  RECOMMENDED = 'recommended',
  NEW = 'new',
  NEARBY = 'nearby',
}

export class MatchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class NearbyQueryDto extends MatchQueryDto {
  @IsOptional()
  @Type(() => Number)
  radiusKm?: number = 100;
}
