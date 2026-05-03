import { ProfileData, Siblings } from './EditProfile.types';

// ─── Gender ───────────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = ['male', 'female', 'other'] as const;

// ─── Marital Status ───────────────────────────────────────────────────────────
export const MARITAL_OPTIONS = [
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorced',
  'annulled',
] as const;

// ─── Manglik ──────────────────────────────────────────────────────────────────
export const MANGLIK_OPTIONS = [
  'non_manglik',
  'manglik',
  'anshik_manglik',
  'dont_know',
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

export const BLOOD_GROUP_OPTIONS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
] as const;

// ─── Family ───────────────────────────────────────────────────────────────────
export const FAMILY_TYPE_OPTIONS = ['joint', 'nuclear', 'extended'] as const;

export const FAMILY_STATUS_OPTIONS = [
  'affluent',
  'upper_middle_class',
  'middle_class',
  'lower_middle_class',
] as const;

export const FAMILY_VALUE_OPTIONS = [
  'traditional',
  'moderate',
  'liberal',
] as const;

export const SIBLING_TYPE_OPTIONS = ['brother', 'sister'] as const;

// ─── Education / Career ───────────────────────────────────────────────────────
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

// ─── Time Picker ──────────────────────────────────────────────────────────────
export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

export const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, '0')
);

export const PERIODS = ['AM', 'PM'] as const;

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const INITIAL_SIBLINGS: Siblings = {
  brothersCount: 0,
  sistersCount: 0,
  marriedBrothersCount: 0,
  marriedSistersCount: 0,
  details: [],
  note: '',
};

export const INITIAL_PROFILE: ProfileData = {
  personal: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    maritalStatus: 'never_married',
    willingToRelocate: false,
    hasChildren: false,
    sonsCount: 0,
    daughtersCount: 0,
    manglikStatus: 'non_manglik',
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    diet: 'vegetarian',
    hobbies: [],
    languages: [],
    aboutMe: '',
    placeOfBirth: {
      city: '',
      state: '',
      country: '',
    },
    timeOfBirth: {
      hour: undefined,
      minute: undefined,
      period: undefined,
    },
    subCast: '',
    gotra: '',
    rashi: '',
    nakshatra: '',
    kundliFileUrl: '',
    country: '',
    state: '',
    citizenship: '',
    motherTongue: '',
  },
  physical: {
    heightLabel: '',
    weightKg: '',
    bloodGroup: undefined,
    bodyType: undefined,
    complexion: undefined,
    disabilityStatus: false,
    disabilityNote: '',
  },
  education: {
    qualification: '',
    field: '',
    university: '',
    occupationType: undefined,
    occupation: '',
    companyName: '',
    jobRole: '',
    annualIncomeAmount: '',
  },
  family: {
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    familyType: undefined,
    familyStatus: undefined,
    familyValues: undefined,
    siblings: INITIAL_SIBLINGS,
  },
  images: [],
};
