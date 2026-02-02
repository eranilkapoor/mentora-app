import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class OnboardingProfileDto {
  /* BASIC */
  @IsNotEmpty()
  profile_for: string;

  @IsNotEmpty()
  first_name: string;

  @IsOptional()
  last_name?: string;

  @IsNotEmpty()
  gender: string;

  @IsDateString()
  dob: string;

  /* LOCATION */
  @IsOptional()
  country?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  city?: string;

  /* MATRIMONIAL */
  @IsNotEmpty()
  religion: string;

  @IsOptional()
  caste?: string;

  @IsOptional()
  language?: string;

  @IsNotEmpty()
  education: string;

  @IsOptional()
  education_area?: string;

  @IsOptional()
  college?: string;

  @IsNotEmpty()
  profession: string;

  @IsOptional()
  income?: string;

  @IsNotEmpty()
  marital_status: string;

  /* PHYSICAL */
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  body_type?: string;

  @IsOptional()
  complexion?: string;

  @IsOptional()
  blood_group?: string;

  /* FAMILY */
  @IsOptional()
  father_name?: string;

  @IsOptional()
  mother_name?: string;

  @IsOptional()
  father_occupation?: string;

  @IsOptional()
  mother_occupation?: string;

  @IsOptional()
  family_status?: string;

  @IsOptional()
  family_type?: string;

  @IsOptional()
  family_values?: string;

  @IsOptional()
  no_of_siblings?: string;
}
