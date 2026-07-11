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
  Min,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { Gender, Eating, Drinking, Smoking } from '@/common/enums';
import {
  BodyType,
  Caste,
  Complexion,
  Country,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  ManglikStatus,
  MaritalStatus,
  ProfileFor,
  Qualification,
  Religion,
  SiblingType,
} from '@/common/enums';

function isValidDateString(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

const normalizeCountryValue = (value: unknown): unknown =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/\s+/g, '_')
    : value;

const normalizeCountryTransform = ({ value }: { value: unknown }): unknown =>
  normalizeCountryValue(value);

const normalizeCountryArrayTransform = ({
  value,
}: {
  value: unknown;
}): unknown =>
  Array.isArray(value) ? value.map(normalizeCountryValue) : value;

export class BasicDto {
  @IsString()
  @IsNotEmpty()
  profileFor!: ProfileFor;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateOfBirth must be YYYY-MM-DD' })
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
  @Transform(normalizeCountryTransform)
  @IsEnum(Country)
  country?: Country;

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
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(Complexion)
  complexion?: Complexion;
}

export class EducationDto {
  @IsNotEmpty()
  @IsEnum(Qualification)
  qualification!: Qualification;

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

export class SiblingDetailDto {
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
  @Min(0)
  brothersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sistersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  marriedBrothersCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  marriedSistersCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SiblingDetailDto)
  details?: SiblingDetailDto[];

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

  @IsOptional()
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
  @IsString({ each: true })
  subCaste?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ManglikStatus, { each: true })
  manglikStatus?: ManglikStatus[];

  @IsOptional()
  @Transform(normalizeCountryArrayTransform)
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
