import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  PersonalDto,
  PhysicalDto,
  EducationDto,
  FamilyDto,
} from './create-profile.dto';

export class UpdateProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PersonalDto)
  personal?: Partial<PersonalDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => PhysicalDto)
  physical?: Partial<PhysicalDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationDto)
  education?: Partial<EducationDto>;

  @IsOptional()
  @ValidateNested()
  @Type(() => FamilyDto)
  family?: Partial<FamilyDto>;

  // Allow passing through arbitrary derived fields from service
  [key: string]: unknown;
}
