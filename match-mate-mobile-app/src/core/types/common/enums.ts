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
  AWAITING_DIVORCED: 'awaiting_divorced',
} as const;
export type MaritalStatus =
  (typeof MaritalStatuses)[keyof typeof MaritalStatuses];

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

/* ================= BODY TYPE ================= */

export enum BodyType {
  SLIM = 'slim',
  ATHLETIC = 'athletic',
  AVERAGE = 'average',
  HEAVY = 'heavy',
}

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  [BodyType.SLIM]: 'Slim',
  [BodyType.ATHLETIC]: 'Athletic',
  [BodyType.AVERAGE]: 'Average',
  [BodyType.HEAVY]: 'Heavy',
};

/* ================= COMPLEXION ================= */

export enum Complexion {
  FAIR = 'fair',
  WHEATISH = 'wheatish',
  DUSKY = 'dusky',
  DARK = 'dark',
}

export const COMPLEXION_LABELS: Record<Complexion, string> = {
  [Complexion.FAIR]: 'Fair',
  [Complexion.WHEATISH]: 'Wheatish',
  [Complexion.DUSKY]: 'Dusky',
  [Complexion.DARK]: 'Dark',
};

/* ================= FAMILY TYPE ================= */

export enum FamilyType {
  JOINT = 'joint',
  NUCLEAR = 'nuclear',
  EXTENDED = 'extended',
}

export const FAMILY_TYPE_LABELS: Record<FamilyType, string> = {
  [FamilyType.JOINT]: 'Joint Family',
  [FamilyType.NUCLEAR]: 'Nuclear Family',
  [FamilyType.EXTENDED]: 'Extended Family',
};
