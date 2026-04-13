// ─── Constants ────────────────────────────────────────────────────────────────

import { ProfileData } from './EditProfile.types';

export const GENDER_OPTIONS = ['male', 'female', 'other'] as const;
export const MARITAL_OPTIONS = [
  'never_married',
  'divorced',
  'widowed',
  'awaiting_divorced',
] as const;
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
export const FAMILY_TYPE_OPTIONS = ['joint', 'nuclear', 'extended'] as const;
export const SMOKING_OPTIONS = ['non_smoker', 'occasional', 'regular'] as const;
export const DRINKING_OPTIONS = [
  'non_drinker',
  'occasional',
  'regular',
] as const;
export const DIET_OPTIONS = [
  'vegetarian',
  'non_vegetarian',
  'eggetarian',
  'vegan',
] as const;

export const INITIAL_PROFILE: ProfileData = {
  personal: {
    profileFor: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'male' as const,
    maritalStatus: 'never_married' as const,
    religion: '',
    caste: '',
    motherTongue: '',
    country: '',
    state: '',
    city: '',
    aboutMe: '',
  },
  physical: {
    height: '',
    weight: '',
    bodyType: 'average' as const,
    complexion: 'fair' as const,
  },
  education: {
    qualification: '',
    field: '',
    university: '',
    occupation: '',
    annualIncome: '',
  },
  family: {
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    familyType: 'nuclear' as const,
    familyStatus: '',
    familyValues: '',
  },
  preferences: {
    hobbies: [],
    languagesKnown: [],
    smoking: 'non_smoker' as const,
    drinking: 'non_drinker' as const,
    diet: 'vegetarian' as const,
  },
  images: [],
};
