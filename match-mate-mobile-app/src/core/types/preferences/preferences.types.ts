import {
  MaritalStatus,
  SmokingHabit,
  DrinkingHabit,
  DietType,
} from '../common/enums';
import { AgeRange, HeightRange, IncomeRange } from '../common/ranges';

export interface PreferencesData {
  ageRange?: AgeRange;
  heightRange?: HeightRange;
  maritalStatus?: MaritalStatus[];
  religion?: string[];
  caste?: string[];
  country?: string[];
  state?: string[];
  city?: string[];
  qualification?: string[];
  occupation?: string[];
  annualIncomeRange?: IncomeRange;
  bodyType?: string[];
  complexion?: string[];
  smoking?: SmokingHabit[];
  drinking?: DrinkingHabit[];
  diet?: DietType[];
  languagesKnown?: string[];
  aboutPartner?: string;
  isStrict?: boolean;
}
