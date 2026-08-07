import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;
export type ParentProfileDocument = HydratedDocument<ParentProfile>;
export type ParentStudentRelationshipDocument =
  HydratedDocument<ParentStudentRelationship>;
export type StudentInvitationDocument = HydratedDocument<StudentInvitation>;
export type ParentalControlDocument = HydratedDocument<ParentalControl>;
export type AcademicRecordDocument = HydratedDocument<StudentAcademicRecord>;
export type AcademicBoardDocument = HydratedDocument<AcademicBoard>;
export type UniversityDocument = HydratedDocument<University>;
export type InstitutionDocument = HydratedDocument<Institution>;
export type AcademicLevelDocument = HydratedDocument<AcademicLevel>;
export type GradeDocument = HydratedDocument<Grade>;
export type StreamDocument = HydratedDocument<Stream>;
export type CourseDocument = HydratedDocument<Course>;
export type SubjectDocument = HydratedDocument<Subject>;
export type TopicDocument = HydratedDocument<Topic>;
export type CurriculumDocument = HydratedDocument<Curriculum>;
export type StudyPlanDocument = HydratedDocument<StudyPlan>;
export type StudentSubjectEnrollmentDocument =
  HydratedDocument<StudentSubjectEnrollment>;
export type LearningScheduleDocument = HydratedDocument<LearningSchedule>;
export type LearningEntitlementDocument = HydratedDocument<LearningEntitlement>;
export type AiTutorSessionDocument = HydratedDocument<AiTutorSession>;
export type AiTutorMessageDocument = HydratedDocument<AiTutorMessage>;
export type QuestionBankDocument = HydratedDocument<QuestionBank>;
export type QuestionDocument = HydratedDocument<Question>;
export type AssessmentDocument = HydratedDocument<Assessment>;
export type AssessmentAttemptDocument = HydratedDocument<AssessmentAttempt>;
export type AssessmentAnswerDocument = HydratedDocument<AssessmentAnswer>;
export type AssessmentResultDocument = HydratedDocument<AssessmentResult>;
export type StudentTopicProgressDocument =
  HydratedDocument<StudentTopicProgress>;
export type LearningRecommendationDocument =
  HydratedDocument<LearningRecommendation>;
export type ClassroomDocument = HydratedDocument<Classroom>;
export type ClassroomMessageDocument = HydratedDocument<ClassroomMessage>;
export type ClassroomFileDocument = HydratedDocument<ClassroomFile>;
export type TutorProfileDocument = HydratedDocument<TutorProfile>;
export type TutorAvailabilityDocument = HydratedDocument<TutorAvailability>;
export type TutorSessionNoteDocument = HydratedDocument<TutorSessionNote>;
export type SafetyEventDocument = HydratedDocument<SafetyEvent>;

@Schema({ collection: COLLECTION_NAMES.STUDENT_PROFILE, timestamps: true })
export class StudentProfile {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({
    enum: ['self_managed', 'parent_managed', 'jointly_managed'],
    required: true,
  })
  ownershipType!: string;

  @Prop({
    enum: [
      'independent_student',
      'parent_created_child',
      'invited_student',
      'admin_created',
    ],
    required: true,
  })
  registrationMode!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ trim: true })
  middleName?: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ required: true })
  dateOfBirth!: Date;

  @Prop({ enum: ['minor', 'adult', 'unknown'], default: 'unknown' })
  ageCategory!: string;

  @Prop({ trim: true })
  gender?: string;

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: Types.ObjectId })
  currentAcademicRecordId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  learningGoals!: string[];

  @Prop({ type: Object, default: {} })
  personal!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  academic!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  parents!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  address!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  previousEducation!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  examScores!: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  coursePreference!: Record<string, unknown>;

  @Prop({ type: [Object], default: [] })
  documents!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  payments!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  communicationHistory!: Record<string, unknown>[];

  @Prop({ type: [Object], default: [] })
  activityTimeline!: Record<string, unknown>[];

  @Prop({ default: false })
  onboardingCompleted!: boolean;

  @Prop({ default: 0, min: 0, max: 100 })
  profileCompletionPercentage!: number;

  @Prop({
    enum: ['active', 'inactive', 'suspended', 'graduated', 'archived'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdByUserId!: Types.ObjectId;
}

export const StudentProfileSchema =
  SchemaFactory.createForClass(StudentProfile);
StudentProfileSchema.index({ createdByUserId: 1, status: 1 });
StudentProfileSchema.index({ userId: 1, status: 1 });
StudentProfileSchema.index({ status: 1, createdAt: -1 });

@Schema({ collection: COLLECTION_NAMES.PARENT_PROFILE, timestamps: true })
export class ParentProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ trim: true })
  occupation?: string;

  @Prop({ trim: true })
  organizationName?: string;

  @Prop({
    enum: ['push', 'email', 'sms', 'whatsapp'],
    default: 'push',
  })
  preferredCommunicationChannel!: string;

  @Prop({
    enum: ['after_each_session', 'daily', 'weekly', 'monthly'],
    default: 'weekly',
  })
  notificationSummaryFrequency!: string;

  @Prop({ default: true })
  billingContact!: boolean;

  @Prop({ default: true })
  emergencyContact!: boolean;
}

