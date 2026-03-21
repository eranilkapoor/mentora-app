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

  @IsOptional()
  siblings?: string;
}

class PreferencesDto {
  @IsOptional()
  partnerPreference?: string;

  @IsOptional()
  @IsArray()
  hobbies?: string[];

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  music?: string;

  @IsOptional()
  movies?: string;

  @IsOptional()
  sports?: string;

  @IsOptional()
  food?: string;

  @IsOptional()
  @IsArray()
  languagesKnown?: string[];

  @IsOptional()
  ageRange?: string;

  @IsOptional()
  heightRange?: string;

  @IsOptional()
  qualificationRequired?: string;

  @IsOptional()
  religionPref?: string;

  @IsOptional()
  castePref?: string;

  @IsOptional()
  locationPref?: string;

  @IsOptional()
  incomePref?: string;

  @IsOptional()
  otherPreferences?: string;
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