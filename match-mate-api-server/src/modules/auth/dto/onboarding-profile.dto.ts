import {
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { Gender } from 'src/common/enums/gender.enum';
import { MaritalStatus } from 'src/common/enums/marital-status.enum';
import { Diet } from 'src/common/enums/diet.enum';
import { Drinking } from 'src/common/enums/drinking.enum';
import { Smoking } from 'src/common/enums/smoking.enum';

export class PersonalDto {
  @IsString()
  @IsNotEmpty()
  profileFor!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  @IsNotEmpty()
  religion!: string;

  @IsOptional()
  @IsString()
  caste?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @IsOptional()
  @IsString()
  aboutMe?: string;
}

export class PhysicalDto {
  @Type(() => Number)
  @IsNumber()
  height!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  complexion?: string;
}

export class EducationDto {
  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  university?: string;

  @IsString()
  @IsNotEmpty()
  occupation!: string;

  @IsOptional()
  @IsString()
  annualIncome?: string;
}

class SiblingDetail {
  @IsNotEmpty()
  @IsEnum(['brother', 'sister'], {
    message: 'Type must be either brother or sister',
  })
  type!: 'brother' | 'sister';

  @IsBoolean()
  @IsNotEmpty()
  married!: boolean;

  @IsOptional()
  @IsString()
  occupation?: string;
}

export class SiblingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brothers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sisters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marriedBrothers?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marriedSisters?: number;

  @IsOptional()
  details?: SiblingDetail[];

  @IsOptional()
  @IsString()
  note?: string;
}

export class FamilyDto {
  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  @IsOptional()
  @IsString()
  motherOccupation?: string;

  @IsOptional()
  @IsString()
  familyType?: string;

  @IsOptional()
  @IsString()
  familyStatus?: string;

  @IsOptional()
  @IsString()
  familyValues?: string;

  @ValidateNested()
  @Type(() => SiblingsDto)
  siblings?: SiblingsDto;
}

export class RangeDto {
  @Type(() => Number)
  @IsNumber()
  min!: number;

  @Type(() => Number)
  @IsNumber()
  max!: number;
}

class PartnerPreferenceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  ageRange?: RangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  heightRange?: RangeDto;

  @IsOptional()
  @IsArray()
  @IsEnum(MaritalStatus, { each: true })
  maritalStatus?: MaritalStatus[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  religion?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caste?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  country?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  state?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  qualification?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occupation?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  annualIncomeRange?: RangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bodyType?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complexion?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(Smoking, { each: true })
  smoking?: Smoking[];

  @IsOptional()
  @IsArray()
  @IsEnum(Drinking, { each: true })
  drinking?: Drinking[];

  @IsOptional()
  @IsArray()
  @IsEnum(Diet, { each: true })
  diet?: Diet[];

  @IsOptional()
  @IsArray()
  @IsEnum(Smoking, { each: true })
  languagesKnown?: string[];

  @IsOptional()
  @IsString()
  aboutPartner?: string;

  @IsOptional()
  isStrict?: boolean;
}

export class PreferencesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerPreferenceDto)
  partnerPreference?: PartnerPreferenceDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsEnum(Smoking)
  smoking?: Smoking;

  @IsOptional()
  @IsEnum(Drinking)
  drinking?: Drinking;

  @IsOptional()
  @IsEnum(Diet)
  diet?: Diet;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  music?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  movies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sports?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesKnown?: string[];
}

const parseJSON =
  <T>(cls: new () => T) =>
  ({ value }: { value: unknown }): T => {
    const parsed: unknown =
      typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(cls, parsed);
  };
export class OnboardingProfileDto {
  @Transform(parseJSON(PersonalDto))
  @ValidateNested()
  @Type(() => PersonalDto)
  personal!: PersonalDto;

  @Transform(parseJSON(PhysicalDto))
  @ValidateNested()
  @Type(() => PhysicalDto)
  physical!: PhysicalDto;

  @Transform(parseJSON(EducationDto))
  @ValidateNested()
  @Type(() => EducationDto)
  education!: EducationDto;

  @Transform(parseJSON(FamilyDto))
  @ValidateNested()
  @Type(() => FamilyDto)
  family!: FamilyDto;

  @Transform(parseJSON(PreferencesDto))
  @IsOptional()
  @ValidateNested()
  @Type(() => PreferencesDto)
  preferences?: PreferencesDto;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    value !== undefined ? parseInt(String(value), 10) : 0,
  )
  primaryImageIndex?: number;
}
