import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class TwoFactorCodeDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 10)
  code!: string;
}

export class TwoFactorVerifyDto {
  @IsMongoId()
  challengeId!: string;

  @IsOptional()
  @IsString()
  @Length(6, 10)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20)
  recoveryCode?: string;
}
