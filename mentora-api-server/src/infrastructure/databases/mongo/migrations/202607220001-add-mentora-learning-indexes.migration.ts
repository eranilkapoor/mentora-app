import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

type IndexDefinition = {
  collection: string;
  keys: Record<string, 1 | -1>;
  name: string;
  unique?: boolean;
  sparse?: boolean;
};

const indexes: IndexDefinition[] = [
  {
    collection: COLLECTION_NAMES.STUDENT_PROFILE,
    keys: { createdByUserId: 1, status: 1 },
    name: 'idx_createdByUserId_status',
  },
  {
    collection: COLLECTION_NAMES.PARENT_STUDENT_RELATIONSHIP,
    keys: { parentUserId: 1, studentProfileId: 1 },
    name: 'uniq_parentUserId_studentProfileId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.PARENTAL_CONTROL,
    keys: { studentProfileId: 1 },
    name: 'uniq_studentProfileId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.STUDENT_ACADEMIC_RECORD,
    keys: { studentProfileId: 1, status: 1, updatedAt: -1 },
    name: 'idx_studentProfileId_status_updatedAt',
  },
  {
    collection: COLLECTION_NAMES.SUBJECT,
    keys: { code: 1 },
    name: 'uniq_code_sparse',
    unique: true,
    sparse: true,
  },
  {
    collection: COLLECTION_NAMES.STUDENT_SUBJECT_ENROLLMENT,
    keys: { studentProfileId: 1, subjectId: 1 },
    name: 'uniq_studentProfileId_subjectId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.LEARNING_SCHEDULE,
    keys: { studentProfileId: 1, startAt: 1, status: 1 },
    name: 'idx_studentProfileId_startAt_status',
  },
  {
    collection: COLLECTION_NAMES.LEARNING_SCHEDULE,
    keys: { tutorUserId: 1, startAt: 1, status: 1 },
    name: 'idx_tutorUserId_startAt_status',
  },
  {
    collection: COLLECTION_NAMES.LEARNING_SCHEDULE,
    keys: { status: 1, startAt: 1, endAt: 1 },
    name: 'idx_status_startAt_endAt',
  },
  {
    collection: COLLECTION_NAMES.LEARNING_ENTITLEMENT,
    keys: { studentProfileId: 1, status: 1, expiresAt: 1 },
    name: 'idx_studentProfileId_status_expiresAt',
  },
  {
    collection: COLLECTION_NAMES.LEARNING_ENTITLEMENT,
    keys: { studentProfileId: 1, subjectId: 1, status: 1 },
    name: 'idx_studentProfileId_subjectId_status',
  },
  {
    collection: COLLECTION_NAMES.AI_TUTOR_SESSION,
    keys: { studentProfileId: 1, createdAt: -1 },
    name: 'idx_studentProfileId_createdAt',
  },
  {
    collection: COLLECTION_NAMES.AI_TUTOR_MESSAGE,
    keys: { sessionId: 1, createdAt: 1 },
    name: 'idx_sessionId_createdAt',
  },
  {
    collection: COLLECTION_NAMES.CLASSROOM,
    keys: { scheduleId: 1 },
    name: 'uniq_scheduleId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.CLASSROOM,
    keys: { studentProfileId: 1, status: 1, createdAt: -1 },
    name: 'idx_studentProfileId_status_createdAt',
  },
  {
    collection: COLLECTION_NAMES.CLASSROOM_MESSAGE,
    keys: { classroomId: 1, createdAt: 1 },
    name: 'idx_classroomId_createdAt',
  },
  {
    collection: COLLECTION_NAMES.CLASSROOM_FILE,
    keys: { classroomId: 1, createdAt: -1 },
    name: 'idx_classroomId_createdAt',
  },
  {
    collection: COLLECTION_NAMES.TUTOR_PROFILE,
    keys: { userId: 1 },
    name: 'uniq_userId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.TUTOR_PROFILE,
    keys: { status: 1, verified: 1, subjectIds: 1 },
    name: 'idx_status_verified_subjectIds',
  },
  {
    collection: COLLECTION_NAMES.TUTOR_AVAILABILITY,
    keys: { tutorUserId: 1, startAt: 1, status: 1 },
    name: 'idx_tutorUserId_startAt_status',
  },
  {
    collection: COLLECTION_NAMES.TUTOR_SESSION_NOTE,
    keys: { scheduleId: 1 },
    name: 'uniq_scheduleId',
    unique: true,
  },
  {
    collection: COLLECTION_NAMES.SAFETY_EVENT,
    keys: { status: 1, severity: 1, createdAt: -1 },
    name: 'idx_status_severity_createdAt',
  },
];

const migration: MongoMigration = {
  id: '202607220001',
  name: 'add-mentora-learning-indexes',
  checksum: 'sha256:mentora-learning-indexes-v1',
  async up(connection: Connection): Promise<void> {
    await Promise.all(
      indexes.map((index) =>
        connection.collection(index.collection).createIndex(index.keys, {
          name: index.name,
          ...(index.unique ? { unique: true } : {}),
          ...(index.sparse ? { sparse: true } : {}),
        }),
      ),
    );
  },
  async down(connection: Connection): Promise<void> {
    await Promise.all(
      indexes.map((index) =>
        dropIndexIfExists(connection, index.collection, index.name),
      ),
    );
  },
};

async function dropIndexIfExists(
  connection: Connection,
  collectionName: string,
  indexName: string,
): Promise<void> {
  await connection
    .collection(collectionName)
    .dropIndex(indexName)
    .catch((error: unknown) => {
      if (error instanceof Error && /index not found/i.test(error.message)) {
        return undefined;
      }
      throw error;
    });
}

export default migration;
