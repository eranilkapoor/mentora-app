import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants';

type ExportDocument = Record<string, unknown>;

const SECRET_KEYS = new Set([
  'password',
  'passwordHash',
  'refreshToken',
  'refreshTokenHash',
  'accessToken',
  'otp',
  'otpHash',
  'appPinHash',
  'totpSecret',
  'recoveryCodes',
  'gatewayPayload',
  '__v',
]);

const SETTINGS_EXPORT_COLLECTIONS = [
  ['account', COLLECTION_NAMES.ACCOUNT_SETTING],
  ['privacy', COLLECTION_NAMES.PRIVACY_SETTING],
  ['notification', COLLECTION_NAMES.NOTIFICATION_SETTING],
  ['communication', COLLECTION_NAMES.COMMUNICATION_SETTING],
  ['security', COLLECTION_NAMES.SECURITY_SETTING],
  ['localization', COLLECTION_NAMES.LOCALIZATION_SETTING],
  ['accessibility', COLLECTION_NAMES.ACCESSIBILITY_SETTING],
  ['media', COLLECTION_NAMES.MEDIA_SETTING],
  ['ai', COLLECTION_NAMES.AI_SETTING],
] satisfies Array<[string, string]>;

export const USER_DATA_EXPORT_COLLECTIONS = {
  user: COLLECTION_NAMES.USER,
  profile: COLLECTION_NAMES.PROFILE,
  media: COLLECTION_NAMES.MEDIA,
  sessions: COLLECTION_NAMES.USER_SESSION,
  notifications: COLLECTION_NAMES.NOTIFICATION,
  notificationLogs: COLLECTION_NAMES.NOTIFICATION_LOG,
  subscriptions: COLLECTION_NAMES.SUBSCRIPTION,
  payments: COLLECTION_NAMES.PAYMENT,
  invoices: COLLECTION_NAMES.PAYMENT_INVOICE,
  referrals: COLLECTION_NAMES.REFERRAL_REWARD,
  walletTransactions: COLLECTION_NAMES.WALLET_TRANSACTION,
  blocks: COLLECTION_NAMES.USER_BLOCK,
  hiddenProfiles: COLLECTION_NAMES.USER_PROFILE_HIDE,
  reports: COLLECTION_NAMES.USER_REPORT,
  consents: COLLECTION_NAMES.USER_CONSENT,
  activityLogs: COLLECTION_NAMES.ACTIVITY_LOG,
  chatRooms: COLLECTION_NAMES.CHAT_ROOM,
  chatMessages: COLLECTION_NAMES.CHAT_MESSAGE,
  verification: COLLECTION_NAMES.VERIFICATION,
  analyticsEvents: COLLECTION_NAMES.ANALYTICS_EVENT,
  supportTickets: COLLECTION_NAMES.SUPPORT_TICKET,
  studentProfiles: COLLECTION_NAMES.STUDENT_PROFILE,
  parentProfiles: COLLECTION_NAMES.PARENT_PROFILE,
  parentStudentRelationships: COLLECTION_NAMES.PARENT_STUDENT_RELATIONSHIP,
  parentalControls: COLLECTION_NAMES.PARENTAL_CONTROL,
  academicRecords: COLLECTION_NAMES.STUDENT_ACADEMIC_RECORD,
  subjectEnrollments: COLLECTION_NAMES.STUDENT_SUBJECT_ENROLLMENT,
  learningSchedules: COLLECTION_NAMES.LEARNING_SCHEDULE,
  learningEntitlements: COLLECTION_NAMES.LEARNING_ENTITLEMENT,
  aiTutorSessions: COLLECTION_NAMES.AI_TUTOR_SESSION,
  aiTutorMessages: COLLECTION_NAMES.AI_TUTOR_MESSAGE,
  classrooms: COLLECTION_NAMES.CLASSROOM,
  classroomMessages: COLLECTION_NAMES.CLASSROOM_MESSAGE,
  classroomFiles: COLLECTION_NAMES.CLASSROOM_FILE,
  tutorProfile: COLLECTION_NAMES.TUTOR_PROFILE,
  tutorAvailability: COLLECTION_NAMES.TUTOR_AVAILABILITY,
  tutorSessionNotes: COLLECTION_NAMES.TUTOR_SESSION_NOTE,
  safetyEvents: COLLECTION_NAMES.SAFETY_EVENT,
} as const;