export const ParentProfileSchema = SchemaFactory.createForClass(ParentProfile);

@Schema({ _id: false })
export class RelationshipPermissions {
  @Prop({ default: true })
  viewProfile!: boolean;

  @Prop({ default: true })
  editProfile!: boolean;

  @Prop({ default: true })
  viewAcademicRecords!: boolean;

  @Prop({ default: true })
  editAcademicRecords!: boolean;

  @Prop({ default: true })
  viewLearningHistory!: boolean;

  @Prop({ default: false })
  viewDetailedAiChats!: boolean;

  @Prop({ default: true })
  viewAssessments!: boolean;

  @Prop({ default: true })
  manageSubjects!: boolean;

  @Prop({ default: true })
  manageSchedule!: boolean;

  @Prop({ default: true })
  manageSubscription!: boolean;

  @Prop({ default: true })
  makePayments!: boolean;

  @Prop({ default: true })
  manageParentalControls!: boolean;

  @Prop({ default: true })
  receiveNotifications!: boolean;
}

export const RelationshipPermissionsSchema = SchemaFactory.createForClass(
  RelationshipPermissions,
);

@Schema({
  collection: COLLECTION_NAMES.PARENT_STUDENT_RELATIONSHIP,
  timestamps: true,
})
export class ParentStudentRelationship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  parentUserId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({
    enum: [
      'father',
      'mother',
      'guardian',
      'grandparent',
      'sibling',
      'sponsor',
      'other',
    ],
    default: 'guardian',
  })
  relationship!: string;

  @Prop({ default: true })
  isPrimaryGuardian!: boolean;

  @Prop({ default: true })
  isBillingGuardian!: boolean;

  @Prop({ default: true })
  isEmergencyContact!: boolean;

  @Prop({ type: RelationshipPermissionsSchema, default: {} })
  permissions!: RelationshipPermissions;

  @Prop({ enum: ['parent', 'student', 'admin'], default: 'parent' })
  createdBy!: string;

  @Prop({ default: false })
  consentRequired!: boolean;

  @Prop({
    enum: ['invited', 'active', 'rejected', 'revoked', 'expired'],
    default: 'active',
  })
  status!: string;
}

export const ParentStudentRelationshipSchema = SchemaFactory.createForClass(
  ParentStudentRelationship,
);
ParentStudentRelationshipSchema.index(
  { parentUserId: 1, studentProfileId: 1 },
  { unique: true },
);
ParentStudentRelationshipSchema.index({ parentUserId: 1, status: 1 });
ParentStudentRelationshipSchema.index({ studentProfileId: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.STUDENT_INVITATION, timestamps: true })
export class StudentInvitation {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  invitedByUserId!: Types.ObjectId;

  @Prop({ lowercase: true, trim: true, required: true, index: true })
  inviteeEmail!: string;

  @Prop({
    enum: [
      'father',
      'mother',
      'guardian',
      'grandparent',
      'sibling',
      'sponsor',
      'other',
    ],
    default: 'guardian',
  })
  relationship!: string;

  @Prop({ type: RelationshipPermissionsSchema, default: {} })
  permissions!: RelationshipPermissions;

  @Prop({ required: true, unique: true })
  token!: string;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({
    enum: ['pending', 'accepted', 'revoked', 'expired'],
    default: 'pending',
    index: true,
  })
  status!: string;

  @Prop()
  acceptedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  acceptedByUserId?: Types.ObjectId;
}

export const StudentInvitationSchema =
  SchemaFactory.createForClass(StudentInvitation);
StudentInvitationSchema.index({ studentProfileId: 1, inviteeEmail: 1 });
StudentInvitationSchema.index({ token: 1, status: 1, expiresAt: 1 });
StudentInvitationSchema.index({ invitedByUserId: 1, status: 1, createdAt: -1 });

@Schema({ collection: COLLECTION_NAMES.PARENTAL_CONTROL, timestamps: true })
export class ParentalControl {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    unique: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  configuredByUserId!: Types.ObjectId;

  @Prop({ default: true })
  aiTutorEnabled!: boolean;

  @Prop({ default: true })
  assessmentEnabled!: boolean;

