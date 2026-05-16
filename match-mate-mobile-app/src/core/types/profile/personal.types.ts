import {
  Country,
  DrinkingHabit,
  EatingHabit,
  Gender,
  MaritalStatus,
  ProfileFor,
  Qualification,
  Religion,
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
  firstName: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth: string;
  country?: Country;
  state?: string;
  city?: string;
  motherTongue?: string;
  maritalStatus: MaritalStatus;
  aboutMe?: string;
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  eating: EatingHabit;
  hobbies: [];
  languages: [];
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
