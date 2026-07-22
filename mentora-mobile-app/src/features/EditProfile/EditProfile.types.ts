import {
  Country,
  Gender,
  ProfileImage,
  Qualification,
  Religion,
  PersonalityBadge,
  ReligiousDetails,
  ProfileData as ApiProfileData,
} from '@/core/types';

export type { ReligiousDetails };

export interface PersonalSection {
  firstName: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth: string;
  religion: Religion;
  religiousDetails?: ReligiousDetails;
  country: Country;
  state?: string;
  city?: string;
  citizenship?: string;
  isNri?: boolean;
  residencyCountry?: Country;
  visaStatus?: string;
  abroadSince?: string;
  motherTongue?: string;
  hobbies?: string[];
  personalityBadges?: PersonalityBadge[];
  languages?: string[];
  aboutMe?: string;
}

export interface PhysicalSection {
  accessibilityNeeds?: string[];
}

export interface EducationSection {
  qualification: Qualification;
  field?: string;
  university?: string;
  occupation: string;
  previousEducationSummary?: string;
  examScoreSummary?: string;
  coursePreference?: string;
  preferredSubjects?: string[];
}

export interface FamilySection {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  guardianName?: string;
  guardianRelation?: string;
  primaryGuardianPhone?: string;
  primaryGuardianEmail?: string;
}

export interface ProfileData {
  personal: PersonalSection;
  physical: PhysicalSection;
  education: EducationSection;
  family: FamilySection;
  contactDetails?: ApiProfileData['contactDetails'];
  images?: ProfileImage[];
  videos?: ProfileImage[];
}

export type SectionKey = keyof ProfileData;
