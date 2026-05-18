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
  Max,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { Gender } from 'src/common/enums/gender.enum';
import { Eating } from 'src/common/enums/eating.enum';
import { Drinking } from 'src/common/enums/drinking.enum';
import { Smoking } from 'src/common/enums/smoking.enum';
import {
  BloodGroup,
  BodyType,
  Caste,
  Complexion,
  Country,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  Hour,
  ManglikStatus,
  MaritalStatus,
  Minute,
  OccupationType,
  ProfileFor,
  Qualification,
  Religion,
  SiblingType,
  TimePeriod,
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

export class TimeOfBirthDto {
  @IsOptional()
  @IsString()
  hour?: Hour;

  @IsOptional()
  @IsString()
  minute?: Minute;

  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;
}

export class PlaceOfBirthDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: Country;
}

export class PersonalDto {
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

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeOfBirthDto)
  timeOfBirth?: TimeOfBirthDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceOfBirthDto)
  placeOfBirth?: PlaceOfBirthDto;

  @IsOptional()
  @IsString()
  subCast?: string;

  @IsOptional()
  @IsString()
  gotra?: string;

  @IsOptional()
  @IsEnum(ManglikStatus)
  manglikStatus?: ManglikStatus;

  @IsOptional()
  @IsString()
  rashi?: string;

  @IsOptional()
  @IsString()
  nakshatra?: string;

  @IsOptional()
  @IsString()
  kundliFileUrl?: string;

  @IsEnum(Religion)
  religion!: Religion;

  @IsOptional()
  @IsString()
  caste?: Caste;

  @IsOptional()
  @IsEnum(Country)
  country?: Country;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  citizenship?: string;

  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsEnum(MaritalStatus)
  maritalStatus!: MaritalStatus;

  @IsOptional()
  @IsBoolean()
  hasChildren?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sonsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  daughtersCount?: number;

  @IsOptional()
  @IsEnum(Smoking)
  smoking?: Smoking;

  @IsOptional()
  @IsEnum(Drinking)
  drinking?: Drinking;

  @IsOptional()
  @IsEnum(Eating)
  eating?: Eating;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

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
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @IsOptional()
  @IsEnum(Complexion)
  complexion?: Complexion;

  @IsOptional()
  @IsBoolean()
  disabilityStatus?: boolean;

  @IsOptional()
  @IsString()
  disabilityNote?: string;
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

  @IsOptional()
  @IsEnum(OccupationType)
  occupationType?: OccupationType;

  @IsString()
  @IsNotEmpty()
  occupation!: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  jobRole?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualIncomeAmount?: number;
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

const parseJSON =
  <T>(cls: new () => T) =>
  ({ value }: { value: unknown }): T => {
    const parsed: unknown =
      typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(cls, parsed);
  };
export class CreateProfileDto {
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
  @IsOptional()
  @ValidateNested()
  @Type(() => FamilyDto)
  family?: FamilyDto;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) =>
    value !== undefined ? parseInt(String(value), 10) : 0,
  )
  primaryImageIndex?: number;
}
