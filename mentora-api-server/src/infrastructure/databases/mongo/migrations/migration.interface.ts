import type { Connection } from 'mongoose';

export interface MongoMigration {
  id: string;
  name: string;
  checksum: string;
  up(connection: Connection): Promise<void>;
  down?(connection: Connection): Promise<void>;
}

export interface AppliedMongoMigration {
  _id: string;
  name: string;
  checksum: string;
  appliedAt: Date;
  executionMs: number;
}
