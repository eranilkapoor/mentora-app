import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import { AppLogger } from 'src/common/logger/logger.service';
import {
  Interest,
  InterestDocument,
  InterestStatus,
} from '../schemas/interest.schema';
import { Match, MatchDocument } from '../schemas/match.schema';
import {
  Profile,
  ProfileDocument,
} from 'src/modules/profile/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
  MediaStatus,
} from 'src/modules/profile/schemas/media/media.schema';
import {
  Interaction,
  InteractionDocument,
  InteractionStatus,
} from 'src/modules/profile/schemas/interaction/interaction.schema';
import { InteractionType } from 'src/modules/profile/enums/interaction-type.enum';

// ─── Explicit lean types ──────────────────────────────────────────────────────

type LeanInterest = FlattenMaps<Interest> & {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
};

type LeanMatch = FlattenMaps<Match> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetUserId: Types.ObjectId;
};

export type LeanProfile = FlattenMaps<Profile> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

type LeanMedia = FlattenMaps<Media> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

type LeanInteraction = FlattenMaps<Interaction> & {
  _id: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
};

@Injectable()
export class MatchRepository implements OnModuleInit {
  constructor(
    @InjectModel(Interest.name)
    private readonly interestModel: Model<InterestDocument>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,

    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<InteractionDocument>,

    private readonly logger: AppLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.dropLegacyUsersIndex();
  }

