import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddParentDto,
  CreateAcademicRecordDto,
  CreateAiTutorSessionDto,
  CreateEntitlementDto,
  CreateScheduleDto,
  CreateStudentDto,
  CreateSubjectDto,
  EnrollSubjectDto,
  SendAiTutorMessageDto,
  UpdateParentalControlsDto,
  UpdateStudentDto,
} from '../dto/learning.dto';
import {
  AcademicRecordDocument,
  AiTutorMessage,
  AiTutorMessageDocument,
  AiTutorSession,
  AiTutorSessionDocument,
  LearningEntitlement,
  LearningEntitlementDocument,
  LearningSchedule,
  LearningScheduleDocument,
  ParentProfile,
  ParentProfileDocument,
  ParentStudentRelationship,
  ParentStudentRelationshipDocument,
  ParentalControl,
  ParentalControlDocument,
  StudentAcademicRecord,
  StudentProfile,
  StudentProfileDocument,
  StudentSubjectEnrollment,
  StudentSubjectEnrollmentDocument,
  Subject,
  SubjectDocument,
} from '../schemas/learning.schemas';

type AccessResult = {
  allowed: boolean;
  denialReason?:
    | 'OUTSIDE_SCHEDULE'
    | 'NO_SUBSCRIPTION'
    | 'SUBJECT_NOT_INCLUDED'
    | 'PARENTAL_CONTROL_BLOCKED'
    | 'DAILY_LIMIT_EXCEEDED'
    | 'ENTITLEMENT_EXPIRED';
  entitlementId?: string;
  remainingMinutes?: number;
};

@Injectable()
export class LearningService {
  constructor(
    @InjectModel(StudentProfile.name)
    private readonly students: Model<StudentProfileDocument>,
    @InjectModel(ParentProfile.name)
    private readonly parents: Model<ParentProfileDocument>,
    @InjectModel(ParentStudentRelationship.name)
    private readonly relationships: Model<ParentStudentRelationshipDocument>,
    @InjectModel(ParentalControl.name)
    private readonly controls: Model<ParentalControlDocument>,
    @InjectModel(StudentAcademicRecord.name)
    private readonly academicRecords: Model<AcademicRecordDocument>,
    @InjectModel(Subject.name)
    private readonly subjects: Model<SubjectDocument>,
    @InjectModel(StudentSubjectEnrollment.name)
    private readonly enrollments: Model<StudentSubjectEnrollmentDocument>,
    @InjectModel(LearningSchedule.name)
    private readonly schedules: Model<LearningScheduleDocument>,
    @InjectModel(LearningEntitlement.name)
    private readonly entitlements: Model<LearningEntitlementDocument>,
    @InjectModel(AiTutorSession.name)
    private readonly aiSessions: Model<AiTutorSessionDocument>,
    @InjectModel(AiTutorMessage.name)
    private readonly aiMessages: Model<AiTutorMessageDocument>,
  ) {}

  async createStudent(userId: string, dto: CreateStudentDto) {
    const ownershipType = dto.ownershipType ?? 'self_managed';
    const registrationMode =
      ownershipType === 'parent_managed'
        ? 'parent_created_child'
        : 'independent_student';
    const dateOfBirth = new Date(dto.dateOfBirth);

    const student = await this.students.create({
      ...dto,
      dateOfBirth,
      ageCategory: this.getAgeCategory(dateOfBirth),
      ownershipType,
      registrationMode,
      userId:
        ownershipType === 'parent_managed'
          ? undefined
          : new Types.ObjectId(userId),
      createdByUserId: new Types.ObjectId(userId),
    });

    if (ownershipType === 'parent_managed') {
      await this.parents.updateOne(
        { userId: new Types.ObjectId(userId) },
        { $setOnInsert: { userId: new Types.ObjectId(userId) } },
        { upsert: true },
      );
      await this.relationships.create({
        parentUserId: new Types.ObjectId(userId),
        studentProfileId: student._id,
        relationship: 'guardian',
        createdBy: 'parent',
      });
      await this.ensureDefaultParentalControl(
        String(student._id),
        userId,
        student.ageCategory,
      );
    }

    return student;
  }

