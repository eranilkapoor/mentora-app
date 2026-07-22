import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
import { buildPaginationMeta } from '@/common/utils/pagination';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { StorageService } from '../../storage/services/storage.service';
import { ChatPresenceService } from './chat-presence.service';
import { ChatRealtimeService } from './chat-realtime.service';
import { ChatAccessService } from './chat-access.service';
import { ChatRepository } from '../repositories/chat.repository';
import { CreateDirectRoomDto } from '../dto/create-direct-room.dto';
import { ListChatContactsDto } from '../dto/list-chat-contacts.dto';
import { ListConversationsDto } from '../dto/list-conversations.dto';
import { ListMessagesDto } from '../dto/list-messages.dto';
import { MarkRoomReadDto } from '../dto/mark-room-read.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { UpdateRoomSettingsDto } from '../dto/update-room-settings.dto';
import {
  ChatMessageStatus,
  ChatMessageType,
  ChatModerationStatus,
  ChatRoomStatus,
  ChatRoomType,
} from '../enums/chat.enums';
import { ChatRoomDocument } from '../schemas/chat-room.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwAppException,
  throwBadRequest,
} from '@/common/exceptions/throw-app-exception';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import { FeatureKey } from '@/common/enums';
import { FeatureService } from '@/modules/subscriptions/services/feature.service';
import { detectFileCategory } from '@/common/utils/file-signature.util';

interface UserSummary {
  userId: string;
  fullName: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  verificationStatus: VerificationStatus;
  isPremium: boolean;
  isOnline: boolean;
  lastSeen: Date | null;
}

interface ConversationResponse {
  roomId: string;
  type: ChatRoomType;
  status: ChatRoomStatus;
  requestedById?: string;
  requestedAt?: Date;
  participant: UserSummary;
  lastMessage?: {
    id?: string;
    text?: string;
    senderId?: string;
    sentAt?: Date;
    status?: ChatMessageStatus;
    deliveredAt?: Date | null;
    readAt?: Date | null;
  };
  unreadCount: number;
  messageCount: number;
  updatedAt?: Date;
  settings: {
    archived: boolean;
    pinned: boolean;
    mutedUntil: Date | null;
    lastReadAt: Date | null;
  };
}

type MessageLike = {
  _id: unknown;
  roomId: unknown;
  senderId: unknown;
  receiverId: unknown;
  type?: ChatMessageType;
  content?: string;
  attachments?: unknown[];
  replyToMessageId?: unknown;
  status?: ChatMessageStatus;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  clientMessageId?: string;
};

type UserLike = {
  membership?: {
    tier?: string;
  };
};

type ProfileImageLike = {
  url?: string;
  isPrimary?: boolean;
  isActive?: boolean;
};

type MediaLike = ProfileImageLike & {
  userId?: unknown;
  thumbnailUrl?: string;
};

