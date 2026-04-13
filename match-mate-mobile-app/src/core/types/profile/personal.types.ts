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