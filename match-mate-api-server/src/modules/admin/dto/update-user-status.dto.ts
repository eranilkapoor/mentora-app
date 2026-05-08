import { IsBoolean, IsMongoId, IsOptional, ValidateIf } from 'class-validator';

export class UpdateUserStatusDto {
  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  // At least one of the two must be present
  @ValidateIf(
    (o: UpdateUserStatusDto) =>
      o.isBlocked === undefined && o.isVerified === undefined,
  )
  _atLeastOne?: never;
}
