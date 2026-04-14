import { ProfileImage } from '@/core/types';
import {
  BODY_TYPE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  FAMILY_TYPE_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
  SMOKING_OPTIONS,
} from './EditProfile.constants';

export interface TimeOfBirth {
  hour?: number;
  minute?: number;
  period?: 'AM' | 'PM';
};

export interface PersonalSection {
  profileFor: string;
  firstName: string;
  lastName: string;
  dob: string;
  timeOfBirth?: TimeOfBirth;
  gender: (typeof GENDER_OPTIONS)[number];
  maritalStatus: (typeof MARITAL_OPTIONS)[number];
  religion: string;
  caste: string;
  motherTongue: string;
  country: string;
  state: string;
  city: string;
  aboutMe: string;
}

export interface PhysicalSection {
  height: string;
  weight: string;
  bodyType: string;//(typeof BODY_TYPE_OPTIONS)[number];
  complexion: string;//(typeof COMPLEXION_OPTIONS)[number];
}

export interface EducationSection {
  qualification: string;
  field: string;
  university: string;
  occupation: string;
  annualIncome: string;
}

export interface FamilySection {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: string; //(typeof FAMILY_TYPE_OPTIONS)[number];
  familyStatus?: string;
  familyValues?: string;
}

export interface PreferencesSection {
  hobbies?: string[];
  languagesKnown?: string[];
  smoking?: (typeof SMOKING_OPTIONS)[number];
  drinking?: (typeof DRINKING_OPTIONS)[number];
  diet?: (typeof DIET_OPTIONS)[number];
}

export interface ProfileData {
  personal: PersonalSection;
  physical: PhysicalSection;
  education: EducationSection;
  family: FamilySection;
  preferences: PreferencesSection;
  images?: ProfileImage[];
}

export type SectionKey = keyof ProfileData | 'images';

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
}

export interface TagInputProps {
  label: string;
  items?: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
}

export interface SectionCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  sectionKey: SectionKey;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
}