@Injectable()
export class DataExportService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async exportUserData(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const byUserId = { userId: userObjectId };

    const settings = await this.getSettings(byUserId);
    const [
      user,
      profile,
      media,
      sessions,
      notifications,
      subscriptions,
      payments,
      invoices,
      referrals,
      walletTransactions,
      blocks,
      hiddenProfiles,
      reports,
      consents,
      activityLogs,
      chatRooms,
      chatMessages,
      verification,
      analyticsEvents,
      supportTickets,
      studentProfiles,
      parentProfiles,
      parentStudentRelationships,
      tutorProfile,
      tutorAvailability,
      tutorSessionNotesByTutor,
      safetyEventsByUser,
    ] = await Promise.all([
      this.collection(USER_DATA_EXPORT_COLLECTIONS.user).findOne({
        _id: userObjectId,
      }),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.profile).findOne(byUserId),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.media)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.sessions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.notifications)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.notificationLogs)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.subscriptions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.payments)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.invoices)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.referrals)
        .find({
          $or: [{ referrerId: userObjectId }, { referredUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.walletTransactions)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.blocks)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.hiddenProfiles)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.reports)
        .find({
          $or: [{ reportedBy: userObjectId }, { reportedUserId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.consents)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.activityLogs)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.chatRooms)
        .find({ participants: userObjectId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.chatMessages)
        .find({
          $or: [{ senderId: userObjectId }, { receiverId: userObjectId }],
        })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.verification).findOne(
        byUserId,
      ),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.analyticsEvents)
        .find({ userId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.supportTickets)
        .find(byUserId)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.studentProfiles)
        .find({ $or: [byUserId, { createdByUserId: userObjectId }] })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.parentProfiles).findOne(
        byUserId,
      ),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.parentStudentRelationships)
        .find({ parentUserId: userObjectId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.tutorProfile).findOne(
        byUserId,
      ),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.tutorAvailability)
        .find({ tutorUserId: userObjectId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.tutorSessionNotes)
        .find({ tutorUserId: userObjectId })
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.safetyEvents)
        .find({ userId: userObjectId })
        .toArray(),
    ]);
    const exportedStudentProfiles = studentProfiles as ExportDocument[];
    const exportedParentStudentRelationships =
      parentStudentRelationships as unknown as ExportDocument[];
    const studentProfileIds = [
      ...exportedStudentProfiles.map((student) => student._id),
      ...exportedParentStudentRelationships.map(
        (relationship) => relationship.studentProfileId,
      ),
    ].filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
    const studentFilter =
      studentProfileIds.length > 0
        ? { studentProfileId: { $in: studentProfileIds } }
        : { studentProfileId: userObjectId };
    const [
      parentalControls,
      academicRecords,
      subjectEnrollments,
      learningSchedules,
      learningEntitlements,
      aiTutorSessions,
      classrooms,
      tutorSessionNotesByStudent,
      safetyEventsByStudent,
    ] = await Promise.all([
      this.collection(USER_DATA_EXPORT_COLLECTIONS.parentalControls)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.academicRecords)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.subjectEnrollments)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.learningSchedules)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.learningEntitlements)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.aiTutorSessions)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.classrooms)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.tutorSessionNotes)
        .find(studentFilter)
        .toArray(),
      this.collection(USER_DATA_EXPORT_COLLECTIONS.safetyEvents)
        .find(studentFilter)
        .toArray(),
    ]);
    const aiTutorSessionIds = aiTutorSessions
      .map((session) => session._id)
      .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
    const classroomIds = classrooms
      .map((classroom) => classroom._id)
      .filter((id): id is Types.ObjectId => id instanceof Types.ObjectId);
    const [aiTutorMessages, classroomMessages, classroomFiles] =
      await Promise.all([
        aiTutorSessionIds.length > 0
          ? this.collection(USER_DATA_EXPORT_COLLECTIONS.aiTutorMessages)
              .find({ sessionId: { $in: aiTutorSessionIds } })
              .toArray()
          : Promise.resolve([]),
        classroomIds.length > 0
          ? this.collection(USER_DATA_EXPORT_COLLECTIONS.classroomMessages)
              .find({ classroomId: { $in: classroomIds } })
              .toArray()
          : Promise.resolve([]),
        classroomIds.length > 0
          ? this.collection(USER_DATA_EXPORT_COLLECTIONS.classroomFiles)
              .find({ classroomId: { $in: classroomIds } })
              .toArray()
          : Promise.resolve([]),
      ]);

    return this.sanitize({
      exportedAt: new Date(),
      user,
      profile,
      media,
      settings,
      sessions,
      notifications,
      subscriptions,
      payments,
      invoices,
      referrals,
      walletTransactions,
      chat: {
        rooms: chatRooms,
        messages: chatMessages,
      },
      verification,
      analyticsEvents,
      supportTickets,
      learning: {
        studentProfiles,
        parentProfile: parentProfiles,
        parentStudentRelationships,
        parentalControls,
        academicRecords,
        subjectEnrollments,
        schedules: learningSchedules,
        entitlements: learningEntitlements,
        aiTutorSessions,
        aiTutorMessages,
        classrooms,
        classroomMessages,
        classroomFiles,
        tutorProfile,
        tutorAvailability,
        tutorSessionNotes: [
          ...tutorSessionNotesByTutor,
          ...tutorSessionNotesByStudent,
        ],
        safetyEvents: [...safetyEventsByUser, ...safetyEventsByStudent],
      },
      privacyControls: {
        blocks,
        hiddenProfiles,
        reports,
        consents,
      },
      activityLogs,
    });
  }

  private getSettings(userFilter: {
    userId: Types.ObjectId;
  }): Promise<Record<string, unknown>> {
    return Promise.all(
      SETTINGS_EXPORT_COLLECTIONS.map(
        async ([key, collectionName]): Promise<[string, unknown]> => [
          key,
          await this.collection(collectionName).findOne(userFilter),
        ],
      ),
    ).then((entries) => Object.fromEntries(entries));
  }

  private collection(name: string) {
    return this.connection.collection<ExportDocument>(name);
  }

  private sanitize(value: unknown): unknown {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([key]) => !SECRET_KEYS.has(key))
          .map(([key, item]) => [key, this.sanitize(item)]),
      );
    }

    return value;
  }
}
