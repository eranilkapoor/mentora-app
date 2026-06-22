import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'atLeastOneUserStatusField', async: false })
class AtLeastOneUserStatusFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const value = args.object as UpdateUserStatusDto;
    return value.isBlocked !== undefined || value.isVerified !== undefined;
  }

  defaultMessage(): string {
    return 'Either isBlocked or isVerified must be provided';
  }
}

export class UpdateUserStatusDto {
  @IsMongoId()
  userId!: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiHideProperty()
  @Validate(AtLeastOneUserStatusFieldConstraint)
  private readonly _statusSelection?: boolean;
}
