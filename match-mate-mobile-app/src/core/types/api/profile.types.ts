import {
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
} from './../../types/index';

export interface ProfileImage {
  _id?: string;
  url: string;
  isPrimary?: boolean;
  isActive?: boolean;
  filename?: string;
  mimeType?: string;
  size?: number;
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
  religion: string;
  caste: string;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
  images: ProfileImage[];
  profileScore?: number;
  profileCompletionPercentage?: number;
  isPremium?: boolean;
  isVerified?: boolean;
  status?: string;
  lastActiveAt?: string | Date;
}