  @Prop({ default: false })
  liveMentorEnabled!: boolean;

  @Prop({ default: false })
  communityEnabled!: boolean;

  @Prop({ default: false })
  externalLinksEnabled!: boolean;

  @Prop()
  allowedStartTime?: string;

  @Prop()
  allowedEndTime?: string;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop()
  dailyLearningLimitMinutes?: number;

  @Prop()
  weeklyLearningLimitMinutes?: number;

  @Prop({ default: true })
  requireApprovalForScheduling!: boolean;

  @Prop({ default: true })
  requireApprovalForPurchase!: boolean;

  @Prop({
    enum: ['strict', 'age_appropriate', 'standard'],
    default: 'age_appropriate',
  })
  contentRestrictionLevel!: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  allowedSubjectIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  blockedSubjectIds!: Types.ObjectId[];
}

export const ParentalControlSchema =
  SchemaFactory.createForClass(ParentalControl);
ParentalControlSchema.index({ configuredByUserId: 1, updatedAt: -1 });

@Schema({
  collection: COLLECTION_NAMES.STUDENT_ACADEMIC_RECORD,
  timestamps: true,
})
export class StudentAcademicRecord {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ trim: true })
  institutionName?: string;

  @Prop({ trim: true })
  educationBoard?: string;

  @Prop({ trim: true })
  universityName?: string;

  @Prop({
    enum: [
      'school',
      'undergraduate',
      'postgraduate',
      'diploma',
      'certificate',
      'competitive_exam',
      'other',
    ],
    default: 'school',
  })
  academicLevel!: string;

  @Prop({ trim: true })
  gradeOrYear?: string;

  @Prop({ trim: true })
  courseName?: string;

  @Prop({
    enum: ['current', 'completed', 'discontinued', 'transferred'],
    default: 'current',
  })
  status!: string;

  @Prop({ enum: ['percentage', 'cgpa', 'grade'] })
  resultType?: string;

  @Prop()
  resultValue?: string;
}

export const StudentAcademicRecordSchema = SchemaFactory.createForClass(
  StudentAcademicRecord,
);
StudentAcademicRecordSchema.index({ studentProfileId: 1, createdAt: -1 });
StudentAcademicRecordSchema.index({ studentProfileId: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.ACADEMIC_BOARD, timestamps: true })
export class AcademicBoard {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  code!: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ enum: ['school', 'university', 'professional'], default: 'school' })
  type!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const AcademicBoardSchema = SchemaFactory.createForClass(AcademicBoard);
AcademicBoardSchema.index({ status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.UNIVERSITY, timestamps: true })
export class University {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ trim: true, uppercase: true, unique: true, sparse: true })
  code?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
UniversitySchema.index({ status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.INSTITUTION, timestamps: true })
export class Institution {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ trim: true, uppercase: true, unique: true, sparse: true })
  code?: string;

  @Prop({ type: Types.ObjectId, ref: University.name })
  universityId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: AcademicBoard.name })
  boardId?: Types.ObjectId;

  @Prop({
    enum: ['school', 'college', 'university', 'coaching'],
    default: 'school',
  })
  type!: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  country?: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const InstitutionSchema = SchemaFactory.createForClass(Institution);
InstitutionSchema.index({ name: 1, type: 1 });
InstitutionSchema.index({ status: 1, name: 1 });
InstitutionSchema.index({ universityId: 1, status: 1, name: 1 });
InstitutionSchema.index({ boardId: 1, status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.ACADEMIC_LEVEL, timestamps: true })
export class AcademicLevel {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  code!: string;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const AcademicLevelSchema = SchemaFactory.createForClass(AcademicLevel);
AcademicLevelSchema.index({ status: 1, sortOrder: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.GRADE, timestamps: true })
export class Grade {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  code!: string;

  @Prop({ type: Types.ObjectId, ref: AcademicLevel.name, index: true })
  academicLevelId?: Types.ObjectId;

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
GradeSchema.index({ status: 1, sortOrder: 1, name: 1 });
GradeSchema.index({ academicLevelId: 1, status: 1, sortOrder: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.STREAM, timestamps: true })
export class Stream {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  code!: string;

  @Prop({ enum: ['school', 'college', 'competitive'], default: 'school' })
  type!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const StreamSchema = SchemaFactory.createForClass(Stream);
StreamSchema.index({ status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.COURSE, timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  code!: string;

  @Prop({ type: Types.ObjectId, ref: AcademicLevel.name, index: true })
  academicLevelId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Stream.name })
  streamId?: Types.ObjectId;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ status: 1, name: 1 });
CourseSchema.index({ academicLevelId: 1, status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.SUBJECT, timestamps: true })
export class Subject {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ trim: true, uppercase: true })
  code?: string;

  @Prop({
    enum: [
      'core',
      'elective',
      'language',
      'competitive',
      'skill',
      'professional',
      'other',
    ],
    default: 'core',
  })
  category!: string;

  @Prop({ type: [String], default: [] })
  gradeIds!: string[];

  @Prop({ trim: true })
  description?: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status!: string;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
