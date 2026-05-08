import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BodyType,
  Caste,
  Complexion,
  Diet,
  Drinking,
  ManglikStatus,
  MaritalStatus,
  OccupationType,
  Religion,
  Smoking,
} from 'src/common/enums';
import { ChildPreference, ResidencyPreference } from 'src/common/enums';

export class RangeDto {
  @Type(() => Number)
  @IsNumber()
  min!: number;

  @Type(() => Number)
  @IsNumber()
  max!: number;
}

export class PartnerFiltersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  age?: RangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  heightCm?: RangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeDto)
  annualIncome?: RangeDto;

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
  @IsEnum(ChildPreference)
  childPreference?: ChildPreference;

  @IsOptional()
  @IsEnum(ResidencyPreference)
  residencyPreference?: ResidencyPreference;

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
  @IsEnum(OccupationType, { each: true })
  occupationType?: OccupationType[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occupation?: string[];

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
  @IsEnum(Diet, { each: true })
  diet?: Diet[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

export class MatchSettingsDto {
  @IsOptional()
  @IsBoolean()
  isStrict?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPartialMatches?: boolean;

  @IsOptional()
  @IsBoolean()
  horoscopeRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  profileVerificationRequired?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minimumMatchScore?: number;
}

export class MatchWeightsDto {
  @IsOptional() @IsNumber() @Min(0) @Max(30) age?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) height?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) religion?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) caste?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) location?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) education?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) occupation?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) lifestyle?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(30) horoscope?: number;
}

export class UpdateAboutPartnerDto {
  @IsString()
  aboutPartner!: string;
}

export class UpdatePreferenceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PartnerFiltersDto)
  filters?: PartnerFiltersDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchSettingsDto)
  settings?: MatchSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MatchWeightsDto)
  weights?: MatchWeightsDto;

  @IsOptional()
  @IsString()
  aboutPartner?: string;
}
