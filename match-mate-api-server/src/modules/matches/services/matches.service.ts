import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { MatchRepository } from '../repositories/match.repository';
import { InterestStatus } from '../enums/match.enums';
import { SettingsService } from '@/modules/settings/services/settings.service';
import { ErrorCode } from '@/common/constants';
import { FeatureKey } from '@/common/enums';
import {
  throwBadRequest,
  throwForbidden,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { MatchNotificationService } from './match-notification.service';
import { FeatureService } from '@/modules/subscriptions/services/feature.service';
import { MatchCompatibilityService } from './match-compatibility.service';
import { buildPaginationMeta } from '@/common/utils/pagination';

@Injectable()
export class MatchesService {
  constructor(
    private readonly repo: MatchRepository,
    private readonly settingsService: SettingsService,
    private readonly matchNotificationService: MatchNotificationService,
    private readonly featureService: FeatureService,
    private readonly compatibilityService: MatchCompatibilityService,
    private readonly configService: ConfigService,
  ) {}

  private toObjectIdString(value: Types.ObjectId | string): string {
    return value instanceof Types.ObjectId ? value.toString() : String(value);
  }

  private async withProfileSummaries<
    T extends {
      senderId: Types.ObjectId | string;
      receiverId: Types.ObjectId | string;
    },
  >(interests: T[], side: 'sender' | 'receiver') {
    const userIds = interests.map((interest) =>
      this.toObjectIdString(
        side === 'sender' ? interest.senderId : interest.receiverId,
      ),
    );
    const [profiles, media] = await Promise.all([
      this.repo.getProfilesByUserIds(userIds),
      this.repo.getActiveMediaByUserIds(userIds),
    ]);
    const profileByUser = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUser = new Map<string, unknown[]>();
    media.forEach((item) => {
      const userId = item.userId.toString();
      mediaByUser.set(userId, [...(mediaByUser.get(userId) ?? []), item]);
    });

    return interests.map((interest) => {
      const userId = this.toObjectIdString(
        side === 'sender' ? interest.senderId : interest.receiverId,
      );
      return {
        ...interest,
        profile: {
          ...profileByUser.get(userId),
          images: mediaByUser.get(userId) ?? [],
        },
      };
    });
  }

  private async withMatchProfiles(
    matches: Awaited<ReturnType<MatchRepository['getMatchesForUser']>>,
    viewerId: string,
  ) {
    const targetUserIds = matches.map((match) => {
      const leftUserId = match.userId.toString();
      const rightUserId = match.targetUserId.toString();
      return leftUserId === viewerId ? rightUserId : leftUserId;
    });

    const [profiles, media] = await Promise.all([
      this.repo.getProfilesByUserIds(targetUserIds),
      this.repo.getActiveMediaByUserIds(targetUserIds),
    ]);

    const profileByUser = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUser = new Map<string, unknown[]>();
    media.forEach((item) => {
      const userId = item.userId.toString();
      mediaByUser.set(userId, [...(mediaByUser.get(userId) ?? []), item]);
    });

    return matches.map((match) => {
      const leftUserId = match.userId.toString();
      const rightUserId = match.targetUserId.toString();
      const matchedUserId = leftUserId === viewerId ? rightUserId : leftUserId;
      const profile = profileByUser.get(matchedUserId);

      return {
        ...match,
        matchedUserId,
        profile: profile
          ? {
              ...profile,
              images: mediaByUser.get(matchedUserId) ?? [],
            }
          : undefined,
      };
    });
  }

  async sendInterest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throwBadRequest(ErrorCode.INTEREST_CANNOT_SEND_SELF);
    }

    await this.ensureUsersCanInteract(senderId, receiverId);

    // Prevent duplicate
    const existing = await this.repo.getExistingInterest(senderId, receiverId);
    if (existing) {
      throwBadRequest(ErrorCode.INTEREST_ALREADY_SENT);
    }

    await this.checkFeature(senderId, FeatureKey.SEND_INTEREST);
    await this.checkMonthlyInterestLimit(senderId);

    const interest = await this.repo.sendInterest(senderId, receiverId);
    await this.matchNotificationService.notifyInterestSent(
      senderId,
      receiverId,
      interest._id.toString(),
    );

    return interest;
  }

  async respondToInterest(
    userId: string,
    interestId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const interest = await this.repo.getInterestById(interestId);

    if (!interest) return throwNotFound(ErrorCode.INTEREST_NOT_FOUND);

    if (interest.receiverId.toString() !== userId) {
      throwForbidden(ErrorCode.ACCESS_DENIED);
    }

    await this.checkFeature(
      userId,
      action === 'ACCEPT'
        ? FeatureKey.ACCEPT_INTEREST
        : FeatureKey.REJECT_INTEREST,
    );

    if (interest.status !== InterestStatus.PENDING) {
      throwBadRequest(ErrorCode.INTEREST_ALREADY_RESPONDED, {
        status: interest.status,
      });
    }

    const status =
      action === 'ACCEPT' ? InterestStatus.ACCEPTED : InterestStatus.REJECTED;

    const updated = await this.repo.updateInterestStatus(interestId, status);

    const match =
      status === InterestStatus.ACCEPTED
        ? await this.repo.createMatch(
            interest.senderId.toString(),
            interest.receiverId.toString(),
            this.buildMatchExpiryDate(),
          )
        : null;

    await this.matchNotificationService.notifyInterestResponded(
      userId,
      interest,
      status,
      match?._id.toString(),
    );

    return { success: true, data: updated };
  }

  async getMyMatches(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    const [matches, total] = await Promise.all([
      this.repo.getMatchesForUser(userId, skip, limit, excludedUserIds),
      this.repo.countMatchesForUserExcluding(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withMatchProfiles(matches, userId),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getReceivedInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    const [interests, total] = await Promise.all([
      this.repo.getReceivedInterests(userId, skip, limit, excludedUserIds),
      this.repo.countReceivedInterests(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withProfileSummaries(interests, 'sender'),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getSentInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    const [interests, total] = await Promise.all([
      this.repo.getSentInterests(userId, skip, limit, excludedUserIds),
      this.repo.countSentInterests(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withProfileSummaries(interests, 'receiver'),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async shortlistProfile(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_shortlist_self',
      });
    }

    await this.ensureUsersCanInteract(userId, targetUserId);
    await this.checkFeature(userId, FeatureKey.SHORTLIST_PROFILES);

    const profile = await this.repo.getProfileByUserId(targetUserId);
    if (!profile) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

    const interaction = await this.repo.addShortlist(userId, targetUserId);
    return {
      success: true,
      data: {
        interaction,
        targetUserId,
        isShortlisted: true,
      },
    };
  }

  async removeShortlistedProfile(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_remove_self_shortlist',
      });
    }

    await this.repo.removeShortlist(userId, targetUserId);
    return {
      success: true,
      data: {
        targetUserId,
        isShortlisted: false,
      },
    };
  }

  async getShortlistedProfiles(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    const [profiles, total, shortlistedIds] = await Promise.all([
      this.repo.getShortlistedProfiles(userId, skip, limit, excludedUserIds),
      this.repo.countShortlisted(userId, excludedUserIds),
      this.repo.getShortlistedUserIds(userId),
    ]);
    const media = await this.repo.getActiveMediaByUserIds(
      profiles.map((profile) => profile.userId.toString()),
    );
    const mediaByUser = new Map<string, unknown[]>();
    media.forEach((item) => {
      const itemUserId = item.userId.toString();
      mediaByUser.set(itemUserId, [
        ...(mediaByUser.get(itemUserId) ?? []),
        item,
      ]);
    });
    const shortlistedSet = new Set(shortlistedIds);

    return {
      success: true,
      data: profiles.map((profile) => {
        const profileUserId = profile.userId.toString();
        return {
          ...profile,
          images: mediaByUser.get(profileUserId) ?? [],
          isShortlisted: shortlistedSet.has(profileUserId),
        };
      }),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getWhoViewedMe(userId: string, page = 1, limit = 20) {
    await this.checkFeature(userId, FeatureKey.WHO_VIEWED_ME);
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    const [views, total] = await Promise.all([
      this.repo.getProfileViewers(userId, skip, limit, excludedUserIds),
      this.repo.countProfileViewers(userId, excludedUserIds),
    ]);
    const viewerIds = views.map((view) => view.fromUserId.toString());
    const [profiles, media] = await Promise.all([
      this.repo.getProfilesByUserIds(viewerIds),
      this.repo.getActiveMediaByUserIds(viewerIds),
    ]);
    const profileByUser = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );
    const mediaByUser = new Map<string, unknown[]>();
    media.forEach((item) => {
      const itemUserId = item.userId.toString();
      mediaByUser.set(itemUserId, [
        ...(mediaByUser.get(itemUserId) ?? []),
        item,
      ]);
    });

    return {
      success: true,
      data: views
        .map((view) => {
          const viewerId = view.fromUserId.toString();
          const profile = profileByUser.get(viewerId);
          if (!profile) return null;

          return {
            viewerId,
            viewedAt: view.updatedAt ?? view.createdAt,
            profile: {
              ...profile,
              images: mediaByUser.get(viewerId) ?? [],
            },
          };
        })
        .filter(Boolean),
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getMatchStats(userId: string) {
    await this.checkFeature(userId, FeatureKey.PROFILE_ANALYTICS);
    const excludedUserIds =
      await this.settingsService.getUnavailableRelationUserIds(userId);
    return this.repo.getStats(userId, excludedUserIds);
  }

  async unmatch(userId: string, targetUserId: string, reason?: string) {
    if (userId === targetUserId) {
      throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_unmatch_self',
      });
    }

    const match = await this.repo.unmatchUsers(userId, targetUserId, reason);
    if (!match) return throwNotFound(ErrorCode.MATCH_NOT_FOUND);

    await this.matchNotificationService.notifyUnmatched(
      userId,
      targetUserId,
      match._id.toString(),
    );

    return { success: true, data: match };
  }

  async withdrawInterest(senderId: string, interestId: string) {
    const interest = await this.repo.getInterestById(interestId);
    if (!interest) return throwNotFound(ErrorCode.INTEREST_NOT_FOUND);
    if (interest.senderId.toString() !== senderId) {
      throwForbidden(ErrorCode.ACCESS_DENIED);
    }
    if (interest.status !== InterestStatus.PENDING) {
      throwBadRequest(ErrorCode.INTEREST_ALREADY_RESPONDED, {
        status: interest.status,
      });
    }
    return this.repo.deleteInterest(interestId);
  }

  private canViewVisibility(
    visibility: string | undefined,
    isMatched: boolean,
  ): boolean {
    if (!visibility || visibility === 'everyone' || visibility === 'public') {
      return true;
    }
    if (visibility === 'accepted_matches' || visibility === 'contacts_only') {
      return isMatched;
    }
    return false;
  }

  async getMatchProfile(viewerId: string, targetUserId: string) {
    if (viewerId === targetUserId) {
      return this.repo.getProfileByUserId(targetUserId);
    }

    const [
      profile,
      viewerProfile,
      privacy,
      viewerPrivacy,
      viewerPreference,
      targetPreference,
      match,
      media,
      sentInterest,
      receivedInterest,
    ] = await Promise.all([
      this.repo.getProfileByUserId(targetUserId),
      this.repo.getProfileByUserId(viewerId),
      this.settingsService.getPrivacy(targetUserId),
      this.settingsService.getPrivacy(viewerId),
      this.repo.getPreferenceByUserId(viewerId),
      this.repo.getPreferenceByUserId(targetUserId),
      this.repo.getMatchBetweenUsers(viewerId, targetUserId),
      this.repo.getActiveMediaByUserId(targetUserId),
      this.repo.getExistingInterest(viewerId, targetUserId),
      this.repo.getExistingInterest(targetUserId, viewerId),
    ]);

    if (!profile) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

    const isBlocked = await this.settingsService.isBlockedBetween(
      viewerId,
      targetUserId,
    );
    if (isBlocked) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

    const isHidden = await this.settingsService.isHiddenBetween(
      viewerId,
      targetUserId,
    );
    if (isHidden) return throwNotFound(ErrorCode.PROFILE_NOT_FOUND);

    if (!viewerPrivacy?.incognitoMode) {
      await this.checkFeature(viewerId, FeatureKey.DAILY_PROFILE_VIEWS);
      await this.repo.recordProfileView(viewerId, targetUserId);
    }

    const compatibility =
      viewerProfile &&
      this.compatibilityService.calculateMutualCompatibility(
        viewerProfile,
        viewerPreference,
        profile,
        targetPreference,
      );

    const isMatched = Boolean(match);
    const canViewPersonalDetails = this.canViewVisibility(
      privacy?.profileVisibility,
      isMatched,
    );
    const photoVisibilityAllowed = this.canViewVisibility(
      privacy?.showPhotosTo,
      isMatched,
    );
    const shouldBlurPhotos =
      photoVisibilityAllowed &&
      Boolean(privacy?.blurPhotosForUnmatched && !isMatched);
    const canViewPhotos = photoVisibilityAllowed && !shouldBlurPhotos;
    const canViewContact = await this.canViewContactDetails(
      viewerId,
      targetUserId,
      Boolean(isMatched && (privacy?.showPhone || privacy?.showEmail)),
    );
    const canViewLastSeen =
      Boolean(privacy?.showOnlineStatus) &&
      this.canViewVisibility(privacy?.showLastSeen, isMatched);
    const displayMedia = photoVisibilityAllowed
      ? media.map((item) => ({
          ...item,
          isBlurred: shouldBlurPhotos,
          blurReason: shouldBlurPhotos ? 'interest_required' : undefined,
        }))
      : [];

    return {
      ...profile,
      images: displayMedia,
      personal: {
        firstName: profile.personal?.firstName,
        lastName: canViewPersonalDetails
          ? profile.personal?.lastName
          : undefined,
        city: profile.personal?.city,
        state: profile.personal?.state,
        country: profile.personal?.country,
        isNri: profile.personal?.isNri,
        residencyCountry: canViewPersonalDetails
          ? profile.personal?.residencyCountry
          : undefined,
        visaStatus: canViewPersonalDetails
          ? profile.personal?.visaStatus
          : undefined,
        gender: profile.personal?.gender,
        maritalStatus: profile.personal?.maritalStatus,
        religion: canViewPersonalDetails
          ? profile.personal?.religion
          : undefined,
        religiousDetails: canViewPersonalDetails
          ? profile.personal?.religiousDetails
          : undefined,
        aboutMe: canViewPersonalDetails ? profile.personal?.aboutMe : undefined,
        motherTongue: canViewPersonalDetails
          ? profile.personal?.motherTongue
          : undefined,
        hobbies: canViewPersonalDetails ? profile.personal?.hobbies : [],
        languages: canViewPersonalDetails ? profile.personal?.languages : [],
      },
      physical: canViewPersonalDetails ? profile.physical : undefined,
      education: canViewPersonalDetails ? profile.education : undefined,
      family: canViewPersonalDetails ? profile.family : undefined,
      age:
        privacy?.showExactAge || canViewPersonalDetails
          ? profile.age
          : undefined,
      lastActiveAt: canViewLastSeen ? profile.lastActiveAt : undefined,
      privacy: {
        isMatched,
        canViewPersonalDetails,
        canViewPhotos,
        photosBlurred: shouldBlurPhotos,
        showPhone: Boolean(privacy?.showPhone && isMatched && canViewContact),
        showEmail: Boolean(privacy?.showEmail && isMatched && canViewContact),
        showIncome: Boolean(privacy?.showIncome && canViewPersonalDetails),
      },
      relationship: {
        isMatched,
        interestId:
          sentInterest?._id.toString() ?? receivedInterest?._id.toString(),
        interestStatus: sentInterest?.status ?? receivedInterest?.status,
        interestDirection: sentInterest
          ? 'sent'
          : receivedInterest
            ? 'received'
            : undefined,
      },
      ...(compatibility
        ? {
            compatibility,
            matchScore: compatibility.score,
          }
        : {}),
    };
  }

  private async ensureUsersCanInteract(userId: string, targetUserId: string) {
    const [isBlocked, isHidden] = await Promise.all([
      this.settingsService.isBlockedBetween(userId, targetUserId),
      this.settingsService.isHiddenBetween(userId, targetUserId),
    ]);

    if (isBlocked || isHidden) {
      throwNotFound(ErrorCode.PROFILE_NOT_FOUND);
    }
  }

  private checkFeature(userId: string, featureKey: FeatureKey) {
    return this.featureService.checkAccess(featureKey, {
      userId,
      timestamp: new Date(),
    });
  }

  private async checkMonthlyInterestLimit(userId: string) {
    const features = await this.featureService.getFeaturesForUser(userId);
    const monthlyLimit = features[FeatureKey.SEND_INTEREST_MONTHLY_LIMIT];

    if (typeof monthlyLimit !== 'number' || monthlyLimit === -1) return;

    await this.featureService.checkUsageLimit(
      userId,
      FeatureKey.SEND_INTEREST_MONTHLY_LIMIT,
      monthlyLimit,
      'month',
    );
  }

  private async canViewContactDetails(
    viewerId: string,
    targetUserId: string,
    privacyAllowsContact: boolean,
  ): Promise<boolean> {
    if (!privacyAllowsContact) return false;

    const features = await this.featureService.getFeaturesForUser(viewerId);
    const contactLimit = features[FeatureKey.CONTACT_VIEW_LIMIT];

    if (contactLimit === -1) return true;
    if (typeof contactLimit !== 'number' || contactLimit <= 0) return false;

    await this.featureService.checkUniqueUsageLimit(
      viewerId,
      FeatureKey.CONTACT_VIEW_LIMIT,
      contactLimit,
      targetUserId,
      'month',
    );

    return true;
  }

  expireOverdueMatches(limit?: number) {
    return this.repo.expireMatches(new Date(), limit);
  }

  private buildMatchExpiryDate(): Date | undefined {
    const enabled = this.configService.get<boolean>('matches.expiryEnabled');
    if (!enabled) {
      return undefined;
    }

    const expiryDays = this.configService.get<number>('matches.expiryDays', 90);
    if (!Number.isFinite(expiryDays) || expiryDays <= 0) {
      return undefined;
    }

    return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  }
}