SubjectSchema.index({ status: 1, name: 1 });
SubjectSchema.index({ category: 1, status: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.TOPIC, timestamps: true })
export class Topic {
  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ type: [String], default: [] })
  gradeIds!: string[];

  @Prop({ default: 0 })
  sortOrder!: number;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
TopicSchema.index({ subjectId: 1, code: 1 }, { unique: true });
TopicSchema.index({ subjectId: 1, status: 1, sortOrder: 1, name: 1 });

@Schema({ collection: COLLECTION_NAMES.CURRICULUM, timestamps: true })
export class Curriculum {
  @Prop({ type: Types.ObjectId, ref: AcademicBoard.name, index: true })
  boardId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Grade.name, required: true, index: true })
  gradeId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Topic.name, default: [] })
  topicIds!: Types.ObjectId[];

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active', index: true })
  status!: string;
}

export const CurriculumSchema = SchemaFactory.createForClass(Curriculum);
CurriculumSchema.index(
  { boardId: 1, gradeId: 1, subjectId: 1 },
  { unique: true },
);
CurriculumSchema.index({ status: 1, code: 1 });
CurriculumSchema.index({ gradeId: 1, status: 1, code: 1 });
CurriculumSchema.index({ subjectId: 1, status: 1, code: 1 });

@Schema({ collection: COLLECTION_NAMES.STUDY_PLAN, timestamps: true })
export class StudyPlan {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ required: true, trim: true, uppercase: true, unique: true })
  code!: string;

  @Prop({
    enum: [
      'school',
      'competitive_exam',
      'college',
      'university',
      'skill_course',
      'professional',
      'other',
    ],
    default: 'competitive_exam',
    index: true,
  })
  category!: string;

  @Prop({
    enum: [
      'jee',
      'neet',
      'upsc',
      'nda',
      'olympiad',
      'board_exam',
      'foundation',
      'skill',
      'other',
    ],
    required: true,
    index: true,
  })
  target!: string;

  @Prop({ type: [Types.ObjectId], ref: Subject.name, default: [] })
  subjectIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Topic.name, default: [] })
  topicIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Curriculum.name, default: [] })
  curriculumIds!: Types.ObjectId[];

  @Prop({ type: [String], default: ['ai'] })
  tutorTypes!: string[];

  @Prop({ type: [String], default: ['chat'] })
  deliveryModes!: string[];

  @Prop({ enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'weekly' })
  scheduleFrequency!: string;

  @Prop({ default: 3, min: 0 })
  sessionsPerWeek!: number;

  @Prop({ default: 45, min: 0 })
  sessionDurationMinutes!: number;

  @Prop({ default: 1, min: 1 })
  maxConcurrentSessions!: number;

  @Prop({ default: 1, min: 1 })
  maxDevicesPerStudent!: number;

  @Prop({ default: 0, min: 0 })
  includedAiMinutes!: number;

  @Prop({ default: 0, min: 0 })
  includedHumanTutorMinutes!: number;

  @Prop({ type: Object, default: {} })
  eligibility!: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  metadata!: Record<string, unknown>;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: true, index: true })
  publiclyVisible!: boolean;

  @Prop({ enum: ['active', 'inactive', 'archived'], default: 'active' })
  status!: string;
}

export const StudyPlanSchema = SchemaFactory.createForClass(StudyPlan);
StudyPlanSchema.index({ category: 1, target: 1, status: 1 });
StudyPlanSchema.index({ category: 1, target: 1, status: 1, name: 1 });
StudyPlanSchema.index({ subjectIds: 1, status: 1 });

@Schema({
  collection: COLLECTION_NAMES.STUDENT_SUBJECT_ENROLLMENT,
  timestamps: true,
})
export class StudentSubjectEnrollment {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({
    enum: ['subscription', 'one_time_purchase', 'free', 'promotional', 'admin'],
    default: 'free',
  })
  accessSource!: string;

