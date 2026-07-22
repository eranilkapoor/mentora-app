import { AppNavigationProp } from '@/navigation/types';
import {
  Country,
  DrinkingHabit,
  EatingHabit,
  Gender,
  Hour,
  MaritalStatus,
  Minute,
  Period,
  ProfileFor,
  ProfileImage,
  ReligiousDetails,
  SmokingHabit,
} from '@/core/types';

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

export interface SiblingDisplayItem {
  type: string;
  maritalStatus: string;
  occupation: string;
}

export type PdfAction = 'download' | 'share';

export type Primitive = string | number | boolean | null | undefined;

// ─── Schema type lives here — not inline in the screen ───────────────────────

export interface SchemaProfile {
  userId?: string;
  profileFor?: ProfileFor;
  personal: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    timeOfBirth?: { hour?: Hour; minute?: Minute; period?: Period };
    placeOfBirth?: { city?: string; state?: string; country?: Country };
    religion?: string;
    religiousDetails?: ReligiousDetails;
    country?: Country;
    state?: string;
    city?: string;
    citizenship?: string;
    isNri?: boolean;
    residencyCountry?: Country;
    visaStatus?: string;
    abroadSince?: string;
    willingToRelocate?: boolean;
    motherTongue?: string;
    maritalStatus?: MaritalStatus;
    hasChildren?: boolean;
    sonsCount?: number;
    daughtersCount?: number;
    smoking?: SmokingHabit;
    drinking?: DrinkingHabit;
    eating?: EatingHabit;
    hobbies?: string[];
    personalityBadges?: string[];
    languages?: string[];
    languagesKnown?: string[];
    aboutMe?: string;
    gender?: Gender;
  };
  physical: {
    height?: string | number;
    weight?: string | number;
    bloodGroup?: string;
    bodyType?: string;
    complexion?: string;
    disabilityStatus?: boolean;
    disabilityNote?: string;
  };
  education: {
    qualification?: string;
    field?: string;
    university?: string;
    occupationType?: string;
    occupation?: string;
    companyName?: string;
    jobRole?: string;
    annualIncomeAmount?: number;
  };
  family?: {
    fatherName?: string;
    motherName?: string;
    fatherOccupation?: string;
    motherOccupation?: string;
    familyType?: string;
    familyStatus?: string;
    familyValues?: string;
    siblings?: {
      brothersCount?: number;
      sistersCount?: number;
      marriedBrothersCount?: number;
      marriedSistersCount?: number;
      details?: Array<{
        type?: string;
        married?: boolean;
        occupation?: string;
      }>;
      note?: string;
    };
  };
  preferences?: {
    ageRange?: { min?: number | null; max?: number | null };
    age?: { min?: number | null; max?: number | null };
    heightRange?: { min?: number | null; max?: number | null };
    height?: { min?: number | null; max?: number | null };
    annualIncomeRange?: { min?: number | null; max?: number | null };
    annualIncome?: { min?: number | null; max?: number | null };
    maritalStatus?: string[];
    religion?: string[];
    caste?: string[];
    subCaste?: string[];
    manglikStatus?: string[];
    country?: string[];
    state?: string[];
    city?: string[];
    qualification?: string[];
    occupationType?: string[];
    occupation?: string[];
    bodyType?: string[];
    complexion?: string[];
    smoking?: string[];
    drinking?: string[];
    eating?: string[];
    languages?: string[];
    languagesKnown?: string[];
    childPreference?: string;
    residencyPreference?: string;
    aboutPartner?: string;
    filters?: {
      age?: { min?: number | null; max?: number | null };
      height?: { min?: number | null; max?: number | null };
      annualIncome?: { min?: number | null; max?: number | null };
      maritalStatus?: string[];
      religion?: string[];
      caste?: string[];
      subCaste?: string[];
      manglikStatus?: string[];
      country?: string[];
      state?: string[];
      city?: string[];
      qualification?: string[];
      occupationType?: string[];
      occupation?: string[];
      bodyType?: string[];
      complexion?: string[];
      smoking?: string[];
      drinking?: string[];
      eating?: string[];
      languages?: string[];
      childPreference?: string;
      residencyPreference?: string;
    };
  };
  images?: ProfileImage[];
  videoIntro?: ProfileImage | null;
  age?: number;
  height?: number;
  location?: { type?: 'Point'; coordinates?: [number, number] };
  profileScore?: number;
  profileCompletionPercentage?: number;
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
