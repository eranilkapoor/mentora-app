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
  'regular',
  'open_to',
  'socially',
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

export const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);

export const MINUTES = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, '0')
);

export const PERIODS = ['AM', 'PM'] as const;

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
    bodyType: 'average',
    complexion: 'fair',
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
    familyType: 'nuclear',
    familyStatus: '',
    familyValues: '',
  },
  preferences: {
    hobbies: [],
    languagesKnown: [],
    smoking: 'non_smoker',
    drinking: 'non_drinker',
    diet: 'vegetarian',
  },
  images: [],
};
