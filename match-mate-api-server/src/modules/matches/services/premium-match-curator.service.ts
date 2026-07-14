import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { CurateMatchDto } from '../dto/curate-match.dto';
import {
  CuratedMatch,
  CuratedMatchDocument,
} from '../schemas/curated-match.schema';
import { CuratedMatchStatus } from '../enums/match.enums';
import {
  LeanProfile,
  MatchDiscoveryRepository,
} from '../repositories/match-discovery.repository';
import { MatchQueryDto } from '../dto/match-query.dto';
import { MatchCompatibilityService } from './match-compatibility.service';
import { presentProfileSummary } from '../presenters/profile-response.presenter';

type LeanCuratedMatch = FlattenMaps<CuratedMatch> & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  profileUserId: Types.ObjectId;
  curatedById: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class PremiumMatchCuratorService {
  constructor(
    @InjectModel(CuratedMatch.name)
    private readonly curatedMatchModel: Model<CuratedMatchDocument>,
    private readonly discoveryRepo: MatchDiscoveryRepository,
    private readonly compatibilityService: MatchCompatibilityService,
  ) {}

  async curateMatch(curatorId: string, dto: CurateMatchDto) {
    this.assertDistinctUsers(dto.userId, dto.profileUserId);

    const [userProfile, candidateProfile] = await Promise.all([
      this.discoveryRepo.getProfile(dto.userId),
      this.discoveryRepo.getProfile(dto.profileUserId),
    ]);

    if (!userProfile || !candidateProfile) {
      return throwNotFound(ErrorCode.PROFILE_NOT_FOUND, {
        reason: 'curated_match_profile_missing',
      });
    }

    const update = {
      curatedById: new Types.ObjectId(curatorId),
      note: dto.note,
      priority: dto.priority ?? 0,
      status: CuratedMatchStatus.ACTIVE,
      expiresAt: dto.expiresAt,
      dismissedAt: undefined,
    };

    return this.curatedMatchModel
      .findOneAndUpdate(
        {
          userId: new Types.ObjectId(dto.userId),
          profileUserId: new Types.ObjectId(dto.profileUserId),
        },
        {
          $set: update,
          $setOnInsert: {
            userId: new Types.ObjectId(dto.userId),
            profileUserId: new Types.ObjectId(dto.profileUserId),
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .lean<LeanCuratedMatch>()
      .exec();
  }

  async getCuratedMatches(userId: string, query: MatchQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const now = new Date();
    const userObjectId = new Types.ObjectId(userId);
    const baseFilter = {
      userId: userObjectId,
      status: CuratedMatchStatus.ACTIVE,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }],
    };

    const [curatedMatches, total, myProfile, myPreference] = await Promise.all([
      this.curatedMatchModel
        .find(baseFilter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<LeanCuratedMatch[]>()
        .exec(),
      this.curatedMatchModel.countDocuments(baseFilter).exec(),
      this.discoveryRepo.getProfile(userId),
      this.discoveryRepo.getPreference(userId),
    ]);

    if (!myProfile) {
      return throwBadRequest(ErrorCode.PROFILE_NOT_FOUND, {
        reason: 'profile_required_for_curated_matches',
      });
    }

    const profileUserIds = curatedMatches.map((item) =>
      item.profileUserId.toString(),
    );
    const profiles = await this.getProfilesByUserIds(profileUserIds);
    const enriched = await this.enrichProfiles(
      myProfile,
      myPreference,
      profiles,
    );
    const curationByUserId = new Map(
      curatedMatches.map((item) => [item.profileUserId.toString(), item]),
    );

    const data = enriched
      .map((profile) => {
        const curation = curationByUserId.get(String(profile.userId));
        return {
          ...profile,
          curation: curation
            ? {
                id: curation._id.toString(),
                note: curation.note,
                priority: curation.priority,
                curatedById: curation.curatedById.toString(),
                curatedAt: curation.createdAt,
                expiresAt: curation.expiresAt,
              }
            : undefined,
        };
      })
      .sort((a, b) => {
        const aCuration = curationByUserId.get(String(a.userId));
        const bCuration = curationByUserId.get(String(b.userId));
        return (
          Number(bCuration?.priority ?? 0) - Number(aCuration?.priority ?? 0)
        );
      });

    return this.paginate(data, total, skip, limit, page);
  }

  async dismissCuratedMatch(userId: string, curatedMatchId: string) {
    const match = await this.curatedMatchModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(curatedMatchId),
          userId: new Types.ObjectId(userId),
          status: CuratedMatchStatus.ACTIVE,
        },
        {
          $set: {
            status: CuratedMatchStatus.DISMISSED,
            dismissedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean<LeanCuratedMatch>()
      .exec();

    if (!match) {
      return throwNotFound(ErrorCode.MATCH_NOT_FOUND, {
        reason: 'curated_match_not_found',
      });
    }

    return match;
  }

  async getAdminCuratedMatches(userId?: string, limit = 50) {
    const filter = userId ? { userId: new Types.ObjectId(userId) } : {};
    return this.curatedMatchModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Math.max(limit, 1), 100))
      .lean<LeanCuratedMatch[]>()
      .exec();
  }

  async expireCuratedMatch(curatedMatchId: string) {
    const match = await this.curatedMatchModel
      .findByIdAndUpdate(
        curatedMatchId,
        {
          $set: {
            status: CuratedMatchStatus.EXPIRED,
            expiresAt: new Date(),
          },
        },
        { new: true },
      )
      .lean<LeanCuratedMatch>()
      .exec();

    if (!match) {
      return throwNotFound(ErrorCode.MATCH_NOT_FOUND, {
        reason: 'curated_match_not_found',
      });
    }

    return match;
  }

  private async getProfilesByUserIds(
    userIds: string[],
  ): Promise<LeanProfile[]> {
    const profiles = await Promise.all(
      userIds.map((userId) => this.discoveryRepo.getProfile(userId)),
    );

    return profiles.filter((profile): profile is LeanProfile =>
      Boolean(profile),
    );
  }

  private async enrichProfiles(
    myProfile: LeanProfile,
    myPreference: unknown,
    profiles: LeanProfile[],
  ) {
    const [media, preferences] = await Promise.all([
      this.discoveryRepo.getActiveMediaByUserIds(
        profiles.map((profile) => String(profile.userId)),
      ),
      this.discoveryRepo.getPreferencesByUserIds(
        profiles.map((profile) => String(profile.userId)),
      ),
    ]);

    const mediaByUserId = new Map<string, unknown[]>();
    media.forEach((item) => {
      const userId = String(item.userId);
      const current = mediaByUserId.get(userId) ?? [];
      current.push(item);
      mediaByUserId.set(userId, current);
    });

    const preferenceByUserId = new Map(
      preferences.map((preference) => [String(preference.userId), preference]),
    );

    return profiles.map((profile) => {
      const compatibility =
        this.compatibilityService.calculateMutualCompatibility(
          myProfile,
          myPreference as Record<string, unknown> | null,
          profile,
          preferenceByUserId.get(String(profile.userId)) ?? null,
        );

      return presentProfileSummary({
        ...profile,
        images: mediaByUserId.get(String(profile.userId)) ?? [],
        matchScore: compatibility.score,
        compatibility,
      });
    });
  }

  private assertDistinctUsers(userId: string, profileUserId: string): void {
    if (userId === profileUserId) {
      return throwBadRequest(ErrorCode.MATCH_CANNOT_MATCH_SELF, {
        reason: 'cannot_curate_self',
      });
    }
  }

  private paginate<T>(
    data: T[],
    total: number,
    skip: number,
    limit: number,
    page: number,
  ) {
    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}