  async sendInterest(
    senderId: string,
    receiverId: string,
  ): Promise<LeanInterest> {
    const doc = await this.interestModel.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      status: InterestStatus.PENDING,
    });
    return doc.toObject() as LeanInterest;
  }

  async getExistingInterest(
    senderId: string,
    receiverId: string,
  ): Promise<LeanInterest | null> {
    return this.interestModel
      .findOne({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(receiverId),
      })
      .lean<LeanInterest>()
      .exec();
  }

  async getInterestById(id: string): Promise<LeanInterest | null> {
    return this.interestModel.findById(id).lean<LeanInterest>().exec();
  }

  async updateInterestStatus(
    id: string,
    status: InterestStatus,
  ): Promise<LeanInterest | null> {
    return this.interestModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .lean<LeanInterest>()
      .exec();
  }

  async deleteInterest(id: string): Promise<LeanInterest | null> {
    return this.interestModel.findByIdAndDelete(id).lean<LeanInterest>().exec();
  }

  async createMatch(user1: string, user2: string): Promise<LeanMatch> {
    try {
      return await this.upsertMatch(user1, user2);
    } catch (error) {
      if (this.isLegacyUsersIndexDuplicate(error)) {
        await this.dropLegacyUsersIndex();
        return this.upsertMatch(user1, user2);
      }

      throw error;
    }
  }

  private async upsertMatch(user1: string, user2: string): Promise<LeanMatch> {
    const [leftUserId, rightUserId] = [user1, user2].sort();
    const doc = await this.matchModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(leftUserId),
        targetUserId: new Types.ObjectId(rightUserId),
      },
      {
        $set: { isActive: true, isMutual: true, matchedOn: new Date() },
        $setOnInsert: { score: 100 },
      },
      { new: true, upsert: true },
    );
    return doc.toObject() as LeanMatch;
  }

  private isLegacyUsersIndexDuplicate(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000 &&
      String((error as { message?: string }).message ?? '').includes('users_1')
    );
  }

  private async dropLegacyUsersIndex(): Promise<void> {
    try {
      const indexes = await this.matchModel.collection.indexes();
      const legacyUsersIndex = indexes.find(
        (index) => index.name === 'users_1',
      );

      if (!legacyUsersIndex) {
        return;
      }

      await this.matchModel.collection.dropIndex('users_1');
      this.logger.warn(
        'Dropped legacy matches.users index. Match uniqueness is now handled by userId + targetUserId.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('index not found')) {
        return;
      }

      this.logger.warn(`Unable to drop legacy matches.users index: ${message}`);
    }
  }

  async getMatchesForUser(
    userId: string,
    skip = 0,
    limit = 20,
    excludedUserIds: string[] = [],
  ): Promise<LeanMatch[]> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.matchModel
      .find({
        isActive: true,
        ...(excludedObjectIds.length
          ? {
              userId: { $nin: excludedObjectIds },
              targetUserId: { $nin: excludedObjectIds },
            }
          : {}),
        $or: [
          { userId: new Types.ObjectId(userId) },
          { targetUserId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ matchedOn: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanMatch[]>()
      .exec();
  }

  async countMatchesForUser(userId: string): Promise<number> {
    return this.countMatchesForUserExcluding(userId);
  }

  async countMatchesForUserExcluding(
    userId: string,
    excludedUserIds: string[] = [],
  ): Promise<number> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.matchModel.countDocuments({
      isActive: true,
      ...(excludedObjectIds.length
        ? {
            userId: { $nin: excludedObjectIds },
            targetUserId: { $nin: excludedObjectIds },
          }
        : {}),
      $or: [
        { userId: new Types.ObjectId(userId) },
        { targetUserId: new Types.ObjectId(userId) },
      ],
    });
  }

  async getReceivedInterests(
    userId: string,
    skip = 0,
    limit = 20,
    excludedUserIds: string[] = [],
  ): Promise<LeanInterest[]> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.interestModel
      .find({
        receiverId: new Types.ObjectId(userId),
        ...(excludedObjectIds.length
          ? { senderId: { $nin: excludedObjectIds } }
          : {}),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanInterest[]>()
      .exec();
  }

  async countReceivedInterests(
    userId: string,
    excludedUserIds: string[] = [],
  ): Promise<number> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.interestModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      ...(excludedObjectIds.length
        ? { senderId: { $nin: excludedObjectIds } }
        : {}),
    });
  }

  async getSentInterests(
    userId: string,
    skip = 0,
    limit = 20,
    excludedUserIds: string[] = [],
  ): Promise<LeanInterest[]> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.interestModel
      .find({
        senderId: new Types.ObjectId(userId),
        ...(excludedObjectIds.length
          ? { receiverId: { $nin: excludedObjectIds } }
          : {}),
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanInterest[]>()
      .exec();
  }

  async countSentInterests(
    userId: string,
    excludedUserIds: string[] = [],
  ): Promise<number> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.interestModel.countDocuments({
      senderId: new Types.ObjectId(userId),
      ...(excludedObjectIds.length
        ? { receiverId: { $nin: excludedObjectIds } }
        : {}),
    });
  }

  async getProfileByUserId(userId: string): Promise<LeanProfile | null> {
    return this.profileModel
      .findOne({
        userId: new Types.ObjectId(userId),
        deletedAt: { $exists: false },
      })
      .select('-__v')
      .lean<LeanProfile>()
      .exec();
  }

  async getProfilesByUserIds(userIds: string[]): Promise<LeanProfile[]> {
    const uniqueIds = [...new Set(userIds)].map((id) => new Types.ObjectId(id));
    return this.profileModel
      .find({
        userId: { $in: uniqueIds },
        deletedAt: { $exists: false },
      })
      .select('-__v')
      .lean<LeanProfile[]>()
      .exec();
  }

  async getActiveMediaByUserIds(userIds: string[]): Promise<LeanMedia[]> {
    const uniqueIds = [...new Set(userIds)].map((id) => new Types.ObjectId(id));
    return this.mediaModel
      .find({
        userId: { $in: uniqueIds },
        status: MediaStatus.ACTIVE,
        isActive: true,
      })
      .sort({ isPrimary: -1, uploadedAt: -1 })
      .lean<LeanMedia[]>()
      .exec();
  }

  async getActiveMediaByUserId(userId: string): Promise<LeanMedia[]> {
    return this.getActiveMediaByUserIds([userId]);
  }

  async getMatchBetweenUsers(
    userId: string,
    targetUserId: string,
  ): Promise<LeanMatch | null> {
    const [leftUserId, rightUserId] = [userId, targetUserId].sort();
    return this.matchModel
      .findOne({
        userId: new Types.ObjectId(leftUserId),
        targetUserId: new Types.ObjectId(rightUserId),
        isActive: true,
      })
      .lean<LeanMatch>()
      .exec();
  }

  async addShortlist(
    userId: string,
    targetUserId: string,
  ): Promise<LeanInteraction> {
    const doc = await this.interactionModel
      .findOneAndUpdate(
        {
          fromUserId: new Types.ObjectId(userId),
          toUserId: new Types.ObjectId(targetUserId),
          type: InteractionType.SHORTLIST,
        },
        {
          $set: {
            status: InteractionStatus.ACCEPTED,
            metadata: { source: 'match' },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .lean<LeanInteraction>()
      .exec();

    return doc;
  }

  async removeShortlist(
    userId: string,
    targetUserId: string,
  ): Promise<LeanInteraction | null> {
    return this.interactionModel
      .findOneAndDelete({
        fromUserId: new Types.ObjectId(userId),
        toUserId: new Types.ObjectId(targetUserId),
        type: InteractionType.SHORTLIST,
      })
      .lean<LeanInteraction>()
      .exec();
  }

  async getShortlistedUserIds(userId: string): Promise<string[]> {
    const rows = await this.interactionModel
      .find({
        fromUserId: new Types.ObjectId(userId),
        type: InteractionType.SHORTLIST,
        status: InteractionStatus.ACCEPTED,
      })
      .select('toUserId')
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean<Array<{ toUserId: Types.ObjectId }>>()
      .exec();

    return rows.map((row) => row.toUserId.toString());
  }

  async countShortlisted(
    userId: string,
    excludedUserIds: string[] = [],
  ): Promise<number> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    return this.interactionModel.countDocuments({
      fromUserId: new Types.ObjectId(userId),
      type: InteractionType.SHORTLIST,
      status: InteractionStatus.ACCEPTED,
      ...(excludedObjectIds.length
        ? { toUserId: { $nin: excludedObjectIds } }
        : {}),
    });
  }

  async getShortlistedProfiles(
    userId: string,
    skip = 0,
    limit = 20,
    excludedUserIds: string[] = [],
  ): Promise<LeanProfile[]> {
    const excludedObjectIds = this.toObjectIds(excludedUserIds);
    const rows = await this.interactionModel
      .find({
        fromUserId: new Types.ObjectId(userId),
        type: InteractionType.SHORTLIST,
        status: InteractionStatus.ACCEPTED,
        ...(excludedObjectIds.length
          ? { toUserId: { $nin: excludedObjectIds } }
          : {}),
      })
      .select('toUserId')
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<Array<{ toUserId: Types.ObjectId }>>()
      .exec();

    const ids = rows.map((row) => row.toUserId.toString());
    const profiles = await this.getProfilesByUserIds(ids);
    const profileMap = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    return ids
      .map((id) => profileMap.get(id))
      .filter((profile): profile is LeanProfile => Boolean(profile));
  }

  private toObjectIds(userIds: string[]): Types.ObjectId[] {
    return [...new Set(userIds.filter((id) => Types.ObjectId.isValid(id)))].map(
      (id) => new Types.ObjectId(id),
    );
  }
}
