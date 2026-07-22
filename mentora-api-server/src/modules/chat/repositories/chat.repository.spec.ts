/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Types } from 'mongoose';
import { ChatModerationStatus, ChatRoomStatus } from '../enums/chat.enums';
import { ChatRepository } from './chat.repository';

const userId = new Types.ObjectId().toString();
const targetId = new Types.ObjectId().toString();
const roomId = new Types.ObjectId().toString();
const messageId = new Types.ObjectId().toString();

const fluent = (initial: unknown = []) => {
  let value = initial;
  const query: Record<string, jest.Mock> & { setValue(value: unknown): void } =
    {
      setValue(next: unknown) {
        value = next;
      },
    } as never;
  for (const method of ['lean', 'sort', 'limit', 'select']) {
    query[method] = jest.fn(() => query);
  }
  query.exec = jest.fn(() => Promise.resolve(value));
  query.then = jest.fn((resolve) => Promise.resolve(value).then(resolve));
  return query;
};

describe('ChatRepository', () => {
  const messageQuery = fluent([]);
  const roomQuery = fluent([]);
  const userQuery = fluent([]);
  const profileQuery = fluent([]);
  const communicationQuery = fluent([]);
  const mediaQuery = fluent([]);
  const blockQuery = fluent([]);
  const messageModel = {
    create: jest.fn(),
    find: jest.fn(() => messageQuery),
    findById: jest.fn(() => messageQuery),
    updateOne: jest.fn(),
    findByIdAndUpdate: jest.fn(() => messageQuery),
    aggregate: jest.fn().mockResolvedValue([]),
    updateMany: jest.fn(),
  };
  const roomModel = {
    findOne: jest.fn(() => roomQuery),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(() => roomQuery),
  };
  const userModel = {
    findById: jest.fn(() => userQuery),
    find: jest.fn(() => userQuery),
  };
  const profileModel = { find: jest.fn(() => profileQuery) };
  const communicationModel = { find: jest.fn(() => communicationQuery) };
  const mediaModel = { find: jest.fn(() => mediaQuery) };
  const blockModel = {
    findOne: jest.fn(() => blockQuery),
    find: jest.fn(() => blockQuery),
  };
  const verificationModel = { distinct: jest.fn().mockResolvedValue([]) };
  let repository: ChatRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    for (const query of [
      messageQuery,
      roomQuery,
      userQuery,
      profileQuery,
      communicationQuery,
      mediaQuery,
      blockQuery,
    ])
      query.setValue([]);
    repository = new ChatRepository(
      messageModel as never,
      roomModel as never,
      userModel as never,
      profileModel as never,
      communicationModel as never,
      mediaModel as never,
      blockModel as never,
      verificationModel as never,
    );
  });

  it('loads users, profiles with verification, media, and communication settings', async () => {
    await repository.findUserById(userId);
    await repository.findUsersByIds([userId, targetId]);
    profileQuery.setValue([
      { userId: new Types.ObjectId(userId) },
      { userId: new Types.ObjectId(targetId) },
    ]);
    verificationModel.distinct.mockResolvedValue([new Types.ObjectId(userId)]);
    const profiles = await repository.findProfilesByUserIds([userId, targetId]);
    expect(
      profiles.map(({ verificationStatus }) => verificationStatus),
    ).toEqual(['approved', 'not_started']);
    await repository.findPrimaryImageMediaByUserIds([userId]);
    await repository.findCommunicationSettingsByUserIds([userId]);
  });

  it('covers direct-room creation, requests, lookup, listing, and save', async () => {
    await repository.findDirectRoomByUsers(userId, targetId);
    await repository.createDirectRoom({
      createdById: userId,
      participantIds: [targetId, userId],
    });
    await repository.createDirectRoom({
      createdById: userId,
      participantIds: [targetId, userId],
      startedFromMatchId: roomId,
      requestedById: userId,
      status: ChatRoomStatus.PENDING,
    });
    await repository.respondToChatRequest({
      roomId,
      responderId: targetId,
      status: ChatRoomStatus.ACTIVE,
    });
    await repository.setRoomRequestMessage(roomId, messageId);
    await repository.findRoomById(roomId);
    await repository.listRoomsForUser(userId, 20);
    const save = jest.fn().mockResolvedValue({});
    await repository.saveRoom({ save } as never);
    expect(save).toHaveBeenCalled();
    expect(repository.buildParticipantKey(targetId, userId)).toBe(
      [targetId, userId].sort().join(':'),
    );
  });

  it('covers message creation, pagination, deletion, and moderation', async () => {
    await repository.createMessage({
      roomId,
      senderId: userId,
      receiverId: targetId,
      content: 'Hello',
      type: 'text',
      attachments: [],
    });
    await repository.createMessage({
      roomId,
      senderId: userId,
      receiverId: targetId,
      content: 'Reply',
      type: 'text',
      attachments: [],
      replyToMessageId: messageId,
    });
    await repository.listMessages(roomId, 20);
    await repository.listMessages(roomId, 20, messageId);
    await repository.findMessageById(messageId);
    repository.softDeleteMessageForEveryone(messageId);
    await repository.listModerationQueue(ChatModerationStatus.FLAGGED, 10);
    await repository.reviewMessage(
      messageId,
      userId,
      ChatModerationStatus.APPROVED,
    );
    await repository.reviewMessage(
      messageId,
      userId,
      ChatModerationStatus.REJECTED,
      'unsafe',
    );
  });

  it('handles empty and populated message batches, unread counts, and receipts', async () => {
    await expect(repository.findMessagesByIds([])).resolves.toEqual([]);
    await repository.findMessagesByIds([messageId]);
    await expect(repository.countUnreadByRoomIds(userId, [])).resolves.toEqual(
      [],
    );
    await repository.countUnreadByRoomIds(userId, [roomId]);
    await repository.markRoomRead(userId, roomId);
    await repository.markRoomRead(userId, roomId, messageId);
    await repository.markRoomDelivered(userId, roomId);
    expect(messageModel.updateMany).toHaveBeenCalledTimes(3);
  });

  it('covers block relations and active-match lookup in both directions', async () => {
    await repository.findBlockedRelation(userId, targetId);
    blockQuery.setValue([
      {
        userId: new Types.ObjectId(userId),
        blockedUserId: new Types.ObjectId(targetId),
      },
      {
        userId: new Types.ObjectId(targetId),
        blockedUserId: new Types.ObjectId(userId),
      },
    ]);
    await expect(repository.getBlockedRelationUserIds(userId)).resolves.toEqual(
      [targetId],
    );
  });
});
