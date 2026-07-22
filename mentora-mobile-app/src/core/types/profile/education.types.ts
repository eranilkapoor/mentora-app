import { Qualification } from '../common/enums';

export interface EducationData {
  qualification: Qualification;
  field?: string;
  university?: string;
  occupation: string;
  previousEducationSummary?: string;
  examScoreSummary?: string;
  coursePreference?: string;
  preferredSubjects?: string[];
}
