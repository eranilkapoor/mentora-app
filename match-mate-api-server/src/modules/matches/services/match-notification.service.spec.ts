/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import type { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { InterestStatus } from '../enums/match.enums';
import type { MatchRepository } from '../repositories/match.repository';
import { MatchNotificationService } from './match-notification.service';

describe('MatchNotificationService', () => {
  const repo = {
    getProfileByUserId: jest.fn(),
    getActiveMediaByUserId: jest.fn(),
  };
  const notificationsService = { notify: jest.fn() };
  let service: MatchNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    repo.getProfileByUserId.mockResolvedValue({
      personal: { firstName: 'Asha', lastName: 'Sharma' },
    });
    repo.getActiveMediaByUserId.mockResolvedValue([
      { url: 'https://cdn.example/photo.jpg' },
    ]);
    notificationsService.notify.mockResolvedValue(undefined);
    service = new MatchNotificationService(
      repo as unknown as MatchRepository,
      notificationsService as unknown as NotificationsService,
    );
  });

  it('notifies the receiver when an interest is sent', async () => {
    await service.notifyInterestSent('sender', 'receiver', 'interest');

    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'receiver',
        actorName: 'Asha Sharma',
        actorImage: 'https://cdn.example/photo.jpg',
        referenceId: 'interest',
        category: 'interest_received',
      }),
    );
  });

  it('sends match and acceptance notifications for an accepted interest', async () => {
    repo.getProfileByUserId
      .mockResolvedValueOnce({ personal: { firstName: 'Ravi' } })
      .mockResolvedValueOnce({ personal: { lastName: 'Patel' } });
    repo.getActiveMediaByUserId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ url: 'receiver.jpg' }]);
    const interest = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(),
      receiverId: new Types.ObjectId(),
      status: InterestStatus.PENDING,
    };

    await service.notifyInterestResponded(
      'responder',
      interest,
      InterestStatus.ACCEPTED,
      'match-id',
    );

    expect(notificationsService.notify).toHaveBeenCalledTimes(2);
    expect(notificationsService.notify).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        userId: 'responder',
        title: "It's a match",
        actorName: 'Ravi',
        actorImage: undefined,
        referenceId: 'match-id',
      }),
    );
    expect(notificationsService.notify).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        userId: interest.senderId.toString(),
        title: 'Interest accepted',
        message: 'Patel accepted your interest. You can start chatting now.',
        type: 'success',
        category: 'interest_accepted',
        priority: 'high',
      }),
    );
  });

  it('sends one generic response notification for a rejected interest', async () => {
    repo.getProfileByUserId.mockResolvedValue(null);
    repo.getActiveMediaByUserId.mockResolvedValue([]);
    const interest = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(),
      receiverId: new Types.ObjectId(),
      status: InterestStatus.PENDING,
    };

    await service.notifyInterestResponded(
      'responder',
      interest,
      InterestStatus.REJECTED,
    );

    expect(notificationsService.notify).toHaveBeenCalledTimes(1);
    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Interest updated',
        message: 'A Match Mate member responded to your interest.',
        type: 'info',
        category: 'system',
        priority: 'normal',
        actorImage: undefined,
      }),
    );
  });

  it('uses the interest ID to deduplicate an accepted response without a match ID', async () => {
    const interest = {
      _id: new Types.ObjectId(),
      senderId: new Types.ObjectId(),
      receiverId: new Types.ObjectId(),
      status: InterestStatus.PENDING,
    };

    await service.notifyInterestResponded(
      'responder',
      interest,
      InterestStatus.ACCEPTED,
    );

    expect(notificationsService.notify).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        dedupeKey: `match-found:${interest._id.toString()}:responder`,
      }),
    );
  });

  it('notifies a user when the other member ends a match', async () => {
    await service.notifyUnmatched('actor', 'target', 'match-id');

    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'target',
        message: 'Asha Sharma has ended this match.',
        dedupeKey: 'match-unmatched:match-id',
      }),
    );
  });

  it('skips empty daily digests and sends eligible digests', async () => {
    await service.notifyDailyMatches('user', 0);
    expect(notificationsService.notify).not.toHaveBeenCalled();

    await service.notifyDailyMatches('user', 3, 'profile-id');
    expect(notificationsService.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user',
        message: 'We found 3 recommended profiles for you today.',
        referenceId: 'profile-id',
        metadata: expect.objectContaining({
          count: 3,
          topProfileId: 'profile-id',
        }),
      }),
    );
  });
});
