import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class OnboardingProfileDto {
  /* BASIC */
  @IsNotEmpty()
  first_name: string;

  @IsOptional()
  last_name?: string;

  @IsNotEmpty()
  gender: string;

  @IsDateString()
  dob: string;

  /* LOCATION */
  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  city: string;

  /* MATRIMONIAL */
  @IsOptional()
  religion?: string;

  @IsOptional()
  caste?: string;

  @IsOptional()
  language?: string;

  @IsOptional()
  education?: string;

  @IsOptional()
  profession?: string;

  @IsOptional()
  income?: string;

  @IsOptional()
  marital_status?: string;

  /* PHYSICAL */
  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;
}
