import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { LeanProfile, MatchRepository } from '../repositories/match.repository';
import { InterestStatus } from '../schemas/interest.schema';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly repo: MatchRepository,
    private readonly notificationService: NotificationService,
    private readonly settingsService: SettingsService,
  ) {}

  private getDisplayName(profile?: LeanProfile | null): string {
    const name = [profile?.personal?.firstName, profile?.personal?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name || 'A MatchMate member';
  }

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
      throw new BadRequestException('Cannot send interest to yourself');
    }

    // Prevent duplicate
    const existing = await this.repo.getExistingInterest(senderId, receiverId);
    if (existing) {
      throw new BadRequestException('Interest already sent to this profile');
    }

    const interest = await this.repo.sendInterest(senderId, receiverId);
    const [senderProfile, senderMedia] = await Promise.all([
      this.repo.getProfileByUserId(senderId),
      this.repo.getActiveMediaByUserId(senderId),
    ]);
    const senderName = this.getDisplayName(senderProfile);

    await this.notificationService.notify({
      userId: receiverId,
      title: 'New interest received',
      message: `${senderName} sent you an interest request.`,
      type: 'match',
      category: 'interest_received',
      actorId: senderId,
      actorName: senderName,
      actorImage: senderMedia[0]?.url,
      referenceId: interest._id.toString(),
      priority: 'high',
      channels: ['in_app', 'push', 'email'],
      action: {
        screen: 'Matches',
        params: { tab: 'requests', interestId: interest._id.toString() },
      },
      metadata: {
        interestId: interest._id.toString(),
        senderId,
      },
    });

    return interest;
  }

  async respondToInterest(
    userId: string,
    interestId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    const interest = await this.repo.getInterestById(interestId);

    if (!interest) throw new NotFoundException('Interest not found');

    if (interest.receiverId.toString() !== userId) {
      throw new BadRequestException('Unauthorized action');
    }

    if (interest.status !== InterestStatus.PENDING) {
      throw new BadRequestException(`Interest is already ${interest.status}`);
    }

    const status =
      action === 'ACCEPT' ? InterestStatus.ACCEPTED : InterestStatus.REJECTED;

    const updated = await this.repo.updateInterestStatus(interestId, status);

    const match =
      status === InterestStatus.ACCEPTED
        ? await this.repo.createMatch(
            interest.senderId.toString(),
            interest.receiverId.toString(),
          )
        : null;

    const [senderProfile, senderMedia, receiverProfile, receiverMedia] =
      await Promise.all([
        this.repo.getProfileByUserId(interest.senderId.toString()),
        this.repo.getActiveMediaByUserId(interest.senderId.toString()),
        this.repo.getProfileByUserId(userId),
        this.repo.getActiveMediaByUserId(userId),
      ]);

    const senderName = this.getDisplayName(senderProfile);
    const receiverName = this.getDisplayName(receiverProfile);

    if (status === InterestStatus.ACCEPTED) {
      await this.notificationService.notify({
        userId,
        title: "It's a match",
        message: `You and ${senderName} can now start chatting.`,
        type: 'match',
        category: 'match_found',
        actorId: interest.senderId.toString(),
        actorName: senderName,
        actorImage: senderMedia[0]?.url,
        referenceId: match?._id.toString(),
        priority: 'high',
        channels: ['in_app', 'push'],
        action: {
          screen: 'MatchDetails',
          params: { userId: interest.senderId.toString() },
        },
        metadata: {
          interestId,
          matchId: match?._id.toString(),
          status,
        },
      });
    }

    await this.notificationService.notify({
      userId: interest.senderId.toString(),
      title:
        status === InterestStatus.ACCEPTED
          ? 'Interest accepted'
          : 'Interest updated',
      message:
        status === InterestStatus.ACCEPTED
          ? `${receiverName} accepted your interest. You can start chatting now.`
          : `${receiverName} responded to your interest.`,
      type: status === InterestStatus.ACCEPTED ? 'success' : 'info',
      category:
        status === InterestStatus.ACCEPTED ? 'interest_accepted' : 'system',
      actorId: userId,
      actorName: receiverName,
      actorImage: receiverMedia[0]?.url,
      referenceId: interestId,
      priority: status === InterestStatus.ACCEPTED ? 'high' : 'normal',
      channels: ['in_app', 'push'],
      action: {
        screen: 'MatchDetails',
        params: { userId },
      },
      metadata: { interestId, matchId: match?._id.toString(), status },
    });

    return { success: true, data: updated };
  }

  async getMyMatches(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getBlockedRelationUserIds(userId);
    const [matches, total] = await Promise.all([
      this.repo.getMatchesForUser(userId, skip, limit, excludedUserIds),
      this.repo.countMatchesForUserExcluding(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withMatchProfiles(matches, userId),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReceivedInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getBlockedRelationUserIds(userId);
    const [interests, total] = await Promise.all([
      this.repo.getReceivedInterests(userId, skip, limit, excludedUserIds),
      this.repo.countReceivedInterests(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withProfileSummaries(interests, 'sender'),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSentInterests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const excludedUserIds =
      await this.settingsService.getBlockedRelationUserIds(userId);
    const [interests, total] = await Promise.all([
      this.repo.getSentInterests(userId, skip, limit, excludedUserIds),
      this.repo.countSentInterests(userId, excludedUserIds),
    ]);
    return {
      success: true,
      data: await this.withProfileSummaries(interests, 'receiver'),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async shortlistProfile(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot shortlist your own profile');
    }

    const profile = await this.repo.getProfileByUserId(targetUserId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

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
      throw new BadRequestException('Cannot remove your own profile');
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
      await this.settingsService.getBlockedRelationUserIds(userId);
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
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async withdrawInterest(senderId: string, interestId: string) {
    const interest = await this.repo.getInterestById(interestId);
    if (!interest) throw new NotFoundException('Interest not found');
    if (interest.senderId.toString() !== senderId) {
      throw new BadRequestException('Unauthorized');
    }
    if (interest.status !== InterestStatus.PENDING) {
      throw new BadRequestException('Only pending interests can be withdrawn');
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

    const [profile, privacy, match, media, sentInterest, receivedInterest] =
      await Promise.all([
        this.repo.getProfileByUserId(targetUserId),
        this.settingsService.getPrivacy(targetUserId),
        this.repo.getMatchBetweenUsers(viewerId, targetUserId),
        this.repo.getActiveMediaByUserId(targetUserId),
        this.repo.getExistingInterest(viewerId, targetUserId),
        this.repo.getExistingInterest(targetUserId, viewerId),
      ]);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const isBlocked = await this.settingsService.isBlockedBetween(
      viewerId,
      targetUserId,
    );
    if (isBlocked) {
      throw new NotFoundException('Profile not found');
    }

    const isMatched = Boolean(match);
    const canViewPersonalDetails = this.canViewVisibility(
      privacy?.profileVisibility,
      isMatched,
    );
    const canViewPhotos =
      this.canViewVisibility(privacy?.showPhotosTo, isMatched) &&
      !(privacy?.blurPhotosForUnmatched && !isMatched);

    return {
      ...profile,
      images: canViewPhotos ? media : [],
      personal: {
        firstName: profile.personal?.firstName,
        lastName: canViewPersonalDetails
          ? profile.personal?.lastName
          : undefined,
        city: profile.personal?.city,
        state: profile.personal?.state,
        country: profile.personal?.country,
        gender: profile.personal?.gender,
        maritalStatus: profile.personal?.maritalStatus,
        religion: canViewPersonalDetails
          ? profile.personal?.religion
          : undefined,
        caste: canViewPersonalDetails ? profile.personal?.caste : undefined,
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
      lastActiveAt: privacy?.showOnlineStatus
        ? profile.lastActiveAt
        : undefined,
      privacy: {
        isMatched,
        canViewPersonalDetails,
        canViewPhotos,
        showPhone: Boolean(privacy?.showPhone && isMatched),
        showEmail: Boolean(privacy?.showEmail && isMatched),
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
    };
  }
}
