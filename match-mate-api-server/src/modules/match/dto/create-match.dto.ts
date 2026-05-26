import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  userId!: string;

  @IsString()
  matchedUserId!: string;

  @IsOptional()
  @IsBoolean()
  isAccepted?: boolean;
}
