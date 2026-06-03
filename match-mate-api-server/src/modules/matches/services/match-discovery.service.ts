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

//  Scoring weights default (overridden by user preference weights)

const DEFAULT_WEIGHTS = {
  age: 10,
  height: 10,
  religion: 15,
  caste: 10,
  location: 10,
  education: 10,
  occupation: 10,
  lifestyle: 10,
  horoscope: 15,
};

@Injectable()
export class MatchDiscoveryService {
  constructor(
    private readonly discoveryRepo: MatchDiscoveryRepository,
    private readonly settingsService: SettingsService,
    private readonly profileBoostService: ProfileBoostService,
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

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { visibilityScore: -1, profileScore: -1, lastActiveAt: -1 },
    );

    const weights =
      (preference?.weights as Record<string, number>) ?? DEFAULT_WEIGHTS;

    const scored = await this.withBoosts(
      (await this.withImages(profiles)).map((p) => ({
        ...p,
        matchScore: this.calculateMatchScore(p, preference, weights),
      })),
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

    let { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { createdAt: -1 },
    );

    if (total === 0) {
      this.applyQueryFilters(baseFilter, query);
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
    const {
      myProfile,
      // preference,
      interactedIds,
      skip,
      limit,
    } = await this.resolveContext(userId, query);

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
      filter['personal.caste'] = { $in: casteFilter };
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

    //  Strict mode  only verified profiles

    if (settings?.isStrict || settings?.profileVerificationRequired) {
      filter.isVerified = true;
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

    if (settings?.profileVerificationRequired) {
      filter.isVerified = true;
    }

    return filter;
  }

  //  Score a profile against user preferences

  private calculateMatchScore(
    profile: Record<string, unknown>,
    preference: Record<string, unknown> | null,
    weights: Record<string, number>,
  ): number {
    if (!preference) {
      return Number(profile.visibilityScore ?? profile.profileScore ?? 50);
    }

    const filters = preference.filters as Record<string, unknown> | undefined;
    let score = 0;

    const personal = profile.personal as Record<string, unknown> | undefined;
    // const physical = profile.physical as Record<string, unknown> | undefined;
    const education = profile.education as Record<string, unknown> | undefined;

    // Age match
    const ageFilter = filters?.age as
      | { min?: number; max?: number }
      | undefined;
    const profileAge = profile.age as number | undefined;
    if (ageFilter && profileAge) {
      const inRange =
        profileAge >= (ageFilter.min ?? 18) &&
        profileAge <= (ageFilter.max ?? 60);
      score += inRange ? weights.age : weights.age * 0.3;
    } else {
      score += weights.age * 0.7;
    }

    // Height match
    const heightFilter = filters?.height as
      | { min?: number; max?: number }
      | undefined;
    const physical = profile.physical as Record<string, unknown> | undefined;
    const profileHeight = physical?.height as number | undefined;
    if (heightFilter && profileHeight) {
      const inRange =
        profileHeight >= (heightFilter.min ?? 0) &&
        profileHeight <= (heightFilter.max ?? 300);
      score += inRange ? weights.height : weights.height * 0.3;
    } else {
      score += weights.height * 0.7;
    }

    // Religion match
    const religionFilter = filters?.religion as string[] | undefined;
    if (religionFilter?.length && personal?.religion) {
      score += religionFilter.includes(personal.religion as string)
        ? weights.religion
        : 0;
    } else {
      score += weights.religion * 0.5;
    }

    // Caste match
    const casteFilter = filters?.caste as string[] | undefined;
    if (casteFilter?.length && personal?.caste) {
      score += casteFilter.includes(personal.caste as string)
        ? weights.caste
        : 0;
    } else {
      score += weights.caste * 0.5;
    }

    // Location match
    const cityFilter = filters?.city as string[] | undefined;
    if (cityFilter?.length && personal?.city) {
      score += cityFilter.includes(personal.city as string)
        ? weights.location
        : weights.location * 0.5;
    } else {
      score += weights.location * 0.5;
    }

    // Education match
    const qualFilter = filters?.qualification as string[] | undefined;
    if (qualFilter?.length && education?.qualification) {
      score += qualFilter.includes(education.qualification as string)
        ? weights.education
        : weights.education * 0.3;
    } else {
      score += weights.education * 0.6;
    }

    // Occupation match
    const occupationFilter = filters?.occupationType as string[] | undefined;
    if (occupationFilter?.length && education?.occupationType) {
      score += occupationFilter.includes(education.occupationType as string)
        ? weights.occupation
        : weights.occupation * 0.3;
    } else {
      score += weights.occupation * 0.6;
    }

    // Lifestyle match
    const smokingFilter = filters?.smoking as string[] | undefined;
    const drinkingFilter = filters?.drinking as string[] | undefined;
    const eatingFilter = filters?.eating as string[] | undefined;

    let lifestyleScore = 0;
    let lifestyleChecks = 0;

    if (smokingFilter?.length && personal?.smoking) {
      lifestyleScore += smokingFilter.includes(personal.smoking as string)
        ? 1
        : 0;
      lifestyleChecks++;
    }
    if (drinkingFilter?.length && personal?.drinking) {
      lifestyleScore += drinkingFilter.includes(personal.drinking as string)
        ? 1
        : 0;
      lifestyleChecks++;
    }
    if (eatingFilter?.length && personal?.eating) {
      lifestyleScore += eatingFilter.includes(personal.eating as string)
        ? 1
        : 0;
      lifestyleChecks++;
    }

    score +=
      lifestyleChecks > 0
        ? (lifestyleScore / lifestyleChecks) * weights.lifestyle
        : weights.lifestyle * 0.5;

    // Horoscope  manglik match bonus
    score += weights.horoscope * 0.5; // Neutral until kundli matching added

    return Math.round(Math.min(score, 100));
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
      filter['personal.caste'] = query.caste;
    }

    if (query.qualification) {
      filter['education.qualification'] = query.qualification;
    }

    if (query.occupationType) {
      filter['education.occupationType'] = query.occupationType;
    }

    if (query.verifiedOnly) {
      filter.isVerified = true;
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }
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
