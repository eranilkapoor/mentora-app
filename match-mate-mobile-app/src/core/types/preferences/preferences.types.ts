import {
  MaritalStatus,
  Smoking,
  Drinking,
  Diet,
} from '../common/enums';
import { AgeRange, HeightRange, IncomeRange } from '../common/ranges';

export interface PartnerPreference {
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
  smoking?: Smoking[];
  drinking?: Drinking[];
  diet?: Diet[];
  languagesKnown?: string[];
  aboutPartner?: string;
  isStrict?: boolean;
}

export interface PreferencesData {
  partnerPreference?: PartnerPreference;
  hobbies?: string[];
  smoking?: Smoking;
  drinking?: Drinking;
  diet?: Diet;
  music?: string[];
  movies?: string[];
  sports?: string[];
  languagesKnown?: string[];
}