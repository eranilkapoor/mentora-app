import {
  Country,
  Gender,
  MaritalStatus,
  ProfileFor,
  Qualification,
  Religion,
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
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  country: Country;
  state: string;
  city: string;
  motherTongue: string;
  maritalStatus: MaritalStatus;
  aboutMe: string;
  smoking: string;
  drinking: string;
  diet: string;
  hobbies: [];
  languagesKnown: [];
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
