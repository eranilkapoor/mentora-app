import { Types } from 'mongoose';
import { LearningService } from './learning.service';

const createLeanQuery = <T>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const createFindOneQuery = <T>(value: T) => ({
  sort: jest.fn().mockResolvedValue(value),
});

const createModel = () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findOneAndUpdate: jest.fn(),
});

const createFixture = () => {
  const models = {
    students: createModel(),
    parents: createModel(),
    relationships: createModel(),
    invitations: createModel(),
    controls: createModel(),
    academicRecords: createModel(),
    boards: createModel(),
    academicLevels: createModel(),
    grades: createModel(),
    streams: createModel(),
    courses: createModel(),
    institutions: createModel(),
    universities: createModel(),
    subjects: createModel(),
    topics: createModel(),
    curriculums: createModel(),
    enrollments: createModel(),
    schedules: createModel(),
    entitlements: createModel(),
    aiSessions: createModel(),
    aiMessages: createModel(),
    questionBanks: createModel(),
    questions: createModel(),
    assessments: createModel(),
    assessmentAttempts: createModel(),
    assessmentAnswers: createModel(),
    assessmentResults: createModel(),
    topicProgress: createModel(),
    recommendations: createModel(),
    safetyEvents: createModel(),
    users: createModel(),
  };

  const service = new LearningService(
    models.students as never,
    models.parents as never,
    models.relationships as never,
    models.invitations as never,
    models.controls as never,
    models.academicRecords as never,
    models.boards as never,
    models.academicLevels as never,
    models.grades as never,
    models.streams as never,
    models.courses as never,
    models.institutions as never,
    models.universities as never,
    models.subjects as never,
    models.topics as never,
    models.curriculums as never,
    models.enrollments as never,
    models.schedules as never,
    models.entitlements as never,
    models.aiSessions as never,
    models.aiMessages as never,
    models.questionBanks as never,
    models.questions as never,
    models.assessments as never,
    models.assessmentAttempts as never,
    models.assessmentAnswers as never,
    models.assessmentResults as never,
    models.topicProgress as never,
    models.recommendations as never,
    models.safetyEvents as never,
    models.users as never,
  );

  return { models, service };
};

describe('LearningService AI access guard', () => {
  const requestedAt = new Date('2026-07-26T10:00:00.000Z');
  const studentProfileId = new Types.ObjectId();
  const subjectId = new Types.ObjectId();
  const scheduleId = new Types.ObjectId();
  const entitlementId = new Types.ObjectId();

  const seedAllowedBaseline = (
    models: ReturnType<typeof createFixture>['models'],
  ) => {
    models.students.findById.mockReturnValue(
      createLeanQuery({
        _id: studentProfileId,
        status: 'active',
      }),
    );
    models.controls.findOne.mockReturnValue(createLeanQuery(null));
    models.enrollments.findOne.mockResolvedValue({
      _id: new Types.ObjectId(),
    });
    models.schedules.findById.mockReturnValue(
      createLeanQuery({
        _id: scheduleId,
        studentProfileId,
        subjectId,
        status: 'scheduled',
        accessRule: 'scheduled_time_only',
        startAt: new Date('2026-07-26T09:45:00.000Z'),
        endAt: new Date('2026-07-26T10:45:00.000Z'),
        earlyAccessMinutes: 5,
        lateAccessMinutes: 5,
        parentApprovalRequired: false,
        parentApproved: false,
      }),
    );
    models.entitlements.findOne.mockReturnValue(
      createFindOneQuery({
        _id: entitlementId,
        expiresAt: new Date('2026-07-27T10:00:00.000Z'),
        allocatedQuantity: 60,
        usedQuantity: 15,
      }),
    );
  };

  it('allows access inside schedule with enrollment and active entitlement', async () => {
    const { models, service } = createFixture();
    seedAllowedBaseline(models);

    await expect(
      service.checkAiAccess({
        studentProfileId: studentProfileId.toString(),
        subjectId: subjectId.toString(),
        scheduleId: scheduleId.toString(),
        requestedAt,
      }),
    ).resolves.toEqual({
      allowed: true,
      entitlementId: entitlementId.toString(),
      remainingMinutes: 45,
    });
  });

  it('denies AI access outside the scheduled time window', async () => {
    const { models, service } = createFixture();
    seedAllowedBaseline(models);

    await expect(
      service.checkAiAccess({
        studentProfileId: studentProfileId.toString(),
        subjectId: subjectId.toString(),
        scheduleId: scheduleId.toString(),
        requestedAt: new Date('2026-07-26T08:00:00.000Z'),
      }),
    ).resolves.toEqual({
      allowed: false,
      denialReason: 'OUTSIDE_SCHEDULE',
    });
  });

  it('denies AI access when entitlement is expired', async () => {
    const { models, service } = createFixture();
    seedAllowedBaseline(models);
    models.entitlements.findOne.mockReturnValue(
      createFindOneQuery({
        _id: entitlementId,
        expiresAt: new Date('2026-07-25T10:00:00.000Z'),
        allocatedQuantity: 60,
        usedQuantity: 15,
      }),
    );

    await expect(
      service.checkAiAccess({
        studentProfileId: studentProfileId.toString(),
        subjectId: subjectId.toString(),
        scheduleId: scheduleId.toString(),
        requestedAt,
      }),
    ).resolves.toEqual({
      allowed: false,
      denialReason: 'ENTITLEMENT_EXPIRED',
    });
  });

  it('denies AI access when the subject is not enrolled or allowed', async () => {
    const { models, service } = createFixture();
    seedAllowedBaseline(models);
    models.enrollments.findOne.mockResolvedValue(null);

    await expect(
      service.checkAiAccess({
        studentProfileId: studentProfileId.toString(),
        subjectId: subjectId.toString(),
        scheduleId: scheduleId.toString(),
        requestedAt,
      }),
    ).resolves.toEqual({
      allowed: false,
      denialReason: 'SUBJECT_NOT_INCLUDED',
    });
  });

  it('denies AI access when parental controls block tutoring', async () => {
    const { models, service } = createFixture();
    seedAllowedBaseline(models);
    models.controls.findOne.mockReturnValue(
      createLeanQuery({
        aiTutorEnabled: false,
        blockedSubjectIds: [],
        allowedSubjectIds: [],
      }),
    );

    await expect(
      service.checkAiAccess({
        studentProfileId: studentProfileId.toString(),
        subjectId: subjectId.toString(),
        scheduleId: scheduleId.toString(),
        requestedAt,
      }),
    ).resolves.toEqual({
      allowed: false,
      denialReason: 'PARENTAL_CONTROL_BLOCKED',
    });
  });
});
