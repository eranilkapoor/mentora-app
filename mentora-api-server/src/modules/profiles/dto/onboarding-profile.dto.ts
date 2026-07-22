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
import { Gender } from '@/common/enums';
import { Country, Qualification, Religion } from '@/common/enums';

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

const normalizeCountryValue = (value: unknown): unknown =>
  typeof value === 'string'
    ? value.trim().toLowerCase().replace(/\s+/g, '_')
    : value;

const normalizeCountryTransform = ({ value }: { value: unknown }): unknown =>
  normalizeCountryValue(value);

export class BasicDto {
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

  @IsEnum(Religion)
  religion!: Religion;

  @IsOptional()
  @Transform(normalizeCountryTransform)
  @IsEnum(Country)
  country?: Country;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  @IsNotEmpty()
  qualification!: string;

  @IsString()
  @IsNotEmpty()
  gradeLevel!: string;

  @IsString()
  @IsNotEmpty()
  institutionName!: string;

  @IsString()
  @IsNotEmpty()
  primaryGoal!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessibilityNeeds?: string[];
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
  annualIncome?: string;
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
  dailySessionMinutes?: RangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  gradeRange?: RangeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  learningGoals?: string[];

  @IsOptional()
  @IsString()
  preferredTutorMode?: 'ai' | 'human' | 'hybrid';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDeliveryModes?: string[];

  @IsOptional()
  @IsString()
  learningPace?: 'guided' | 'balanced' | 'accelerated';

  @IsOptional()
  @IsNumber()
  weeklyStudyMinutes?: number;

  @IsOptional()
  @IsString()
  parentDigestFrequency?: 'after_each_session' | 'daily' | 'weekly' | 'monthly';

  @IsOptional()
  @IsBoolean()
  parentalApprovalRequired?: boolean;
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
