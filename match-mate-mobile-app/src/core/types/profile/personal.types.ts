import { Gender, MaritalStatus } from '../common/enums';

export interface PersonalData {
  profileFor: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
  religion: string;
  caste: string;
  country: string;
  state: string;
  city: string;
  motherTongue: string;
  maritalStatus: MaritalStatus;
  aboutMe: string;
}

export interface MatchProfile {
  userId: string;
  name: string;
  age: number;
  height: string; // e.g. "5'4\""
  location: string; // e.g. "Pune, Maharashtra"
  religion: string; // e.g. "Hindu • Brahmin"
  education: string;
  profession: string;
  isOnline?: boolean;
  isNew?: boolean;
  photos: string[];
}
