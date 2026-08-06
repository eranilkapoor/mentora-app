import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Role, Status, PlanTier, SubscriptionStatus } from '@/common/enums';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import {
  AddParentDto,
  AcceptStudentInvitationDto,
  AddClassroomFileDto,
  CompleteClassroomSummaryDto,
  CreateAcademicRecordDto,
  CreateAcademicCatalogDto,
  CreateAiTutorSessionDto,
  CreateAssessmentDto,
  CreateCurriculumDto,
  CreateEntitlementDto,
  CreateLearningRecommendationDto,
  CreateQuestionBankDto,
  CreateQuestionDto,
  CreateScheduleDto,
  CreateStudentBulkDto,
  CreateStudentDto,
  CreateStudentInvitationDto,
  CreateStudyPlanDto,
  CreateSubjectDto,
  CreateTopicDto,
  EnrollSubjectDto,
  RescheduleScheduleDto,
  SendAiTutorMessageDto,
  SendClassroomMessageDto,
  StartAssessmentAttemptDto,
  SubmitStudentEligibilityDocumentsDto,
  SubmitAssessmentAnswerDto,
  UpdateParentalControlsDto,
  UpdateStudentDto,
  UpdateParentProfileDto,
  UpdateStudentProfileSectionDto,
  UpsertTopicProgressDto,
} from '../dto/learning.dto';
import {
  AcademicRecordDocument,
  AcademicBoard,
  AcademicBoardDocument,
  AcademicLevel,
  AcademicLevelDocument,
  AiTutorMessage,
  AiTutorMessageDocument,
  AiTutorSession,
  AiTutorSessionDocument,
  Assessment,
  AssessmentAnswer,
  AssessmentAnswerDocument,
  AssessmentAttempt,
  AssessmentAttemptDocument,
  AssessmentDocument,
  AssessmentResult,
  AssessmentResultDocument,
  Classroom,
  ClassroomDocument,
  ClassroomFile,
  ClassroomFileDocument,
  ClassroomMessage,
  ClassroomMessageDocument,
  Course,
  CourseDocument,
  Curriculum,
  CurriculumDocument,
  Grade,
  GradeDocument,
  Institution,
  InstitutionDocument,
  LearningEntitlement,
  LearningEntitlementDocument,
  LearningRecommendation,
  LearningRecommendationDocument,
  LearningSchedule,
  LearningScheduleDocument,
  ParentProfile,
  ParentProfileDocument,
  ParentStudentRelationship,
  ParentStudentRelationshipDocument,
  ParentalControl,
  ParentalControlDocument,
  Question,
  QuestionBank,
  QuestionBankDocument,
  QuestionDocument,
  SafetyEvent,
  SafetyEventDocument,
  StudentInvitation,
  StudentInvitationDocument,
  StudentAcademicRecord,
  StudentProfile,
  StudentProfileDocument,
  StudyPlan,
  StudyPlanDocument,
  StudentSubjectEnrollment,
  StudentSubjectEnrollmentDocument,
  StudentTopicProgress,
  StudentTopicProgressDocument,
  Subject,
  SubjectDocument,
  Stream,
  StreamDocument,
  Topic,
  TopicDocument,
  TutorSessionNote,
  TutorSessionNoteDocument,
  University,
  UniversityDocument,
} from '../schemas/learning.schemas';
import { AgePolicyService } from './age-policy.service';

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

type CatalogType =
  | 'boards'
  | 'universities'
  | 'institutions'
  | 'academic-levels'
  | 'grades'
  | 'streams'
  | 'courses';

@Injectable()
export class LearningService {
  private readonly profileSections = new Set([
    'personal',
    'academic',
    'parents',
    'address',
    'previousEducation',
    'examScores',
    'coursePreference',
    'documents',
    'payments',
    'communicationHistory',
    'activityTimeline',
  ]);

