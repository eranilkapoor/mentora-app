import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';

export type StudentProfileDocument = HydratedDocument<StudentProfile>;
export type ParentProfileDocument = HydratedDocument<ParentProfile>;
export type ParentStudentRelationshipDocument =
  HydratedDocument<ParentStudentRelationship>;
export type ParentalControlDocument = HydratedDocument<ParentalControl>;
export type AcademicRecordDocument = HydratedDocument<StudentAcademicRecord>;
export type SubjectDocument = HydratedDocument<Subject>;
export type StudentSubjectEnrollmentDocument =
  HydratedDocument<StudentSubjectEnrollment>;
export type LearningScheduleDocument = HydratedDocument<LearningSchedule>;
export type LearningEntitlementDocument = HydratedDocument<LearningEntitlement>;
export type AiTutorSessionDocument = HydratedDocument<AiTutorSession>;
export type AiTutorMessageDocument = HydratedDocument<AiTutorMessage>;
export type ClassroomDocument = HydratedDocument<Classroom>;
export type ClassroomMessageDocument = HydratedDocument<ClassroomMessage>;
export type ClassroomFileDocument = HydratedDocument<ClassroomFile>;
export type TutorProfileDocument = HydratedDocument<TutorProfile>;
export type TutorAvailabilityDocument = HydratedDocument<TutorAvailability>;
export type TutorSessionNoteDocument = HydratedDocument<TutorSessionNote>;
export type SafetyEventDocument = HydratedDocument<SafetyEvent>;

@Schema({ collection: COLLECTION_NAMES.STUDENT_PROFILE, timestamps: true })
export class StudentProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
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
StudentProfileSchema.index({ userId: 1 });
StudentProfileSchema.index({ createdByUserId: 1, status: 1 });

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

@Schema({ collection: COLLECTION_NAMES.SUBJECT, timestamps: true })
export class Subject {
  @Prop({ required: true, trim: true, index: true })
  name!: string;

  @Prop({ trim: true, uppercase: true, index: true })
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
SubjectSchema.index({ code: 1 }, { unique: true, sparse: true });

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
