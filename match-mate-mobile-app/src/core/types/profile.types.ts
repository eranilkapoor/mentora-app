export interface SiblingDetail {
  type: 'brother' | 'sister';
  married: boolean;
  occupation?: string;
}

export interface Siblings {
  brothers?: number;
  sisters?: number;
  marriedBrothers?: number;
  marriedSisters?: number;
}

export interface PersonalData {
  profileFor: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dob: string;
  religion: string;
  caste: string;
  country: string;
  state: string;
  city: string;
  motherTongue: string;
  maritalStatus: string;
  aboutMe: string;
}

export interface PhysicalData {
  height: string;
  weight: string;
  bodyType: string;
  complexion: string;
}

export interface EducationData {
  qualification: string;
  field: string;
  university: string;
  occupation: string;
  annualIncome: string;
}

export interface FamilyData {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  siblings?: Siblings;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface HeightRange {
  min: number;
  max: number;
}

export type MaritalStatus = 'never_married' | 'divorced' | 'widowed';

export type Smoking = 'non_smoker' | 'no' | 'occasionally';

export type Drinking = 'non_drinker' | 'no' | 'occasionally';

export type Diet = 'vegetarian' | 'non_vegetarian' | 'vegan';

export interface IncomeRange {
  min: number;
  max: number;
}

export interface PartnerPreference {
  ageRange?: AgeRange;
  heightRange?: HeightRange;
  maritalStatus?: MaritalStatus[];
  religion?: string[];
  caste?: string[];
  country?: string[];
  state?: string[];
  city?: string[];
  qualification?: string[];
  occupation?: string[];
  annualIncomeRange?: IncomeRange;
  bodyType?: string[];
  complexion?: string[];
  smoking?: Smoking[];
  drinking?: Drinking[];
  diet?: Diet[];
  languagesKnown?: string[];
  aboutPartner?: string;
  isStrict?: boolean;
}

export interface PreferencesData {
  partnerPreference?: PartnerPreference;
  hobbies?: string[];
  smoking?: Smoking;
  drinking?: Drinking;
  diet?: Diet;
  music?: string[];
  movies?: string[];
  sports?: string[];
  languagesKnown?: string[];
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  height: string;
  location: string;
  religion: string;
  education: string;
  profession: string;
  photos: string[];
}
