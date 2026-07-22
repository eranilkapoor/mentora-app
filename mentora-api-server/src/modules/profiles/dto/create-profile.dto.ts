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
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import {
  Caste,
  Country,
  Gender,
  PersonalityBadge,
  Qualification,
  Religion,
} from '@/common/enums';

function isValidDateString(date: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  const isCalendarDate =
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day;
  if (!isCalendarDate) return false;

  const now = new Date();
  let age = now.getFullYear() - year;
  if (
    now.getMonth() < month - 1 ||
    (now.getMonth() === month - 1 && now.getDate() < day)
  ) {
    age -= 1;
  }
  return age >= 5 && age <= 100;
}

const normalizeCountryValue = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/\s+/g, '_')
    : value;

export class ReligiousDetailsDto {
  @IsOptional()
  @IsEnum(Caste)
  caste?: Caste;

  @IsOptional()
  @IsString()
  subCaste?: string;

  @IsOptional()
  @IsString()
  gotra?: string;

  @IsOptional()
  @IsString()
  rashi?: string;

  @IsOptional()
  @IsString()
  nakshatra?: string;

  @IsOptional()
  @IsString()
  sect?: string;

  @IsOptional()
  @IsString()
  subSect?: string;

  @IsOptional()
  @IsString()
  community?: string;

  @IsOptional()
  @IsString()
  maslak?: string;

  @IsOptional()
  @IsString()
  namaazPracticing?: string;

  @IsOptional()
  @IsString()
  hijabPreference?: string;

  @IsOptional()
  @IsBoolean()
  halalLifestyle?: boolean;

  @IsOptional()
  @IsString()
  denomination?: string;

  @IsOptional()
  @IsString()
  churchName?: string;

  @IsOptional()
  @IsString()
  churchAttendance?: string;

  @IsOptional()
  @IsString()
  baptismStatus?: string;

  @IsOptional()
  @IsString()
  confirmationStatus?: string;

  @IsOptional()
  @IsBoolean()
  bornAgain?: boolean;

  @IsOptional()
  @IsString()
  sikhCommunity?: string;

  @IsOptional()
  @IsString()
  amritdhariStatus?: string;

  @IsOptional()
  @IsBoolean()
  wearsTurban?: boolean;

  @IsOptional()
  @IsString()
  nativeVillage?: string;

  @IsOptional()
  @IsString()
  gurudwaraName?: string;

  @IsOptional()
  @IsString()
  jainSect?: string;

  @IsOptional()
  @IsString()
  jainCommunity?: string;

  @IsOptional()
  @IsString()
  foodStrictness?: string;

  @IsOptional()
  @IsString()
  buddhistTradition?: string;

  @IsOptional()
  @IsString()
  buddhistCommunity?: string;

  @IsOptional()
  @IsString()
  jewishDenomination?: string;

  @IsOptional()
  @IsString()
  jewishCommunity?: string;

  @IsOptional()
  @IsString()
  kosherPractice?: string;

  @IsOptional()
  @IsString()
  parsiCommunity?: string;

  @IsOptional()
  @IsBoolean()
  navjoteDone?: boolean;

  @IsOptional()
  @IsString()
  fireTempleAssociation?: string;

  @IsOptional()
  @IsString()
  otherReligionDetails?: string;
}

export class PersonalDto {
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
    name: 'isEligibleDateOfBirth',
    validator: {
      validate: (value: string) => isValidDateString(value),
    },
  })
  dateOfBirth!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReligiousDetailsDto)
  religiousDetails?: ReligiousDetailsDto;

  @IsEnum(Religion)
  religion!: Religion;

  @IsOptional()
  @Transform(normalizeCountryValue)
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
  isNri?: boolean;

  @IsOptional()
  @Transform(normalizeCountryValue)
  @IsEnum(Country)
  residencyCountry?: Country;

  @IsOptional()
  @IsString()
  visaStatus?: string;

  @IsOptional()
  @IsString()
  abroadSince?: string;

  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(10)
  @IsEnum(PersonalityBadge, { each: true })
  personalityBadges?: PersonalityBadge[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  aboutMe?: string;
}

export class PhysicalDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibilityNeeds?: string[];
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
  previousEducationSummary?: string;

  @IsOptional()
  @IsString()
  examScoreSummary?: string;

  @IsOptional()
  @IsString()
  coursePreference?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredSubjects?: string[];
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
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianRelation?: string;

  @IsOptional()
  @IsString()
  primaryGuardianPhone?: string;

  @IsOptional()
  @IsString()
  primaryGuardianEmail?: string;
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
