import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from './schemas/chat-message.schema';
import { ChatRoom, ChatRoomDocument } from './schemas/chat-room.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from '../profile/schemas/profile/profile.schema';
import {
  PrivacySetting,
  PrivacySettingDocument,
} from '../profile/schemas/settings/privacy.schema';
import { Match, MatchDocument } from '../match/schemas/match.schema';
import {
  UserBlock,
  UserBlockDocument,
} from '../profile/schemas/settings/user-block.schema';
import { ChatMessageStatus, ChatRoomType } from './enums/chat.enums';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,

    @InjectModel(ChatRoom.name)
    private readonly roomModel: Model<ChatRoomDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,

    @InjectModel(PrivacySetting.name)
    private readonly privacyModel: Model<PrivacySettingDocument>,

    @InjectModel(Match.name)
    private readonly matchModel: Model<MatchDocument>,

    @InjectModel(UserBlock.name)
    private readonly userBlockModel: Model<UserBlockDocument>,
  ) {}

  async findUserById(userId: string) {
    return this.userModel.findById(userId).lean();
  }

  async findUsersByIds(userIds: string[]) {
    return this.userModel
      .find({ _id: { $in: this.toObjectIds(userIds) } })
      .lean();
  }

  async findProfilesByUserIds(userIds: string[]) {
    return this.profileModel
      .find({ userId: { $in: this.toObjectIds(userIds) } })
      .lean();
  }

  async findPrivacySettingsByUserIds(userIds: string[]) {
    return this.privacyModel
      .find({ userId: { $in: this.toObjectIds(userIds) } })
      .lean();
  }

  async findDirectRoomByUsers(userA: string, userB: string) {
    return this.roomModel.findOne({
      participantHash: this.buildParticipantKey(userA, userB),
    });
  }

  async createDirectRoom(params: {
    createdById: string;
    participantIds: string[];
    startedFromMatchId?: string;
  }) {
    const sortedIds = [...params.participantIds].sort();

    return this.roomModel.create({
      roomType: ChatRoomType.DIRECT,
      participants: this.toObjectIds(sortedIds),
      participantHash: sortedIds.join(':'),
      createdById: new Types.ObjectId(params.createdById),
      startedFromMatchId: params.startedFromMatchId
        ? new Types.ObjectId(params.startedFromMatchId)
        : undefined,
      participantStates: sortedIds.map((participantId) => ({
        userId: new Types.ObjectId(participantId),
        unreadCount: 0,
      })),
      messageCount: 0,
      lastActivityAt: new Date(),
    });
  }

  async findRoomById(roomId: string) {
    return this.roomModel.findById(roomId);
  }

  async listRoomsForUser(userId: string, limit: number) {
    return this.roomModel
      .find({ participants: new Types.ObjectId(userId) })
      .sort({ lastActivityAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  saveRoom(room: ChatRoomDocument) {
    return room.save();
  }

  async createMessage(params: {
    roomId: string;
    senderId: string;
    receiverId: string;
    content: string;
    type: string;
    attachments: Array<{
      url: string;
      name?: string;
      mimeType?: string;
      size?: number;
    }>;
    replyToMessageId?: string;
    clientMessageId?: string;
  }) {
    return this.messageModel.create({
      roomId: new Types.ObjectId(params.roomId),
      senderId: new Types.ObjectId(params.senderId),
      receiverId: new Types.ObjectId(params.receiverId),
      content: params.content,
      type: params.type,
      attachments: params.attachments,
      replyToMessageId: params.replyToMessageId
        ? new Types.ObjectId(params.replyToMessageId)
        : undefined,
      clientMessageId: params.clientMessageId,
    });
  }

  async listMessages(roomId: string, limit: number, beforeMessageId?: string) {
    const filter: FilterQuery<ChatMessageDocument> = {
      roomId: new Types.ObjectId(roomId),
      isDeletedForEveryone: false,
    };

    if (beforeMessageId) {
      filter._id = { $lt: new Types.ObjectId(beforeMessageId) };
    }

    return this.messageModel.find(filter).sort({ _id: -1 }).limit(limit).lean();
  }

  findMessageById(messageId: string) {
    return this.messageModel.findById(messageId).lean();
  }

  async countUnreadByRoomIds(userId: string, roomIds: string[]) {
    if (roomIds.length === 0) {
      return [] as Array<{ _id: Types.ObjectId; count: number }>;
    }

    return this.messageModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      {
        $match: {
          receiverId: new Types.ObjectId(userId),
          roomId: { $in: this.toObjectIds(roomIds) },
          status: { $ne: ChatMessageStatus.READ },
          isDeletedForEveryone: false,
        },
      },
      { $group: { _id: '$roomId', count: { $sum: 1 } } },
    ]);
  }

  async markRoomRead(userId: string, roomId: string, upToMessageId?: string) {
    const filter: FilterQuery<ChatMessageDocument> = {
      roomId: new Types.ObjectId(roomId),
      receiverId: new Types.ObjectId(userId),
      status: { $ne: ChatMessageStatus.READ },
      isDeletedForEveryone: false,
    };

    if (upToMessageId) {
      filter._id = { $lte: new Types.ObjectId(upToMessageId) };
    }

    return this.messageModel.updateMany(filter, {
      $set: {
        readAt: new Date(),
        status: ChatMessageStatus.READ,
      },
    });
  }

  async markRoomDelivered(userId: string, roomId: string) {
    return this.messageModel.updateMany(
      {
        roomId: new Types.ObjectId(roomId),
        receiverId: new Types.ObjectId(userId),
        status: ChatMessageStatus.SENT,
        isDeletedForEveryone: false,
      },
      {
        $set: {
          deliveredAt: new Date(),
          status: ChatMessageStatus.DELIVERED,
        },
      },
    );
  }

  async findBlockedRelation(userId: string, targetUserId: string) {
    return this.userBlockModel.findOne({
      $or: [
        {
          userId: new Types.ObjectId(userId),
          blockedUserId: new Types.ObjectId(targetUserId),
        },
        {
          userId: new Types.ObjectId(targetUserId),
          blockedUserId: new Types.ObjectId(userId),
        },
      ],
    });
  }

  async findActiveMatchBetween(userId: string, targetUserId: string) {
    return this.matchModel.findOne({
      isActive: true,
      $or: [
        {
          userId: new Types.ObjectId(userId),
          targetUserId: new Types.ObjectId(targetUserId),
        },
        {
          userId: new Types.ObjectId(targetUserId),
          targetUserId: new Types.ObjectId(userId),
        },
        {
          users: {
            $all: [
              new Types.ObjectId(userId),
              new Types.ObjectId(targetUserId),
            ],
          },
        },
      ],
    });
  }

  async findMatchesForUser(userId: string) {
    return this.matchModel
      .find({
        isActive: true,
        $or: [
          { userId: new Types.ObjectId(userId) },
          { targetUserId: new Types.ObjectId(userId) },
          { users: new Types.ObjectId(userId) },
        ],
      })
      .lean();
  }

  buildParticipantKey(userA: string, userB: string) {
    return [userA, userB].sort().join(':');
  }

  private toObjectIds(values: string[]) {
    return values.map((value) => new Types.ObjectId(value));
  }
}
