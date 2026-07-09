import {
  Country,
  DrinkingHabit,
  EatingHabit,
  Gender,
  MaritalStatus,
  ManglikStatus,
  ProfileFor,
  Qualification,
  Religion,
  Caste,
  SmokingHabit,
  PersonalityBadge,
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

export interface ReligiousDetails {
  caste?: Caste;
  subCaste?: string;
  gotra?: string;
  manglikStatus?: ManglikStatus;
  rashi?: string;
  nakshatra?: string;
  kundliFileUrl?: string;
  sect?: string;
  subSect?: string;
  community?: string;
  maslak?: string;
  namaazPracticing?: string;
  hijabPreference?: string;
  halalLifestyle?: boolean;
  denomination?: string;
  churchName?: string;
  churchAttendance?: string;
  baptismStatus?: string;
  confirmationStatus?: string;
  bornAgain?: boolean;
  sikhCommunity?: string;
  amritdhariStatus?: string;
  wearsTurban?: boolean;
  nativeVillage?: string;
  gurudwaraName?: string;
  jainSect?: string;
  jainCommunity?: string;
  foodStrictness?: string;
  buddhistTradition?: string;
  buddhistCommunity?: string;
  jewishDenomination?: string;
  jewishCommunity?: string;
  kosherPractice?: string;
  parsiCommunity?: string;
  navjoteDone?: boolean;
  fireTempleAssociation?: string;
  otherReligionDetails?: string;
}

export interface PersonalData {
  profileFor: ProfileFor;
  firstName: string;
  lastName?: string;
  gender: Gender;
  dateOfBirth: string;
  religion: Religion;
  religiousDetails?: ReligiousDetails;
  country?: Country;
  state?: string;
  city?: string;
  motherTongue?: string;
  maritalStatus: MaritalStatus;
  smoking: SmokingHabit;
  drinking: DrinkingHabit;
  eating: EatingHabit;
  hobbies?: string[];
  personalityBadges?: PersonalityBadge[];
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
