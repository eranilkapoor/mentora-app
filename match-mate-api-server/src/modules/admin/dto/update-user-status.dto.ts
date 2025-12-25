import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  userId: string;

  @IsBoolean()
  isBlocked: boolean;

  @IsBoolean()
  isVerified: boolean;
}