type ProfileLike = {
  personal?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: string;
  };
  verificationStatus?: VerificationStatus;
  isPremium?: boolean;
  profileImages?: ProfileImageLike[];
};

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly presence: ChatPresenceService,
    private readonly realtime: ChatRealtimeService,
    private readonly access: ChatAccessService,
    private readonly notificationsService: NotificationsService,
    private readonly logger: AppLogger,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly featureService: FeatureService,
  ) {}

  health() {
    return {
      status: 'ok',
      transport: 'socket.io',
      timestamp: new Date().toISOString(),
    };
  }

  async createOrGetDirectRoom(
    userId: string,
    dto: CreateDirectRoomDto,
  ): Promise<unknown> {
    this.access.ensureValidObjectId(userId, 'invalid_user_id');
    this.access.ensureValidObjectId(dto.targetUserId, 'invalid_target_user_id');

    if (userId === dto.targetUserId) {
      throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'cannot_create_chat_with_self',
      });
    }

    await this.access.ensureUsersExist([userId, dto.targetUserId]);
    await this.access.ensureMessagingAllowed(userId, dto.targetUserId);

    let room = await this.repo.findDirectRoomByUsers(userId, dto.targetUserId);

    if (!room) {
      room = await this.repo.createDirectRoom({
        createdById: userId,
        participantIds: [userId, dto.targetUserId],
        status: ChatRoomStatus.PENDING,
        requestedById: userId,
      });
    }

    //  Ensure room exists (type narrowing for TS)
    if (!room || !room.id) {
      return throwAppException(
        ErrorCode.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          reason: 'failed_to_create_or_fetch_room',
        },
      );
    }

    const initialMessage =
      typeof dto.initialMessage === 'string' ? dto.initialMessage.trim() : '';

    if (room.status === ChatRoomStatus.PENDING && room.messageCount === 0) {
      const requestText =
        initialMessage || "Hi, I'd like to connect and chat with you.";
      const message = await this.createRoomMessage(room, userId, {
        content: requestText,
        type: ChatMessageType.TEXT,
        clientMessageId: dto.clientMessageId,
        attachments: [],
      });
      await this.repo.setRoomRequestMessage(
        room.id as string,
        String(message.id),
      );
      await this.emitConversationUpdates(room);
      void this.notifyChatRequest(room, userId, dto.targetUserId, requestText);
      return this.getConversationDetail(userId, room.id as string);
    }

    if (room.status === ChatRoomStatus.PENDING) {
      return this.getConversationDetail(userId, room.id as string);
    }

    if (initialMessage.length > 0) {
      return this.sendMessage(userId, {
        roomId: room.id as string,
        content: initialMessage,
        clientMessageId: dto.clientMessageId,
        attachments: [],
        type: ChatMessageType.TEXT,
      });
    }

    return this.getConversationDetail(userId, room.id as string);
  }

  async getConversations(userId: string, query: ListConversationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const hasInMemoryFilter = Boolean(
      query.search ||
      query.onlyArchived ||
      query.onlyPinned ||
      query.onlyMuted ||
      query.onlyOnline,
    );
    const candidateLimit = hasInMemoryFilter
      ? Math.max(limit * 10, 200)
      : page * limit;

    const rooms = await this.repo.listRoomsForUser(userId, candidateLimit);
    const [blockedRelations, unreadRows, unreadTotal] = await Promise.all([
      this.repo.getBlockedRelationUserIds(userId),
      this.repo.countUnreadByRoomIds(
        userId,
        rooms.map((room) => String(room._id)),
      ),
      this.repo.countUnreadForUser(userId),
    ]);
    const blockedUserIds = new Set(blockedRelations);
    const unreadMap = new Map(
      unreadRows.map((row) => [String(row._id), row.count]),
    );

    const userIds = Array.from(
      new Set(
        rooms
          .flatMap((room) =>
            room.participants.map((participantId) => String(participantId)),
          )
          .filter((participantId) => participantId !== userId),
      ),
    );
    const [users, profiles, media] = await Promise.all([
      this.repo.findUsersByIds(userIds),
      this.repo.findProfilesByUserIds(userIds),
      this.repo.findPrimaryImageMediaByUserIds(userIds),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const mediaMap = this.buildPrimaryMediaMap(media);
    const lastMessageMap = await this.buildLastMessageMap(rooms);

    let items = await Promise.all(
      rooms
        .filter((room) =>
          this.shouldIncludeRoom(room, userId, query.includeArchived ?? false),
        )
        .filter((room) => {
          const otherUserId = this.getOtherParticipantId(
            room.participants,
            userId,
          );
          return !blockedUserIds.has(otherUserId);
        })
        .map((room) =>
          this.mapConversation(
            room,
            userId,
            userMap,
            profileMap,
            mediaMap,
            unreadMap.get(String(room._id)) ?? 0,
            lastMessageMap,
          ),
        ),
    );

    if (query.onlyUnread) {
      items = items.filter((item) => item.unreadCount > 0);
    }

    if (query.onlyArchived) {
      items = items.filter((item) => item.settings.archived);
    }

    if (query.onlyPinned) {
      items = items.filter((item) => item.settings.pinned);
    }

    if (query.onlyMuted) {
      items = items.filter((item) => Boolean(item.settings.mutedUntil));
    }

    if (query.onlyOnline) {
      items = items.filter((item) => item.participant.isOnline);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      items = items.filter((item) => {
        const haystack = [
          item.participant.fullName,
          item.participant.firstName,
          item.participant.lastName,
          item.participant.city,
          item.participant.country,
          item.lastMessage?.text,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    items = items.sort((left, right) => {
      if (left.settings.pinned && !right.settings.pinned) {
        return -1;
      }

      if (!left.settings.pinned && right.settings.pinned) {
        return 1;
      }

      return (
        (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0)
      );
    });

    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);

    return {
      ...buildPaginationMeta(items.length, page, limit),
      hasMore: start + pagedItems.length < items.length,
      unreadTotal,
      items: pagedItems,
    };
  }

  async getContacts(userId: string, query: ListChatContactsDto) {
    const rooms = await this.repo.listRoomsForUser(userId, 200);

    const roomPartnerIds = rooms.flatMap((room) =>
      room.participants
        .map((participantId) => String(participantId))
        .filter((participantId) => participantId !== userId),
    );

    const blockedUserIds = new Set(
      await this.repo.getBlockedRelationUserIds(userId),
    );
    const contactUserIds = Array.from(new Set(roomPartnerIds)).filter(
      (contactUserId) => !blockedUserIds.has(contactUserId),
    );
    const [users, profiles, media] = await Promise.all([
      this.repo.findUsersByIds(contactUserIds),
      this.repo.findProfilesByUserIds(contactUserIds),
      this.repo.findPrimaryImageMediaByUserIds(contactUserIds),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const mediaMap = this.buildPrimaryMediaMap(media);
    const roomMap = new Map<string, string>();

    rooms.forEach((room) => {
      const otherUserId = room.participants
        .map((participantId) => String(participantId))
        .find((participantId) => participantId !== userId);

      if (otherUserId) {
        roomMap.set(otherUserId, String(room._id));
      }
    });

    let items = await Promise.all(
      contactUserIds.map(async (contactUserId) => ({
        roomId: roomMap.get(contactUserId) ?? null,
        isMatched: false,
        ...(await this.buildUserSummary(
          contactUserId,
          userMap,
          profileMap,
          mediaMap,
        )),
      })),
    );

    if (query.search) {
      const search = query.search.toLowerCase();
      items = items.filter((item) => {
        const haystack = [
          item.fullName,
          item.firstName,
          item.lastName,
          item.city,
          item.country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      ...buildPaginationMeta(items.length, page, limit),
      hasMore: start + limit < items.length,
      items: items.slice(start, start + limit),
    };
  }

  async getConversationDetail(userId: string, roomId: string) {
    const room = await this.access.getAuthorizedRoom(userId, roomId, [
      ChatRoomStatus.ACTIVE,
      ChatRoomStatus.PENDING,
    ]);
    const otherUserId = this.getOtherParticipantId(room.participants, userId);
    const unreadRows = await this.repo.countUnreadByRoomIds(userId, [roomId]);
    const [users, profiles, media] = await Promise.all([
      this.repo.findUsersByIds([otherUserId]),
      this.repo.findProfilesByUserIds([otherUserId]),
      this.repo.findPrimaryImageMediaByUserIds([otherUserId]),
    ]);
    const lastMessageMap = await this.buildLastMessageMap([room]);

    return this.mapConversation(
      room,
      userId,
      new Map(users.map((user) => [String(user._id), user])),
      new Map(profiles.map((profile) => [String(profile.userId), profile])),
      this.buildPrimaryMediaMap(media),
      unreadRows[0]?.count ?? 0,
      lastMessageMap,
    );
  }

  async getMessages(userId: string, roomId: string, query: ListMessagesDto) {
    await this.access.getAuthorizedRoom(userId, roomId, [
      ChatRoomStatus.ACTIVE,
      ChatRoomStatus.PENDING,
    ]);

    const limit = query.limit ?? 30;
    const rows = await this.repo.listMessages(
      roomId,
      limit,
      query.beforeMessageId,
    );
    const delivered = await this.repo.markRoomDelivered(userId, roomId);

    if ((delivered.modifiedCount ?? 0) > 0) {
      this.realtime.emitToConversation(roomId, 'message:delivered', {
        roomId,
        userId,
        deliveredCount: delivered.modifiedCount,
        deliveredAt: new Date(),
      });
    }

    const items = rows.reverse().map((message) => this.mapMessage(message));
    const nextCursor =
      rows.length === limit ? String(rows[rows.length - 1]._id) : null;

    return {
      roomId,
      items,
      nextCursor,
    };
  }

  async respondToChatRequest(
    userId: string,
    roomId: string,
    action: 'ACCEPT' | 'REJECT',
  ) {
    this.access.ensureValidObjectId(roomId, 'invalid_room_id');
    const room = await this.repo.respondToChatRequest({
      roomId,
      responderId: userId,
      status:
        action === 'ACCEPT' ? ChatRoomStatus.ACTIVE : ChatRoomStatus.REJECTED,
    });

    if (!room) {
      return throwAppException(
        ErrorCode.CHAT_ACCESS_DENIED,
        HttpStatus.FORBIDDEN,
        { reason: 'chat_request_not_found_or_not_actionable' },
      );
    }

    await this.emitConversationUpdates(room);

    const requesterId = room.requestedById ? String(room.requestedById) : '';
    if (requesterId) {
      void this.notificationsService.notify({
        userId: requesterId,
        title:
          action === 'ACCEPT'
            ? 'Chat request accepted'
            : 'Chat request declined',
        message:
          action === 'ACCEPT'
            ? 'You can now continue the conversation.'
            : 'Your chat request was declined.',
        category: 'message_received',
        type: 'chat',
        actorId: userId,
        referenceId: String(room._id),
        dedupeKey: `chat-request-response:${String(room._id)}:${action}`,
        action: {
          screen: 'ChatDetails',
          params: {
            roomId: String(room._id),
            userId,
          },
        },
        metadata: {
          roomId: String(room._id),
          action,
        },
      });
    }

    if (action === 'REJECT') {
      return {
        roomId: String(room._id),
        status: room.status,
        respondedAt: room.respondedAt,
      };
    }

    return this.getConversationDetail(userId, String(room._id));
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const room = await this.access.getAuthorizedRoom(userId, dto.roomId);
    const receiverId = this.getOtherParticipantId(room.participants, userId);

    await this.access.ensureMessagingAllowed(userId, receiverId);

    const content = dto.content?.trim() ?? '';
    const attachments = dto.attachments ?? [];
    if (!content && attachments.length === 0) {
      throwBadRequest(ErrorCode.CHAT_MESSAGE_EMPTY);
    }

    this.ensureMessageIsSafe(content);
    this.ensureAttachmentsAreValid(userId, attachments);

    const messagePayload = await this.createRoomMessage(room, userId, {
      content,
      type: dto.type ?? ChatMessageType.TEXT,
      attachments,
      replyToMessageId: dto.replyToMessageId,
      clientMessageId: dto.clientMessageId,
    });

    await this.emitConversationUpdates(room);

    void this.notificationsService
      .notify({
        userId: receiverId,
        title: 'New message',
        message: this.buildNotificationPreview(
          content ||
            this.buildAttachmentPreview(dto.type ?? ChatMessageType.FILE),
        ),
        category: 'message_received',
        type: 'chat',
        actorId: userId,
        referenceId: messagePayload.id,
        dedupeKey: `chat-message:${messagePayload.id}`,
        action: {
          screen: 'ChatDetails',
          params: {
            roomId: String(room._id),
            userId,
          },
        },
        metadata: {
          roomId: String(room._id),
          messageId: messagePayload.id,
          senderId: userId,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Failed to create chat notification for room ${String(room._id)}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      });

    return messagePayload;
  }

  private async createRoomMessage(
    room: ChatRoomDocument,
    senderId: string,
    dto: {
      content: string;
      type: ChatMessageType;
      attachments: Array<{
        url: string;
        name?: string;
        mimeType?: string;
        size?: number;
      }>;
      replyToMessageId?: string;
      clientMessageId?: string;
    },
  ) {
    const receiverId = this.getOtherParticipantId(room.participants, senderId);
    const moderation = this.getMessageModeration(dto.content);
    const message = await this.repo.createMessage({
      roomId: room.id as string,
      senderId,
      receiverId,
      content: dto.content,
      type: dto.type,
      attachments: dto.attachments,
      moderationStatus: moderation.status,
      moderationReasons: moderation.reasons,
      replyToMessageId: dto.replyToMessageId,
      clientMessageId: dto.clientMessageId,
    });

    const sentAt = (message as { createdAt?: Date }).createdAt ?? new Date();
    room.lastMessageId = this.toObjectId(message._id);
    room.lastMessageSenderId = new Types.ObjectId(senderId);
    room.lastMessageText = this.buildPreview(
      dto.content || this.buildAttachmentPreview(dto.type),
    );
    room.lastMessageAt = sentAt;
    room.lastActivityAt = sentAt;
    room.messageCount = (room.messageCount ?? 0) + 1;

    const senderState = this.getParticipantState(room, senderId);
    const receiverState = this.getParticipantState(room, receiverId);
    senderState.archivedAt = undefined;
    senderState.unreadCount = 0;
    receiverState.archivedAt = undefined;
    receiverState.unreadCount = (receiverState.unreadCount ?? 0) + 1;

    await this.repo.saveRoom(room);

    const messagePayload = this.mapMessage(message);
    this.realtime.emitToConversation(
      room.id as string,
      'message:new',
      messagePayload,
    );
    return messagePayload;
  }

  async uploadAttachments(userId: string, files: Express.Multer.File[]) {
    this.access.ensureValidObjectId(userId, 'invalid_user_id');

    if (!files.length) {
      throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
        reason: 'chat_attachment_required',
      });
    }

    if (files.length > 5) {
      throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
        reason: 'chat_attachment_limit_exceeded',
      });
    }

    const allowedMimePattern = /^(image|video|audio)\//i;
    for (const file of files) {
      const category = detectFileCategory(file.buffer);
      if (
        !allowedMimePattern.test(file.mimetype) ||
        !category ||
        !['image', 'video', 'audio'].includes(category) ||
        !file.mimetype.toLowerCase().startsWith(`${category}/`)
      ) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'unsupported_or_mismatched_chat_attachment_type',
        });
      }

      const featureKey =
        category === 'video'
          ? FeatureKey.SEND_VIDEOS_IN_CHAT
          : category === 'audio'
            ? FeatureKey.SEND_VOICE_NOTES
            : FeatureKey.SEND_IMAGES_IN_CHAT;
      await this.featureService.checkAccess(featureKey, { userId });
    }

    const uploaded = await this.storageService.uploadFiles(
      files,
      `chat/${userId}`,
    );

    return uploaded.map((file, index) => ({
      url: file.url,
      name: files[index]?.originalname,
      mimeType: files[index]?.mimetype,
      size: files[index]?.size,
    }));
  }

  getModerationQueue(status = ChatModerationStatus.FLAGGED, limit = 50) {
    return this.repo.listModerationQueue(
      status,
      Math.min(Math.max(Number(limit) || 50, 1), 100),
    );
  }

  async reviewMessage(
    reviewerId: string,
    messageId: string,
    approve: boolean,
    note?: string,
  ) {
    this.access.ensureValidObjectId(messageId, 'invalid_message_id');
    this.access.ensureValidObjectId(reviewerId, 'invalid_reviewer_id');

    const moderationStatus = approve
      ? ChatModerationStatus.APPROVED
      : ChatModerationStatus.REJECTED;
    const message = await this.repo.reviewMessage(
      messageId,
      reviewerId,
      moderationStatus,
      note,
    );

    if (!message) {
      return throwBadRequest(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
    }

    if (!approve) {
      this.realtime.emitToConversation(
        String(message.roomId),
        'message:deleted',
        {
          roomId: String(message.roomId),
          messageId,
          deletedAt: message.deletedAt ?? new Date(),
        },
      );
    }

    return this.mapMessage(message);
  }

  async deleteOwnMessage(userId: string, roomId: string, messageId: string) {
    await this.access.getAuthorizedRoom(userId, roomId);

    const message = await this.repo.findMessageById(messageId);
    if (
      !message ||
      String(message.roomId) !== roomId ||
      String(message.senderId) !== userId
    ) {
      return throwBadRequest(ErrorCode.CHAT_MESSAGE_NOT_FOUND);
    }

    const deleted = await this.repo.softDeleteMessageForEveryone(messageId);
    this.realtime.emitToConversation(roomId, 'message:deleted', {
      roomId,
      messageId,
      deletedAt: deleted?.deletedAt ?? new Date(),
    });

    return {
      roomId,
      messageId,
      deletedAt: deleted?.deletedAt ?? new Date(),
    };
  }

  async markRoomRead(userId: string, roomId: string, dto: MarkRoomReadDto) {
    const room = await this.access.getAuthorizedRoom(userId, roomId);

    if (dto.upToMessageId) {
      const anchorMessage = await this.repo.findMessageById(dto.upToMessageId);
      if (!anchorMessage || String(anchorMessage.roomId) !== roomId) {
        throwBadRequest(ErrorCode.INVALID_ID, {
          reason: 'invalid_read_cursor',
        });
      }
    }

    const result = await this.repo.markRoomRead(
      userId,
      roomId,
      dto.upToMessageId,
    );
    const state = this.getParticipantState(room, userId);
    state.unreadCount = 0;
    state.lastReadAt = new Date();
    state.lastReadMessageId = dto.upToMessageId
      ? new Types.ObjectId(dto.upToMessageId)
      : room.lastMessageId;

    await this.repo.saveRoom(room);

    this.realtime.emitToConversation(roomId, 'message:read', {
      roomId,
      userId,
      upToMessageId:
        dto.upToMessageId ?? room.lastMessageId?.toString() ?? null,
      readAt: state.lastReadAt,
    });
    await this.emitConversationUpdates(room);

    return {
      roomId,
      updatedCount: result.modifiedCount,
      readAt: state.lastReadAt,
    };
  }

  async updateRoomSettings(
    userId: string,
    roomId: string,
    dto: UpdateRoomSettingsDto,
  ) {
    const room = await this.access.getAuthorizedRoom(userId, roomId);
    const state = this.getParticipantState(room, userId);

    if (typeof dto.archived === 'boolean') {
      state.archivedAt = dto.archived ? new Date() : undefined;
    }

    if (typeof dto.pinned === 'boolean') {
      state.pinnedAt = dto.pinned ? new Date() : undefined;
    }

    if (dto.mutedUntil !== undefined) {
      state.mutedUntil = dto.mutedUntil ? new Date(dto.mutedUntil) : undefined;
    }

    await this.repo.saveRoom(room);
    const detail = await this.getConversationDetail(userId, roomId);
    this.realtime.emitToUser(userId, 'conversation:updated', detail);
    return detail;
  }

  private async emitConversationUpdates(room: ChatRoomDocument) {
    const participantIds = room.participants.map((participantId) =>
      String(participantId),
    );
    const [users, profiles, media] = await Promise.all([
      this.repo.findUsersByIds(participantIds),
      this.repo.findProfilesByUserIds(participantIds),
      this.repo.findPrimaryImageMediaByUserIds(participantIds),
    ]);
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const mediaMap = this.buildPrimaryMediaMap(media);
    const lastMessageMap = await this.buildLastMessageMap([room]);

    for (const participantId of participantIds) {
      const unreadRows = await this.repo.countUnreadByRoomIds(participantId, [
        room.id as string,
      ]);
      const conversation = await this.mapConversation(
        room,
        participantId,
        userMap,
        profileMap,
        mediaMap,
        unreadRows[0]?.count ?? 0,
        lastMessageMap,
      );

      this.realtime.emitToUser(
        participantId,
        'conversation:updated',
        conversation,
      );
    }
  }

  private notifyChatRequest(
    room: ChatRoomDocument,
    requesterId: string,
    receiverId: string,
    message: string,
  ) {
    return this.notificationsService
      .notify({
        userId: receiverId,
        title: 'New chat request',
        message: this.buildNotificationPreview(message),
        category: 'message_received',
        type: 'chat',
        actorId: requesterId,
        referenceId: String(room._id),
        dedupeKey: `chat-request:${String(room._id)}`,
        action: {
          screen: 'ChatDetails',
          params: {
            roomId: String(room._id),
            userId: requesterId,
          },
        },
        metadata: {
          roomId: String(room._id),
          requesterId,
          status: ChatRoomStatus.PENDING,
        },
      })
      .catch((error: unknown) => {
        this.logger.warn(
          `Failed to create chat request notification for room ${String(
            room._id,
          )}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
  }

  private shouldIncludeRoom(
    room: {
      status?: ChatRoomStatus;
      participantStates?: Array<{
        userId: Types.ObjectId | string;
        archivedAt?: Date;
      }>;
    },
    currentUserId: string,
    includeArchived: boolean,
  ) {
    if (
      room.status !== ChatRoomStatus.ACTIVE &&
      room.status !== ChatRoomStatus.PENDING
    ) {
      return false;
    }

    if (includeArchived) {
      return true;
    }

    const state = this.getParticipantState(room, currentUserId);
    return !state.archivedAt;
  }

  private getParticipantState(
    room: {
      participantStates?: Array<{
        userId: Types.ObjectId | string;
        unreadCount?: number;
        archivedAt?: Date;
        pinnedAt?: Date;
        mutedUntil?: Date;
        lastReadAt?: Date;
        lastReadMessageId?: Types.ObjectId;
      }>;
    },
    currentUserId: string,
  ) {
    const state = room.participantStates?.find(
      (participantState) => String(participantState.userId) === currentUserId,
    );

    if (!state) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'invalid_chat_room_state',
      });
    }

    return state;
  }

  private async mapConversation(
    room: {
      _id: unknown;
      roomType: ChatRoomType;
      status: ChatRoomStatus;
      participants: Array<Types.ObjectId | string>;
      requestedById?: Types.ObjectId | string;
      requestedAt?: Date;
      participantStates?: Array<{
        userId: Types.ObjectId | string;
        archivedAt?: Date;
        pinnedAt?: Date;
        mutedUntil?: Date;
        lastReadAt?: Date;
      }>;
      lastMessageText?: string;
      lastMessageId?: Types.ObjectId | string;
      lastMessageSenderId?: Types.ObjectId | string;
      lastMessageAt?: Date;
      messageCount?: number;
      lastActivityAt?: Date;
      updatedAt?: Date;
    },
    currentUserId: string,
    userMap: Map<string, UserLike>,
    profileMap: Map<string, ProfileLike>,
    mediaMap: Map<string, MediaLike>,
    unreadCount: number,
    lastMessageMap: Map<string, MessageLike> = new Map(),
  ): Promise<ConversationResponse> {
    const otherUserId = this.getOtherParticipantId(
      room.participants,
      currentUserId,
    );
    const state = this.getParticipantState(room, currentUserId);
    const lastMessage = room.lastMessageId
      ? lastMessageMap.get(String(room.lastMessageId))
      : undefined;

    return {
      roomId: String(room._id),
      type: room.roomType,
      status: room.status,
      requestedById: room.requestedById
        ? String(room.requestedById)
        : undefined,
      requestedAt: room.requestedAt,
      participant: await this.buildUserSummary(
        otherUserId,
        userMap,
        profileMap,
        mediaMap,
      ),
      lastMessage: room.lastMessageText
        ? {
            id: room.lastMessageId ? String(room.lastMessageId) : undefined,
            text: room.lastMessageText,
            senderId: room.lastMessageSenderId
              ? String(room.lastMessageSenderId)
              : undefined,
            sentAt: room.lastMessageAt,
            status: lastMessage?.status,
            deliveredAt: lastMessage?.deliveredAt ?? null,
            readAt: lastMessage?.readAt ?? null,
          }
        : undefined,
      unreadCount,
      messageCount: room.messageCount ?? 0,
      updatedAt: room.lastActivityAt ?? room.updatedAt,
      settings: {
        archived: Boolean(state.archivedAt),
        pinned: Boolean(state.pinnedAt),
        mutedUntil: state.mutedUntil ?? null,
        lastReadAt: state.lastReadAt ?? null,
      },
    };
  }

  private async buildLastMessageMap(
    rooms: Array<{ lastMessageId?: Types.ObjectId | string }>,
  ): Promise<Map<string, MessageLike>> {
    const messageIds = [
      ...new Set(
        rooms
          .map((room) => room.lastMessageId?.toString())
          .filter((messageId): messageId is string => Boolean(messageId)),
      ),
    ];
    const messages = await this.repo.findMessagesByIds(messageIds);

    return new Map(messages.map((message) => [String(message._id), message]));
  }

  private buildPrimaryMediaMap(media: MediaLike[]): Map<string, MediaLike> {
    const mediaMap = new Map<string, MediaLike>();

    for (const item of media) {
      const userId =
        item.userId instanceof Types.ObjectId
          ? item.userId.toHexString()
          : typeof item.userId === 'string'
            ? item.userId
            : '';
      if (!userId || mediaMap.has(userId)) continue;
      mediaMap.set(userId, item);
    }

    return mediaMap;
  }

  private toSafeString(value: unknown): string {
    if (typeof value === 'string') return value;

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (
      value &&
      typeof value === 'object' &&
      'toString' in value &&
      typeof (value as { toString: () => string }).toString === 'function' &&
      value.constructor?.name === 'ObjectId'
    ) {
      return (value as { toString: () => string }).toString();
    }

    return throwBadRequest(ErrorCode.INVALID_REQUEST, {
      reason: 'invalid_value_for_string_conversion',
    });
  }

  private mapMessage(message: MessageLike): {
    id: string;
    roomId: string;
    senderId: string;
    receiverId: string;
    type?: ChatMessageType;
    content?: string;
    attachments: unknown[];
    replyToMessageId?: string;
    status?: ChatMessageStatus;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    clientMessageId?: string;
  } {
    return {
      id: this.toSafeString(message._id),
      roomId: this.toSafeString(message.roomId),
      senderId: this.toSafeString(message.senderId),
      receiverId: this.toSafeString(message.receiverId),
      type: message.type,
      content: message.content,
      attachments: Array.isArray(message.attachments)
        ? message.attachments
        : [],
      replyToMessageId: message.replyToMessageId
        ? this.toSafeString(message.replyToMessageId)
        : undefined,
      status: message.status,
      deliveredAt: message.deliveredAt ?? null,
      readAt: message.readAt ?? null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      clientMessageId: message.clientMessageId,
    };
  }

  private async buildUserSummary(
    userId: string,
    userMap: Map<string, UserLike>,
    profileMap: Map<string, ProfileLike>,
    mediaMap: Map<string, MediaLike>,
  ): Promise<UserSummary> {
    const user = userMap.get(userId);
    const profile = profileMap.get(userId);

    const firstName =
      typeof profile?.personal?.firstName === 'string'
        ? profile.personal.firstName
        : 'User';

    const lastName =
      typeof profile?.personal?.lastName === 'string'
        ? profile.personal.lastName
        : undefined;

    const images: ProfileImageLike[] = Array.isArray(profile?.profileImages)
      ? profile.profileImages
      : [];

    const primaryImage =
      images.find((img) => img.isActive !== false && img.isPrimary === true) ??
      images.find((img) => img.isActive !== false);
    const primaryMedia = mediaMap.get(userId);
    const avatarUrl =
      (typeof primaryMedia?.thumbnailUrl === 'string'
        ? primaryMedia.thumbnailUrl
        : undefined) ??
      (typeof primaryMedia?.url === 'string' ? primaryMedia.url : undefined) ??
      (typeof primaryImage?.url === 'string' ? primaryImage.url : undefined);

    const city =
      typeof profile?.personal?.city === 'string'
        ? profile.personal.city
        : undefined;

    const country =
      typeof profile?.personal?.country === 'string'
        ? profile.personal.country
        : undefined;

    const verificationStatus =
      profile?.verificationStatus ?? VerificationStatus.NOT_STARTED;

    const isPremium = Boolean(
      profile?.isPremium ||
      (typeof user?.membership?.tier === 'string' &&
        user.membership.tier !== 'free'),
    );

    return {
      userId,
      fullName: [firstName, lastName].filter(Boolean).join(' '),
      firstName,
      lastName,
      avatarUrl,
      city,
      country,
      verificationStatus,
      isPremium,
      isOnline: await this.presence.isOnline(userId),
      lastSeen: await this.presence.getLastSeen(userId),
    };
  }

  private getOtherParticipantId(
    participantIds: Array<Types.ObjectId | string>,
    currentUserId: string,
  ): string {
    const otherUserId = participantIds
      .map((participantId) => String(participantId))
      .find((participantId) => participantId !== currentUserId);

    if (!otherUserId) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'invalid_chat_room_participants',
      });
    }

    return otherUserId;
  }

  private buildPreview(content: string) {
    return content.length > 120 ? `${content.slice(0, 117)}...` : content;
  }

  private buildNotificationPreview(content: string) {
    return content.length > 80 ? `${content.slice(0, 77)}...` : content;
  }

  private buildAttachmentPreview(type: ChatMessageType) {
    switch (type) {
      case ChatMessageType.IMAGE:
        return 'Photo';
      case ChatMessageType.VIDEO:
        return 'Video';
      case ChatMessageType.AUDIO:
        return 'Voice message';
      default:
        return 'Attachment';
    }
  }

  private ensureAttachmentsAreValid(
    userId: string,
    attachments: Array<{ url: string; mimeType?: string; size?: number }>,
  ) {
    if (attachments.length > 5) {
      throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
        reason: 'chat_attachment_limit_exceeded',
      });
    }

    for (const attachment of attachments) {
      if (!attachment.url || !/^https?:\/\//i.test(attachment.url)) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'chat_attachment_url_invalid',
        });
      }

      let pathname = '';
      try {
        pathname = new URL(attachment.url).pathname;
      } catch {
        pathname = '';
      }
      if (!pathname.includes(`/uploads/chat/${userId}/`)) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'chat_attachment_not_owned',
        });
      }

      if (
        attachment.mimeType &&
        !/^(image|video|audio)\//i.test(attachment.mimeType)
      ) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'chat_attachment_type_invalid',
        });
      }

      if (attachment.size && attachment.size > 25 * 1024 * 1024) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'chat_attachment_too_large',
        });
      }
    }
  }

  private ensureMessageIsSafe(content: string) {
    const enabled = this.configService.get<boolean>(
      'chat.profanityFilter.enabled',
      true,
    );

    if (!enabled || !content) {
      return;
    }

    const configuredWords = this.configService.get<string>(
      'chat.profanityFilter.blockedWords',
      '',
    );
    const blockedWords = configuredWords
      .split(',')
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);

    if (blockedWords.length === 0) {
      return;
    }

    const normalized = content.toLowerCase();
    const matched = blockedWords.find((word) =>
      new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'i').test(normalized),
    );

    if (matched) {
      throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
        reason: 'chat_message_contains_blocked_language',
      });
    }
  }

  private getMessageModeration(content: string): {
    status: ChatModerationStatus;
    reasons: string[];
  } {
    const enabled = this.configService.get<boolean>(
      'chat.profanityFilter.enabled',
      true,
    );

    if (!enabled || !content) {
      return { status: ChatModerationStatus.APPROVED, reasons: [] };
    }

    const reviewWords = this.parseWordList(
      this.configService.get<string>('chat.profanityFilter.reviewWords', ''),
    );
    const normalized = content.toLowerCase();
    const matched = reviewWords.filter((word) =>
      new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'i').test(normalized),
    );

    if (matched.length === 0) {
      return { status: ChatModerationStatus.APPROVED, reasons: [] };
    }

    return {
      status: ChatModerationStatus.FLAGGED,
      reasons: matched.map((word) => `review_word:${word}`),
    };
  }

  private parseWordList(value: string): string[] {
    return value
      .split(',')
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);
  }

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private toObjectId(value: unknown): Types.ObjectId {
    if (value instanceof Types.ObjectId) {
      return value;
    }

    if (typeof value === 'string') {
      return new Types.ObjectId(value);
    }

    return throwBadRequest(ErrorCode.INVALID_ID);
  }
}
