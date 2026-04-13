export const Genders = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;
export type Gender = (typeof Genders)[keyof typeof Genders];

export const MaritalStatuses = {
  NEVER_MARRIED: 'never_married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  AWAITING_DIVORCED: 'awaiting_divorced'
} as const;
export type MaritalStatus = (typeof MaritalStatuses)[keyof typeof MaritalStatuses];

export const SmokingTypes = {
  NON_SMOKER: 'non_smoker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  TRYING_TO_QUIT: 'trying_to_quit',
  OPEN_TO: 'open_to',
} as const;
export type Smoking = (typeof SmokingTypes)[keyof typeof SmokingTypes];

export const DrinkingTypes = {
  NON_DRINKER: 'non_drinker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  SOCIALLY: 'socially',
  OPEN_TO: 'open_to',
} as const;
export type Drinking = (typeof DrinkingTypes)[keyof typeof DrinkingTypes];

export const DietTypes = {
  VEGETARIAN: 'vegetarian',
  NON_VEGETARIAN: 'non_vegetarian',
  EGGETARIAN: 'eggetarian',
  VEGAN: 'vegan',
  JAIN: 'jain',
  SATVIK: 'satvik',
  HALAL: 'halal',
  KOSHER: 'kosher',
  OPEN_TO: 'open_to',
} as const;
export type Diet = (typeof DietTypes)[keyof typeof DietTypes];

export const SiblingTypes = {
  BROTHER: 'brother',
  SISTER: 'sister',
} as const;
export type SiblingType = (typeof SiblingTypes)[keyof typeof SiblingTypes];