import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  IsBoolean,
  Matches,
  ValidateBy,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { Gender } from 'src/common/enums/gender.enum';
import { Eating } from 'src/common/enums/eating.enum';
import { Drinking } from 'src/common/enums/drinking.enum';
import { Smoking } from 'src/common/enums/smoking.enum';
import {
  BodyType,
  Caste,
  Complexion,
  Country,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  MaritalStatus,
  Qualification,
  Religion,
  SiblingType,
} from 'src/common/enums';

function isValidDateString(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

export class BasicDto {
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

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @ValidateBy({
    name: 'isValidDate',
    validator: {
      validate: (value: string) => isValidDateString(value),
    },
  })
  dateOfBirth!: string;

  @IsEnum(Religion)
  religion!: Religion;

  @IsOptional()
  @IsString()
  country?: string;

  @IsEnum(MaritalStatus)
  maritalStatus!: MaritalStatus;

  @Type(() => Number)
  @IsNumber()
  height!: number;

  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @IsString()
  @IsNotEmpty()
  occupation!: string;
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
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(Complexion)
  complexion?: Complexion;
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
  @IsEnum(SiblingType, {
    message: 'Type must be either brother or sister',
  })
  type!: SiblingType;

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
  brothersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sistersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marriedBrothersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  marriedSistersCount?: number;

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
  @IsEnum(FamilyType)
  familyType?: FamilyType;

  @IsOptional()
  @IsEnum(FamilyStatus)
  familyStatus?: FamilyStatus;

  @IsOptional()
  @IsEnum(FamilyValue)
  familyValues?: FamilyValue;

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

export class PreferencesDto {
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
  @IsEnum(Religion, { each: true })
  religion?: Religion[];

  @IsOptional()
  @IsArray()
  @IsEnum(Caste, { each: true })
  caste?: Caste[];

  @IsOptional()
  @IsArray()
  @IsEnum(Country, { each: true })
  country?: Country[];

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
  @IsEnum(Qualification, { each: true })
  qualification?: Qualification[];

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
  @IsEnum(BodyType, { each: true })
  bodyType?: BodyType[];

  @IsOptional()
  @IsArray()
  @IsEnum(Complexion, { each: true })
  complexion?: Complexion[];

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
  @IsEnum(Eating, { each: true })
  eating?: Eating[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languagesKnown?: string[];

  @IsOptional()
  @IsString()
  aboutPartner?: string;

  @IsOptional()
  isStrict?: boolean;
}

const parseJSON =
  <T>(cls: new () => T) =>
  ({ value }: { value: unknown }): T => {
    const parsed: unknown =
      typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(cls, parsed);
  };
export class OnboardingProfileDto {
  @Transform(parseJSON(BasicDto))
  @ValidateNested()
  @Type(() => BasicDto)
  basic!: BasicDto;

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
