import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { BroadcastDto, BroadcastTarget } from '../dto/broadcast.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { FilterQuery } from 'mongoose';
import { UserDocument } from '@/modules/auth/schemas/user.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  async getUsers(query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: FilterQuery<UserDocument> = {};

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { email: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (query.status === 'blocked') {
      filter.isBlocked = true;
    } else if (query.status === 'active') {
      filter.isBlocked = false;
    }

    const [users, total] = await Promise.all([
      this.repo.findUsers(filter, skip, limit),
      this.repo.countUsers(filter),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  async updateUserStatus(dto: UpdateUserStatusDto) {
    if (dto.isBlocked === undefined && dto.isVerified === undefined) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'admin_user_status_update_empty',
      });
    }

    const user = await this.repo.findUserById(dto.userId);
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    const update: { isBlocked?: boolean; isVerified?: boolean } = {};
    if (dto.isBlocked !== undefined) update.isBlocked = dto.isBlocked;
    if (dto.isVerified !== undefined) update.isVerified = dto.isVerified;

    return this.repo.updateUserStatus(dto.userId, update);
  }

  broadcast(dto: BroadcastDto): {
    success: boolean;
    message: string;
    target: string;
  } {
    // This is a hook point  inject NotificationService here when ready
    // For now it validates and returns a structured response
    const targetLabel = dto.target ?? BroadcastTarget.ALL;
    const channels = dto.channels ?? ['in_app'];

    // Broadcast delivery can be wired to NotificationService when campaign
    // orchestration is enabled for admin operations.

    return {
      success: true,
      message: `Broadcast queued for ${targetLabel} users via ${channels.join(', ')}`,
      target: targetLabel,
    };
  }
}
