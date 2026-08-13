import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import {
  ChatMessage,
  ChatMessageDocument,
} from '../schemas/chat-message.schema';
import { ChatRoom, ChatRoomDocument } from '../schemas/chat-room.schema';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileDocument,
} from '@/modules/learning/schemas/learning.schemas';
import {
  UserBlock,
  UserBlockDocument,
} from '../../safety/schemas/user-block.schema';
import {
  ChatMessageStatus,
  ChatModerationStatus,
  ChatRoomStatus,
  ChatRoomType,
} from '../enums/chat.enums';
import {
  CommunicationSetting,
  CommunicationSettingDocument,
} from '../../settings/schemas/communication-setting.schema';
import {
  Media,
  MediaDocument,
} from '../../../common/schemas/user-media.schema';
import { MediaType } from '@/common/enums';
import {
  MediaModerationStatus,
  MediaStatus,
} from '../../../common/enums/user-media.enums';
import {
  Verification,
  VerificationDocument,
} from '../../safety/schemas/verification.schema';
import { VerificationStatus } from '../../safety/enums/verification.enums';

export interface ChatProfileSummary {
  userId: Types.ObjectId;
  personal?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: string;
  };
  isPremium?: boolean;
  profileImages?: Array<{
    url?: string;
    isPrimary?: boolean;
    isActive?: boolean;
  }>;
  verificationStatus: VerificationStatus;
}
@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel(ChatMessage.name)
    private readonly messageModel: Model<ChatMessageDocument>,

    @InjectModel(ChatRoom.name)
    private readonly roomModel: Model<ChatRoomDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(StudentProfile.name)
    private readonly profileModel: Model<StudentProfileDocument>,

    @InjectModel(CommunicationSetting.name)
    private readonly communicationModel: Model<CommunicationSettingDocument>,

    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,

    @InjectModel(UserBlock.name)
    private readonly userBlockModel: Model<UserBlockDocument>,

    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
  ) {}

  async findUserById(userId: string) {
    return this.userModel.findById(userId).lean();
  }

  async findUsersByIds(userIds: string[]) {
    return this.userModel
      .find({ _id: { $in: this.toObjectIds(userIds) } })
      .lean();
  }

  async findProfilesByUserIds(
    userIds: string[],
  ): Promise<ChatProfileSummary[]> {
    const objectIds = this.toObjectIds(userIds);
    const [profiles, verifiedUserIds] = await Promise.all([
      this.profileModel
        .find({ userId: { $in: objectIds } })
        .lean<Omit<ChatProfileSummary, 'verificationStatus'>[]>()
        .exec(),
      this.verificationModel.distinct('userId', {
        userId: { $in: objectIds },
        status: VerificationStatus.APPROVED,
      }),
    ]);
    const verified = new Set(verifiedUserIds.map(String));

    return profiles.map((profile) => ({
      ...profile,
      verificationStatus: verified.has(String(profile.userId))
        ? VerificationStatus.APPROVED
        : VerificationStatus.NOT_STARTED,
    }));
  }

  async findPrimaryImageMediaByUserIds(userIds: string[]) {
    return this.mediaModel
      .find({
        userId: { $in: this.toObjectIds(userIds) },
        type: MediaType.IMAGE,
        status: MediaStatus.ACTIVE,
        moderationStatus: MediaModerationStatus.APPROVED,
        isActive: { $ne: false },
      })
      .sort({ isPrimary: -1, uploadedAt: -1, createdAt: -1 })
      .lean();
  }

  async findCommunicationSettingsByUserIds(userIds: string[]) {
    return this.communicationModel
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
    status?: ChatRoomStatus;
    requestedById?: string;
  }) {
    const sortedIds = [...params.participantIds].sort();
    const now = new Date();

    return this.roomModel.create({
      roomType: ChatRoomType.DIRECT,
      participants: this.toObjectIds(sortedIds),
      participantHash: sortedIds.join(':'),
      createdById: new Types.ObjectId(params.createdById),
      startedFromMatchId: params.startedFromMatchId
        ? new Types.ObjectId(params.startedFromMatchId)
        : undefined,
      requestedById: params.requestedById
        ? new Types.ObjectId(params.requestedById)
        : undefined,
      requestedAt: params.requestedById ? now : undefined,
      status: params.status ?? ChatRoomStatus.ACTIVE,
      participantStates: sortedIds.map((participantId) => ({
        userId: new Types.ObjectId(participantId),
        unreadCount: 0,
      })),
      messageCount: 0,
      lastActivityAt: new Date(),
    });
  }

  async respondToChatRequest(params: {
    roomId: string;
    responderId: string;
    status: ChatRoomStatus.ACTIVE | ChatRoomStatus.REJECTED;
  }) {
    return this.roomModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(params.roomId),
        participants: new Types.ObjectId(params.responderId),
        status: ChatRoomStatus.PENDING,
        requestedById: { $ne: new Types.ObjectId(params.responderId) },
      },
      {
        $set: {
          status: params.status,
          respondedById: new Types.ObjectId(params.responderId),
          respondedAt: new Date(),
          lastActivityAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async setRoomRequestMessage(roomId: string, messageId: string) {
    return this.roomModel.findByIdAndUpdate(roomId, {
      $set: {
        requestMessageId: new Types.ObjectId(messageId),
      },
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
    moderationStatus?: ChatModerationStatus;
    moderationReasons?: string[];
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
      moderationStatus: params.moderationStatus,
      moderationReasons: params.moderationReasons,
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

  softDeleteMessageForEveryone(messageId: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      {
        $set: {
          isDeletedForEveryone: true,
          deletedAt: new Date(),
          content: 'Message deleted',
          attachments: [],
        },
      },
      { new: true },
    );
  }

  listModerationQueue(status: ChatModerationStatus, limit: number) {
    return this.messageModel
      .find({
        moderationStatus: status,
        isDeletedForEveryone: false,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  reviewMessage(
    messageId: string,
    reviewerId: string,
    status: ChatModerationStatus.APPROVED | ChatModerationStatus.REJECTED,
    note?: string,
  ) {
    const isRejected = status === ChatModerationStatus.REJECTED;
    return this.messageModel
      .findByIdAndUpdate(
        messageId,
        {
          $set: {
            moderationStatus: status,
            reviewedBy: new Types.ObjectId(reviewerId),
            reviewedAt: new Date(),
            ...(note ? { reviewNote: note } : {}),
            ...(isRejected
              ? {
                  isDeletedForEveryone: true,
                  deletedAt: new Date(),
                  content: 'Message removed by moderation',
                  attachments: [],
                }
              : {}),
          },
        },
        { new: true },
      )
      .lean()
      .exec();
  }

  async findMessagesByIds(messageIds: string[]) {
    if (messageIds.length === 0) {
      return [];
    }

    return this.messageModel
      .find({ _id: { $in: this.toObjectIds(messageIds) } })
      .lean();
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

  async countUnreadForUser(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      status: { $ne: ChatMessageStatus.READ },
      isDeletedForEveryone: false,
    });
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

  async getBlockedRelationUserIds(userId: string): Promise<string[]> {
    const currentUserId = new Types.ObjectId(userId);
    const rows = await this.userBlockModel
      .find({
        $or: [{ userId: currentUserId }, { blockedUserId: currentUserId }],
      })
      .select('userId blockedUserId')
      .lean<Array<{ userId: Types.ObjectId; blockedUserId: Types.ObjectId }>>()
      .exec();

    return [
      ...new Set(
        rows.map((row) =>
          row.userId.equals(currentUserId)
            ? row.blockedUserId.toString()
            : row.userId.toString(),
        ),
      ),
    ];
  }

  buildParticipantKey(userA: string, userB: string) {
    return [userA, userB].sort().join(':');
  }

  private toObjectIds(values: string[]) {
    return values.map((value) => new Types.ObjectId(value));
  }
}
