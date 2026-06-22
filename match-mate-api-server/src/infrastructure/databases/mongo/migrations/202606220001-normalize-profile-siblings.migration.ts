import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import { SiblingType } from '@/common/enums';
import type { MongoMigration } from './migration.interface';

interface StoredSiblingDetail {
  type?: string;
  married?: boolean;
  occupation?: string;
}

interface StoredSiblings {
  brothersCount?: number;
  sistersCount?: number;
  marriedBrothersCount?: number;
  marriedSistersCount?: number;
  details?: StoredSiblingDetail[];
}

interface StoredProfile {
  family?: { siblings?: StoredSiblings };
}

const toCount = (value: unknown): number =>
  Math.max(0, Math.floor(Number(value) || 0));

export const normalizeStoredSiblings = (
  siblings: StoredSiblings,
): StoredSiblings => {
  const brothersCount = toCount(siblings.brothersCount);
  const sistersCount = toCount(siblings.sistersCount);
  const sourceDetails = Array.isArray(siblings.details) ? siblings.details : [];

  const detailsFor = (type: SiblingType, count: number) => {
    const matching = sourceDetails
      .filter((detail) => detail.type === type)
      .slice(0, count)
      .map((detail) => ({
        ...detail,
        type,
        married: detail.married === true,
        occupation:
          typeof detail.occupation === 'string' ? detail.occupation : '',
      }));

    while (matching.length < count) {
      matching.push({ type, married: false, occupation: '' });
    }

    return matching;
  };

  const details = [
    ...detailsFor(SiblingType.BROTHER, brothersCount),
    ...detailsFor(SiblingType.SISTER, sistersCount),
  ];

  return {
    ...siblings,
    brothersCount,
    sistersCount,
    details,
    marriedBrothersCount: details.filter(
      (detail) =>
        detail.type === SiblingType.BROTHER && detail.married === true,
    ).length,
    marriedSistersCount: details.filter(
      (detail) => detail.type === SiblingType.SISTER && detail.married === true,
    ).length,
  };
};

const migration: MongoMigration = {
  id: '202606220001',
  name: 'normalize-profile-sibling-counts',
  checksum: 'sha256:profile-siblings-v1',
  async up(connection: Connection): Promise<void> {
    const profiles = connection.collection<StoredProfile>(
      COLLECTION_NAMES.PROFILE,
    );
    const cursor = profiles.find(
      { 'family.siblings': { $exists: true } },
      { projection: { 'family.siblings': 1 } },
    );
    let operations: Array<Parameters<typeof profiles.bulkWrite>[0][number]> =
      [];

    const flush = async (): Promise<void> => {
      if (operations.length === 0) return;
      await profiles.bulkWrite(operations, { ordered: false });
      operations = [];
    };

    for await (const profile of cursor) {
      const siblings = profile.family?.siblings;
      if (!siblings) continue;

      operations.push({
        updateOne: {
          filter: { _id: profile._id },
          update: {
            $set: { 'family.siblings': normalizeStoredSiblings(siblings) },
          },
        },
      });

      if (operations.length >= 500) await flush();
    }

    await flush();
  },
};

export default migration;
