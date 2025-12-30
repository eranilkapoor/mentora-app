import { PartialType } from '@nestjs/mapped-types';
import { OnboardingProfileDto } from './onboarding-profile.dto';

export class UpdateProfileDto extends PartialType(OnboardingProfileDto) {}
