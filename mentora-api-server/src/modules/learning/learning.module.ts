import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@/modules/auth/schemas/user.schema';
import { LearningController } from './controllers/learning.controller';
import { StudentsController } from './controllers/students.controller';
import { LearningService } from './services/learning.service';
import {
  AiTutorMessage,
  AiTutorMessageSchema,
  AiTutorSession,
  AiTutorSessionSchema,
  Classroom,
  ClassroomFile,
  ClassroomFileSchema,
  ClassroomMessage,
  ClassroomMessageSchema,
  ClassroomSchema,
  LearningEntitlement,
  LearningEntitlementSchema,
  LearningSchedule,
  LearningScheduleSchema,
  ParentProfile,
  ParentProfileSchema,
  ParentStudentRelationship,
  ParentStudentRelationshipSchema,
  ParentalControl,
  ParentalControlSchema,
  StudentAcademicRecord,
  StudentAcademicRecordSchema,
  StudentProfile,
  StudentProfileSchema,
  StudentSubjectEnrollment,
  StudentSubjectEnrollmentSchema,
  Subject,
  SubjectSchema,
  SafetyEvent,
  SafetyEventSchema,
  TutorAvailability,
  TutorAvailabilitySchema,
  TutorProfile,
  TutorProfileSchema,
  TutorSessionNote,
  TutorSessionNoteSchema,
} from './schemas/learning.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      {
        name: ParentStudentRelationship.name,
        schema: ParentStudentRelationshipSchema,
      },
      { name: ParentalControl.name, schema: ParentalControlSchema },
      { name: StudentAcademicRecord.name, schema: StudentAcademicRecordSchema },
      { name: Subject.name, schema: SubjectSchema },
      {
        name: StudentSubjectEnrollment.name,
        schema: StudentSubjectEnrollmentSchema,
      },
      { name: LearningSchedule.name, schema: LearningScheduleSchema },
      { name: LearningEntitlement.name, schema: LearningEntitlementSchema },
      { name: AiTutorSession.name, schema: AiTutorSessionSchema },
      { name: AiTutorMessage.name, schema: AiTutorMessageSchema },
      { name: Classroom.name, schema: ClassroomSchema },
      { name: ClassroomMessage.name, schema: ClassroomMessageSchema },
      { name: ClassroomFile.name, schema: ClassroomFileSchema },
      { name: TutorProfile.name, schema: TutorProfileSchema },
      { name: TutorAvailability.name, schema: TutorAvailabilitySchema },
      { name: TutorSessionNote.name, schema: TutorSessionNoteSchema },
      { name: SafetyEvent.name, schema: SafetyEventSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [StudentsController, LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
