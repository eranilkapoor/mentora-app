import mongoose from 'mongoose';
import { Types } from 'mongoose';

type ExplainQuery = {
  name: string;
  collection: string;
  filter: Record<string, unknown>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
};

const sampleId = new Types.ObjectId();
const now = new Date();

const QUERIES: ExplainQuery[] = [
  {
    name: 'student profile dashboard',
    collection: 'student_profiles',
    filter: { status: 'active' },
    sort: { createdAt: -1 },
    limit: 50,
  },
  {
    name: 'student search',
    collection: 'student_profiles',
    filter: {
      status: 'active',
      gender: 'female',
      'address.city': 'Mumbai',
    },
    sort: { profileCompletionPercentage: -1, updatedAt: -1 },
    limit: 50,
  },
  {
    name: 'chat history',
    collection: 'chat_messages',
    filter: { roomId: sampleId, deletedAt: { $exists: false } },
    sort: { createdAt: -1 },
    limit: 50,
  },
  {
    name: 'unread messages',
    collection: 'chat_rooms',
    filter: {
      'participantStates.userId': sampleId,
      lastActivityAt: { $lte: now },
    },
    sort: { lastActivityAt: -1 },
    limit: 50,
  },
  {
    name: 'notification feed',
    collection: 'notifications',
    filter: { userId: sampleId, deletedAt: { $exists: false } },
    sort: { createdAt: -1 },
    limit: 50,
  },
  {
    name: 'payment history',
    collection: 'payments',
    filter: { userId: sampleId },
    sort: { createdAt: -1, initiatedAt: -1 },
    limit: 25,
  },
  {
    name: 'admin moderation queue',
    collection: 'media',
    filter: { moderationStatus: 'pending', isActive: true },
    sort: { createdAt: 1 },
    limit: 50,
  },
  {
    name: 'support queue',
    collection: 'support_tickets',
    filter: { status: { $in: ['open', 'pending'] } },
    sort: { updatedAt: -1 },
    limit: 50,
  },
];

function getWinningStage(plan: unknown): string {
  const text = JSON.stringify(plan);
  if (text.includes('IXSCAN')) return 'IXSCAN';
  if (text.includes('COLLSCAN')) return 'COLLSCAN';
  return 'UNKNOWN';
}

async function run(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');

  if (dryRun) {
    for (const query of QUERIES) {
      console.log(
        `${query.name}: ${query.collection} filter=${JSON.stringify(
          query.filter,
        )} sort=${JSON.stringify(query.sort ?? {})}`,
      );
    }
    return;
  }

  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error('MONGO_URI is required for Mongo explain audit');
  }

  await mongoose.connect(uri);

  try {
    for (const query of QUERIES) {
      const cursor = mongoose.connection
        .collection(query.collection)
        .find(query.filter)
        .sort(query.sort ?? {})
        .limit(query.limit ?? 50);
      const plan = await cursor.explain('executionStats');
      const stage = getWinningStage(plan);
      console.log(`${query.name}: ${query.collection} ${stage}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
