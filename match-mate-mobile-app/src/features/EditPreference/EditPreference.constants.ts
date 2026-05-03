import { PreferenceData } from './EditPreference.types';

// ─── Basic Filters ────────────────────────────────────────────────────────────

export const MARITAL_OPTIONS = [
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorced',
  'annulled',
] as const;

export const RELIGION_OPTIONS = [
  'hindu',
  'muslim',
  'christian',
  'sikh',
  'jain',
  'buddhist',
  'parsi',
  'jewish',
  'other',
] as const;

export const CASTE_OPTIONS = [
  'brahmin',
  'kshatriya',
  'vaishya',
  'shudra',
  'kayastha',
  'rajput',
  'maratha',
  'reddy',
  'naidu',
  'nair',
  'other',
  'does_not_matter',
] as const;

export const MANGLIK_OPTIONS = [
  'non_manglik',
  'manglik',
  'anshik_manglik',
  'dont_know',
  'does_not_matter',
] as const;

// ─── Preference Enums ─────────────────────────────────────────────────────────

export const CHILD_PREFERENCE_OPTIONS = [
  'does_not_matter',
  'want_children',
  'do_not_want_children',
  'open_to_children',
  'has_children_acceptable',
] as const;

export const RESIDENCY_PREFERENCE_OPTIONS = [
  'does_not_matter',
  'same_city',
  'same_state',
  'same_country',
  'abroad_preferred',
  'nri_preferred',
] as const;

// ─── Physical ─────────────────────────────────────────────────────────────────

export const BODY_TYPE_OPTIONS = [
  'slim',
  'athletic',
  'average',
  'heavy',
] as const;

export const COMPLEXION_OPTIONS = [
  'fair',
  'wheatish',
  'dusky',
  'dark',
] as const;

// ─── Career ───────────────────────────────────────────────────────────────────

export const OCCUPATION_TYPE_OPTIONS = [
  'government',
  'private',
  'business',
  'self_employed',
  'not_working',
  'student',
] as const;

// ─── Lifestyle ────────────────────────────────────────────────────────────────

export const SMOKING_OPTIONS = [
  'non_smoker',
  'occasionally',
  'regular',
  'trying_to_quit',
  'open_to',
] as const;

export const DRINKING_OPTIONS = [
  'non_drinker',
  'occasionally',
  'socially',
  'regular',
  'open_to',
] as const;

export const DIET_OPTIONS = [
  'vegetarian',
  'non_vegetarian',
  'eggetarian',
  'vegan',
  'open_to',
  'jain',
  'satvik',
  'halal',
  'kosher',
] as const;

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
// Used as i18n keys: preference.weights.{key}
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
    childPreference: 'does_not_matter',
    residencyPreference: 'does_not_matter',
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
