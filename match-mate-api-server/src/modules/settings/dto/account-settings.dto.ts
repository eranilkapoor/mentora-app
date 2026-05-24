import { IsEmail, IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class DeactivateAccountDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ConnectLinkedAccountDto {
  @IsIn(['google', 'facebook', 'apple'])
  provider!: string;
}

export class RequestEmailChangeDto {
  @IsEmail()
  email!: string;
}

export class RequestPhoneChangeDto {
  @IsString()
  countryCode!: string;

  @IsString()
  @Matches(/^\d{6,15}$/)
  phone!: string;
}
