import { ChildPreferences, ResidencyPreferences } from '@/core/types';
import { PreferenceData } from './EditPreference.types';

// ─── Range Bounds ─────────────────────────────────────────────────────────────
export const AGE_RANGE = { min: 18, max: 70 } as const;
export const HEIGHT_RANGE = { min: 140, max: 220 } as const;
export const INCOME_RANGE = { min: 0, max: 10000000 } as const;
export const INCOME_STEP = 50000 as const;
export const MATCH_SCORE_RANGE = { min: 0, max: 100 } as const;

// ─── Weight Bounds ────────────────────────────────────────────────────────────
export const WEIGHT_MIN = 0 as const;
export const WEIGHT_MAX = 30 as const;

// ─── Weight Labels ────────────────────────────────────────────────────────────
export const WEIGHT_KEYS = [
  'age',
  'height',
  'religion',
  'caste',
  'location',
  'education',
  'occupation',
  'lifestyle',
  'horoscope',
] as const;

export type WeightKey = (typeof WEIGHT_KEYS)[number];

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const INITIAL_PREFERENCE: PreferenceData = {
  filters: {
    age: { min: 22, max: 35 },
    heightCm: { min: 150, max: 185 },
    annualIncome: { min: 0, max: 1000000 },
    maritalStatus: ['never_married'],
    religion: [],
    caste: [],
    subCaste: [],
    manglikStatus: [],
    childPreference: ChildPreferences.DOES_NOT_MATTER,
    residencyPreference: ResidencyPreferences.DOES_NOT_MATTER,
    country: [],
    state: [],
    city: [],
    qualification: [],
    occupationType: [],
    occupation: [],
    bodyType: [],
    complexion: [],
    smoking: [],
    drinking: [],
    diet: [],
    languages: [],
  },
  settings: {
    isStrict: false,
    allowPartialMatches: true,
    horoscopeRequired: false,
    profileVerificationRequired: false,
    minimumMatchScore: 50,
  },
  weights: {
    age: 10,
    height: 10,
    religion: 15,
    caste: 10,
    location: 10,
    education: 10,
    occupation: 10,
    lifestyle: 10,
    horoscope: 15,
  },
  aboutPartner: '',
};
