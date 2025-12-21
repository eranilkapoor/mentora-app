import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class MatchDto {
  @IsString() userId: string;
  @IsString() matchedUserId: string;
  @IsOptional() @IsBoolean() isAccepted?: boolean;
}