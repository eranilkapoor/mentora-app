import { SiblingType } from '../common/enums';

export interface SiblingDetail {
  type: SiblingType;
  married: boolean;
  occupation?: string;
}

export interface Siblings {
  brothers?: number;
  sisters?: number;
  marriedBrothers?: number;
  marriedSisters?: number;
}

export interface FamilyData {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: string;
  familyStatus?: string;
  familyValues?: string;
  siblings?: Siblings;
}
