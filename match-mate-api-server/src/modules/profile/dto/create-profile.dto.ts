import { Gender } from '../enums/gender.enum';
import { MaritalStatus } from '../enums/marital-status.enum';

export class CreateProfileDto {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: Date;
  heightCm?: number;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  maritalStatus?: MaritalStatus;
  education?: string;
  occupation?: string;
  annualIncome?: string;
  location?: string;
  aboutMe?: string;
}
