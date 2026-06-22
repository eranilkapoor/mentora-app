import { Types } from 'mongoose';
import { ErrorCode } from '@/common/constants';
import { CommunicationAccess } from '@/modules/settings/enums/settings-preferences.enums';
import { ChatRoomStatus } from '../enums/chat.enums';
import type { ChatRepository } from '../repositories/chat.repository';
import { ChatAccessService } from './chat-access.service';

const createRepository = () => ({
  findRoomById: jest.fn(),
  findBlockedRelation: jest.fn(),
  findCommunicationSettingsByUserIds: jest.fn(),
  findActiveMatchBetween: jest.fn(),
  findDirectRoomByUsers: jest.fn(),
  findUsersByIds: jest.fn(),
});

describe('ChatAccessService', () => {
  it('rejects users who are not room participants', async () => {
    const repo = createRepository();
    repo.findRoomById.mockResolvedValue({
      participants: [new Types.ObjectId(), new Types.ObjectId()],
      status: ChatRoomStatus.ACTIVE,
    });
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.getAuthorizedRoom(
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });

  it('rejects messaging when either user has blocked the other', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue({ _id: new Types.ObjectId() });
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });

  it('allows unrestricted recipients without requiring a match', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue(null);
    repo.findCommunicationSettingsByUserIds.mockResolvedValue([
      { whoCanMessage: CommunicationAccess.ALL },
    ]);
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).resolves.toBeUndefined();
    expect(repo.findActiveMatchBetween).not.toHaveBeenCalled();
  });

  it('requires an existing match or room for restricted recipients', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue(null);
    repo.findCommunicationSettingsByUserIds.mockResolvedValue([
      { whoCanMessage: CommunicationAccess.MATCHES_ONLY },
    ]);
    repo.findActiveMatchBetween.mockResolvedValue(null);
    repo.findDirectRoomByUsers.mockResolvedValue(null);
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });
});
