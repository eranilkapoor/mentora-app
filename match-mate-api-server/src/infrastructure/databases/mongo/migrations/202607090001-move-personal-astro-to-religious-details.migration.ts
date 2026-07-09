import type { Connection } from 'mongoose';
import { COLLECTION_NAMES } from '@/common/constants/collection-names.constants';
import type { MongoMigration } from './migration.interface';

const LEGACY_ASTRO_FIELDS = [
  'caste',
  'subCast',
  'gotra',
  'manglikStatus',
  'rashi',
  'nakshatra',
  'kundliFileUrl',
] as const;

const migration: MongoMigration = {
  id: '202607090001',
  name: 'move-personal-astro-to-religious-details',
  checksum: 'sha256:move-personal-astro-to-religious-details-v1',
  async up(connection: Connection): Promise<void> {
    const profiles = connection.collection(COLLECTION_NAMES.PROFILE);

    const cursor = profiles.find({
      $or: LEGACY_ASTRO_FIELDS.map((field) => ({
        [`personal.${field}`]: { $exists: true },
      })),
    });

    for await (const profile of cursor) {
      const personal = profile.personal as Record<string, unknown> | undefined;
      if (!personal) continue;

      const religiousDetails = {
        ...((personal.religiousDetails as Record<string, unknown>) ?? {}),
      };

      if (personal.caste !== undefined) religiousDetails.caste = personal.caste;
      if (personal.subCast !== undefined)
        religiousDetails.subCaste = personal.subCast;
      if (personal.gotra !== undefined) religiousDetails.gotra = personal.gotra;
      if (personal.manglikStatus !== undefined)
        religiousDetails.manglikStatus = personal.manglikStatus;
      if (personal.rashi !== undefined) religiousDetails.rashi = personal.rashi;
      if (personal.nakshatra !== undefined)
        religiousDetails.nakshatra = personal.nakshatra;
      if (personal.kundliFileUrl !== undefined)
        religiousDetails.kundliFileUrl = personal.kundliFileUrl;

      await profiles.updateOne(
        { _id: profile._id },
        {
          $set: { 'personal.religiousDetails': religiousDetails },
          $unset: {
            'personal.caste': '',
            'personal.subCast': '',
            'personal.gotra': '',
            'personal.manglikStatus': '',
            'personal.rashi': '',
            'personal.nakshatra': '',
            'personal.kundliFileUrl': '',
          },
        },
      );
    }
  },
  async down(connection: Connection): Promise<void> {
    const profiles = connection.collection(COLLECTION_NAMES.PROFILE);

    const cursor = profiles.find({
      'personal.religiousDetails': { $exists: true },
    });

    for await (const profile of cursor) {
      const personal = profile.personal as Record<string, unknown> | undefined;
      const details = personal?.religiousDetails as
        | Record<string, unknown>
        | undefined;
      if (!details) continue;

      await profiles.updateOne(
        { _id: profile._id },
        {
          $set: {
            ...(details.caste !== undefined
              ? { 'personal.caste': details.caste }
              : {}),
            ...(details.subCaste !== undefined
              ? { 'personal.subCast': details.subCaste }
              : {}),
            ...(details.gotra !== undefined
              ? { 'personal.gotra': details.gotra }
              : {}),
            ...(details.manglikStatus !== undefined
              ? { 'personal.manglikStatus': details.manglikStatus }
              : {}),
            ...(details.rashi !== undefined
              ? { 'personal.rashi': details.rashi }
              : {}),
            ...(details.nakshatra !== undefined
              ? { 'personal.nakshatra': details.nakshatra }
              : {}),
            ...(details.kundliFileUrl !== undefined
              ? { 'personal.kundliFileUrl': details.kundliFileUrl }
              : {}),
          },
        },
      );
    }
  },
};

export default migration;