  async listStudents(userId: string) {
    const ownStudents = await this.students
      .find({
        $or: [
          { userId: new Types.ObjectId(userId) },
          { createdByUserId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const relationships = await this.relationships
      .find({
        parentUserId: new Types.ObjectId(userId),
        status: 'active',
      })
      .lean();

    const relatedIds = relationships.map((item) => item.studentProfileId);
    const relatedStudents = relatedIds.length
      ? await this.students.find({ _id: { $in: relatedIds } }).lean()
      : [];

    const byId = new Map<string, unknown>();
    [...ownStudents, ...relatedStudents].forEach((student) => {
      byId.set(String(student._id), student);
    });

    return Array.from(byId.values());
  }

  async getStudentForUser(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewProfile');
    return this.getStudentOrThrow(studentId);
  }

  async updateStudent(
    userId: string,
    studentId: string,
    dto: UpdateStudentDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'editProfile');
    const updated = await this.students
      .findByIdAndUpdate(studentId, dto, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Student profile not found');
    return updated;
  }

  async addParent(userId: string, studentId: string, dto: AddParentDto) {
    await this.assertStudentAccess(userId, studentId, 'editProfile');
    await this.parents.updateOne(
      { userId: new Types.ObjectId(dto.parentUserId) },
      { $setOnInsert: { userId: new Types.ObjectId(dto.parentUserId) } },
      { upsert: true },
    );
    return this.relationships.findOneAndUpdate(
      {
        parentUserId: new Types.ObjectId(dto.parentUserId),
        studentProfileId: new Types.ObjectId(studentId),
      },
      {
        relationship: dto.relationship ?? 'guardian',
        permissions: dto.permissions,
        status: 'active',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateParentalControls(
    userId: string,
    studentId: string,
    dto: UpdateParentalControlsDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'manageParentalControls');
    return this.controls.findOneAndUpdate(
      { studentProfileId: new Types.ObjectId(studentId) },
      {
        ...dto,
        configuredByUserId: new Types.ObjectId(userId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async createAcademicRecord(
    userId: string,
    studentId: string,
    dto: CreateAcademicRecordDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'editAcademicRecords');
    const record = await this.academicRecords.create({
      ...dto,
      studentProfileId: new Types.ObjectId(studentId),
    });
    if (record.status === 'current') {
      await this.students.findByIdAndUpdate(studentId, {
        currentAcademicRecordId: record._id,
        onboardingCompleted: true,
        profileCompletionPercentage: 70,
      });
    }
    return record;
  }

  async listAcademicRecords(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewAcademicRecords');
    return this.academicRecords
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async createSubject(dto: CreateSubjectDto) {
    return this.subjects.findOneAndUpdate(
      {
        $or: [
          ...(dto.code ? [{ code: dto.code.toUpperCase() }] : []),
          { name: dto.name },
        ],
      },
      {
        ...dto,
        code: dto.code?.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listSubjects() {
    return this.subjects.find({ status: 'active' }).sort({ name: 1 }).lean();
  }

  async enrollSubject(
    userId: string,
    studentId: string,
    dto: EnrollSubjectDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'manageSubjects');
    await this.getSubjectOrThrow(dto.subjectId);
    return this.enrollments.findOneAndUpdate(
      {
        studentProfileId: new Types.ObjectId(studentId),
        subjectId: new Types.ObjectId(dto.subjectId),
      },
      {
        ...dto,
        studentProfileId: new Types.ObjectId(studentId),
        subjectId: new Types.ObjectId(dto.subjectId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async createSchedule(
    userId: string,
    studentId: string,
    dto: CreateScheduleDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'manageSchedule');
    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException(
        'Schedule end time must be after start time',
      );
    }
    if (dto.subjectId) {
      await this.assertSubjectEnrollment(studentId, dto.subjectId);
    }
    return this.schedules.create({
      ...dto,
      studentProfileId: new Types.ObjectId(studentId),
      scheduledByUserId: new Types.ObjectId(userId),
      subjectId: dto.subjectId ? new Types.ObjectId(dto.subjectId) : undefined,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    });
  }

  async listSchedules(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'manageSchedule');
    return this.schedules
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ startAt: 1 })
      .lean();
  }

  async cancelSchedule(userId: string, scheduleId: string) {
    const schedule = await this.getScheduleOrThrow(scheduleId);
    await this.assertStudentAccess(
      userId,
      String(schedule.studentProfileId),
      'manageSchedule',
    );
    return this.schedules.findByIdAndUpdate(
      scheduleId,
      { status: 'cancelled' },
      { new: true },
    );
  }

  async createEntitlement(userId: string, dto: CreateEntitlementDto) {
    await this.assertStudentAccess(
      userId,
      dto.studentProfileId,
      'manageSubscription',
    );
    return this.entitlements.create({
      ...dto,
      studentProfileId: new Types.ObjectId(dto.studentProfileId),
      subjectId: dto.subjectId ? new Types.ObjectId(dto.subjectId) : undefined,
      scheduleId: dto.scheduleId
        ? new Types.ObjectId(dto.scheduleId)
        : undefined,
      startsAt: new Date(dto.startsAt),
      expiresAt: new Date(dto.expiresAt),
    });
  }

  async createAiTutorSession(userId: string, dto: CreateAiTutorSessionDto) {
    await this.assertStudentAccess(userId, dto.studentProfileId, 'viewProfile');
    const access = await this.checkAiAccess({
      studentProfileId: dto.studentProfileId,
      subjectId: dto.subjectId,
      scheduleId: dto.scheduleId,
      requestedAt: new Date(),
    });
    if (!access.allowed || !access.entitlementId) {
      throw new ForbiddenException(access);
    }
    const session = await this.aiSessions.create({
      studentProfileId: new Types.ObjectId(dto.studentProfileId),
      subjectId: new Types.ObjectId(dto.subjectId),
      scheduleId: dto.scheduleId
        ? new Types.ObjectId(dto.scheduleId)
        : undefined,
      accessEntitlementId: new Types.ObjectId(access.entitlementId),
      startedAt: new Date(),
      status: 'active',
    });
    return { session, access };
  }

  async getAiTutorSession(userId: string, sessionId: string) {
    const session = await this.aiSessions.findById(sessionId).lean();
    if (!session) throw new NotFoundException('AI tutor session not found');
    await this.assertStudentAccess(
      userId,
      String(session.studentProfileId),
      'viewLearningHistory',
    );
    const messages = await this.aiMessages
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .lean();
    return { session, messages };
  }

  async sendAiTutorMessage(
    userId: string,
    sessionId: string,
    dto: SendAiTutorMessageDto,
  ) {
    const session = await this.aiSessions.findById(sessionId);
    if (!session) throw new NotFoundException('AI tutor session not found');
    await this.assertStudentAccess(
      userId,
      String(session.studentProfileId),
      'viewProfile',
    );
    if (session.status !== 'active') {
      throw new BadRequestException('AI tutor session is not active');
    }

    const studentMessage = await this.aiMessages.create({
      sessionId: session._id,
      sender: 'student',
      messageType: dto.messageType ?? 'text',
      content: dto.content,
      safetyStatus: 'pending_review',
    });
    const aiMessage = await this.aiMessages.create({
      sessionId: session._id,
      sender: 'ai',
      messageType: 'explanation',
      content:
        'Mentora AI tutor is ready for this subject. The full model provider integration will generate the next adaptive explanation here.',
      metadata: {
        placeholder: true,
      },
      safetyStatus: 'allowed',
    });
    session.totalMessages += 2;
    await session.save();
    return { studentMessage, aiMessage };
  }

  async completeAiTutorSession(userId: string, sessionId: string) {
    const session = await this.aiSessions.findById(sessionId);
    if (!session) throw new NotFoundException('AI tutor session not found');
    await this.assertStudentAccess(
      userId,
      String(session.studentProfileId),
      'viewProfile',
    );
    session.status = 'completed';
    session.endedAt = new Date();
    session.sessionSummary =
      session.sessionSummary ??
      'Session completed. A detailed AI-generated summary will be added when the tutor provider is connected.';
    return session.save();
  }

  async listAiHistory(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    return this.aiSessions
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async checkAiAccess(input: {
    studentProfileId: string;
    subjectId: string;
    scheduleId?: string;
    requestedAt: Date;
  }): Promise<AccessResult> {
    const student = await this.students.findById(input.studentProfileId).lean();
    if (!student || student.status !== 'active') {
      return { allowed: false, denialReason: 'PARENTAL_CONTROL_BLOCKED' };
    }

    const control = await this.controls
      .findOne({ studentProfileId: student._id })
      .lean();
    if (control && !control.aiTutorEnabled) {
      return { allowed: false, denialReason: 'PARENTAL_CONTROL_BLOCKED' };
    }
    if (
      control?.blockedSubjectIds?.some(
        (subjectId) => String(subjectId) === input.subjectId,
      )
    ) {
      return { allowed: false, denialReason: 'SUBJECT_NOT_INCLUDED' };
    }

    const enrollment = await this.enrollments.findOne({
      studentProfileId: student._id,
      subjectId: new Types.ObjectId(input.subjectId),
      status: 'active',
    });
    if (!enrollment) {
      return { allowed: false, denialReason: 'SUBJECT_NOT_INCLUDED' };
    }

    if (input.scheduleId) {
      const schedule = await this.schedules.findById(input.scheduleId).lean();
      if (!schedule || schedule.status === 'cancelled') {
        return { allowed: false, denialReason: 'OUTSIDE_SCHEDULE' };
      }
      const startsAt = new Date(schedule.startAt);
      startsAt.setMinutes(startsAt.getMinutes() - schedule.earlyAccessMinutes);
      const endsAt = new Date(schedule.endAt);
      endsAt.setMinutes(endsAt.getMinutes() + schedule.lateAccessMinutes);
      if (
        schedule.accessRule === 'scheduled_time_only' &&
        (input.requestedAt < startsAt || input.requestedAt > endsAt)
      ) {
        return { allowed: false, denialReason: 'OUTSIDE_SCHEDULE' };
      }
    }

    const entitlement = await this.entitlements
      .findOne({
        studentProfileId: student._id,
        status: 'active',
        startsAt: { $lte: input.requestedAt },
        expiresAt: { $gte: input.requestedAt },
        $or: [
          { subjectId: new Types.ObjectId(input.subjectId) },
          { entitlementType: 'ai_minutes' },
          ...(input.scheduleId
            ? [{ scheduleId: new Types.ObjectId(input.scheduleId) }]
            : []),
        ],
      })
      .sort({ expiresAt: 1 });

    if (!entitlement) {
      return { allowed: false, denialReason: 'NO_SUBSCRIPTION' };
    }
    if (entitlement.expiresAt < input.requestedAt) {
      return { allowed: false, denialReason: 'ENTITLEMENT_EXPIRED' };
    }
    if (
      entitlement.allocatedQuantity !== undefined &&
      entitlement.usedQuantity >= entitlement.allocatedQuantity
    ) {
      return { allowed: false, denialReason: 'DAILY_LIMIT_EXCEEDED' };
    }

    return {
      allowed: true,
      entitlementId: String(entitlement._id),
      remainingMinutes:
        entitlement.allocatedQuantity !== undefined
          ? Math.max(
              entitlement.allocatedQuantity - entitlement.usedQuantity,
              0,
            )
          : undefined,
    };
  }

  private async getStudentOrThrow(studentId: string) {
    const student = await this.students.findById(studentId).lean();
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  private async getSubjectOrThrow(subjectId: string) {
    const subject = await this.subjects.findById(subjectId).lean();
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  private async getScheduleOrThrow(scheduleId: string) {
    const schedule = await this.schedules.findById(scheduleId).lean();
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  private async assertSubjectEnrollment(studentId: string, subjectId: string) {
    const enrollment = await this.enrollments.findOne({
      studentProfileId: new Types.ObjectId(studentId),
      subjectId: new Types.ObjectId(subjectId),
      status: 'active',
    });
    if (!enrollment) {
      throw new ForbiddenException('Student is not enrolled in this subject');
    }
  }

  private async assertStudentAccess(
    userId: string,
    studentId: string,
    permission: keyof import('../schemas/learning.schemas').RelationshipPermissions,
  ) {
    const student = await this.getStudentOrThrow(studentId);
    if (
      String(student.userId ?? '') === userId ||
      String(student.createdByUserId) === userId
    ) {
      return;
    }

    const relationship = await this.relationships.findOne({
      parentUserId: new Types.ObjectId(userId),
      studentProfileId: new Types.ObjectId(studentId),
      status: 'active',
    });

    if (relationship?.permissions?.[permission]) {
      return;
    }

    throw new ForbiddenException('You do not have access to this student');
  }

  private async ensureDefaultParentalControl(
    studentId: string,
    userId: string,
    ageCategory: string,
  ) {
    await this.controls.updateOne(
      { studentProfileId: new Types.ObjectId(studentId) },
      {
        $setOnInsert: {
          studentProfileId: new Types.ObjectId(studentId),
          configuredByUserId: new Types.ObjectId(userId),
          aiTutorEnabled: true,
          assessmentEnabled: true,
          externalLinksEnabled: ageCategory === 'adult',
          requireApprovalForScheduling: ageCategory !== 'adult',
          requireApprovalForPurchase: ageCategory !== 'adult',
          contentRestrictionLevel:
            ageCategory === 'minor' ? 'age_appropriate' : 'standard',
        },
      },
      { upsert: true },
    );
  }

  private getAgeCategory(dateOfBirth: Date): string {
    if (Number.isNaN(dateOfBirth.getTime())) return 'unknown';
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDelta = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDelta < 0 ||
      (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age -= 1;
    }
    return age >= 18 ? 'adult' : 'minor';
  }
}
