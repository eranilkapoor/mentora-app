import {
  Country,
  Gender,
  Qualification,
  Religion,
  Caste,
  PersonalityBadge,
} from '../common/enums';

export interface BasicData {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  religion: Religion;
  country: Country;
  state?: string;
  city?: string;
  qualification: Qualification;
  gradeLevel: string;
  institutionName: string;
  primaryGoal: string;
  accessibilityNeeds?: string[];
}

export interface ReligiousDetails {
  caste?: Caste;
  subCaste?: string;
  gotra?: string;
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
  hobbies?: string[];
  personalityBadges?: PersonalityBadge[];
  languages?: string[];
  aboutMe?: string;
}

export interface MatchProfile {
  userId: string;
  name: string;
  age: number;
  location: string;
  religion: string;
  education: string;
  profession: string;
  isOnline?: boolean;
  isNew?: boolean;
  photos: string[];
}
