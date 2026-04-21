import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationService } from '../../notification/services/notification.service';
import { ChatPresenceService } from './chat-presence.service';
import { ChatRealtimeService } from './chat-realtime.service';
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
    text?: string;
    senderId?: string;
    sentAt?: Date;
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

@Injectable()
export class ChatService {
  constructor(
    private readonly repo: ChatRepository,
    private readonly presence: ChatPresenceService,
    private readonly realtime: ChatRealtimeService,
    private readonly notificationService: NotificationService,
  ) {}

  health() {
    return {
      status: 'ok',
      transport: 'socket.io',
      timestamp: new Date().toISOString(),
    };
  }

  async createOrGetDirectRoom(userId: string, dto: CreateDirectRoomDto) {
    this.ensureValidObjectId(userId, 'Invalid user id');
    this.ensureValidObjectId(dto.targetUserId, 'Invalid target user id');

    if (userId === dto.targetUserId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    await this.ensureUsersExist([userId, dto.targetUserId]);
    await this.ensureMessagingAllowed(userId, dto.targetUserId);

    let room = await this.repo.findDirectRoomByUsers(userId, dto.targetUserId);

    if (!room) {
      const match = await this.repo.findActiveMatchBetween(
        userId,
        dto.targetUserId,
      );

      if (!match) {
        throw new ForbiddenException(
          'Only matched users can start a direct conversation',
        );
      }

      room = await this.repo.createDirectRoom({
        createdById: userId,
        participantIds: [userId, dto.targetUserId],
        startedFromMatchId: String(match._id),
      });
    }

    if (dto.initialMessage?.trim()) {
      return this.sendMessage(userId, {
        roomId: room.id,
        content: dto.initialMessage,
        clientMessageId: dto.clientMessageId,
        attachments: [],
        type: ChatMessageType.TEXT,
      });
    }

    return this.getConversationDetail(userId, room.id);
  }

  async getConversations(userId: string, query: ListConversationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const candidateLimit = query.search
      ? Math.max(limit * 5, 100)
      : page * limit;

    const rooms = await this.repo.listRoomsForUser(userId, candidateLimit);
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

    let items = rooms
      .filter((room) =>
        this.shouldIncludeRoom(room, userId, query.includeArchived ?? false),
      )
      .map((room) =>
        this.mapConversation(
          room,
          userId,
          userMap,
          profileMap,
          unreadMap.get(String(room._id)) ?? 0,
        ),
      );

    if (query.onlyUnread) {
      items = items.filter((item) => item.unreadCount > 0);
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

    const contactUserIds = Array.from(
      new Set([...matchedUserIds, ...roomPartnerIds]),
    );
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
    const room = await this.getAuthorizedRoom(userId, roomId);
    const otherUserId = this.getOtherParticipantId(room.participants, userId);
    const unreadRows = await this.repo.countUnreadByRoomIds(userId, [roomId]);
    const [users, profiles] = await Promise.all([
      this.repo.findUsersByIds([otherUserId]),
      this.repo.findProfilesByUserIds([otherUserId]),
    ]);

    return this.mapConversation(
      room,
      userId,
      new Map(users.map((user) => [String(user._id), user])),
      new Map(profiles.map((profile) => [String(profile.userId), profile])),
      unreadRows[0]?.count ?? 0,
    );
  }

  async getMessages(userId: string, roomId: string, query: ListMessagesDto) {
    await this.getAuthorizedRoom(userId, roomId);

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
    const room = await this.getAuthorizedRoom(userId, dto.roomId);
    const receiverId = this.getOtherParticipantId(room.participants, userId);

    await this.ensureMessagingAllowed(userId, receiverId);

    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const message = await this.repo.createMessage({
      roomId: dto.roomId,
      senderId: userId,
      receiverId,
      content,
      type: dto.type ?? ChatMessageType.TEXT,
      attachments: dto.attachments ?? [],
      replyToMessageId: dto.replyToMessageId,
      clientMessageId: dto.clientMessageId,
    });

    const sentAt = (message as { createdAt?: Date }).createdAt ?? new Date();
    room.lastMessageId = this.toObjectId(message._id);
    room.lastMessageSenderId = new Types.ObjectId(userId);
    room.lastMessageText = this.buildPreview(content);
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
    this.realtime.emitToConversation(room.id, 'message:new', messagePayload);
    await this.emitConversationUpdates(room);

    await this.notificationService.notify({
      userId: receiverId,
      title: 'New message',
      message: this.buildNotificationPreview(content),
      type: 'chat',
      metadata: {
        roomId: room.id,
        senderId: userId,
      },
    });

    return messagePayload;
  }

  async markRoomRead(userId: string, roomId: string, dto: MarkRoomReadDto) {
    const room = await this.getAuthorizedRoom(userId, roomId);

    if (dto.upToMessageId) {
      const anchorMessage = await this.repo.findMessageById(dto.upToMessageId);
      if (!anchorMessage || String(anchorMessage.roomId) !== roomId) {
        throw new BadRequestException('Invalid read cursor');
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
    const room = await this.getAuthorizedRoom(userId, roomId);
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

    for (const participantId of participantIds) {
      const unreadRows = await this.repo.countUnreadByRoomIds(participantId, [
        room.id,
      ]);
      const conversation = this.mapConversation(
        room,
        participantId,
        userMap,
        profileMap,
        unreadRows[0]?.count ?? 0,
      );

      this.realtime.emitToUser(
        participantId,
        'conversation:updated',
        conversation,
      );
    }
  }

  private async getAuthorizedRoom(userId: string, roomId: string) {
    this.ensureValidObjectId(roomId, 'Invalid room id');
    const room = await this.repo.findRoomById(roomId);

    if (!room) {
      throw new NotFoundException('Chat room not found');
    }

    const participantIds = room.participants.map((participantId) =>
      String(participantId),
    );
    if (!participantIds.includes(userId)) {
      throw new ForbiddenException(
        'You are not allowed to access this chat room',
      );
    }

    return room;
  }

  private async ensureUsersExist(userIds: string[]) {
    const users = await this.repo.findUsersByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more chat users were not found');
    }
  }

  private async ensureMessagingAllowed(userId: string, targetUserId: string) {
    const blockedRelation = await this.repo.findBlockedRelation(
      userId,
      targetUserId,
    );
    if (blockedRelation) {
      throw new ForbiddenException(
        'Messaging is not allowed between these users',
      );
    }

    const privacyRows = await this.repo.findPrivacySettingsByUserIds([
      targetUserId,
    ]);
    const targetPrivacy = privacyRows[0];
    const rule = targetPrivacy?.allowMessagesFrom ?? 'all';
    if (rule === 'all') {
      return;
    }

    const [match, room] = await Promise.all([
      this.repo.findActiveMatchBetween(userId, targetUserId),
      this.repo.findDirectRoomByUsers(userId, targetUserId),
    ]);

    if (!match && !room) {
      throw new ForbiddenException(
        'Recipient privacy settings do not allow this chat',
      );
    }
  }

  private shouldIncludeRoom(
    room: {
      participantStates?: Array<{
        userId: Types.ObjectId | string;
        archivedAt?: Date;
      }>;
    },
    currentUserId: string,
    includeArchived: boolean,
  ) {
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
      throw new BadRequestException('Invalid chat room state');
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
      lastMessageSenderId?: Types.ObjectId | string;
      lastMessageAt?: Date;
      messageCount?: number;
      lastActivityAt?: Date;
      updatedAt?: Date;
    },
    currentUserId: string,
    userMap: Map<string, any>,
    profileMap: Map<string, any>,
    unreadCount: number,
  ): ConversationResponse {
    const otherUserId = this.getOtherParticipantId(
      room.participants,
      currentUserId,
    );
    const state = this.getParticipantState(room, currentUserId);

    return {
      roomId: String(room._id),
      type: room.roomType,
      status: room.status,
      participant: this.buildUserSummary(otherUserId, userMap, profileMap),
      lastMessage: room.lastMessageText
        ? {
            text: room.lastMessageText,
            senderId: room.lastMessageSenderId
              ? String(room.lastMessageSenderId)
              : undefined,
            sentAt: room.lastMessageAt,
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

  private mapMessage(message: any) {
    return {
      id: String(message._id),
      roomId: String(message.roomId),
      senderId: String(message.senderId),
      receiverId: String(message.receiverId),
      type: message.type,
      content: message.content,
      attachments: message.attachments ?? [],
      replyToMessageId: message.replyToMessageId
        ? String(message.replyToMessageId)
        : undefined,
      status: message.status,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      clientMessageId: message.clientMessageId,
    };
  }

  private buildUserSummary(
    userId: string,
    userMap: Map<string, any>,
    profileMap: Map<string, any>,
  ): UserSummary {
    const user = userMap.get(userId);
    const profile = profileMap.get(userId);
    const firstName = profile?.personal?.firstName ?? 'User';
    const lastName = profile?.personal?.lastName;
    const primaryImage =
      profile?.profileImages?.find(
        (image: { isPrimary?: boolean; isActive?: boolean }) =>
          image.isActive !== false && image.isPrimary,
      ) ??
      profile?.profileImages?.find(
        (image: { isActive?: boolean }) => image.isActive !== false,
      );

    return {
      userId,
      fullName: [firstName, lastName].filter(Boolean).join(' '),
      firstName,
      lastName,
      avatarUrl: primaryImage?.url,
      city: profile?.personal?.city,
      country: profile?.personal?.country,
      isVerified: Boolean(
        profile?.isVerified || user?.isEmailVerified || user?.isPhoneVerified,
      ),
      isPremium: Boolean(
        profile?.isPremium || user?.membership?.tier !== 'free',
      ),
      isOnline: this.presence.isOnline(userId),
      lastSeen: this.presence.getLastSeen(userId),
    };
  }

  private getOtherParticipantId(
    participantIds: Array<Types.ObjectId | string>,
    currentUserId: string,
  ) {
    const otherUserId = participantIds
      .map((participantId) => String(participantId))
      .find((participantId) => participantId !== currentUserId);

    if (!otherUserId) {
      throw new BadRequestException('Invalid chat room participants');
    }

    return otherUserId;
  }

  private ensureValidObjectId(value: string, message: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(message);
    }
  }

  private buildPreview(content: string) {
    return content.length > 120 ? `${content.slice(0, 117)}...` : content;
  }

  private buildNotificationPreview(content: string) {
    return content.length > 80 ? `${content.slice(0, 77)}...` : content;
  }

  private toObjectId(value: unknown) {
    if (value instanceof Types.ObjectId) {
      return value;
    }

    if (typeof value === 'string') {
      return new Types.ObjectId(value);
    }

    throw new BadRequestException('Invalid object id');
  }
}
