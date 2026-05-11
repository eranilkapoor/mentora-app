import {
  BODY_TYPE_OPTIONS,
  CASTE_OPTIONS,
  CHILD_PREFERENCE_OPTIONS,
  COMPLEXION_OPTIONS,
  DIET_OPTIONS,
  DRINKING_OPTIONS,
  MANGLIK_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  RELIGION_OPTIONS,
  RESIDENCY_PREFERENCE_OPTIONS,
  SMOKING_OPTIONS,
} from './EditPreference.constants';
import Feather from 'react-native-vector-icons/Feather';
import React from 'react';
import { MaritalStatus } from '@/core/types';

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
  religion?: (typeof RELIGION_OPTIONS)[number][];
  caste?: (typeof CASTE_OPTIONS)[number][];
  subCaste?: string[];
  manglikStatus?: (typeof MANGLIK_OPTIONS)[number][];
  childPreference: (typeof CHILD_PREFERENCE_OPTIONS)[number];
  residencyPreference: (typeof RESIDENCY_PREFERENCE_OPTIONS)[number];
  country?: string[];
  state?: string[];
  city?: string[];
  qualification?: string[];
  occupationType?: (typeof OCCUPATION_TYPE_OPTIONS)[number][];
  occupation?: string[];
  bodyType?: (typeof BODY_TYPE_OPTIONS)[number][];
  complexion?: (typeof COMPLEXION_OPTIONS)[number][];
  smoking?: (typeof SMOKING_OPTIONS)[number][];
  drinking?: (typeof DRINKING_OPTIONS)[number][];
  diet?: (typeof DIET_OPTIONS)[number][];
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

export type SelectOption = {
  value: string;
  label: string;
};

export interface MultiSelectPillProps {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  i18nPrefix?: string;
}

export interface WeightSliderProps {
  label: string;
  value: number;
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
