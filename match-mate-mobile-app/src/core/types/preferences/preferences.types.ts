import {
  BodyType,
  Caste,
  Complexion,
  Country,
  MaritalStatus,
  Qualification,
  Religion,
  SmokingHabit,
  DrinkingHabit,
  EatingHabit,
} from '../common/enums';
import { AgeRange, HeightRange, IncomeRange } from '../common/ranges';

export interface PreferencesData {
  ageRange?: AgeRange;
  heightRange?: HeightRange;
  maritalStatus?: MaritalStatus[];
  religion?: Religion[];
  caste?: Caste[];
  country?: Country[];
  state?: string[];
  city?: string[];
  qualification?: Qualification[];
  occupation?: string[];
  annualIncomeRange?: IncomeRange;
  bodyType?: BodyType[];
  complexion?: Complexion[];
  smoking?: SmokingHabit[];
  drinking?: DrinkingHabit[];
  eating?: EatingHabit[];
  languagesKnown?: string[];
  aboutPartner?: string;
  isStrict?: boolean;
}
