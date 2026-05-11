import Feather from 'react-native-vector-icons/Feather';
import React from 'react';
import {
  BodyType,
  ChildPreference,
  Complexion,
  DietType,
  DrinkingType,
  ManglikStatus,
  MaritalStatus,
  OccupationType,
  Religion,
  ResidencyPreference,
  SmokingType,
} from '@/core/types';

// ─── Range ────────────────────────────────────────────────────────────────────
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
  smoking?: SmokingType[];
  drinking?: DrinkingType[];
  diet?: DietType[];
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

// ─── Component Props ──────────────────────────────────────────────────────────
export interface RangeInputProps {
  label: string;
  value?: Range;
  onChange: (v: Range) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export interface OptionType {
  value: string;
  label: string;
}

export interface MultiSelectPillProps {
  label: string;
  options: readonly OptionType[];
  value?: string[];
  onChange: (value: string[]) => void;
  i18nPrefix?: string;
}

export interface WeightSliderProps {
  label: string;
  value?: number;
  onChange: (v: number) => void;
}

export interface TagInputProps {
  label: string;
  items?: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
}

export interface ToggleRowProps {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export interface SectionCardProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
  sectionKey: PreferenceSectionKey;
  sectionLoading: PreferenceSectionKey | null;
  onSave: (key: PreferenceSectionKey) => void;
}

export interface ScoreStepperProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}
