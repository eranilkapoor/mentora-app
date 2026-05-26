import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { ErrorCode } from 'src/common/constants';
import {
  throwBadRequest,
  throwForbidden,
  throwNotFound,
} from 'src/common/exceptions/throw-app-exception';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatRoomDocument } from '../schemas/chat-room.schema';

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
    if (blockedRelation) {
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
        reason: 'blocked_relation',
      });
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
      throwForbidden(ErrorCode.CHAT_ACCESS_DENIED, {
        reason: 'recipient_privacy_restricted',
      });
    }
  }
}
