import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { ProfileDocument } from '@/modules/profiles/schemas/profile/profile.schema';
import { ProfileStatus, Gender } from '@/common/enums';
import {
  LeanProfile,
  MatchDiscoveryRepository,
} from '../repositories/match-discovery.repository';
import { MatchQueryDto, NearbyQueryDto } from '../dto/match-query.dto';
import { SettingsService } from '@/modules/settings/services/settings.service';
import { ProfileBoostService } from '@/modules/subscriptions/services/profile-boost.service';
import { ErrorCode } from '@/common/constants';
import { throwBadRequest } from '@/common/exceptions/throw-app-exception';
import { MatchCompatibilityService } from './match-compatibility.service';
import { presentProfileSummary } from '../presenters/profile-response.presenter';

@Injectable()
export class MatchDiscoveryService {
  constructor(
    private readonly discoveryRepo: MatchDiscoveryRepository,
    private readonly settingsService: SettingsService,
    private readonly profileBoostService: ProfileBoostService,
    private readonly compatibilityService: MatchCompatibilityService,
  ) {}

  //  Recommended matches

  async getRecommendedMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(
      this.getProfileGender(myProfile),
    );

    const filter = this.buildDiscoveryFilter(
      userId,
      oppositeGender,
      interactedIds,
      preference,
      myProfile,
    );
    this.applyQueryFilters(filter, query);
    await this.applyVerificationConstraint(
      filter,
      this.requiresVerifiedProfiles(preference, query),
    );

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { visibilityScore: -1, profileScore: -1, lastActiveAt: -1 },
    );

    const scored = await this.withBoosts(
      await this.withCompatibility(myProfile, preference, profiles),
    );

    scored.sort(
      (a, b) =>
        Number(b.boostedMatchScore ?? b.matchScore) -
        Number(a.boostedMatchScore ?? a.matchScore),
    );

    return this.paginate(scored, total, skip, limit, query.page ?? 1);
  }

  //  New matches  profiles created in last 30 days

  async getNewMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(
      this.getProfileGender(myProfile),
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const baseFilter = this.buildDiscoveryFilter(
      userId,
      oppositeGender,
      interactedIds,
      preference,
      myProfile,
    );

    const filter = {
      ...baseFilter,
      createdAt: { $gte: thirtyDaysAgo },
    };
    this.applyQueryFilters(filter, query);
    await this.applyVerificationConstraint(
      filter,
      this.requiresVerifiedProfiles(preference, query),
    );

    let { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { createdAt: -1 },
    );

    if (total === 0) {
      this.applyQueryFilters(baseFilter, query);
      await this.applyVerificationConstraint(
        baseFilter,
        this.requiresVerifiedProfiles(preference, query),
      );
      const fallback = await this.discoveryRepo.findProfiles(
        baseFilter,
        skip,
        limit,
        { createdAt: -1 },
      );

      profiles = fallback.profiles;
      total = fallback.total;
    }

    return this.paginate(
      await this.withBoosts(await this.withImages(profiles)),
      total,
      skip,
      limit,
      query.page ?? 1,
    );
  }

  //  Nearby matches  geo-based

  async getNearbyMatches(userId: string, query: NearbyQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const location = myProfile.location as
      | { type: string; coordinates: [number, number] }
      | undefined;

    if (!location?.coordinates?.length) {
      return throwBadRequest(ErrorCode.PROFILE_NOT_FOUND, {
        reason: 'profile_location_required',
      });
    }

    const oppositeGender = this.getOppositeGender(
      this.getProfileGender(myProfile),
    );
    const radiusMeters = (query.radiusKm ?? 100) * 1000;

    const baseFilter = this.buildBaseFilter(
      userId,
      oppositeGender,
      interactedIds,
    );
    this.applyQueryFilters(baseFilter, query);
    await this.applyVerificationConstraint(
      baseFilter,
      this.requiresVerifiedProfiles(preference, query),
    );

    const { profiles, total } = await this.discoveryRepo.findNearbyProfiles(
      baseFilter,
      location.coordinates,
      radiusMeters,
      skip,
      limit,
    );

    return this.paginate(
      await this.withBoosts(await this.withImages(profiles)),
      total,
      skip,
      limit,
      query.page ?? 1,
    );
  }

  //  Build base filter (gender + exclusions + active status)

  async getOnlineMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(
      this.getProfileGender(myProfile),
    );
    const onlineSince = new Date(Date.now() - 15 * 60 * 1000);

    const filter = {
      ...this.buildDiscoveryFilter(
        userId,
        oppositeGender,
        interactedIds,
        preference,
        myProfile,
      ),
      lastActiveAt: { $gte: onlineSince },
    };
    this.applyQueryFilters(filter, query);
    await this.applyVerificationConstraint(
      filter,
      this.requiresVerifiedProfiles(preference, query),
    );

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { lastActiveAt: -1 },
    );

    return this.paginate(
      await this.withBoosts(await this.withImages(profiles)),
      total,
      skip,
      limit,
      query.page ?? 1,
    );
  }

  private buildBaseFilter(
    userId: string,
    oppositeGender: Gender | undefined,
    interactedIds: Types.ObjectId[],
  ): FilterQuery<ProfileDocument> {
    const conditions: FilterQuery<ProfileDocument>[] = [
      {
        $or: [{ status: ProfileStatus.ACTIVE }, { status: { $exists: false } }],
      },
    ];

    if (oppositeGender) {
      conditions.push({
        'personal.gender': oppositeGender,
      });
    }

    return {
      userId: {
        $ne: new Types.ObjectId(userId),
        $nin: interactedIds,
      },
      deletedAt: { $exists: false },
      $and: conditions,
    };
  }

  //  Build full preference-based filter

  private buildPreferenceFilter(
    userId: string,
    oppositeGender: Gender | undefined,
    interactedIds: Types.ObjectId[],
    preference: Record<string, unknown> | null,
    myProfile: Record<string, unknown>,
  ): FilterQuery<ProfileDocument> {
    const filter = this.buildBaseFilter(userId, oppositeGender, interactedIds);
    const filters = preference?.filters as Record<string, unknown> | undefined;
    const settings = preference?.settings as
      | Record<string, unknown>
      | undefined;

    //  Age range

    const ageFilter = filters?.age as
      | { min?: number; max?: number }
      | undefined;

    const myAge = (myProfile.age as number | undefined) ?? 25;

    filter.age = {
      $gte: ageFilter?.min ?? Math.max(18, myAge - 5),
      $lte: ageFilter?.max ?? myAge + 5,
    };

    //  Height range (cm)

    const heightFilter = filters?.height as
      | { min?: number; max?: number }
      | undefined;

    if (heightFilter?.min || heightFilter?.max) {
      filter['physical.height'] = {
        ...(heightFilter.min ? { $gte: heightFilter.min } : {}),
        ...(heightFilter.max ? { $lte: heightFilter.max } : {}),
      };
    }

    //  Religion

    const religionFilter = filters?.religion as string[] | undefined;
    const myPersonal = (myProfile.personal ?? {}) as Record<string, unknown>;

    if (religionFilter?.length) {
      filter['personal.religion'] = { $in: religionFilter };
    } else if (myPersonal.religion) {
      filter['personal.religion'] = myPersonal.religion as string;
    }

    //  Caste

    const casteFilter = filters?.caste as string[] | undefined;
    if (casteFilter?.length) {
      filter['personal.religiousDetails.caste'] = { $in: casteFilter };
    }

    const subCasteFilter = filters?.subCaste as string[] | undefined;
    if (subCasteFilter?.length) {
      filter['personal.religiousDetails.subCaste'] = { $in: subCasteFilter };
    }

    //  Marital status

    const maritalFilter = filters?.maritalStatus as string[] | undefined;
    if (maritalFilter?.length) {
      filter['personal.maritalStatus'] = { $in: maritalFilter };
    }

    //  Location

    const cityFilter = filters?.city as string[] | undefined;
    const stateFilter = filters?.state as string[] | undefined;
    const countryFilter = filters?.country as string[] | undefined;

    if (cityFilter?.length) {
      filter['personal.city'] = { $in: cityFilter };
    } else if (stateFilter?.length) {
      filter['personal.state'] = { $in: stateFilter };
    } else if (countryFilter?.length) {
      filter['personal.country'] = { $in: countryFilter };
    }

    //  Education / qualification

    const qualFilter = filters?.qualification as string[] | undefined;
    if (qualFilter?.length) {
      filter['education.qualification'] = { $in: qualFilter };
    }

    //  Occupation type

    const occupationTypeFilter = filters?.occupationType as
      | string[]
      | undefined;
    if (occupationTypeFilter?.length) {
      filter['education.occupationType'] = { $in: occupationTypeFilter };
    }

    //  Body type

    const bodyTypeFilter = filters?.bodyType as string[] | undefined;
    if (bodyTypeFilter?.length) {
      filter['physical.bodyType'] = { $in: bodyTypeFilter };
    }

    //  Lifestyle filters

    const smokingFilter = filters?.smoking as string[] | undefined;
    if (smokingFilter?.length) {
      filter['personal.smoking'] = { $in: smokingFilter };
    }

    const drinkingFilter = filters?.drinking as string[] | undefined;
    if (drinkingFilter?.length) {
      filter['personal.drinking'] = { $in: drinkingFilter };
    }

    const eatingFilter = filters?.eating as string[] | undefined;
    if (eatingFilter?.length) {
      filter['personal.eating'] = { $in: eatingFilter };
    }

    //  Minimum match score

    const minScore = settings?.minimumMatchScore as number | undefined;
    if (minScore) {
      filter.profileScore = { $gte: minScore };
    }

    return filter;
  }

  private buildDiscoveryFilter(
    userId: string,
    oppositeGender: Gender | undefined,
    interactedIds: Types.ObjectId[],
    preference: Record<string, unknown> | null,
    myProfile: Record<string, unknown>,
  ): FilterQuery<ProfileDocument> {
    const settings = preference?.settings as
      | Record<string, unknown>
      | undefined;

    if (settings?.isStrict) {
      return this.buildPreferenceFilter(
        userId,
        oppositeGender,
        interactedIds,
        preference,
        myProfile,
      );
    }

    const filter = this.buildBaseFilter(userId, oppositeGender, interactedIds);

    return filter;
  }

  //  Helpers

  private getProfileGender(
    profile: Record<string, unknown>,
  ): Gender | undefined {
    const personal = profile.personal as Record<string, unknown> | undefined;

    return personal?.gender as Gender | undefined;
  }

  private getOppositeGender(gender: Gender | undefined): Gender | undefined {
    if (gender === Gender.MALE) return Gender.FEMALE;
    if (gender === Gender.FEMALE) return Gender.MALE;

    return gender;
  }

  private async resolveContext(userId: string, query: MatchQueryDto) {
    const [myProfile, preference, interactedIds, unavailableUserIds] =
      await Promise.all([
        this.discoveryRepo.getProfile(userId),
        this.discoveryRepo.getPreference(userId),
        this.discoveryRepo.getInteractedUserIds(userId),
        this.settingsService.getUnavailableRelationUserIds(userId),
      ]);

    if (!myProfile) {
      return throwBadRequest(ErrorCode.PROFILE_NOT_FOUND, {
        reason: 'profile_required_for_discovery',
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return {
      myProfile: myProfile as unknown as Record<string, unknown>,
      preference: preference as unknown as Record<string, unknown> | null,
      interactedIds: this.uniqueObjectIds([
        ...interactedIds,
        ...unavailableUserIds.map((id) => new Types.ObjectId(id)),
      ]),
      page,
      limit,
      skip,
    };
  }

  private uniqueObjectIds(ids: Types.ObjectId[]): Types.ObjectId[] {
    return [...new Map(ids.map((id) => [id.toString(), id])).values()];
  }

  private applyQueryFilters(
    filter: FilterQuery<ProfileDocument>,
    query: MatchQueryDto,
  ): void {
    const andConditions = filter.$and ?? [];

    const search = query.search?.trim();
    if (search) {
      const regex = new RegExp(this.escapeRegex(search), 'i');
      andConditions.push({
        $or: [
          { 'personal.firstName': regex },
          { 'personal.lastName': regex },
          { 'personal.city': regex },
          { 'personal.state': regex },
          { 'education.occupation': regex },
          { 'education.jobRole': regex },
          { 'education.companyName': regex },
        ],
      });
    }

    if (query.minAge || query.maxAge) {
      filter.age = {
        ...((filter.age as Record<string, number>) ?? {}),
        ...(query.minAge ? { $gte: query.minAge } : {}),
        ...(query.maxAge ? { $lte: query.maxAge } : {}),
      };
    }

    if (query.minHeight || query.maxHeight) {
      filter['physical.height'] = {
        ...((filter['physical.height'] as Record<string, number>) ?? {}),
        ...(query.minHeight ? { $gte: query.minHeight } : {}),
        ...(query.maxHeight ? { $lte: query.maxHeight } : {}),
      };
    }

    if (query.city?.trim()) {
      filter['personal.city'] = new RegExp(
        this.escapeRegex(query.city.trim()),
        'i',
      );
    }

    if (query.state?.trim()) {
      filter['personal.state'] = new RegExp(
        this.escapeRegex(query.state.trim()),
        'i',
      );
    }

    if (query.religion) {
      filter['personal.religion'] = query.religion;
    }

    if (query.caste) {
      filter['personal.religiousDetails.caste'] = query.caste;
    }

    if (query.qualification) {
      filter['education.qualification'] = query.qualification;
    }

    if (query.occupationType) {
      filter['education.occupationType'] = query.occupationType;
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }
  }

  private requiresVerifiedProfiles(
    preference: Record<string, unknown> | null,
    query: MatchQueryDto | NearbyQueryDto,
  ): boolean {
    const settings = preference?.settings as
      | Record<string, unknown>
      | undefined;
    return Boolean(
      query.verifiedOnly ||
      settings?.isStrict ||
      settings?.profileVerificationRequired,
    );
  }

  private async applyVerificationConstraint(
    filter: FilterQuery<ProfileDocument>,
    required: boolean,
  ): Promise<void> {
    if (!required) return;

    const verifiedUserIds = await this.discoveryRepo.getVerifiedUserIds();
    const currentUserFilter =
      filter.userId && typeof filter.userId === 'object'
        ? (filter.userId as Record<string, unknown>)
        : {};
    filter.userId = { ...currentUserFilter, $in: verifiedUserIds };
  }

  private async withImages<T extends LeanProfile>(
    profiles: T[],
  ): Promise<(T & { images: unknown[] })[]> {
    const userIds = profiles.map((profile) => String(profile.userId));
    const media = await this.discoveryRepo.getActiveMediaByUserIds(userIds);
    const mediaByUserId = new Map<string, unknown[]>();

    media.forEach((item) => {
      const userId = String(item.userId);
      const current = mediaByUserId.get(userId) ?? [];
      current.push(item);
      mediaByUserId.set(userId, current);
    });

    return profiles.map((profile) => ({
      ...profile,
      images: mediaByUserId.get(String(profile.userId)) ?? [],
    }));
  }

  private async withCompatibility<T extends LeanProfile>(
    myProfile: Record<string, unknown>,
    myPreference: Record<string, unknown> | null,
    profiles: T[],
  ): Promise<
    (T & { images: unknown[]; matchScore: number; compatibility: unknown })[]
  > {
    const profilesWithImages = await this.withImages(profiles);
    const candidatePreferences =
      await this.discoveryRepo.getPreferencesByUserIds(
        profiles.map((profile) => String(profile.userId)),
      );
    const preferenceByUserId = new Map(
      candidatePreferences.map((candidatePreference) => [
        String(candidatePreference.userId),
        candidatePreference,
      ]),
    );

    return profilesWithImages.map((profile) => {
      const compatibility =
        this.compatibilityService.calculateMutualCompatibility(
          myProfile,
          myPreference,
          profile,
          preferenceByUserId.get(String(profile.userId)) ?? null,
        );

      return {
        ...profile,
        matchScore: compatibility.score,
        compatibility,
      };
    });
  }

  private async withBoosts<T extends LeanProfile & Record<string, unknown>>(
    profiles: T[],
  ): Promise<
    Array<
      T & {
        activeBoost?: { multiplier: number; endsAt: Date };
        boostedMatchScore?: number;
      }
    >
  > {
    const boostMap = await this.profileBoostService.getActiveBoostMap(
      profiles.map((profile) => String(profile.userId)),
    );

    return profiles.map((profile) => {
      const boost = boostMap.get(String(profile.userId));
      if (!boost) return profile;

      const matchScore = Number(
        profile.matchScore ?? profile.profileScore ?? 0,
      );
      const multiplier = Number(boost.multiplier ?? 1.25);
      return {
        ...profile,
        activeBoost: {
          multiplier,
          endsAt: boost.endsAt,
        },
        boostedMatchScore: Math.min(100, Math.round(matchScore * multiplier)),
      };
    });
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
      data: data.map((item) => presentProfileSummary(item)),
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