  @Prop({ enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  proficiencyLevel!: string;

  @Prop({ trim: true })
  learningGoal?: string;

  @Prop({
    enum: ['active', 'expired', 'paused', 'completed'],
    default: 'active',
  })
  status!: string;
}

export const StudentSubjectEnrollmentSchema = SchemaFactory.createForClass(
  StudentSubjectEnrollment,
);
StudentSubjectEnrollmentSchema.index(
  { studentProfileId: 1, subjectId: 1 },
  { unique: true },
);

@Schema({ collection: COLLECTION_NAMES.LEARNING_SCHEDULE, timestamps: true })
export class LearningSchedule {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  scheduledByUserId!: Types.ObjectId;

  @Prop({
    enum: [
      'ai_tutor',
      'live_class',
      'mentor_session',
      'assessment',
      'revision',
      'event',
    ],
    default: 'ai_tutor',
  })
  type!: string;

  @Prop({ type: Types.ObjectId, ref: Subject.name })
  subjectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  tutorUserId?: Types.ObjectId;

  @Prop({ enum: ['ai', 'human', 'hybrid'], default: 'ai', index: true })
  tutorType!: string;

  @Prop({
    enum: ['chat', 'audio', 'video', 'offline', 'in_person'],
    default: 'chat',
    index: true,
  })
  deliveryMode!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, index: true })
  startAt!: Date;

  @Prop({ required: true })
  endAt!: Date;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop({
    enum: ['scheduled_time_only', 'available_before_and_after', 'open_access'],
    default: 'scheduled_time_only',
  })
  accessRule!: string;

  @Prop({ default: 0 })
  earlyAccessMinutes!: number;

  @Prop({ default: 0 })
  lateAccessMinutes!: number;

  @Prop({ default: 10 })
  joinWindowBeforeMinutes!: number;

  @Prop({ default: 15 })
  joinWindowAfterMinutes!: number;

  @Prop({ type: [Number], default: [60, 15] })
  reminderMinutesBefore!: number[];

  @Prop({ type: [Number], default: [] })
  reminderOffsetsSent!: number[];

  @Prop()
  nextReminderAt?: Date;

  @Prop({ trim: true })
  recurrenceRule?: string;

  @Prop({ default: false })
  parentApprovalRequired!: boolean;

  @Prop({ default: false })
  parentApproved!: boolean;

  @Prop({
    enum: ['scheduled', 'started', 'completed', 'cancelled', 'missed'],
    default: 'scheduled',
    index: true,
  })
  status!: string;

  @Prop({ type: Types.ObjectId })
  subscriptionEntitlementId?: Types.ObjectId;
}

export const LearningScheduleSchema =
  SchemaFactory.createForClass(LearningSchedule);
LearningScheduleSchema.index({ studentProfileId: 1, startAt: 1, status: 1 });
LearningScheduleSchema.index({ studentProfileId: 1, startAt: 1 });
LearningScheduleSchema.index({ studentProfileId: 1, status: 1, startAt: 1 });
LearningScheduleSchema.index({ tutorUserId: 1, startAt: 1, status: 1 });
LearningScheduleSchema.index({ status: 1, startAt: 1, endAt: 1 });
LearningScheduleSchema.index({ subjectId: 1, startAt: 1 });

@Schema({ collection: COLLECTION_NAMES.LEARNING_ENTITLEMENT, timestamps: true })
export class LearningEntitlement {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({
    enum: [
      'subject_access',
      'ai_minutes',
      'scheduled_session',
      'assessment',
      'course_access',
    ],
    required: true,
  })
  entitlementType!: string;

  @Prop({ type: Types.ObjectId, ref: Subject.name })
  subjectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LearningSchedule.name })
  scheduleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: StudyPlan.name, index: true })
  studyPlanId?: Types.ObjectId;

  @Prop()
  allocatedQuantity?: number;

  @Prop({ default: 0 })
  usedQuantity!: number;

  @Prop({ required: true })
  startsAt!: Date;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({
    enum: ['active', 'used', 'expired', 'revoked'],
    default: 'active',
    index: true,
  })
  status!: string;
}

export const LearningEntitlementSchema =
  SchemaFactory.createForClass(LearningEntitlement);
LearningEntitlementSchema.index({
  studentProfileId: 1,
  status: 1,
  expiresAt: 1,
});
LearningEntitlementSchema.index({
  studentProfileId: 1,
  subjectId: 1,
  status: 1,
});
LearningEntitlementSchema.index({ scheduleId: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.AI_TUTOR_SESSION, timestamps: true })
export class AiTutorSession {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LearningSchedule.name })
  scheduleId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Subject.name, required: true })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LearningEntitlement.name, required: true })
  accessEntitlementId!: Types.ObjectId;

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop({
    enum: ['created', 'active', 'completed', 'expired', 'blocked', 'cancelled'],
    default: 'created',
  })
  status!: string;

  @Prop({ default: 0 })
  totalMessages!: number;

  @Prop({ default: 0 })
  totalDurationSeconds!: number;

  @Prop({ type: [String], default: [] })
  learningObjectives!: string[];

  @Prop({
    enum: ['chat', 'audio', 'video'],
    default: 'chat',
  })
  deliveryMode!: string;

  @Prop({ default: 0 })
  totalTokens!: number;

  @Prop({ default: 0 })
  safetyEventsCount!: number;

  @Prop()
  sessionSummary?: string;
}

