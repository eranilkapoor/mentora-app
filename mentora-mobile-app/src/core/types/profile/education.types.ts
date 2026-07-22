import { OccupationType, Qualification } from '../common/enums';

export interface EducationData {
  qualification: Qualification;
  field?: string;
  university?: string;
  occupationType?: OccupationType;
  occupation: string;
  companyName?: string;
  jobRole?: string;
  annualIncomeAmount?: number;
}
