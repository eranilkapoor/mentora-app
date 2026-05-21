import {
  FamilyStatus,
  FamilyType,
  FamilyValue,
  SiblingType,
} from '../common/enums';

export interface SiblingDetail {
  type: SiblingType;
  married: boolean;
  occupation?: string;
}

export interface Siblings {
  brothersCount?: number;
  sistersCount?: number;
  marriedBrothersCount?: number;
  marriedSistersCount?: number;
  details: SiblingDetail[];
  note?: string;
}

export interface FamilyData {
  fatherName?: string;
  motherName?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  familyType?: FamilyType;
  familyStatus?: FamilyStatus;
  familyValues?: FamilyValue;
  siblings?: Siblings;
}
