import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class ValidateCouponDto {
  @IsMongoId()
  planId!: string;

  @IsString()
  @MaxLength(40)
  code!: string;
}
