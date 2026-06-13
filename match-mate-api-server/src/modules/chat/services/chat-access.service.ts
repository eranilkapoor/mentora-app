import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwForbidden,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatRoomDocument } from '../schemas/chat-room.schema';
import { ChatRoomStatus } from '../enums/chat.enums';

@Injectable()
export class ChatAccessService {
  constructor(private readonly repo: ChatRepository) {}

  ensureValidObjectId(value: string, reason = 'invalid_object_id'): void {
    if (!Types.ObjectId.isValid(value)) {
      throwBadRequest(ErrorCode.INVALID_ID, { reason });
    }
  }

  async getAuthorizedRoom(
    userId: string,
    roomId: string,
    allowedStatuses: ChatRoomStatus[] = [ChatRoomStatus.ACTIVE],
  ): Promise<ChatRoomDocument> {
    this.ensureValidObjectId(roomId, 'invalid_room_id');
    const room = await this.repo.findRoomById(roomId);

    if (!room) return throwNotFound(ErrorCode.CHAT_NOT_FOUND);

    const participantIds = room.participants.map((participantId) =>
      String(participantId),
    );
    if (!participantIds.includes(userId)) {
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED);
    }

    if (!allowedStatuses.includes(room.status)) {
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
        reason: 'chat_room_status_not_allowed',
        status: room.status,
      });
    }

    const otherParticipantId = participantIds.find(
      (participantId) => participantId !== userId,
    );
    if (!otherParticipantId) {
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
        reason: 'invalid_chat_room_participants',
      });
      return room;
    }

    await this.ensureNotBlocked(userId, otherParticipantId);

    return room;
  }

  async ensureUsersExist(userIds: string[]): Promise<void> {
    const users = await this.repo.findUsersByIds(userIds);
    if (users.length !== userIds.length) {
      throwNotFound(ErrorCode.USER_NOT_FOUND, {
        reason: 'one_or_more_chat_users_not_found',
      });
    }
  }

  async ensureMessagingAllowed(
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    const blockedRelation = await this.repo.findBlockedRelation(
      userId,
      targetUserId,
    );
    if (blockedRelation) this.throwBlockedRelation();

    const communicationSettingsRows =
      await this.repo.findCommunicationSettingsByUserIds([targetUserId]);
    const targetCommunicationSettings = communicationSettingsRows[0];
    const rule = targetCommunicationSettings?.whoCanMessage ?? 'all';
    if (rule === 'all') {
      return;
    }

    const [match, room] = await Promise.all([
      this.repo.findActiveMatchBetween(userId, targetUserId),
      this.repo.findDirectRoomByUsers(userId, targetUserId),
    ]);

    if (!match && !room) {
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
        reason: 'recipient_communication_restricted',
      });
    }
  }

  private async ensureNotBlocked(
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    const blockedRelation = await this.repo.findBlockedRelation(
      userId,
      targetUserId,
    );
    if (blockedRelation) this.throwBlockedRelation();
  }

  private throwBlockedRelation(): never {
    return throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
      reason: 'blocked_relation',
    });
  }
}
