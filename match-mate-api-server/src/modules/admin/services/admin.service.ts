import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { BroadcastDto, BroadcastTarget } from '../dto/broadcast.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { FilterQuery } from 'mongoose';
import { UserDocument } from 'src/modules/auth/schemas/user.schema';

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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUserStatus(dto: UpdateUserStatusDto) {
    if (dto.isBlocked === undefined && dto.isVerified === undefined) {
      throw new BadRequestException(
        'At least one of isBlocked or isVerified must be provided',
      );
    }

    const user = await this.repo.findUserById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

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
    // This is a hook point — inject NotificationService here when ready
    // For now it validates and returns a structured response
    const targetLabel = dto.target ?? BroadcastTarget.ALL;
    const channels = dto.channels ?? ['in_app'];

    // TODO: inject and call NotificationService.broadcastToAll(dto)
    // await this.notificationService.broadcast({ ...dto, channels });

    return {
      success: true,
      message: `Broadcast queued for ${targetLabel} users via ${channels.join(', ')}`,
      target: targetLabel,
    };
  }
}