  constructor(
    @InjectModel(StudentProfile.name)
    private readonly students: Model<StudentProfileDocument>,
    @InjectModel(ParentProfile.name)
    private readonly parents: Model<ParentProfileDocument>,
    @InjectModel(ParentStudentRelationship.name)
    private readonly relationships: Model<ParentStudentRelationshipDocument>,
    @InjectModel(StudentInvitation.name)
    private readonly invitations: Model<StudentInvitationDocument>,
    @InjectModel(ParentalControl.name)
    private readonly controls: Model<ParentalControlDocument>,
    @InjectModel(StudentAcademicRecord.name)
    private readonly academicRecords: Model<AcademicRecordDocument>,
    @InjectModel(AcademicBoard.name)
    private readonly boards: Model<AcademicBoardDocument>,
    @InjectModel(AcademicLevel.name)
    private readonly academicLevels: Model<AcademicLevelDocument>,
    @InjectModel(Grade.name)
    private readonly grades: Model<GradeDocument>,
    @InjectModel(Stream.name)
    private readonly streams: Model<StreamDocument>,
    @InjectModel(Course.name)
    private readonly courses: Model<CourseDocument>,
    @InjectModel(Institution.name)
    private readonly institutions: Model<InstitutionDocument>,
    @InjectModel(University.name)
    private readonly universities: Model<UniversityDocument>,
    @InjectModel(Subject.name)
    private readonly subjects: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private readonly topics: Model<TopicDocument>,
    @InjectModel(Curriculum.name)
    private readonly curriculums: Model<CurriculumDocument>,
    @InjectModel(StudyPlan.name)
    private readonly studyPlans: Model<StudyPlanDocument>,
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
    @InjectModel(QuestionBank.name)
    private readonly questionBanks: Model<QuestionBankDocument>,
    @InjectModel(Question.name)
    private readonly questions: Model<QuestionDocument>,
    @InjectModel(Assessment.name)
    private readonly assessments: Model<AssessmentDocument>,
    @InjectModel(AssessmentAttempt.name)
    private readonly assessmentAttempts: Model<AssessmentAttemptDocument>,
    @InjectModel(AssessmentAnswer.name)
    private readonly assessmentAnswers: Model<AssessmentAnswerDocument>,
    @InjectModel(AssessmentResult.name)
    private readonly assessmentResults: Model<AssessmentResultDocument>,
    @InjectModel(StudentTopicProgress.name)
    private readonly topicProgress: Model<StudentTopicProgressDocument>,
    @InjectModel(LearningRecommendation.name)
    private readonly recommendations: Model<LearningRecommendationDocument>,
    @InjectModel(Classroom.name)
    private readonly classrooms: Model<ClassroomDocument>,
    @InjectModel(ClassroomMessage.name)
    private readonly classroomMessages: Model<ClassroomMessageDocument>,
    @InjectModel(ClassroomFile.name)
    private readonly classroomFiles: Model<ClassroomFileDocument>,
    @InjectModel(TutorSessionNote.name)
    private readonly tutorSessionNotes: Model<TutorSessionNoteDocument>,
    @InjectModel(SafetyEvent.name)
    private readonly safetyEvents: Model<SafetyEventDocument>,
    @InjectModel(User.name)
    private readonly users: Model<UserDocument>,
    private readonly agePolicy: AgePolicyService = new AgePolicyService(),
  ) {}

  async createStudent(userId: string, dto: CreateStudentDto) {
    const ownershipType = dto.ownershipType ?? 'self_managed';
    const registrationMode =
      ownershipType === 'parent_managed'
        ? 'parent_created_child'
        : 'independent_student';
    const dateOfBirth = new Date(dto.dateOfBirth);
    const agePolicy =
      ownershipType === 'parent_managed'
        ? this.agePolicy.evaluate(dateOfBirth)
        : this.agePolicy.assertCanSelfRegister(dateOfBirth);
    const ageCategory = agePolicy.ageCategory;
    const studentUserId =
      ownershipType === 'parent_managed'
        ? await this.createParentManagedStudentUser(dto)
        : new Types.ObjectId(userId);
    const studentDto = { ...dto };
    delete studentDto.studentEmail;
    delete studentDto.studentPassword;

    await this.ensureAccountRole(
      userId,
      ownershipType === 'parent_managed' ? Role.PARENT : Role.STUDENT,
    );

    const student = await this.students.create({
      ...studentDto,
      dateOfBirth,
      ageCategory,
      ownershipType,
      registrationMode,
      userId: studentUserId,
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
        ageCategory,
      );
    }

    return student;
  }

  async createStudentsBulk(userId: string, dto: CreateStudentBulkDto) {
    const created: StudentProfileDocument[] = [];
    const errors: Array<{ index: number; reason: string }> = [];

    for (let index = 0; index < dto.students.length; index += 1) {
      const studentDto = dto.students[index];
      try {
        const student = await this.createStudent(userId, studentDto);
        created.push(student);
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message
            : 'Unknown student import error';
        errors.push({
          index,
          reason,
        });
      }
    }

    return {
      total: dto.students.length,
      createdCount: created.length,
      failedCount: errors.length,
      created,
      errors,
    };
  }

