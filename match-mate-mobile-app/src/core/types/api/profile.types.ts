import {
  PersonalData,
  PhysicalData,
  EducationData,
  FamilyData,
  PreferencesData,
} from './../../types/index';

export interface ProfileImage {
  _id?: string | undefined;
  url: string;
  thumbnailUrl?: string | null | undefined;
  isBlurred?: boolean | undefined;
  blurReason?: string | undefined;
  isPrimary?: boolean | undefined;
  isActive?: boolean | undefined;
  filename?: string | undefined;
  mimeType?: string | undefined;
  size?: number | undefined;
  uploadedAt?: Date | undefined;
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
  visibilityScore?: number;
  summary?: {
    profileCompletionPercentage?: number;
    profileScore?: number;
    hasAboutMe?: boolean;
  };
  isPremium?: boolean;
  verification?: {
    status: 'not_started' | 'pending' | 'approved' | 'rejected';
    provider?: 'manual' | 'aadhaar' | 'digilocker' | 'liveness';
    verifiedAt?: string | Date;
  };
  accountVerification?: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  status?: string;
  lastActiveAt?: string | Date;
}
