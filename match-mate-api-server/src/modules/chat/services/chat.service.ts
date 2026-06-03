import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';
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
  ChatRoomStatus,
  ChatRoomType,
} from '../enums/chat.enums';
import { ChatRoomDocument } from '../schemas/chat-room.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwAppException,
  throwBadRequest,
} from '@/common/exceptions/throw-app-exception';

interface UserSummary {
  userId: string;
  fullName: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  isVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  lastSeen: Date | null;
}

interface ConversationResponse {
  roomId: string;
  type: ChatRoomType;
  status: ChatRoomStatus;
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

type ProfileLike = {
  personal?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    country?: string;
  };
  isVerified?: boolean;
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
      const match = await this.repo.findActiveMatchBetween(
        userId,
        dto.targetUserId,
      );

      if (!match) {
        return throwAppException(
          ErrorCode.CHAT_ACCESS_DENIED,
          HttpStatus.FORBIDDEN,
          {
            reason: 'direct_chat_requires_match',
          },
        );
      }

      room = await this.repo.createDirectRoom({
        createdById: userId,
        participantIds: [userId, dto.targetUserId],
        startedFromMatchId: String(match._id),
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
    const blockedUserIds = new Set(
      await this.repo.getBlockedRelationUserIds(userId),
    );
    const unreadRows = await this.repo.countUnreadByRoomIds(
      userId,
      rooms.map((room) => String(room._id)),
    );
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
    const [users, profiles] = await Promise.all([
      this.repo.findUsersByIds(userIds),
      this.repo.findProfilesByUserIds(userIds),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const lastMessageMap = await this.buildLastMessageMap(rooms);

    let items = rooms
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
          unreadMap.get(String(room._id)) ?? 0,
          lastMessageMap,
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
      page,
      limit,
      total: items.length,
      hasMore: start + pagedItems.length < items.length,
      unreadTotal: items.reduce((sum, item) => sum + item.unreadCount, 0),
      items: pagedItems,
    };
  }

  async getContacts(userId: string, query: ListChatContactsDto) {
    const [matches, rooms] = await Promise.all([
      this.repo.findMatchesForUser(userId),
      this.repo.listRoomsForUser(userId, 200),
    ]);

    const matchedUserIds = matches
      .map((match) => {
        if (
          'users' in match &&
          Array.isArray((match as { users?: Types.ObjectId[] }).users)
        ) {
          return (match as { users: Types.ObjectId[] }).users
            .map((value) => value.toString())
            .find((value) => value !== userId);
        }

        const primaryUserId = String(match.userId);
        return primaryUserId === userId
          ? String(match.targetUserId)
          : primaryUserId;
      })
      .filter((value): value is string => Boolean(value));

    const roomPartnerIds = rooms.flatMap((room) =>
      room.participants
        .map((participantId) => String(participantId))
        .filter((participantId) => participantId !== userId),
    );

    const blockedUserIds = new Set(
      await this.repo.getBlockedRelationUserIds(userId),
    );
    const contactUserIds = Array.from(
      new Set([...matchedUserIds, ...roomPartnerIds]),
    ).filter((contactUserId) => !blockedUserIds.has(contactUserId));
    const [users, profiles] = await Promise.all([
      this.repo.findUsersByIds(contactUserIds),
      this.repo.findProfilesByUserIds(contactUserIds),
    ]);

    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const roomMap = new Map<string, string>();

    rooms.forEach((room) => {
      const otherUserId = room.participants
        .map((participantId) => String(participantId))
        .find((participantId) => participantId !== userId);

      if (otherUserId) {
        roomMap.set(otherUserId, String(room._id));
      }
    });

    let items = contactUserIds.map((contactUserId) => ({
      roomId: roomMap.get(contactUserId) ?? null,
      isMatched: matchedUserIds.includes(contactUserId),
      ...this.buildUserSummary(contactUserId, userMap, profileMap),
    }));

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
      page,
      limit,
      total: items.length,
      hasMore: start + limit < items.length,
      items: items.slice(start, start + limit),
    };
  }

  async getConversationDetail(userId: string, roomId: string) {
    const room = await this.access.getAuthorizedRoom(userId, roomId);
    const otherUserId = this.getOtherParticipantId(room.participants, userId);
    const unreadRows = await this.repo.countUnreadByRoomIds(userId, [roomId]);
    const [users, profiles] = await Promise.all([
      this.repo.findUsersByIds([otherUserId]),
      this.repo.findProfilesByUserIds([otherUserId]),
    ]);
    const lastMessageMap = await this.buildLastMessageMap([room]);

    return this.mapConversation(
      room,
      userId,
      new Map(users.map((user) => [String(user._id), user])),
      new Map(profiles.map((profile) => [String(profile.userId), profile])),
      unreadRows[0]?.count ?? 0,
      lastMessageMap,
    );
  }

  async getMessages(userId: string, roomId: string, query: ListMessagesDto) {
    await this.access.getAuthorizedRoom(userId, roomId);

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
    this.ensureAttachmentsAreValid(attachments);

    const message = await this.repo.createMessage({
      roomId: dto.roomId,
      senderId: userId,
      receiverId,
      content,
      type: dto.type ?? ChatMessageType.TEXT,
      attachments,
      replyToMessageId: dto.replyToMessageId,
      clientMessageId: dto.clientMessageId,
    });

    const sentAt = (message as { createdAt?: Date }).createdAt ?? new Date();
    room.lastMessageId = this.toObjectId(message._id);
    room.lastMessageSenderId = new Types.ObjectId(userId);
    room.lastMessageText = this.buildPreview(
      content || this.buildAttachmentPreview(dto.type ?? ChatMessageType.FILE),
    );
    room.lastMessageAt = sentAt;
    room.lastActivityAt = sentAt;
    room.messageCount = (room.messageCount ?? 0) + 1;

    const senderState = this.getParticipantState(room, userId);
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
        referenceId: String(message._id),
        dedupeKey: `chat-message:${String(message._id)}`,
        action: {
          screen: 'ChatDetails',
          params: {
            roomId: String(room._id),
            userId,
          },
        },
        metadata: {
          roomId: String(room._id),
          messageId: String(message._id),
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

    const allowedMimePattern = /^(image|video)\//i;
    for (const file of files) {
      if (!allowedMimePattern.test(file.mimetype)) {
        throwBadRequest(ErrorCode.CHAT_ATTACHMENT_INVALID, {
          reason: 'unsupported_chat_attachment_type',
        });
      }
    }

    const uploaded = await this.storageService.uploadFiles(files, 'chat');

    return uploaded.map((file, index) => ({
      url: file.url,
      name: files[index]?.originalname,
      mimeType: files[index]?.mimetype,
      size: files[index]?.size,
    }));
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
    const [users, profiles] = await Promise.all([
      this.repo.findUsersByIds(participantIds),
      this.repo.findProfilesByUserIds(participantIds),
    ]);
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const profileMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );
    const lastMessageMap = await this.buildLastMessageMap([room]);

    for (const participantId of participantIds) {
      const unreadRows = await this.repo.countUnreadByRoomIds(participantId, [
        room.id as string,
      ]);
      const conversation = this.mapConversation(
        room,
        participantId,
        userMap,
        profileMap,
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
    if (room.status !== ChatRoomStatus.ACTIVE) {
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

  private mapConversation(
    room: {
      _id: unknown;
      roomType: ChatRoomType;
      status: ChatRoomStatus;
      participants: Array<Types.ObjectId | string>;
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
    unreadCount: number,
    lastMessageMap: Map<string, MessageLike> = new Map(),
  ): ConversationResponse {
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
      participant: this.buildUserSummary(otherUserId, userMap, profileMap),
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

  private buildUserSummary(
    userId: string,
    userMap: Map<string, UserLike>,
    profileMap: Map<string, ProfileLike>,
  ): UserSummary {
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

    const city =
      typeof profile?.personal?.city === 'string'
        ? profile.personal.city
        : undefined;

    const country =
      typeof profile?.personal?.country === 'string'
        ? profile.personal.country
        : undefined;

    const isVerified = Boolean(profile?.isVerified);

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
      avatarUrl:
        typeof primaryImage?.url === 'string' ? primaryImage.url : undefined,
      city,
      country,
      isVerified,
      isPremium,
      isOnline: this.presence.isOnline(userId),
      lastSeen: this.presence.getLastSeen(userId),
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

      if (
        attachment.mimeType &&
        !/^(image|video)\//i.test(attachment.mimeType)
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