export const AiTutorSessionSchema =
  SchemaFactory.createForClass(AiTutorSession);
AiTutorSessionSchema.index({ studentProfileId: 1, createdAt: -1 });
AiTutorSessionSchema.index({ studentProfileId: 1, status: 1, createdAt: -1 });
AiTutorSessionSchema.index({ scheduleId: 1, status: 1 });
AiTutorSessionSchema.index({ subjectId: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.AI_TUTOR_MESSAGE, timestamps: true })
export class AiTutorMessage {
  @Prop({
    type: Types.ObjectId,
    ref: AiTutorSession.name,
    required: true,
    index: true,
  })
  sessionId!: Types.ObjectId;

  @Prop({ enum: ['student', 'ai', 'system'], required: true })
  sender!: string;

  @Prop({
    enum: [
      'text',
      'question',
      'answer',
      'quiz',
      'hint',
      'explanation',
      'image',
      'audio',
      'document',
    ],
    default: 'text',
  })
  messageType!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop()
  safetyStatus?: string;
}

export const AiTutorMessageSchema =
  SchemaFactory.createForClass(AiTutorMessage);
AiTutorMessageSchema.index({ sessionId: 1, createdAt: 1 });

@Schema({ collection: COLLECTION_NAMES.QUESTION_BANK, timestamps: true })
export class QuestionBank {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Topic.name, index: true })
  topicId?: Types.ObjectId;

  @Prop({
    enum: ['school', 'exam_prep', 'skill', 'diagnostic'],
    default: 'school',
  })
  category!: string;

  @Prop({ enum: ['active', 'archived'], default: 'active', index: true })
  status!: string;
}

export const QuestionBankSchema = SchemaFactory.createForClass(QuestionBank);
QuestionBankSchema.index({ subjectId: 1, topicId: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.QUESTION, timestamps: true })
export class Question {
  @Prop({
    type: Types.ObjectId,
    ref: QuestionBank.name,
    required: true,
    index: true,
  })
  questionBankId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Topic.name, index: true })
  topicId?: Types.ObjectId;

  @Prop({
    enum: ['mcq_single', 'mcq_multi', 'short_answer', 'long_answer', 'coding'],
    default: 'mcq_single',
  })
  type!: string;

  @Prop({ required: true })
  prompt!: string;

  @Prop({ type: [Object], default: [] })
  options!: Record<string, unknown>[];

  @Prop({ type: Object, default: {} })
  answerKey!: Record<string, unknown>;

  @Prop({ enum: ['easy', 'medium', 'hard'], default: 'medium', index: true })
  difficulty!: string;

  @Prop({ default: 1 })
  points!: number;

  @Prop({ enum: ['active', 'archived'], default: 'active', index: true })
  status!: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
QuestionSchema.index({ questionBankId: 1, difficulty: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.ASSESSMENT, timestamps: true })
export class Assessment {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: Topic.name, default: [] })
  topicIds!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: Question.name, default: [] })
  questionIds!: Types.ObjectId[];

  @Prop({
    enum: ['diagnostic', 'practice', 'homework', 'quiz', 'exam'],
    default: 'practice',
    index: true,
  })
  assessmentType!: string;

  @Prop({ default: 0 })
  durationMinutes!: number;

  @Prop({ default: 0 })
  passingScorePercentage!: number;

  @Prop({
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true,
  })
  status!: string;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
AssessmentSchema.index({ subjectId: 1, status: 1, assessmentType: 1 });

@Schema({ collection: COLLECTION_NAMES.ASSESSMENT_ATTEMPT, timestamps: true })
export class AssessmentAttempt {
  @Prop({
    type: Types.ObjectId,
    ref: Assessment.name,
    required: true,
    index: true,
  })
  assessmentId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: LearningSchedule.name, index: true })
  scheduleId?: Types.ObjectId;

  @Prop({
    enum: ['started', 'submitted', 'graded', 'abandoned'],
    default: 'started',
    index: true,
  })
  status!: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  submittedAt?: Date;
}

export const AssessmentAttemptSchema =
  SchemaFactory.createForClass(AssessmentAttempt);
AssessmentAttemptSchema.index({ studentProfileId: 1, createdAt: -1 });
AssessmentAttemptSchema.index({
  studentProfileId: 1,
  status: 1,
  createdAt: -1,
});
AssessmentAttemptSchema.index({ assessmentId: 1, studentProfileId: 1 });

