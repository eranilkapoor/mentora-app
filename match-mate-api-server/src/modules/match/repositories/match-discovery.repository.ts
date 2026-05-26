import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, FlattenMaps } from 'mongoose';
import {
  Profile,
  ProfileDocument,
} from 'src/modules/profile/schemas/profile/profile.schema';
import {
  Preference,
  PreferenceDocument,
} from 'src/modules/profile/schemas/preference/preference.schema';
import {
  Media,
  MediaDocument,
  MediaStatus,
} from 'src/modules/profile/schemas/media/media.schema';
import {
  Interest,
  InterestDocument,
  InterestStatus,
} from '../schemas/interest.schema';
import { Match, MatchDocument } from '../schemas/match.schema';

//  Explicit lean types

export type LeanProfile = FlattenMaps<Profile> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

export type LeanPreference = FlattenMaps<Preference> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

export type LeanMedia = FlattenMaps<Media> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
};

export interface DiscoveryResult {
  profiles: LeanProfile[];
  total: number;
}

@Injectable()
export class MatchDiscoveryRepository {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,

    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,

    @InjectModel(Interest.name)
    private readonly interestModel: Model<InterestDocument>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,
  ) {}

  // Explicit return type stops TypeScript from trying to infer the full
  // Mongoose Document chain which blows past the serialization limit
  async getProfile(userId: string): Promise<LeanProfile | null> {
    return this.profileModel
      .findOne({
        userId: new Types.ObjectId(userId),
        deletedAt: { $exists: false },
      })
      .lean<LeanProfile>()
      .exec();
  }

  async getPreference(userId: string): Promise<LeanPreference | null> {
    return this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean<LeanPreference>()
      .exec();
  }

  async getInteractedUserIds(userId: string): Promise<Types.ObjectId[]> {
    const uid = new Types.ObjectId(userId);

    const [sent, received] = await Promise.all([
      this.interestModel
        .find({
          senderId: uid,
          status: { $ne: InterestStatus.PENDING },
        })
        .select('receiverId')
        .lean<{ receiverId: Types.ObjectId }[]>()
        .exec(),
      this.interestModel
        .find({ receiverId: uid })
        .select('senderId')
        .lean<{ senderId: Types.ObjectId }[]>()
        .exec(),
    ]);

    return [
      ...sent.map((i) => i.receiverId),
      ...received.map((i) => i.senderId),
    ];
  }

  async findProfiles(
    filter: FilterQuery<ProfileDocument>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1> = { profileScore: -1, lastActiveAt: -1 },
  ): Promise<DiscoveryResult> {
    const [profiles, total]: [LeanProfile[], number] = await Promise.all([
      this.profileModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean<LeanProfile[]>()
        .exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    return { profiles, total };
  }

  async findNearbyProfiles(
    filter: FilterQuery<ProfileDocument>,
    coordinates: [number, number],
    radiusMeters: number,
    skip: number,
    limit: number,
  ): Promise<DiscoveryResult> {
    const earthRadiusMeters = 6378137;
    const radiusInRadians = radiusMeters / earthRadiusMeters;
    const geoFilter: FilterQuery<ProfileDocument> = {
      ...filter,
      location: {
        $geoWithin: {
          $centerSphere: [coordinates, radiusInRadians],
        },
      },
    };

    const [profiles, total]: [LeanProfile[], number] = await Promise.all([
      this.profileModel
        .find(geoFilter)
        .sort({ lastActiveAt: -1, profileScore: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean<LeanProfile[]>()
        .exec(),
      this.profileModel.countDocuments(geoFilter).exec(),
    ]);

    return { profiles, total };
  }

  async getActiveMediaByUserIds(userIds: string[]): Promise<LeanMedia[]> {
    const objectIds = userIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return [];
    }

    return this.mediaModel
      .find({
        userId: { $in: objectIds },
        status: MediaStatus.ACTIVE,
        isActive: true,
      })
      .sort({ isPrimary: -1, uploadedAt: -1, createdAt: -1 })
      .select('-__v')
      .lean<LeanMedia[]>()
      .exec();
  }
}