  async listStudentAttendance(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    return this.tutorSessionNotes
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async getClassroomTranscript(userId: string, classroomId: string) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    if (!classroom.transcriptEnabled) {
      throw new ForbiddenException(
        'Transcript is not enabled for this classroom',
      );
    }

    const messages = await this.classroomMessages
      .find({ classroomId: classroom._id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      classroom,
      transcriptAvailable: true,
      messages,
    };
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

  async updateStudentProfileSection(
    userId: string,
    studentId: string,
    section: string,
    dto: UpdateStudentProfileSectionDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'editProfile');
    if (!this.profileSections.has(section)) {
      throw new BadRequestException('Unsupported student profile section');
    }

    const update = {
      [section]: dto.data,
      profileCompletionPercentage: await this.calculateProfileCompletion(
        studentId,
        section,
        dto.data,
      ),
    };
    const updated = await this.students
      .findByIdAndUpdate(studentId, update, { new: true })
      .lean();
    if (!updated) throw new NotFoundException('Student profile not found');
    return updated;
  }

  async getParentProfile(userId: string) {
    return this.parents.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async updateParentProfile(userId: string, dto: UpdateParentProfileDto) {
    await this.ensureAccountRole(userId, Role.PARENT);
    return this.parents.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        ...dto,
        userId: new Types.ObjectId(userId),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
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

  async getParentalControls(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'manageParentalControls');
    const student = await this.getStudentOrThrow(studentId);
    const control = await this.controls
      .findOne({ studentProfileId: new Types.ObjectId(studentId) })
      .lean();
    if (control) return control;

    await this.ensureDefaultParentalControl(
      studentId,
      userId,
      String(student.ageCategory),
    );
    return this.controls
      .findOne({ studentProfileId: new Types.ObjectId(studentId) })
      .lean();
  }

  async createStudentInvitation(
    userId: string,
    studentId: string,
    dto: CreateStudentInvitationDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'manageParentalControls');
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.invitations.create({
      studentProfileId: new Types.ObjectId(studentId),
      invitedByUserId: new Types.ObjectId(userId),
      inviteeEmail: dto.inviteeEmail.toLowerCase().trim(),
      relationship: dto.relationship ?? 'guardian',
      permissions: dto.permissions,
      token,
      expiresAt,
      status: 'pending',
    });
  }

  async listStudentInvitations(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'manageParentalControls');
    return this.invitations
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  async acceptStudentInvitation(
    userId: string,
    dto: AcceptStudentInvitationDto,
  ) {
    const invitation = await this.invitations.findOne({ token: dto.token });
    if (!invitation || invitation.status !== 'pending') {
      throw new NotFoundException('Student invitation not found');
    }
    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw new BadRequestException('Student invitation has expired');
    }

    await this.ensureAccountRole(userId, Role.PARENT);
    await this.parents.updateOne(
      { userId: new Types.ObjectId(userId) },
      { $setOnInsert: { userId: new Types.ObjectId(userId) } },
      { upsert: true },
    );
    const relationship = await this.relationships.findOneAndUpdate(
      {
        parentUserId: new Types.ObjectId(userId),
        studentProfileId: invitation.studentProfileId,
      },
      {
        relationship: invitation.relationship,
        permissions: invitation.permissions,
        status: 'active',
        createdBy: 'parent',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedByUserId = new Types.ObjectId(userId);
    await invitation.save();

    return relationship;
  }

  async revokeStudentInvitation(
    userId: string,
    studentId: string,
    invitationId: string,
  ) {
    await this.assertStudentAccess(userId, studentId, 'manageParentalControls');
    const invitation = await this.invitations.findOneAndUpdate(
      {
        _id: new Types.ObjectId(invitationId),
        studentProfileId: new Types.ObjectId(studentId),
        status: 'pending',
      },
      { status: 'revoked' },
      { new: true },
    );
    if (!invitation)
      throw new NotFoundException('Student invitation not found');
    return invitation;
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

  async updatePreviousEducation(
    userId: string,
    studentId: string,
    dto: UpdateStudentProfileSectionDto,
  ) {
    return this.updateStudentProfileSection(
      userId,
      studentId,
      'previousEducation',
      dto,
    );
  }

  async updateExamScores(
    userId: string,
    studentId: string,
    dto: UpdateStudentProfileSectionDto,
  ) {
    return this.updateStudentProfileSection(
      userId,
      studentId,
      'examScores',
      dto,
    );
  }

  async updateCoursePreference(
    userId: string,
    studentId: string,
    dto: UpdateStudentProfileSectionDto,
  ) {
    return this.updateStudentProfileSection(
      userId,
      studentId,
      'coursePreference',
      dto,
    );
  }

  async updateDocuments(
    userId: string,
    studentId: string,
    dto: UpdateStudentProfileSectionDto,
  ) {
    return this.updateStudentProfileSection(
      userId,
      studentId,
      'documents',
      dto,
    );
  }

  async submitEligibilityDocuments(
    userId: string,
    studentId: string,
    dto: SubmitStudentEligibilityDocumentsDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'editProfile');
    const student = await this.getStudentOrThrow(studentId);
    if (student.ageCategory !== 'adult') {
      throw new ForbiddenException(
        'Only legally eligible adult students can submit self-managed eligibility documents',
      );
    }
    if (
      !['self_managed', 'jointly_managed'].includes(
        String(student.ownershipType),
      )
    ) {
      throw new ForbiddenException(
        'Parent-managed student profiles require parent consent instead of self-managed document verification',
      );
    }

    const submittedAt = new Date();
    const existingDocuments: Record<string, unknown>[] = Array.isArray(
      student.documents,
    )
      ? student.documents.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === 'object' && !Array.isArray(item),
        )
      : [];
    const documentRecord = {
      documentType: dto.documentType,
      idProofUrl: dto.idProofUrl,
      selfieUrl: dto.selfieUrl,
      metadata: dto.metadata,
      purpose: 'self_managed_age_eligibility',
      status: 'pending_review',
      submittedAt,
      submittedByUserId: userId,
    };
    const updatedDocuments = [...existingDocuments, documentRecord];
    return this.students
      .findByIdAndUpdate(
        studentId,
        {
          documents: updatedDocuments,
          profileCompletionPercentage: await this.calculateProfileCompletion(
            studentId,
            'documents',
            updatedDocuments,
          ),
        },
        { new: true },
      )
      .lean();
  }

  async createCatalogItem(type: CatalogType, dto: CreateAcademicCatalogDto) {
    const model = this.getCatalogModel(type);
    const payload = this.toCatalogPayload(type, dto);
    return model.findOneAndUpdate({ code: dto.code.toUpperCase() }, payload, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  async listCatalogItems(type: CatalogType) {
    const model = this.getCatalogModel(type);
    return model
      .find({ status: 'active' })
      .sort({ sortOrder: 1, name: 1 })
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

  async createTopic(dto: CreateTopicDto) {
    await this.getSubjectOrThrow(dto.subjectId);
    return this.topics.findOneAndUpdate(
      {
        subjectId: new Types.ObjectId(dto.subjectId),
        code: dto.code.toUpperCase(),
      },
      {
        ...dto,
        subjectId: new Types.ObjectId(dto.subjectId),
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listTopics(subjectId?: string) {
    return this.topics
      .find({
        status: 'active',
        ...(subjectId ? { subjectId: new Types.ObjectId(subjectId) } : {}),
      })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
  }

  async createCurriculum(dto: CreateCurriculumDto) {
    return this.curriculums.findOneAndUpdate(
      {
        ...(dto.boardId ? { boardId: new Types.ObjectId(dto.boardId) } : {}),
        gradeId: new Types.ObjectId(dto.gradeId),
        subjectId: new Types.ObjectId(dto.subjectId),
      },
      {
        ...dto,
        boardId: dto.boardId ? new Types.ObjectId(dto.boardId) : undefined,
        gradeId: new Types.ObjectId(dto.gradeId),
        subjectId: new Types.ObjectId(dto.subjectId),
        topicIds: dto.topicIds?.map((id) => new Types.ObjectId(id)) ?? [],
        code: dto.code.toUpperCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listCurriculums() {
    return this.curriculums.find({ status: 'active' }).sort({ code: 1 }).lean();
  }

  async createStudyPlan(dto: CreateStudyPlanDto) {
    return this.studyPlans.findOneAndUpdate(
      { code: dto.code.toUpperCase() },
      {
        ...dto,
        code: dto.code.toUpperCase(),
        subjectIds: dto.subjectIds?.map((id) => new Types.ObjectId(id)) ?? [],
        topicIds: dto.topicIds?.map((id) => new Types.ObjectId(id)) ?? [],
        curriculumIds:
          dto.curriculumIds?.map((id) => new Types.ObjectId(id)) ?? [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listStudyPlans(target?: string, category?: string) {
    return this.studyPlans
      .find({
        status: 'active',
        publiclyVisible: true,
        ...(target ? { target } : {}),
        ...(category ? { category } : {}),
      })
      .sort({ category: 1, target: 1, name: 1 })
      .lean();
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
      nextReminderAt: this.resolveNextReminderAt(
        new Date(dto.startAt),
        dto.reminderMinutesBefore,
      ),
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

  async rescheduleSchedule(
    userId: string,
    scheduleId: string,
    dto: RescheduleScheduleDto,
  ) {
    const schedule = await this.getScheduleOrThrow(scheduleId);
    await this.assertStudentAccess(
      userId,
      String(schedule.studentProfileId),
      'manageSchedule',
    );
    if (new Date(dto.endAt) <= new Date(dto.startAt)) {
      throw new BadRequestException(
        'Schedule end time must be after start time',
      );
    }

    return this.schedules.findByIdAndUpdate(
      scheduleId,
      {
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        ...(dto.timezone ? { timezone: dto.timezone } : {}),
        status: 'scheduled',
        reminderOffsetsSent: [],
        nextReminderAt: this.resolveNextReminderAt(
          new Date(dto.startAt),
          schedule.reminderMinutesBefore,
        ),
      },
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

  async listEntitlements(userId: string, studentId: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Valid studentProfileId is required');
    }
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    return this.entitlements
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ expiresAt: 1 })
      .lean();
  }

  async createAiTutorSession(userId: string, dto: CreateAiTutorSessionDto) {
    const student = await this.getStudentOrThrow(dto.studentProfileId);
    if (this.toIdString(student.userId) !== userId) {
      throw new ForbiddenException(
        'Students must join tutor sessions with their own credentials',
      );
    }
    await this.assertNoParallelActiveSession(dto.studentProfileId);
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
      deliveryMode: dto.deliveryMode ?? 'chat',
    });
    const context = await this.buildAiTutorContext(userId, String(session._id));
    return { session, access, context };
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
    const context = await this.buildAiTutorContext(userId, sessionId);
    return { session, messages, context };
  }

  async getAiTutorSessionContext(userId: string, sessionId: string) {
    return this.buildAiTutorContext(userId, sessionId);
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

    const moderation = this.moderateTutorMessage(dto.content);
    const studentMessage = await this.aiMessages.create({
      sessionId: session._id,
      sender: 'student',
      messageType: dto.messageType ?? 'text',
      content: dto.content,
      safetyStatus: moderation.status,
      metadata: { safetyReasons: moderation.reasons },
    });
    if (moderation.status !== 'allowed') {
      await this.safetyEvents.create({
        studentProfileId: session.studentProfileId,
        userId: new Types.ObjectId(userId),
        sourceId: session._id,
        sourceType: 'ai_tutor',
        severity: moderation.severity,
        reasons: moderation.reasons,
        metadata: {
          messageId: studentMessage._id,
          action: moderation.status,
        },
      });
      session.safetyEventsCount += 1;
    }
    if (moderation.status === 'blocked') {
      session.totalMessages += 1;
      await session.save();
      throw new BadRequestException(
        'This message was blocked by Mentora safety rules',
      );
    }
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
      session.sessionSummary ?? (await this.generateSessionSummary(sessionId));
    return session.save();
  }

  async listAiHistory(
    userId: string,
    studentId: string,
  ): Promise<Record<string, unknown>[]> {
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    const sessions = await this.aiSessions
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ createdAt: -1 })
      .lean();
    return sessions.map((session) => ({
      ...session,
      parentVisibleSummary:
        session.sessionSummary ??
        'Summary will appear after the tutor session is completed.',
    }));
  }

  async joinClassroom(userId: string, scheduleId: string) {
    const schedule = await this.schedules.findById(scheduleId).lean();
    if (!schedule) throw new NotFoundException('Learning schedule not found');
    await this.assertStudentAccess(
      userId,
      String(schedule.studentProfileId),
      'viewLearningHistory',
    );
    const now = new Date();
    return this.classrooms.findOneAndUpdate(
      { scheduleId: new Types.ObjectId(scheduleId) },
      {
        $set: {
          scheduleId: new Types.ObjectId(scheduleId),
          studentProfileId: schedule.studentProfileId,
          tutorUserId: schedule.tutorUserId,
          tutorType: schedule.tutorType,
          deliveryMode: schedule.deliveryMode,
          status: 'open',
          openedAt: now,
          recordingEnabled: schedule.deliveryMode === 'video',
          transcriptEnabled: ['chat', 'audio', 'video'].includes(
            schedule.deliveryMode,
          ),
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listClassroomMessages(userId: string, classroomId: string) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    return this.classroomMessages
      .find({ classroomId: classroom._id })
      .sort({ createdAt: 1 })
      .lean();
  }

  async sendClassroomMessage(
    userId: string,
    classroomId: string,
    dto: SendClassroomMessageDto,
  ) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    return this.classroomMessages.create({
      classroomId: classroom._id,
      senderUserId: new Types.ObjectId(userId),
      senderRole: dto.senderRole ?? 'student',
      messageType: dto.messageType ?? 'text',
      content: dto.content,
      metadata: dto.metadata,
      safetyStatus: 'clean',
    });
  }

  async listClassroomFiles(userId: string, classroomId: string) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    return this.classroomFiles
      .find({ classroomId: classroom._id })
      .sort({ createdAt: -1 })
      .lean();
  }

  async addClassroomFile(
    userId: string,
    classroomId: string,
    dto: AddClassroomFileDto,
  ) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    return this.classroomFiles.create({
      classroomId: classroom._id,
      uploadedByUserId: new Types.ObjectId(userId),
      url: dto.url,
      mimeType: dto.mimeType,
      originalName: dto.originalName,
      moderationStatus: 'pending',
    });
  }

  async completeClassroom(
    userId: string,
    classroomId: string,
    dto: CompleteClassroomSummaryDto,
  ) {
    const classroom = await this.getClassroomForUser(userId, classroomId);
    const closedAt = new Date();
    await this.tutorSessionNotes.findOneAndUpdate(
      { scheduleId: classroom.scheduleId },
      {
        $set: {
          scheduleId: classroom.scheduleId,
          tutorUserId: classroom.tutorUserId ?? new Types.ObjectId(userId),
          studentProfileId: classroom.studentProfileId,
          attendanceStatus: dto.attendanceStatus ?? 'present',
          summary: dto.summary,
          homework: dto.homework ?? [],
          updatedAt: closedAt,
        },
        $setOnInsert: { createdAt: closedAt },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return this.classrooms.findByIdAndUpdate(
      classroom._id,
      { status: 'closed', closedAt, summary: dto.summary },
      { new: true },
    );
  }

  async createQuestionBank(dto: CreateQuestionBankDto) {
    await this.getSubjectOrThrow(dto.subjectId);
    return this.questionBanks.create({
      ...dto,
      subjectId: new Types.ObjectId(dto.subjectId),
      topicId: dto.topicId ? new Types.ObjectId(dto.topicId) : undefined,
    });
  }

  async listQuestionBanks(subjectId?: string) {
    return this.questionBanks
      .find({
        status: 'active',
        ...(subjectId ? { subjectId: new Types.ObjectId(subjectId) } : {}),
      })
      .sort({ name: 1 })
      .lean();
  }

  async createQuestion(dto: CreateQuestionDto) {
    return this.questions.create({
      ...dto,
      questionBankId: new Types.ObjectId(dto.questionBankId),
      subjectId: new Types.ObjectId(dto.subjectId),
      topicId: dto.topicId ? new Types.ObjectId(dto.topicId) : undefined,
    });
  }

  async listQuestions(questionBankId?: string) {
    return this.questions
      .find({
        status: 'active',
        ...(questionBankId
          ? { questionBankId: new Types.ObjectId(questionBankId) }
          : {}),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async createAssessment(dto: CreateAssessmentDto) {
    return this.assessments.create({
      ...dto,
      subjectId: new Types.ObjectId(dto.subjectId),
      topicIds: dto.topicIds?.map((id) => new Types.ObjectId(id)) ?? [],
      questionIds: dto.questionIds?.map((id) => new Types.ObjectId(id)) ?? [],
    });
  }

  async listAssessments(subjectId?: string) {
    return this.assessments
      .find({
        status: 'published',
        ...(subjectId ? { subjectId: new Types.ObjectId(subjectId) } : {}),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async startAssessmentAttempt(
    userId: string,
    assessmentId: string,
    dto: StartAssessmentAttemptDto,
  ) {
    await this.assertStudentAccess(
      userId,
      dto.studentProfileId,
      'viewAssessments',
    );
    const assessment = await this.assessments.findById(assessmentId).lean();
    if (!assessment) throw new NotFoundException('Assessment not found');

    return this.assessmentAttempts.create({
      assessmentId: new Types.ObjectId(assessmentId),
      studentProfileId: new Types.ObjectId(dto.studentProfileId),
      scheduleId: dto.scheduleId
        ? new Types.ObjectId(dto.scheduleId)
        : undefined,
      startedAt: new Date(),
      status: 'started',
    });
  }

  async submitAssessmentAnswer(
    userId: string,
    attemptId: string,
    dto: SubmitAssessmentAnswerDto,
  ) {
    const attempt = await this.assessmentAttempts.findById(attemptId).lean();
    if (!attempt) throw new NotFoundException('Assessment attempt not found');
    await this.assertStudentAccess(
      userId,
      String(attempt.studentProfileId),
      'viewAssessments',
    );
    const question = await this.questions.findById(dto.questionId).lean();
    if (!question) throw new NotFoundException('Question not found');
    const isCorrect = this.isAssessmentAnswerCorrect(
      dto.response,
      question.answerKey,
    );

    return this.assessmentAnswers.findOneAndUpdate(
      {
        attemptId: new Types.ObjectId(attemptId),
        questionId: new Types.ObjectId(dto.questionId),
      },
      {
        response: dto.response,
        isCorrect,
        awardedPoints: isCorrect ? question.points : 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async completeAssessmentAttempt(userId: string, attemptId: string) {
    const attempt = await this.assessmentAttempts.findById(attemptId);
    if (!attempt) throw new NotFoundException('Assessment attempt not found');
    await this.assertStudentAccess(
      userId,
      String(attempt.studentProfileId),
      'viewAssessments',
    );
    const assessment = await this.assessments
      .findById(attempt.assessmentId)
      .lean();
    if (!assessment) throw new NotFoundException('Assessment not found');
    const answers = await this.assessmentAnswers
      .find({ attemptId: attempt._id })
      .lean();
    const questions = assessment.questionIds.length
      ? await this.questions
          .find({ _id: { $in: assessment.questionIds } })
          .lean()
      : [];
    const totalPoints = questions.reduce(
      (total, question) => total + (question.points ?? 0),
      0,
    );
    const awardedPoints = answers.reduce(
      (total, answer) => total + (answer.awardedPoints ?? 0),
      0,
    );
    const scorePercentage = totalPoints
      ? Math.round((awardedPoints / totalPoints) * 100)
      : 0;
    attempt.status = 'graded';
    attempt.submittedAt = new Date();
    await attempt.save();

    return this.assessmentResults.findOneAndUpdate(
      { attemptId: attempt._id },
      {
        attemptId: attempt._id,
        studentProfileId: attempt.studentProfileId,
        subjectId: assessment.subjectId,
        scorePercentage,
        totalPoints,
        awardedPoints,
        passed: scorePercentage >= assessment.passingScorePercentage,
        strengths: scorePercentage >= 70 ? ['Current concept readiness'] : [],
        improvementAreas:
          scorePercentage < 70 ? ['Revise weak topics with AI tutor'] : [],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async upsertTopicProgress(
    userId: string,
    studentId: string,
    dto: UpsertTopicProgressDto,
  ) {
    await this.assertStudentAccess(userId, studentId, 'viewAssessments');
    return this.topicProgress.findOneAndUpdate(
      {
        studentProfileId: new Types.ObjectId(studentId),
        subjectId: new Types.ObjectId(dto.subjectId),
        topicId: new Types.ObjectId(dto.topicId),
      },
      {
        masteryPercentage: dto.masteryPercentage,
        practiceCount: dto.practiceCount ?? 0,
        lastPracticedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async listTopicProgress(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    return this.topicProgress
      .find({ studentProfileId: new Types.ObjectId(studentId) })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async createLearningRecommendation(dto: CreateLearningRecommendationDto) {
    return this.recommendations.create({
      ...dto,
      studentProfileId: new Types.ObjectId(dto.studentProfileId),
      subjectId: dto.subjectId ? new Types.ObjectId(dto.subjectId) : undefined,
      topicId: dto.topicId ? new Types.ObjectId(dto.topicId) : undefined,
    });
  }

  async listRecommendations(userId: string, studentId: string) {
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');
    return this.recommendations
      .find({
        studentProfileId: new Types.ObjectId(studentId),
        status: 'open',
      })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
  }

  async getParentProgressDashboard(userId: string) {
    const students = await this.listStudents(userId);
    const dashboards = await Promise.all(
      students.map(async (student) => {
        const studentRecord = student as Record<string, unknown>;
        const studentId = String(studentRecord._id);
        const progress = await this.getStudentProgress(userId, studentId);
        const recommendations = await this.listRecommendations(
          userId,
          studentId,
        );
        return { student: studentRecord, progress, recommendations };
      }),
    );
    return { students: dashboards };
  }

  async getStudentProgress(userId: string, studentId: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Valid student id is required');
    }
    await this.assertStudentAccess(userId, studentId, 'viewLearningHistory');

    const studentObjectId = new Types.ObjectId(studentId);
    const [sessions, enrollments, results, topicProgress] = await Promise.all([
      this.aiSessions
        .find({ studentProfileId: studentObjectId })
        .sort({ createdAt: -1 })
        .lean(),
      this.enrollments
        .find({ studentProfileId: studentObjectId, status: 'active' })
        .lean(),
      this.assessmentResults
        .find({ studentProfileId: studentObjectId })
        .sort({ createdAt: -1 })
        .lean(),
      this.topicProgress.find({ studentProfileId: studentObjectId }).lean(),
    ]);

    const subjectIds = [
      ...new Set(enrollments.map((enrollment) => String(enrollment.subjectId))),
    ];
    const subjects = subjectIds.length
      ? await this.subjects
          .find({
            _id: { $in: subjectIds.map((id) => new Types.ObjectId(id)) },
          })
          .lean()
      : [];
    const subjectNameById = new Map(
      subjects.map((subject) => [String(subject._id), subject.name]),
    );
    const completedSessions = sessions.filter(
      (session) => session.status === 'completed',
    );
    const completedBySubject = completedSessions.reduce<Record<string, number>>(
      (acc, session) => {
        const subjectId = String(session.subjectId);
        acc[subjectId] = (acc[subjectId] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return {
      studentProfileId: studentId,
      totalLearningMinutes: Math.round(
        sessions.reduce(
          (total, session) => total + (session.totalDurationSeconds ?? 0),
          0,
        ) / 60,
      ),
      completedSessions: completedSessions.length,
      averageAssessmentScore: results.length
        ? Math.round(
            results.reduce(
              (total, result) => total + result.scorePercentage,
              0,
            ) / results.length,
          )
        : undefined,
      subjectProgress: subjectIds.map((subjectId) => {
        const completedCount = completedBySubject[subjectId] ?? 0;
        const subjectTopics = topicProgress.filter(
          (item) => String(item.subjectId) === subjectId,
        );
        const topicMastery = subjectTopics.length
          ? Math.round(
              subjectTopics.reduce(
                (total, item) => total + item.masteryPercentage,
                0,
              ) / subjectTopics.length,
            )
          : undefined;
        return {
          subjectId,
          subjectName: subjectNameById.get(subjectId) ?? 'Subject',
          masteryPercentage: topicMastery ?? Math.min(completedCount * 20, 100),
          recommendedTopic:
            (topicMastery ?? completedCount) > 0
              ? 'Continue the next adaptive practice set'
              : 'Start with the first guided AI tutor session',
        };
      }),
    };
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
    if (
      control?.allowedSubjectIds?.length &&
      !control.allowedSubjectIds.some(
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
      if (
        String(schedule.studentProfileId) !== input.studentProfileId ||
        (schedule.subjectId && String(schedule.subjectId) !== input.subjectId)
      ) {
        return { allowed: false, denialReason: 'OUTSIDE_SCHEDULE' };
      }
      if (schedule.parentApprovalRequired && !schedule.parentApproved) {
        return { allowed: false, denialReason: 'PARENTAL_CONTROL_BLOCKED' };
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

  private async buildAiTutorContext(userId: string, sessionId: string) {
    const session = await this.aiSessions.findById(sessionId).lean();
    if (!session) throw new NotFoundException('AI tutor session not found');
    await this.assertStudentAccess(
      userId,
      String(session.studentProfileId),
      'viewLearningHistory',
    );
    const [student, subject, schedule, control, entitlement] =
      await Promise.all([
        this.students.findById(session.studentProfileId).lean(),
        this.subjects.findById(session.subjectId).lean(),
        session.scheduleId
          ? this.schedules.findById(session.scheduleId).lean()
          : Promise.resolve(null),
        this.controls
          .findOne({ studentProfileId: session.studentProfileId })
          .lean(),
        this.entitlements.findById(session.accessEntitlementId).lean(),
      ]);

    return {
      student: {
        studentProfileId: String(session.studentProfileId),
        ageCategory: student?.ageCategory,
        learningGoals: student?.learningGoals ?? [],
        profileCompletionPercentage: student?.profileCompletionPercentage ?? 0,
      },
      subject: subject
        ? {
            subjectId: String(subject._id),
            name: subject.name,
            code: subject.code,
            category: subject.category,
          }
        : undefined,
      schedule: schedule
        ? {
            scheduleId: String(schedule._id),
            title: schedule.title,
            startAt: schedule.startAt,
            endAt: schedule.endAt,
            timezone: schedule.timezone,
            deliveryMode: schedule.deliveryMode,
          }
        : undefined,
      access: {
        entitlementId: String(session.accessEntitlementId),
        remainingQuantity:
          entitlement?.allocatedQuantity !== undefined
            ? Math.max(
                entitlement.allocatedQuantity - entitlement.usedQuantity,
                0,
              )
            : undefined,
        expiresAt: entitlement?.expiresAt,
      },
      safety: {
        contentRestrictionLevel: control?.contentRestrictionLevel ?? 'standard',
        externalLinksEnabled: control?.externalLinksEnabled ?? false,
      },
    };
  }

  private moderateTutorMessage(content: string): {
    status: 'allowed' | 'review' | 'blocked';
    severity: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
  } {
    const normalized = content.toLowerCase();
    const blockedRules = [
      { reason: 'self_harm', pattern: /(suicide|self harm|kill myself)/ },
      { reason: 'sexual_content', pattern: /(explicit|nude|porn)/ },
      { reason: 'payment_bypass', pattern: /(free class hack|bypass payment)/ },
    ];
    const reviewRules = [
      {
        reason: 'external_contact',
        pattern: /(whatsapp|telegram|phone number)/,
      },
      {
        reason: 'academic_integrity',
        pattern: /(write my exam|cheat|answer key)/,
      },
    ];
    const blockedReasons = blockedRules
      .filter((rule) => rule.pattern.test(normalized))
      .map((rule) => rule.reason);
    if (blockedReasons.length) {
      return { status: 'blocked', severity: 'high', reasons: blockedReasons };
    }
    const reviewReasons = reviewRules
      .filter((rule) => rule.pattern.test(normalized))
      .map((rule) => rule.reason);
    if (reviewReasons.length) {
      return { status: 'review', severity: 'medium', reasons: reviewReasons };
    }
    return { status: 'allowed', severity: 'low', reasons: [] };
  }

  private async generateSessionSummary(sessionId: string): Promise<string> {
    const messages = await this.aiMessages
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ createdAt: 1 })
      .lean();
    const studentMessages = messages.filter(
      (message) => message.sender === 'student',
    );
    if (!studentMessages.length) {
      return 'Session completed without student questions.';
    }
    const lastQuestion = studentMessages[studentMessages.length - 1]?.content;
    return `Session completed with ${studentMessages.length} student message(s). Last focus: ${String(
      lastQuestion,
    ).slice(0, 160)}`;
  }

  private isAssessmentAnswerCorrect(
    response: Record<string, unknown>,
    answerKey?: Record<string, unknown>,
  ): boolean {
    if (!answerKey || !Object.keys(answerKey).length) return false;
    return JSON.stringify(response) === JSON.stringify(answerKey);
  }

  private async getStudentOrThrow(studentId: string) {
    const student = (await this.students.findById(studentId).lean()) as Record<
      string,
      unknown
    > | null;
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

  private async getClassroomForUser(userId: string, classroomId: string) {
    const classroom = await this.classrooms.findById(classroomId).lean();
    if (!classroom) throw new NotFoundException('Classroom not found');
    await this.assertStudentAccess(
      userId,
      String(classroom.studentProfileId),
      'viewLearningHistory',
    );
    return classroom;
  }

  private async assertNoParallelActiveSession(studentId: string) {
    const activeSession = await this.aiSessions
      .findOne({
        studentProfileId: new Types.ObjectId(studentId),
        status: 'active',
      })
      .lean();

    if (activeSession) {
      throw new ConflictException(
        'This student already has an active tutor session',
      );
    }
  }

  private async createParentManagedStudentUser(dto: CreateStudentDto) {
    if (!dto.studentEmail || !dto.studentPassword) {
      throw new BadRequestException(
        'Parent-managed students require studentEmail and studentPassword',
      );
    }

    const email = dto.studentEmail.toLowerCase().trim();
    const existingUser = await this.users.findOne({ email }).lean();
    if (existingUser) {
      throw new ConflictException('Student login email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.studentPassword, 12);
    const studentUser = await this.users.create({
      email,
      status: Status.ACTIVE,
      roles: [Role.USER, Role.STUDENT],
      isEmailVerified: false,
      isPhoneVerified: false,
      isOnboardingCompleted: false,
      membership: {
        tier: PlanTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        autoRenew: false,
      },
      authAccounts: [
        {
          provider: AuthProvider.EMAIL,
          providerId: email,
          passwordHash,
          isVerified: false,
          isPrimary: true,
        },
      ],
    });

    return studentUser._id;
  }

  private async ensureAccountRole(userId: string, role: Role) {
    await this.users.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { roles: role } },
    );
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
      this.toIdString(student.userId) === userId ||
      this.toIdString(student.createdByUserId) === userId
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

  private async calculateProfileCompletion(
    studentId: string,
    section: string,
    data: unknown,
  ): Promise<number> {
    const student = await this.students.findById(studentId).lean();
    const studentRecord = student as Record<string, unknown> | null;
    const sections = new Set<string>();

    if (studentRecord) {
      for (const key of this.profileSections) {
        const value = studentRecord[key];
        if (this.hasSectionValue(value)) sections.add(key);
      }
    }

    if (this.hasSectionValue(data)) sections.add(section);
    else sections.delete(section);

    return Math.round((sections.size / this.profileSections.size) * 100);
  }

  private hasSectionValue(value: unknown): boolean {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  }

  private getCatalogModel(type: CatalogType): Model<unknown> {
    const models: Record<CatalogType, Model<unknown>> = {
      boards: this.boards as Model<unknown>,
      universities: this.universities as Model<unknown>,
      institutions: this.institutions as Model<unknown>,
      'academic-levels': this.academicLevels as Model<unknown>,
      grades: this.grades as Model<unknown>,
      streams: this.streams as Model<unknown>,
      courses: this.courses as Model<unknown>,
    };

    return models[type];
  }

  private toCatalogPayload(
    type: CatalogType,
    dto: CreateAcademicCatalogDto,
  ): Record<string, unknown> {
    return {
      ...dto,
      code: dto.code.toUpperCase(),
      academicLevelId: dto.academicLevelId
        ? new Types.ObjectId(dto.academicLevelId)
        : undefined,
      streamId: dto.streamId ? new Types.ObjectId(dto.streamId) : undefined,
      boardId: dto.boardId ? new Types.ObjectId(dto.boardId) : undefined,
      universityId: dto.universityId
        ? new Types.ObjectId(dto.universityId)
        : undefined,
      type:
        dto.type ??
        (type === 'boards'
          ? 'school'
          : type === 'institutions'
            ? 'school'
            : undefined),
    };
  }

  private resolveNextReminderAt(
    startAt: Date,
    reminderMinutesBefore: number[] = [60, 15],
  ): Date | undefined {
    const now = new Date();
    return reminderMinutesBefore
      .map((minutes) => new Date(startAt.getTime() - minutes * 60_000))
      .filter((reminderAt) => reminderAt > now)
      .sort((a, b) => a.getTime() - b.getTime())[0];
  }

  private toIdString(value: unknown): string {
    if (!value) return '';
    if (value instanceof Types.ObjectId) return value.toHexString();
    if (typeof value === 'string') return value;
    return '';
  }
}