@Schema({ collection: COLLECTION_NAMES.ASSESSMENT_ANSWER, timestamps: true })
export class AssessmentAnswer {
  @Prop({
    type: Types.ObjectId,
    ref: AssessmentAttempt.name,
    required: true,
    index: true,
  })
  attemptId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Question.name,
    required: true,
    index: true,
  })
  questionId!: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  response!: Record<string, unknown>;

  @Prop({ default: 0 })
  awardedPoints!: number;

  @Prop({ default: false })
  isCorrect!: boolean;
}

export const AssessmentAnswerSchema =
  SchemaFactory.createForClass(AssessmentAnswer);
AssessmentAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

@Schema({ collection: COLLECTION_NAMES.ASSESSMENT_RESULT, timestamps: true })
export class AssessmentResult {
  @Prop({
    type: Types.ObjectId,
    ref: AssessmentAttempt.name,
    required: true,
    unique: true,
  })
  attemptId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ default: 0 })
  scorePercentage!: number;

  @Prop({ default: 0 })
  totalPoints!: number;

  @Prop({ default: 0 })
  awardedPoints!: number;

  @Prop({ default: false })
  passed!: boolean;

  @Prop({ type: [String], default: [] })
  strengths!: string[];

  @Prop({ type: [String], default: [] })
  improvementAreas!: string[];
}

export const AssessmentResultSchema =
  SchemaFactory.createForClass(AssessmentResult);
AssessmentResultSchema.index({ studentProfileId: 1, createdAt: -1 });
AssessmentResultSchema.index({ studentProfileId: 1, updatedAt: -1 });
AssessmentResultSchema.index({
  studentProfileId: 1,
  subjectId: 1,
  createdAt: -1,
});

@Schema({
  collection: COLLECTION_NAMES.STUDENT_TOPIC_PROGRESS,
  timestamps: true,
})
export class StudentTopicProgress {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Subject.name,
    required: true,
    index: true,
  })
  subjectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Topic.name, required: true, index: true })
  topicId!: Types.ObjectId;

  @Prop({ default: 0, min: 0, max: 100 })
  masteryPercentage!: number;

  @Prop({ default: 0 })
  practiceCount!: number;

  @Prop()
  lastPracticedAt?: Date;
}

export const StudentTopicProgressSchema =
  SchemaFactory.createForClass(StudentTopicProgress);
StudentTopicProgressSchema.index(
  { studentProfileId: 1, subjectId: 1, topicId: 1 },
  { unique: true },
);

@Schema({
  collection: COLLECTION_NAMES.LEARNING_RECOMMENDATION,
  timestamps: true,
})
export class LearningRecommendation {
  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Subject.name, index: true })
  subjectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Topic.name, index: true })
  topicId?: Types.ObjectId;

  @Prop({
    enum: ['topic_revision', 'assessment', 'ai_session', 'parent_review'],
    required: true,
  })
  type!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  reason?: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium', index: true })
  priority!: string;

  @Prop({
    enum: ['open', 'accepted', 'dismissed', 'completed'],
    default: 'open',
    index: true,
  })
  status!: string;
}

export const LearningRecommendationSchema = SchemaFactory.createForClass(
  LearningRecommendation,
);
LearningRecommendationSchema.index({
  studentProfileId: 1,
  status: 1,
  priority: 1,
});
LearningRecommendationSchema.index({
  studentProfileId: 1,
  priority: -1,
  createdAt: -1,
});
LearningRecommendationSchema.index({
  studentProfileId: 1,
  status: 1,
  priority: -1,
  createdAt: -1,
});

@Schema({ collection: COLLECTION_NAMES.CLASSROOM, timestamps: true })
export class Classroom {
  @Prop({
    type: Types.ObjectId,
    ref: LearningSchedule.name,
    required: true,
    unique: true,
  })
  scheduleId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  tutorUserId?: Types.ObjectId;

  @Prop({ enum: ['ai', 'human', 'hybrid'], required: true, index: true })
  tutorType!: string;

  @Prop({
    enum: ['chat', 'audio', 'video', 'offline', 'in_person'],
    required: true,
  })
  deliveryMode!: string;

  @Prop({
    enum: ['created', 'open', 'closed', 'cancelled'],
    default: 'created',
    index: true,
  })
  status!: string;

  @Prop()
  openedAt?: Date;

  @Prop()
  closedAt?: Date;

  @Prop({ default: false })
  recordingEnabled!: boolean;

  @Prop({ default: false })
  transcriptEnabled!: boolean;

  @Prop()
  summary?: string;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);
ClassroomSchema.index({ studentProfileId: 1, status: 1, createdAt: -1 });
ClassroomSchema.index({ tutorUserId: 1, status: 1, createdAt: -1 });

