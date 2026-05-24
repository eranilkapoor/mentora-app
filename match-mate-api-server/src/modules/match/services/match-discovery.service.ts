import { Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { FilterQuery } from 'mongoose';
import { ProfileDocument } from 'src/modules/profile/schemas/profile/profile.schema';
import { ProfileStatus, Gender } from 'src/common/enums';
import { MatchDiscoveryRepository } from '../repositories/match-discovery.repository';
import { MatchQueryDto, NearbyQueryDto } from '../dto/match-query.dto';

// ─── Scoring weights default (overridden by user preference weights) ──────────

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
  constructor(private readonly discoveryRepo: MatchDiscoveryRepository) {}

  // ─── Recommended matches ───────────────────────────────────────────────────

  async getRecommendedMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(myProfile.gender as Gender);

    const filter = this.buildPreferenceFilter(
      userId,
      oppositeGender,
      interactedIds,
      preference,
      myProfile,
    );

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { profileScore: -1, lastActiveAt: -1 },
    );

    const weights =
      (preference?.weights as Record<string, number>) ?? DEFAULT_WEIGHTS;

    const scored = profiles
      .map((p) => ({
        ...p,
        matchScore: this.calculateMatchScore(p, preference, weights),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    return this.paginate(scored, total, skip, limit, query.page ?? 1);
  }

  // ─── New matches — profiles created in last 30 days ───────────────────────

  async getNewMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(myProfile.gender as Gender);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filter = {
      ...this.buildPreferenceFilter(
        userId,
        oppositeGender,
        interactedIds,
        preference,
        myProfile,
      ),
      createdAt: { $gte: thirtyDaysAgo },
    };

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { createdAt: -1 },
    );

    return this.paginate(profiles, total, skip, limit, query.page ?? 1);
  }

  // ─── Nearby matches — geo-based ───────────────────────────────────────────

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
      throw new BadRequestException(
        'Your profile does not have location data. Please update your location.',
      );
    }

    const oppositeGender = this.getOppositeGender(myProfile.gender as Gender);
    const radiusMeters = (query.radiusKm ?? 100) * 1000;

    const baseFilter = this.buildBaseFilter(
      userId,
      oppositeGender,
      interactedIds,
    );

    const { profiles, total } = await this.discoveryRepo.findNearbyProfiles(
      baseFilter,
      location.coordinates,
      radiusMeters,
      skip,
      limit,
    );

    return this.paginate(profiles, total, skip, limit, query.page ?? 1);
  }

  // ─── Build base filter (gender + exclusions + active status) ─────────────

  async getOnlineMatches(userId: string, query: MatchQueryDto) {
    const { myProfile, preference, interactedIds, skip, limit } =
      await this.resolveContext(userId, query);

    const oppositeGender = this.getOppositeGender(myProfile.gender as Gender);
    const onlineSince = new Date(Date.now() - 15 * 60 * 1000);

    const filter = {
      ...this.buildPreferenceFilter(
        userId,
        oppositeGender,
        interactedIds,
        preference,
        myProfile,
      ),
      lastActiveAt: { $gte: onlineSince },
    };

    const { profiles, total } = await this.discoveryRepo.findProfiles(
      filter,
      skip,
      limit,
      { lastActiveAt: -1 },
    );

    return this.paginate(profiles, total, skip, limit, query.page ?? 1);
  }

  private buildBaseFilter(
    userId: string,
    oppositeGender: Gender,
    interactedIds: Types.ObjectId[],
  ): FilterQuery<ProfileDocument> {
    return {
      userId: {
        $ne: new Types.ObjectId(userId),
        $nin: interactedIds,
      },
      gender: oppositeGender,
      status: ProfileStatus.ACTIVE,
      deletedAt: { $exists: false },
      isVerified: true,
    };
  }

  // ─── Build full preference-based filter ───────────────────────────────────

  private buildPreferenceFilter(
    userId: string,
    oppositeGender: Gender,
    interactedIds: Types.ObjectId[],
    preference: Record<string, unknown> | null,
    myProfile: Record<string, unknown>,
  ): FilterQuery<ProfileDocument> {
    const filter = this.buildBaseFilter(userId, oppositeGender, interactedIds);
    const filters = preference?.filters as Record<string, unknown> | undefined;
    const settings = preference?.settings as
      | Record<string, unknown>
      | undefined;

    // ── Age range ────────────────────────────────────────────────────────────

    const ageFilter = filters?.age as
      | { min?: number; max?: number }
      | undefined;

    const myAge = (myProfile.age as number | undefined) ?? 25;

    filter.age = {
      $gte: ageFilter?.min ?? Math.max(18, myAge - 5),
      $lte: ageFilter?.max ?? myAge + 5,
    };

    // ── Height range (cm) ────────────────────────────────────────────────────

    const heightFilter = filters?.height as
      | { min?: number; max?: number }
      | undefined;

    if (heightFilter?.min || heightFilter?.max) {
      filter.height = {
        ...(heightFilter.min ? { $gte: heightFilter.min } : {}),
        ...(heightFilter.max ? { $lte: heightFilter.max } : {}),
      };
    }

    // ── Religion ─────────────────────────────────────────────────────────────

    const religionFilter = filters?.religion as string[] | undefined;
    if (religionFilter?.length) {
      filter.religion = { $in: religionFilter };
    } else if (myProfile.religion) {
      filter.religion = myProfile.religion as string;
    }

    // ── Caste ────────────────────────────────────────────────────────────────

    const casteFilter = filters?.caste as string[] | undefined;
    if (casteFilter?.length) {
      filter.caste = { $in: casteFilter };
    }

    // ── Marital status ───────────────────────────────────────────────────────

    const maritalFilter = filters?.maritalStatus as string[] | undefined;
    if (maritalFilter?.length) {
      filter['personal.maritalStatus'] = { $in: maritalFilter };
    }

    // ── Location ─────────────────────────────────────────────────────────────

    const cityFilter = filters?.city as string[] | undefined;
    const stateFilter = filters?.state as string[] | undefined;
    const countryFilter = filters?.country as string[] | undefined;

    if (cityFilter?.length) {
      filter.city = { $in: cityFilter };
    } else if (stateFilter?.length) {
      filter['personal.state'] = { $in: stateFilter };
    } else if (countryFilter?.length) {
      filter['personal.country'] = { $in: countryFilter };
    }

    // ── Education / qualification ─────────────────────────────────────────────

    const qualFilter = filters?.qualification as string[] | undefined;
    if (qualFilter?.length) {
      filter['education.qualification'] = { $in: qualFilter };
    }

    // ── Occupation type ───────────────────────────────────────────────────────

    const occupationTypeFilter = filters?.occupationType as
      | string[]
      | undefined;
    if (occupationTypeFilter?.length) {
      filter['education.occupationType'] = { $in: occupationTypeFilter };
    }

    // ── Body type ─────────────────────────────────────────────────────────────

    const bodyTypeFilter = filters?.bodyType as string[] | undefined;
    if (bodyTypeFilter?.length) {
      filter['physical.bodyType'] = { $in: bodyTypeFilter };
    }

    // ── Lifestyle filters ─────────────────────────────────────────────────────

    const smokingFilter = filters?.smoking as string[] | undefined;
    if (smokingFilter?.length) {
      filter['personal.smoking'] = { $in: smokingFilter };
    }

    const drinkingFilter = filters?.drinking as string[] | undefined;
    if (drinkingFilter?.length) {
      filter['personal.drinking'] = { $in: drinkingFilter };
    }

    const dietFilter = filters?.diet as string[] | undefined;
    if (dietFilter?.length) {
      filter['personal.diet'] = { $in: dietFilter };
    }

    // ── Strict mode — only verified profiles ──────────────────────────────────

    if (settings?.isStrict) {
      filter.isVerified = true;
    }

    // ── Minimum match score ───────────────────────────────────────────────────

    const minScore = settings?.minimumMatchScore as number | undefined;
    if (minScore) {
      filter.profileScore = { $gte: minScore };
    }

    return filter;
  }

  // ─── Score a profile against user preferences ─────────────────────────────

  private calculateMatchScore(
    profile: Record<string, unknown>,
    preference: Record<string, unknown> | null,
    weights: Record<string, number>,
  ): number {
    if (!preference) return Number(profile.profileScore ?? 50);

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
    const profileHeight = profile.height as number | undefined;
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
    if (religionFilter?.length && profile.religion) {
      score += religionFilter.includes(profile.religion as string)
        ? weights.religion
        : 0;
    } else {
      score += weights.religion * 0.5;
    }

    // Caste match
    const casteFilter = filters?.caste as string[] | undefined;
    if (casteFilter?.length && profile.caste) {
      score += casteFilter.includes(profile.caste as string)
        ? weights.caste
        : 0;
    } else {
      score += weights.caste * 0.5;
    }

    // Location match
    const cityFilter = filters?.city as string[] | undefined;
    if (cityFilter?.length && profile.city) {
      score += cityFilter.includes(profile.city as string)
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
    const dietFilter = filters?.diet as string[] | undefined;

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
    if (dietFilter?.length && personal?.diet) {
      lifestyleScore += dietFilter.includes(personal.diet as string) ? 1 : 0;
      lifestyleChecks++;
    }

    score +=
      lifestyleChecks > 0
        ? (lifestyleScore / lifestyleChecks) * weights.lifestyle
        : weights.lifestyle * 0.5;

    // Horoscope — manglik match bonus
    score += weights.horoscope * 0.5; // Neutral until kundli matching added

    return Math.round(Math.min(score, 100));
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private getOppositeGender(gender: Gender): Gender {
    if (gender === Gender.MALE) return Gender.FEMALE;
    if (gender === Gender.FEMALE) return Gender.MALE;

    return gender;
  }

  private async resolveContext(userId: string, query: MatchQueryDto) {
    const [myProfile, preference, interactedIds] = await Promise.all([
      this.discoveryRepo.getProfile(userId),
      this.discoveryRepo.getPreference(userId),
      this.discoveryRepo.getInteractedUserIds(userId),
    ]);

    if (!myProfile) {
      throw new BadRequestException(
        'Your profile is not complete. Please complete onboarding first.',
      );
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    return {
      myProfile: myProfile as unknown as Record<string, unknown>,
      preference: preference as unknown as Record<string, unknown> | null,
      interactedIds,
      page,
      limit,
      skip,
    };
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
