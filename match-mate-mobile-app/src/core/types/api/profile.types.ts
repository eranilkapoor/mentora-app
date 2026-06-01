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
  thumbnailUrl?: string | null;
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
  videoIntro?: ProfileImage | null;
}

export interface ProfileData {
  personal: PersonalData;
  physical: PhysicalData;
  education: EducationData;
  family: FamilyData;
  preferences: PreferencesData;
  images: ProfileImage[];
  videoIntro?: ProfileImage | null;
  profileScore?: number;
  profileCompletionPercentage?: number;
  summary?: {
    profileCompletionPercentage?: number;
    profileScore?: number;
    hasAboutMe?: boolean;
  };
  isPremium?: boolean;
  isVerified?: boolean;
  status?: string;
  lastActiveAt?: string | Date;
}
