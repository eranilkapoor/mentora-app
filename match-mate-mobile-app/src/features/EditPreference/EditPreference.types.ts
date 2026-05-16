import {
  BodyType,
  ChildPreference,
  Complexion,
  EatingHabit,
  DrinkingHabit,
  ManglikStatus,
  MaritalStatus,
  OccupationType,
  Religion,
  ResidencyPreference,
  SmokingHabit,
} from '@/core/types';

export interface Range {
  min: number;
  max: number;
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export interface PartnerFilters {
  age?: Range;
  heightCm?: Range;
  annualIncome?: Range;
  maritalStatus?: MaritalStatus[];
  religion?: Religion[];
  caste?: string[];
  subCaste?: string[];
  manglikStatus?: ManglikStatus[];
  childPreference: ChildPreference;
  residencyPreference: ResidencyPreference;
  country?: string[];
  state?: string[];
  city?: string[];
  qualification?: string[];
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
