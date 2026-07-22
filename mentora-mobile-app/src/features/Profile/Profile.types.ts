import { AppNavigationProp } from '@/navigation/types';
import { Country, Gender, ProfileImage, ReligiousDetails } from '@/core/types';

export interface ProfileScreenProps {
  navigation: AppNavigationProp;
}

export interface SectionProps {
  titleKey: string;
  icon: string;
  children: React.ReactNode;
}

export interface RowProps {
  labelKey: string;
  value?: string | string[] | null;
}

export type PdfAction = 'download' | 'share';

export type Primitive = string | number | boolean | null | undefined;

export interface SchemaProfile {
  userId?: string;
  personal: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    religion?: string;
    religiousDetails?: ReligiousDetails;
    country?: Country;
    state?: string;
    city?: string;
    citizenship?: string;
    residencyCountry?: Country;
    motherTongue?: string;
    hobbies?: string[];
    personalityBadges?: string[];
    languages?: string[];
    languagesKnown?: string[];
    aboutMe?: string;
    gender?: Gender;
  };
  physical?: {
    accessibilityNeeds?: string[];
  };
  education?: {
    qualification?: string;
    field?: string;
    university?: string;
    occupation?: string;
    previousEducationSummary?: string;
    examScoreSummary?: string;
    coursePreference?: string;
    preferredSubjects?: string[];
  };
  family?: {
    fatherName?: string;
    motherName?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    guardianName?: string;
    guardianRelation?: string;
    primaryGuardianPhone?: string;
    primaryGuardianEmail?: string;
  };
  images?: ProfileImage[];
  videoIntro?: ProfileImage | null;
  age?: number;
  location?: { type?: 'Point'; coordinates?: [number, number] };
  profileScore?: number;
  profileCompletionPercentage?: number;
  missingFields?: string[];
  visibilityScore?: number;
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
