import {
  Country,
  DrinkingHabit,
  EatingHabit,
  Gender,
  MaritalStatus,
  ProfileFor,
  Qualification,
  Religion,
  Caste,
  SmokingHabit,
} from '../common/enums';

export interface BasicData {
  profileFor: ProfileFor;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  religion: Religion;
  country: Country;
  maritalStatus: MaritalStatus;
  qualification: Qualification;
  occupation: string;
  height: string;
}
export interface PersonalData {
  profileFor: ProfileFor;
  firstName: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth: string;
  religion: Religion;
  caste?: Caste;
  country?: Country;
  state?: string;
  city?: string;
  motherTongue?: string;
  maritalStatus: MaritalStatus;
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  eating: EatingHabit;
  hobbies?: string[];
  languages?: string[];
  aboutMe?: string;
}

export interface MatchProfile {
  userId: string;
  name: string;
  age: number;
  height: string;
  location: string;
  religion: string;
  education: string;
  profession: string;
  isOnline?: boolean;
  isNew?: boolean;
  photos: string[];
}
