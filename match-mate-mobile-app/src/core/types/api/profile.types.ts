import {
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
} from './../../types/index';

export interface ProfileImage {
  url: string;
  isPrimary?: boolean;
  isActive?: boolean;
  uploadedAt?: Date;
}

export interface OnboardingProfileRequest {
  personal: PersonalData;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
  images: ProfileImage[];
}

export interface ProfileData {
  personal: PersonalData;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
  images: ProfileImage[];
}
