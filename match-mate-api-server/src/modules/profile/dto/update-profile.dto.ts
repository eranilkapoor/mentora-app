import { MaritalStatus } from '../schemas/profile.schema';

export class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
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
