import {
  BloodGroup,
  BodyType,
  Complexion,
  DietType,
  DrinkingHabit,
  FamilyStatus,
  FamilyType,
  FamilyValue,
  Hour,
  ManglikStatus,
  MaritalStatus,
  Minute,
  OccupationType,
  Period,
  ProfileImage,
  SiblingType,
  SmokingHabit,
} from '@/core/types';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';

export interface TimeOfBirth {
  hour?: Hour;
  minute?: Minute;
  period?: Period;
}

export interface PlaceOfBirth {
  city?: string;
  state?: string;
  country?: string;
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
  firstName: string;
  lastName?: string;
  dateOfBirth: string;
  timeOfBirth?: TimeOfBirth;
  placeOfBirth?: PlaceOfBirth;
  subCast?: string;
  gotra?: string;
  manglikStatus?: ManglikStatus;
  rashi?: string;
  nakshatra?: string;
  kundliFileUrl?: string;
  country?: string;
  state?: string;
  citizenship?: string;
  willingToRelocate?: boolean;
  motherTongue?: string;
  maritalStatus: MaritalStatus;
  hasChildren?: boolean;
  sonsCount?: number;
  daughtersCount?: number;
  smoking?: SmokingHabit;
  drinking?: DrinkingHabit;
  diet?: DietType;
  hobbies?: string[];
  languages?: string[];
  aboutMe?: string;
}

export interface PhysicalSection {
  heightCm: string;
  weightKg?: string;
  bloodGroup?: BloodGroup;
  bodyType?: BodyType;
  complexion?: Complexion;
  disabilityStatus?: boolean;
  disabilityNote?: string;
}

export interface EducationSection {
  qualification: string;
  field?: string;
  university?: string;
  occupationType?: OccupationType;
  occupation: string;
  companyName?: string;
  jobRole?: string;
  annualIncomeAmount?: string;
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
  images?: ProfileImage[];
}

export type SectionKey = keyof ProfileData;

export interface FormInputProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean;
}

export interface OptionType {
  label: string;
  value: string;
}

export interface SelectPillProps {
  label: string;
  options: readonly OptionType[];
  value?: string;
  onChange: (value: string) => void;
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