@Schema({ collection: COLLECTION_NAMES.CLASSROOM_MESSAGE, timestamps: true })
export class ClassroomMessage {
  @Prop({
    type: Types.ObjectId,
    ref: Classroom.name,
    required: true,
    index: true,
  })
  classroomId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderUserId!: Types.ObjectId;

  @Prop({
    enum: ['student', 'parent', 'tutor', 'ai', 'system'],
    required: true,
  })
  senderRole!: string;

  @Prop({ enum: ['text', 'file', 'whiteboard', 'system'], default: 'text' })
  messageType!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ enum: ['clean', 'review', 'blocked'], default: 'clean', index: true })
  safetyStatus!: string;
}

export const ClassroomMessageSchema =
  SchemaFactory.createForClass(ClassroomMessage);
ClassroomMessageSchema.index({ classroomId: 1, createdAt: 1 });

@Schema({ collection: COLLECTION_NAMES.CLASSROOM_FILE, timestamps: true })
export class ClassroomFile {
  @Prop({
    type: Types.ObjectId,
    ref: Classroom.name,
    required: true,
    index: true,
  })
  classroomId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedByUserId!: Types.ObjectId;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ trim: true })
  originalName?: string;

  @Prop({
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  moderationStatus!: string;
}

export const ClassroomFileSchema = SchemaFactory.createForClass(ClassroomFile);
ClassroomFileSchema.index({ classroomId: 1, createdAt: -1 });

@Schema({ collection: COLLECTION_NAMES.TUTOR_PROFILE, timestamps: true })
export class TutorProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [], index: true })
  subjectIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  deliveryModes!: string[];

  @Prop({ type: [String], default: [] })
  languages!: string[];

  @Prop({ default: false, index: true })
  verified!: boolean;

  @Prop({
    enum: ['active', 'inactive', 'suspended'],
    default: 'inactive',
    index: true,
  })
  status!: string;

  @Prop({ default: 0 })
  hourlyRateMinor!: number;
}

export const TutorProfileSchema = SchemaFactory.createForClass(TutorProfile);
TutorProfileSchema.index({ status: 1, verified: 1, subjectIds: 1 });

@Schema({ collection: COLLECTION_NAMES.TUTOR_AVAILABILITY, timestamps: true })
export class TutorAvailability {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  tutorUserId!: Types.ObjectId;

  @Prop({ required: true })
  startAt!: Date;

  @Prop({ required: true })
  endAt!: Date;

  @Prop({ default: 'Asia/Kolkata' })
  timezone!: string;

  @Prop({
    enum: ['available', 'held', 'booked', 'blocked'],
    default: 'available',
    index: true,
  })
  status!: string;
}

export const TutorAvailabilitySchema =
  SchemaFactory.createForClass(TutorAvailability);
TutorAvailabilitySchema.index({ tutorUserId: 1, startAt: 1, status: 1 });

@Schema({ collection: COLLECTION_NAMES.TUTOR_SESSION_NOTE, timestamps: true })
export class TutorSessionNote {
  @Prop({
    type: Types.ObjectId,
    ref: LearningSchedule.name,
    required: true,
    unique: true,
  })
  scheduleId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  tutorUserId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: StudentProfile.name,
    required: true,
    index: true,
  })
  studentProfileId!: Types.ObjectId;

  @Prop()
  attendanceStatus?: string;

  @Prop()
  summary?: string;

  @Prop({ type: [String], default: [] })
  homework!: string[];
}

export const TutorSessionNoteSchema =
  SchemaFactory.createForClass(TutorSessionNote);

@Schema({ collection: COLLECTION_NAMES.SAFETY_EVENT, timestamps: true })
export class SafetyEvent {
  @Prop({ type: Types.ObjectId, ref: StudentProfile.name, index: true })
  studentProfileId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  userId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, index: true })
  sourceId?: Types.ObjectId;

  @Prop({
    enum: ['ai_tutor', 'classroom', 'chat', 'profile', 'payment'],
    required: true,
    index: true,
  })
  sourceType!: string;

  @Prop({
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true,
  })
  severity!: string;

  @Prop({
    enum: ['open', 'reviewing', 'resolved', 'dismissed'],
    default: 'open',
    index: true,
  })
  status!: string;

  @Prop({ type: [String], default: [] })
  reasons!: string[];

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const SafetyEventSchema = SchemaFactory.createForClass(SafetyEvent);
SafetyEventSchema.index({ status: 1, severity: 1, createdAt: -1 });
SafetyEventSchema.index({ studentProfileId: 1, status: 1, createdAt: -1 });
SafetyEventSchema.index({ userId: 1, status: 1, createdAt: -1 });
