// ─── Helper ───────────────────────────────────────────────────────────────────

const toLabel = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Gender ───────────────────────────────────────────────────────────────────

export const Genders = {
  MALE: 'male',
  FEMALE: 'female',
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export const GenderOptions = Object.values(Genders).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Marital Status ───────────────────────────────────────────────────────────

export const MaritalStatuses = {
  NEVER_MARRIED: 'never_married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  AWAITING_DIVORCED: 'awaiting_divorced',
} as const;

export type MaritalStatus =
  (typeof MaritalStatuses)[keyof typeof MaritalStatuses];

export const MaritalStatusOptions = Object.values(MaritalStatuses).map(
  (value) => ({
    label: toLabel(value),
    value,
  })
);

// ─── Smoking ──────────────────────────────────────────────────────────────────

export const SmokingTypes = {
  NON_SMOKER: 'non_smoker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  TRYING_TO_QUIT: 'trying_to_quit',
  OPEN_TO: 'open_to',
} as const;

export type SmokingType = (typeof SmokingTypes)[keyof typeof SmokingTypes];

export const SmokingOptions = Object.values(SmokingTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Drinking ─────────────────────────────────────────────────────────────────

export const DrinkingTypes = {
  NON_DRINKER: 'non_drinker',
  OCCASIONALLY: 'occasionally',
  REGULAR: 'regular',
  SOCIALLY: 'socially',
  OPEN_TO: 'open_to',
} as const;

export type DrinkingType = (typeof DrinkingTypes)[keyof typeof DrinkingTypes];

export const DrinkingOptions = Object.values(DrinkingTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Diet ─────────────────────────────────────────────────────────────────────

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

export type DietType = (typeof DietTypes)[keyof typeof DietTypes];

export const DietTypeOptions = Object.values(DietTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Sibling Type ─────────────────────────────────────────────────────────────

export const SiblingTypes = {
  BROTHER: 'brother',
  SISTER: 'sister',
} as const;

export type SiblingType = (typeof SiblingTypes)[keyof typeof SiblingTypes];

export const SiblingTypeOptions = Object.values(SiblingTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Body Type ────────────────────────────────────────────────────────────────

export const BodyTypes = {
  SLIM: 'slim',
  ATHLETIC: 'athletic',
  AVERAGE: 'average',
  HEAVY: 'heavy',
} as const;

export type BodyType = (typeof BodyTypes)[keyof typeof BodyTypes];

export const BodyTypeOptions = Object.values(BodyTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Complexion ───────────────────────────────────────────────────────────────

export const Complexions = {
  FAIR: 'fair',
  WHEATISH: 'wheatish',
  DUSKY: 'dusky',
  DARK: 'dark',
} as const;

export type Complexion = (typeof Complexions)[keyof typeof Complexions];

export const ComplexionOptions = Object.values(Complexions).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Manglik Status ───────────────────────────────────────────────────────────

export const ManglikStatuses = {
  NON_MANGLIK: 'non_manglik',
  MANGLIK: 'manglik',
  ANSHIK_MANGLIK: 'anshik_manglik',
  DONT_KNOW: 'dont_know',
} as const;

export type ManglikStatus =
  (typeof ManglikStatuses)[keyof typeof ManglikStatuses];

export const ManglikStatusOptions = Object.values(ManglikStatuses).map(
  (value) => ({
    label: toLabel(value),
    value,
  })
);

// ─── Profile For ──────────────────────────────────────────────────────────────

export const ProfileFors = {
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

export type ProfileFor = (typeof ProfileFors)[keyof typeof ProfileFors];

export const ProfileForOptions = Object.values(ProfileFors).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Religion ─────────────────────────────────────────────────────────────────

export const Religions = {
  HINDU: 'hindu',
  MUSLIM: 'muslim',
  CHRISTIAN: 'christian',
  SIKH: 'sikh',
  JAIN: 'jain',
  BUDDHIST: 'buddhist',
  JEWISH: 'jewish',
  PARSI: 'parsi',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;

export type Religion = (typeof Religions)[keyof typeof Religions];

export const ReligionOptions = Object.values(Religions).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Qualification ────────────────────────────────────────────────────────────

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

export const QualificationOptions = Object.values(Qualifications).map(
  (value) => ({
    label: toLabel(value),
    value,
  })
);

// ─── Country ──────────────────────────────────────────────────────────────────

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

export const CountryOptions = Object.values(Countries).map((value) => ({
  label: toLabel(value),
  value,
}));

// ─── Day ──────────────────────────────────────────────────────────────────────

export const Days = {
  D01: '01',
  D02: '02',
  D03: '03',
  D04: '04',
  D05: '05',
  D06: '06',
  D07: '07',
  D08: '08',
  D09: '09',
  D10: '10',
  D11: '11',
  D12: '12',
  D13: '13',
  D14: '14',
  D15: '15',
  D16: '16',
  D17: '17',
  D18: '18',
  D19: '19',
  D20: '20',
  D21: '21',
  D22: '22',
  D23: '23',
  D24: '24',
  D25: '25',
  D26: '26',
  D27: '27',
  D28: '28',
  D29: '29',
  D30: '30',
  D31: '31',
} as const;

export type Day = (typeof Days)[keyof typeof Days];

export const DayOptions = Object.values(Days).map((value) => ({
  label: value,
  value,
}));

// ─── Month ────────────────────────────────────────────────────────────────────

export const Months = {
  JANUARY: '01',
  FEBRUARY: '02',
  MARCH: '03',
  APRIL: '04',
  MAY: '05',
  JUNE: '06',
  JULY: '07',
  AUGUST: '08',
  SEPTEMBER: '09',
  OCTOBER: '10',
  NOVEMBER: '11',
  DECEMBER: '12',
} as const;

export type Month = (typeof Months)[keyof typeof Months];

export const MonthOptions = [
  { label: 'January', value: Months.JANUARY },
  { label: 'February', value: Months.FEBRUARY },
  { label: 'March', value: Months.MARCH },
  { label: 'April', value: Months.APRIL },
  { label: 'May', value: Months.MAY },
  { label: 'June', value: Months.JUNE },
  { label: 'July', value: Months.JULY },
  { label: 'August', value: Months.AUGUST },
  { label: 'September', value: Months.SEPTEMBER },
  { label: 'October', value: Months.OCTOBER },
  { label: 'November', value: Months.NOVEMBER },
  { label: 'December', value: Months.DECEMBER },
] as const;

// ─── Year ─────────────────────────────────────────────────────────────────────

const CurrentYear = new Date().getFullYear();

export const Years = Object.fromEntries(
  Array.from({ length: 60 }, (_, i) => {
    const year = String(CurrentYear - i - 18);

    return [year, year];
  })
) as Record<string, string>;

export type Year = keyof typeof Years;

export const YearOptions = Object.values(Years).map((value) => ({
  label: value,
  value,
}));

// ─── Blood Group ──────────────────────────────────────────────────────────────

export const BloodGroups = {
  APLUS: 'A+',
  AMINUS: 'A-',
  BPLUS: 'B+',
  BMINUS: 'B-',
  OPLUS: 'O+',
  OMINUS: 'O-',
  ABPLUS: 'AB+',
  ABMINUS: 'AB-',
} as const;

export type BloodGroup = (typeof BloodGroups)[keyof typeof BloodGroups];

export const BloodGroupOptions = Object.values(BloodGroups).map((value) => ({
  label: value,
  value,
}));

// ─── Family ───────────────────────────────────────────────────────────────────

export const FamilyTypes = {
  JOINT: 'joint',
  NUCLEAR: 'nuclear',
  EXTENDED: 'extended',
} as const;

export type FamilyType = (typeof FamilyTypes)[keyof typeof FamilyTypes];

export const FamilyTypeOptions = Object.values(FamilyTypes).map((value) => ({
  label: toLabel(value),
  value,
}));

export const FamilyStatuses = {
  AFFLUENT: 'affluent',
  UPPER_MIDDLE_CLASS: 'upper_middle_class',
  MIDDLE_CLASS: 'middle_class',
  LOWER_MIDDLE_CLASS: 'lower_middle_class',
} as const;

export type FamilyStatus = (typeof FamilyStatuses)[keyof typeof FamilyStatuses];

export const FamilyStatusOptions = Object.values(FamilyStatuses).map(
  (value) => ({
    label: toLabel(value),
    value,
  })
);

export const FamilyValues = {
  TRADITIONAL: 'traditional',
  MODERATE: 'moderate',
  LIBERAL: 'liberal',
} as const;

export type FamilyValue = (typeof FamilyValues)[keyof typeof FamilyValues];

export const FamilyValueOptions = Object.values(FamilyValues).map((value) => ({
  label: toLabel(value),
  value,
}));

export const ChildPreferences = {
  DOES_NOT_MATTER: 'does_not_matter',
  WANT_CHILDREN: 'want_children',
  DO_NOT_WANT_CHILDREN: 'do_not_want_children',
  OPEN_TO_CHILDREN: 'open_to_children',
  HAS_CHILDREN_ACCEPTABLE: 'has_children_acceptable',
} as const;

export type ChildPreference =
  (typeof ChildPreferences)[keyof typeof ChildPreferences];

export const ChildPreferenceOptions = Object.values(ChildPreferences).map(
  (value) => ({
    value,
    label: toLabel(value),
  })
);

// ───────────────────────────────────────────────────────

export const ResidencyPreferences = {
  DOES_NOT_MATTER: 'does_not_matter',
  SAME_CITY: 'same_city',
  SAME_STATE: 'same_state',
  SAME_COUNTRY: 'same_country',
  ABROAD_PREFERRED: 'abroad_preferred',
  NRI_PREFERRED: 'nri_preferred',
} as const;

export type ResidencyPreference =
  (typeof ResidencyPreferences)[keyof typeof ResidencyPreferences];

export const ResidencyPreferenceOptions = Object.values(
  ResidencyPreferences
).map((value) => ({
  value,
  label: toLabel(value),
}));

// ─── Education / Career ───────────────────────────────────────────────────────

export const OccupationTypes = {
  GOVERNMENT: 'government',
  PRIVATE: 'private',
  BUSINESS: 'business',
  SELF_EMPLOYED: 'self_employed',
  NOT_WORKING: 'not_working',
  STUDENT: 'student',
} as const;

export type OccupationType =
  (typeof OccupationTypes)[keyof typeof OccupationTypes];
export const OccupationTypeOptions = Object.values(OccupationTypes).map(
  (value) => ({
    label: toLabel(value),
    value,
  })
);

// ─── Time Picker ──────────────────────────────────────────────────────────────

export const Hours = {
  ONE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  ELEVEN: '11',
  TWELVE: '12',
} as const;

export type Hour = (typeof Hours)[keyof typeof Hours];

export const HourOptions = [
  { label: '1', value: Hours.ONE },
  { label: '2', value: Hours.TWO },
  { label: '3', value: Hours.THREE },
  { label: '4', value: Hours.FOUR },
  { label: '5', value: Hours.FIVE },
  { label: '6', value: Hours.SIX },
  { label: '7', value: Hours.SEVEN },
  { label: '8', value: Hours.EIGHT },
  { label: '9', value: Hours.NINE },
  { label: '10', value: Hours.TEN },
  { label: '11', value: Hours.ELEVEN },
  { label: '12', value: Hours.TWELVE },
] as const;

export const Minutes = {
  ZERO: '00',
  FIVE: '05',
  TEN: '10',
  FIFTEEN: '15',
  TWENTY: '20',
  TWENTY_FIVE: '25',
  THIRTY: '30',
  THIRTY_FIVE: '35',
  FORTY: '40',
  FORTY_FIVE: '45',
  FIFTY: '50',
  FIFTY_FIVE: '55',
} as const;

export type Minute = (typeof Minutes)[keyof typeof Minutes];

export const MinuteOptions = [
  { label: '00', value: Minutes.ZERO },
  { label: '05', value: Minutes.FIVE },
  { label: '10', value: Minutes.TEN },
  { label: '15', value: Minutes.FIFTEEN },
  { label: '20', value: Minutes.TWENTY },
  { label: '25', value: Minutes.TWENTY_FIVE },
  { label: '30', value: Minutes.THIRTY },
  { label: '35', value: Minutes.THIRTY_FIVE },
  { label: '40', value: Minutes.FORTY },
  { label: '45', value: Minutes.FORTY_FIVE },
  { label: '50', value: Minutes.FIFTY },
  { label: '55', value: Minutes.FIFTY_FIVE },
] as const;

export const Periods = {
  AM: 'AM',
  PM: 'PM',
} as const;

export type Period = (typeof Periods)[keyof typeof Periods];

export const PeriodOptions = [
  { label: 'AM', value: Periods.AM },
  { label: 'PM', value: Periods.PM },
] as const;
