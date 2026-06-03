import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @MinLength(20)
  @MaxLength(4096)
  token!: string;

  @IsString()
  @MaxLength(120)
  deviceId!: string;

  @IsIn(['ios', 'android', 'web', 'unknown'])
  platform!: 'ios' | 'android' | 'web' | 'unknown';
}

export class RevokeDeviceTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  token?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceId?: string;
}
