export const Genders = {
  MALE: 'male',
  FEMALE: 'female',
} as const;
export type Gender = (typeof Genders)[keyof typeof Genders];
export const Gender_Options = Object.values(Genders).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const MaritalStatuses = {
  NEVER_MARRIED: 'never_married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  AWAITING_DIVORCED: 'awaiting_divorced',
} as const;
export type MaritalStatus =
  (typeof MaritalStatuses)[keyof typeof MaritalStatuses];
export const Marital_Status_Options = Object.values(MaritalStatuses).map(
  (value) => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })
);

export const SmokingTypes = {
  NON_SMOKER: 'non_smoker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  TRYING_TO_QUIT: 'trying_to_quit',
  OPEN_TO: 'open_to',
} as const;
export type Smoking = (typeof SmokingTypes)[keyof typeof SmokingTypes];
export const Smoking_Options = Object.values(SmokingTypes).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const DrinkingTypes = {
  NON_DRINKER: 'non_drinker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  SOCIALLY: 'socially',
  OPEN_TO: 'open_to',
} as const;
export type Drinking = (typeof DrinkingTypes)[keyof typeof DrinkingTypes];
export const Drinking_Options = Object.values(DrinkingTypes).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

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
export const Diet_Options = Object.values(DietTypes).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const SiblingTypes = {
  BROTHER: 'brother',
  SISTER: 'sister',
} as const;
export type SiblingType = (typeof SiblingTypes)[keyof typeof SiblingTypes];
export const Sibling_Type_Options = Object.values(SiblingTypes).map(
  (value) => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })
);

export const BodyTypes = {
  SLIM: 'slim',
  ATHLETIC: 'athletic',
  AVERAGE: 'average',
  HEAVY: 'heavy',
} as const;
export type BodyType = (typeof BodyTypes)[keyof typeof BodyTypes];
export const Body_Type_Options = Object.values(BodyTypes).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const Complexions = {
  FAIR: 'fair',
  WHEATISH: 'wheatish',
  DUSKY: 'dusky',
  DARK: 'dark',
} as const;
export type Complexion = (typeof Complexions)[keyof typeof Complexions];
export const Complexion_Options = Object.values(Complexions).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const FamilyTypes = {
  JOINT: 'joint',
  NUCLEAR: 'nuclear',
  EXTENDED: 'extended',
} as const;
export type FamilyType = (typeof FamilyTypes)[keyof typeof FamilyTypes];
export const Family_Type_Options = Object.values(FamilyTypes).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const Profile_For = {
  SELF: 'self',
  SON: 'son',
  DAUGHTER: 'daughter',
  BROTHER: 'brother',
  SISTER: 'sister',
  FRIEND: 'friend',
  RELATIVE: 'relative',
  CLIENT: 'client',
  OTHER: 'other',
} as const;
export type ProfileFor = (typeof Profile_For)[keyof typeof Profile_For];
export const Profile_For_Options = Object.values(Profile_For).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const Religions = {
  HINDU: 'hindu',
  MUSLIM: 'muslim',
  CHRISTIAN: 'christian',
  SIKH: 'sikh',
  JAIN: 'jain',
  BUDDIST: 'buddhist',
  JEWISH: 'jewish',
  PARSI: 'parsi',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;
export type Religion = (typeof Religions)[keyof typeof Religions];
export const Religion_Options = Object.values(Religions).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export const Qualifications = {
  BELOW_10TH: 'below_10th',
  TENTH: '10th',
  TWELFTH: '12th',
  DIPLOMA: 'diploma',
  BA: 'ba',
  BSC: 'bsc',
  BCOM: 'bcom',
  BE: 'be',
  BTECH: 'btech',
  BCA: 'bca',
  BBA: 'bba',
  LLB: 'llb',
  MBBS: 'mbbs',
  MA: 'ma',
  MSC: 'msc',
  MCOM: 'mcom',
  ME: 'me',
  MTECH: 'mtech',
  MCA: 'mca',
  MBA: 'mba',
  MD: 'md',
  MS: 'ms',
  PHD: 'phd',
  POST_DOCTORATE: 'post_doctorate',
  CA: 'ca',
  CS: 'cs',
  CMA: 'cma',
  CFA: 'cfa',
  ACCA: 'acca',
  ITI: 'iti',
  POLYTECHNIC: 'polytechnic',
  SKILL_CERTIFICATION: 'skill_certification',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;
export type Qualification =
  (typeof Qualifications)[keyof typeof Qualifications];
export const Qualification_Options = Object.values(Qualifications).map(
  (value) => ({
    value,
    label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  })
);

export const Countries = {
  UNITED_STATES: 'united_states',
  INDIA: 'india',
  CHINA: 'china',
  UNITED_KINGDOM: 'united_kingdom',
  CANADA: 'canada',
  AUSTRALIA: 'australia',
  GERMANY: 'germany',
  FRANCE: 'france',
  BRAZIL: 'brazil',
  JAPAN: 'japan',
  RUSSIA: 'russia',
  SOUTH_AFRICA: 'south_africa',
  ITALY: 'italy',
  SPAIN: 'spain',
  MEXICO: 'mexico',
  NETHERLANDS: 'netherlands',
  SWEDEN: 'sweden',
  SWITZERLAND: 'switzerland',
  NEW_ZEALAND: 'new_zealand',
  SINGAPORE: 'singapore',
  UNITED_ARAB_EMIRATES: 'united_arab_emirates',
} as const;
export type Country = (typeof Countries)[keyof typeof Countries];
export const Country_Options = Object.values(Countries).map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

export type Day =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18'
  | '19'
  | '20'
  | '21'
  | '22'
  | '23'
  | '24'
  | '25'
  | '26'
  | '27'
  | '28'
  | '29'
  | '30'
  | '31';

export const Day_Options = Array.from({ length: 31 }, (_, i) => {
  const val = String(i + 1).padStart(2, '0');
  return { value: val as Day, label: val };
});

export type Month =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const Month_Options = MONTH_LABELS.map((label, i) => {
  const val = String(i + 1).padStart(2, '0') as Month;
  return { value: val, label };
});

export type Year = string;

const CURRENT_YEAR = new Date().getFullYear();

export const Year_Options = Array.from({ length: 60 }, (_, i) => {
  const val = String(CURRENT_YEAR - i - 18);
  return { value: val, label: val };
});
