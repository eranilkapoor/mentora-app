import {
  BloodGroup,
  BodyType,
  Complexion,
  Country,
  EatingHabit,
  DrinkingHabit,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  Gender,
  Hour,
  MaritalStatus,
  Minute,
  OccupationType,
  Period,
  ProfileImage,
  SiblingType,
  SmokingHabit,
  ProfileFor,
  Qualification,
  Religion,
  PersonalityBadge,
  ReligiousDetails,
  ProfileData as ApiProfileData,
} from '@/core/types';

export type { ReligiousDetails };

export interface TimeOfBirth {
  hour?: Hour;
  minute?: Minute;
  period?: Period;
}

export interface PlaceOfBirth {
  city?: string;
  state?: string;
  country?: Country;
}

export interface SiblingDetail {
  type: SiblingType;
  married: boolean;
  occupation?: string;
}

export interface Siblings {
  brothersCount: number;
  sistersCount: number;
  marriedBrothersCount: number;
  marriedSistersCount: number;
  details: SiblingDetail[];
  note?: string;
}

export interface PersonalSection {
  profileFor: ProfileFor;
  firstName: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth: string;
  timeOfBirth?: TimeOfBirth;
  placeOfBirth?: PlaceOfBirth;
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
  willingToRelocate?: boolean;
  motherTongue?: string;
  maritalStatus: MaritalStatus;
  hasChildren?: boolean;
  sonsCount?: number;
  daughtersCount?: number;
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  eating: EatingHabit;
  hobbies?: string[];
  personalityBadges?: PersonalityBadge[];
  languages?: string[];
  aboutMe?: string;
}

export interface PhysicalSection {
  height: string;
  weight?: string;
  bloodGroup?: BloodGroup;
  bodyType?: BodyType;
  complexion?: Complexion;
  disabilityStatus?: boolean;
  disabilityNote?: string;
}

export interface EducationSection {
  qualification: Qualification;
  field?: string;
  university?: string;
  occupationType?: OccupationType;
  occupation: string;
  companyName?: string;
  jobRole?: string;
  annualIncomeAmount?: number;
}

export interface FamilySection {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: FamilyType;
  familyStatus?: FamilyStatus;
  familyValues?: FamilyValue;
  siblings?: Siblings;
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

export interface SiblingsEditorProps {
  value?: Siblings;
  onChange: (v: Siblings) => void;
}
