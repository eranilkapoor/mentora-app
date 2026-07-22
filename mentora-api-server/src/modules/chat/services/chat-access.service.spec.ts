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
  findDirectRoomByUsers: jest.fn(),
  findUsersByIds: jest.fn(),
});

describe('ChatAccessService', () => {
  it('validates object IDs with default and explicit reasons', () => {
    const service = new ChatAccessService(
      createRepository() as unknown as ChatRepository,
    );
    expect(() =>
      service.ensureValidObjectId(new Types.ObjectId().toString()),
    ).not.toThrow();
    expect(() => service.ensureValidObjectId('invalid')).toThrow();
    expect(() =>
      service.ensureValidObjectId('invalid', 'custom_reason'),
    ).toThrow();
  });

  it('rejects invalid and missing rooms', async () => {
    const repo = createRepository();
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.getAuthorizedRoom('user', 'invalid'),
    ).rejects.toMatchObject({
      code: ErrorCode.INVALID_ID,
    });
    repo.findRoomById.mockResolvedValue(null);
    await expect(
      service.getAuthorizedRoom('user', new Types.ObjectId().toString()),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_NOT_FOUND });
  });

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

  it('rejects disallowed room status and malformed participants', async () => {
    const repo = createRepository();
    const userId = new Types.ObjectId();
    repo.findRoomById
      .mockResolvedValueOnce({
        participants: [userId, new Types.ObjectId()],
        status: ChatRoomStatus.BLOCKED,
      })
      .mockResolvedValueOnce({
        participants: [userId],
        status: ChatRoomStatus.ACTIVE,
      });
    const service = new ChatAccessService(repo as unknown as ChatRepository);
    const roomId = new Types.ObjectId().toString();

    await expect(
      service.getAuthorizedRoom(userId.toString(), roomId),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
    await expect(
      service.getAuthorizedRoom(userId.toString(), roomId),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });

  it('authorizes valid room members and enforces block relationships', async () => {
    const repo = createRepository();
    const userId = new Types.ObjectId();
    const otherId = new Types.ObjectId();
    const room = {
      participants: [userId, otherId],
      status: ChatRoomStatus.ACTIVE,
    };
    repo.findRoomById.mockResolvedValue(room);
    repo.findBlockedRelation.mockResolvedValueOnce(null);
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.getAuthorizedRoom(
        userId.toString(),
        new Types.ObjectId().toString(),
      ),
    ).resolves.toBe(room);

    repo.findBlockedRelation.mockResolvedValueOnce({
      _id: new Types.ObjectId(),
    });
    await expect(
      service.getAuthorizedRoom(
        userId.toString(),
        new Types.ObjectId().toString(),
      ),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });

  it('verifies that every requested user exists', async () => {
    const repo = createRepository();
    const service = new ChatAccessService(repo as unknown as ChatRepository);
    repo.findUsersByIds.mockResolvedValueOnce([{ id: 'one' }, { id: 'two' }]);
    await expect(
      service.ensureUsersExist(['one', 'two']),
    ).resolves.toBeUndefined();

    repo.findUsersByIds.mockResolvedValueOnce([{ id: 'one' }]);
    await expect(
      service.ensureUsersExist(['one', 'two']),
    ).rejects.toMatchObject({
      code: ErrorCode.USER_NOT_FOUND,
    });
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
    expect(repo.findDirectRoomByUsers).not.toHaveBeenCalled();
  });

  it('defaults missing communication settings to unrestricted', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue(null);
    repo.findCommunicationSettingsByUserIds.mockResolvedValue([]);
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).resolves.toBeUndefined();
  });

  it('requires an existing direct room for restricted recipients', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue(null);
    repo.findCommunicationSettingsByUserIds.mockResolvedValue([
      { whoCanMessage: CommunicationAccess.SCHEDULED_SESSIONS_ONLY },
    ]);
    repo.findDirectRoomByUsers.mockResolvedValue(null);
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).rejects.toMatchObject({ code: ErrorCode.CHAT_ACCESS_DENIED });
  });

  it('allows restricted messaging with an existing direct room', async () => {
    const repo = createRepository();
    repo.findBlockedRelation.mockResolvedValue(null);
    repo.findCommunicationSettingsByUserIds.mockResolvedValue([
      { whoCanMessage: CommunicationAccess.SCHEDULED_SESSIONS_ONLY },
    ]);
    repo.findDirectRoomByUsers.mockResolvedValue({ _id: 'room' });
    const service = new ChatAccessService(repo as unknown as ChatRepository);

    await expect(
      service.ensureMessagingAllowed('sender', 'recipient'),
    ).resolves.toBeUndefined();
  });
});
