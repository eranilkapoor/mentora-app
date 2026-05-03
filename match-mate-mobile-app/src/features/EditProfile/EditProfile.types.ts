import { ProfileImage } from '@/core/types';
import {
  BLOOD_GROUP_OPTIONS,
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  FAMILY_STATUS_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  FAMILY_VALUE_OPTIONS,
  GENDER_OPTIONS,
  MANGLIK_OPTIONS,
  MARITAL_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  SIBLING_TYPE_OPTIONS,
  SMOKING_OPTIONS,
} from './EditProfile.constants';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';

// ─── Nested types ─────────────────────────────────────────────────────────────

export interface TimeOfBirth {
  hour?: number;
  minute?: number;
  period?: 'AM' | 'PM';
}

export interface PlaceOfBirth {
  city?: string;
  state?: string;
  country?: string;
}

export interface SiblingDetail {
  type: (typeof SIBLING_TYPE_OPTIONS)[number];
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

// ─── Section types ────────────────────────────────────────────────────────────

export interface PersonalSection {
  firstName: string;
  lastName?: string;
  dateOfBirth: string; // stored as ISO string, sent as Date
  timeOfBirth?: TimeOfBirth;
  placeOfBirth?: PlaceOfBirth;
  subCast?: string;
  gotra?: string;
  manglikStatus?: (typeof MANGLIK_OPTIONS)[number];
  rashi?: string;
  nakshatra?: string;
  kundliFileUrl?: string;
  country?: string;
  state?: string;
  citizenship?: string;
  willingToRelocate?: boolean;
  motherTongue?: string;
  maritalStatus: (typeof MARITAL_OPTIONS)[number];
  hasChildren?: boolean;
  sonsCount?: number;
  daughtersCount?: number;
  // Lifestyle — moved from preferences per schema
  smoking?: (typeof SMOKING_OPTIONS)[number];
  drinking?: (typeof DRINKING_OPTIONS)[number];
  diet?: (typeof DIET_OPTIONS)[number];
  hobbies?: string[];
  languages?: string[];
  aboutMe?: string;
}

export interface PhysicalSection {
  heightLabel: string; // renamed from height
  weightKg?: string; // renamed from weight
  bloodGroup?: (typeof BLOOD_GROUP_OPTIONS)[number];
  bodyType?: (typeof BODY_TYPE_OPTIONS)[number];
  complexion?: (typeof COMPLEXION_OPTIONS)[number];
  disabilityStatus?: boolean;
  disabilityNote?: string;
}

export interface EducationSection {
  qualification: string;
  field?: string;
  university?: string;
  occupationType?: (typeof OCCUPATION_TYPE_OPTIONS)[number];
  occupation: string;
  companyName?: string;
  jobRole?: string;
  annualIncomeAmount?: string; // renamed from annualIncome, numeric on server
}

export interface FamilySection {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: (typeof FAMILY_TYPE_OPTIONS)[number];
  familyStatus?: (typeof FAMILY_STATUS_OPTIONS)[number];
  familyValues?: (typeof FAMILY_VALUE_OPTIONS)[number];
  siblings?: Siblings;
}

export interface ProfileData {
  personal: PersonalSection;
  physical: PhysicalSection;
  education: EducationSection;
  family: FamilySection;
  images?: ProfileImage[];
  // 'preferences' removed — merged into personal per backend schema
}

export type SectionKey = keyof ProfileData;

// ─── Component prop types ─────────────────────────────────────────────────────

export interface FormInputProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
}

export interface SelectPillProps {
  label: string;
  options: readonly string[];
  value?: string;
  onChange: (v: string) => void;
  i18nPrefix?: string;
}

export interface ToggleRowProps {
  label: string;
  value?: boolean;
  onChange: (v: boolean) => void;
  sublabel?: string;
}

export interface NumberStepperProps {
  label: string;
  value?: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export interface TagInputProps {
  label: string;
  items?: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
}

export interface SectionCardProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
  sectionKey: SectionKey;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
}

export interface TimeOfBirthPickerProps {
  value?: TimeOfBirth;
  onChange: (val: TimeOfBirth) => void;
}

export interface SiblingsEditorProps {
  value?: Siblings;
  onChange: (v: Siblings) => void;
}
