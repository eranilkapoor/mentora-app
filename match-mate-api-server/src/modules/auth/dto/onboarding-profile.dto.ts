import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';

class PersonalDto {
  @IsNotEmpty()
  profileFor: string;

  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  gender: Gender;

  @IsDateString()
  dob: string;

  @IsNotEmpty()
  religion: string;

  @IsOptional()
  caste?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  state?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  motherTongue?: string;

  @IsOptional()
  maritalStatus: MaritalStatus;

  @IsOptional()
  aboutMe?: string;
}

class PhysicalDto {
  @IsNotEmpty()
  @IsNumber()
  height: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  bodyType?: string;

  @IsOptional()
  complexion?: string;
}

class EducationDto {
  @IsNotEmpty()
  qualification: string;

  @IsOptional()
  field?: string;

  @IsOptional()
  university?: string;

  @IsNotEmpty()
  occupation: string;

  @IsOptional()
  annualIncome?: string;
}

class SiblingsDto {
  @IsOptional()
  brothers?: number;

  @IsOptional()
  sisters?: number;

  @IsOptional()
  marriedBrothers?: number;

  @IsOptional()
  marriedSisters?: number;
}

class FamilyDto {
  @IsOptional()
  fatherName?: string;

  @IsOptional()
  motherName?: string;

  @IsOptional()
  fatherOccupation?: string;

  @IsOptional()
  motherOccupation?: string;

  @IsOptional()
  familyType?: string;

  @IsOptional()
  familyStatus?: string;

  @IsOptional()
  familyValues?: string;

  @ValidateNested()
  @Type(() => SiblingsDto)
  siblings?: SiblingsDto;
}

class PartnerPreferenceDto {
  @IsOptional()
  ageRange?: {
    min: number;
    max: number;
  };

  @IsOptional()
  heightRange?: {
    min: number;
    max: number;
  };

  @IsOptional()
  @IsArray()
  maritalStatus?: MaritalStatus[];

  @IsOptional()
  @IsArray()
  religion?: string[];

  @IsOptional()
  @IsArray()
  caste?: string[];

  @IsOptional()
  @IsArray()
  country?: string[];

  @IsOptional()
  @IsArray()
  state?: string[];

  @IsOptional()
  @IsArray()
  city?: string[];

  @IsOptional()
  @IsArray()
  qualification?: string[];

  @IsOptional()
  @IsArray()
  occupation?: string[];

  @IsOptional()  
  annualIncomeRange?: {
    min: number;
    max: number;
  };

  @IsOptional()
  bodyType?: string[];

  @IsOptional()
  complexion?: string[];
  
  @IsOptional()
  smoking?: string[];

  @IsOptional()
  drinking?: string[];

  @IsOptional()
  diet?: string[];

  @IsOptional()
  languagesKnown?: string[];

  @IsOptional()
  aboutPartner?: string;
}

class PreferencesDto {
  @ValidateNested()
  @Type(() => PartnerPreferenceDto)
  partnerPreference?: PartnerPreferenceDto;

  @IsOptional()
  @IsArray()
  hobbies?: string[];

  @IsOptional()
  smoking?: string;

  @IsOptional()
  drinking?: string;

  @IsOptional()
  diet?: string;

  @IsOptional()
  @IsArray()
  music?: string[];

  @IsOptional()
  @IsArray()
  movies?: string[];

  @IsOptional()
  @IsArray()
  sports?: string[];

  @IsOptional()
  @IsArray()
  languagesKnown?: string[];
}

export class OnboardingProfileDto {
  @ValidateNested()
  @Type(() => PersonalDto)
  personal: PersonalDto;

  @ValidateNested()
  @Type(() => PhysicalDto)
  physical: PhysicalDto;

  @ValidateNested()
  @Type(() => EducationDto)
  education: EducationDto;

  @ValidateNested()
  @Type(() => FamilyDto)
  family: FamilyDto;

  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences: PreferencesDto;
}