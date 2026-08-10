import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export const EDUCATION_RECORD_MODULES = [
  {
    path: 'admin/students',
    resource: 'student',
    collection: COLLECTION_NAMES.STUDENT,
  },
  {
    path: 'admin/academic-sessions',
    resource: 'academic_session',
    collection: COLLECTION_NAMES.ACADEMIC_SESSION,
  },
  {
    path: 'admin/courses',
    resource: 'course',
    collection: COLLECTION_NAMES.COURSE_OFFERING,
  },
  {
    path: 'admin/specializations',
    resource: 'specialization',
    collection: COLLECTION_NAMES.SPECIALIZATION,
  },
  {
    path: 'admin/enrollment',
    resource: 'enrollment',
    collection: COLLECTION_NAMES.ENROLLMENT,
  },
  {
    path: 'admin/fees',
    resource: 'fee_record',
    collection: COLLECTION_NAMES.FEE_RECORD,
  },
] as const;
