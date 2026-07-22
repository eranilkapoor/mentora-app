import {
  BodyType,
  Caste,
  ChildPreference,
  Complexion,
  Country,
  EatingHabit,
  DrinkingHabit,
  ManglikStatus,
  MaritalStatus,
  OccupationType,
  Qualification,
  Religion,
  ResidencyPreference,
  SmokingHabit,
} from '@/core/types';

export interface Range {
  min?: number | null;
  max?: number | null;
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface PartnerFilters {
  age?: Range;
  height?: Range;
  annualIncome?: Range;
  maritalStatus?: MaritalStatus[];
  religion?: Religion[];
  caste?: Caste[];
  subCaste?: string[];
  manglikStatus?: ManglikStatus[];
  childPreference: ChildPreference;
  residencyPreference: ResidencyPreference;
  country?: Country[];
  state?: string[];
  city?: string[];
  qualification?: Qualification[];
  occupationType?: OccupationType[];
  occupation?: string[];
  bodyType?: BodyType[];
  complexion?: Complexion[];
  smoking?: SmokingHabit[];
  drinking?: DrinkingHabit[];
  eating?: EatingHabit[];
  languages?: string[];
}

// ─── Match Settings ───────────────────────────────────────────────────────────
export interface MatchSettings {
  isStrict: boolean;
  allowPartialMatches: boolean;
  horoscopeRequired: boolean;
  profileVerificationRequired: boolean;
  minimumMatchScore: number;
}

// ─── Match Weights ────────────────────────────────────────────────────────────
export interface MatchWeights {
  age: number;
  height: number;
  religion: number;
  caste: number;
  location: number;
  education: number;
  occupation: number;
  lifestyle: number;
  horoscope: number;
}

// ─── Root Preference Data ─────────────────────────────────────────────────────
export interface PreferenceData {
  filters: PartnerFilters;
  settings: MatchSettings;
  weights: MatchWeights;
  aboutPartner?: string;
}

export type PreferenceSectionKey = 'filters' | 'settings' | 'weights' | 'about';
