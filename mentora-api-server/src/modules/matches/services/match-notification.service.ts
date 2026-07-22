import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { LeanProfile, MatchRepository } from '../repositories/match.repository';
import { InterestStatus } from '../enums/match.enums';

type InterestLike = {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: InterestStatus;
};

@Injectable()
export class MatchNotificationService {
  constructor(
    private readonly repo: MatchRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async notifyInterestSent(
    senderId: string,
    receiverId: string,
    interestId: string,
  ): Promise<void> {
    const [senderProfile, senderMedia] = await Promise.all([
      this.repo.getProfileByUserId(senderId),
      this.repo.getActiveMediaByUserId(senderId),
    ]);
    const senderName = this.getDisplayName(senderProfile);

    await this.notificationsService.notify({
      userId: receiverId,
      title: 'New interest received',
      message: `${senderName} sent you an interest request.`,
      type: 'match',
      category: 'interest_received',
      actorId: senderId,
      actorName: senderName,
      actorImage: senderMedia[0]?.url,
      referenceId: interestId,
      dedupeKey: `interest-sent:${interestId}`,
      priority: 'high',
      channels: ['in_app', 'push', 'email'],
      action: {
        screen: 'Matches',
        params: { tab: 'requests', interestId },
      },
      metadata: {
        interestId,
        senderId,
      },
    });
  }

  async notifyInterestResponded(
    responderId: string,
    interest: InterestLike,
    status: InterestStatus,
    matchId?: string,
  ): Promise<void> {
    const senderId = interest.senderId.toString();
    const [senderProfile, senderMedia, receiverProfile, receiverMedia] =
      await Promise.all([
        this.repo.getProfileByUserId(senderId),
        this.repo.getActiveMediaByUserId(senderId),
        this.repo.getProfileByUserId(responderId),
        this.repo.getActiveMediaByUserId(responderId),
      ]);

    const senderName = this.getDisplayName(senderProfile);
    const receiverName = this.getDisplayName(receiverProfile);
    const interestId = interest._id.toString();

    if (status === InterestStatus.ACCEPTED) {
      await this.notificationsService.notify({
        userId: responderId,
        title: "It's a match",
        message: `You and ${senderName} can now start chatting.`,
        type: 'match',
        category: 'match_found',
        actorId: senderId,
        actorName: senderName,
        actorImage: senderMedia[0]?.url,
        referenceId: matchId,
        dedupeKey: `match-found:${matchId ?? interestId}:${responderId}`,
        priority: 'high',
        channels: ['in_app', 'push'],
        action: {
          screen: 'MatchDetails',
          params: { userId: senderId },
        },
        metadata: {
          interestId,
          matchId,
          status,
        },
      });
    }

    await this.notificationsService.notify({
      userId: senderId,
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
      actorId: responderId,
      actorName: receiverName,
      actorImage: receiverMedia[0]?.url,
      referenceId: interestId,
      dedupeKey: `interest-response:${interestId}:${status}`,
      priority: status === InterestStatus.ACCEPTED ? 'high' : 'normal',
      channels: ['in_app', 'push'],
      action: {
        screen: 'MatchDetails',
        params: { userId: responderId },
      },
      metadata: { interestId, matchId, status },
    });
  }

  async notifyUnmatched(
    actorId: string,
    targetUserId: string,
    matchId: string,
  ): Promise<void> {
    const actorProfile = await this.repo.getProfileByUserId(actorId);
    const actorName = this.getDisplayName(actorProfile);

    await this.notificationsService.notify({
      userId: targetUserId,
      title: 'Match updated',
      message: `${actorName} has ended this match.`,
      type: 'info',
      category: 'system',
      actorId,
      actorName,
      referenceId: matchId,
      dedupeKey: `match-unmatched:${matchId}`,
      priority: 'normal',
      channels: ['in_app'],
      action: {
        screen: 'Matches',
        params: { tab: 'matched' },
      },
      metadata: {
        matchId,
        actorId,
        status: 'unmatched',
      },
    });
  }

  async notifyDailyMatches(
    userId: string,
    count: number,
    topProfileId?: string,
  ): Promise<void> {
    if (count <= 0) return;

    await this.notificationsService.notify({
      userId,
      title: 'Your daily matches are ready',
      message: `We found ${count} recommended profiles for you today.`,
      type: 'match',
      category: 'match_found',
      referenceId: topProfileId,
      dedupeKey: `daily-matches:${userId}:${new Date().toISOString().slice(0, 10)}`,
      priority: 'normal',
      channels: ['in_app', 'push'],
      action: {
        screen: 'Matches',
        params: { tab: 'recommended' },
      },
      metadata: {
        count,
        topProfileId,
        source: 'daily_match_digest',
      },
    });
  }

  private getDisplayName(profile?: LeanProfile | null): string {
    const name = [profile?.personal?.firstName, profile?.personal?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    return name || 'A Mentora member';
  }
}
