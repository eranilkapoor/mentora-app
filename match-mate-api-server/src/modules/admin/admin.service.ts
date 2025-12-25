import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { BroadcastDto } from './dto/broadcast.dto';

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  getUsers(query: any) {
    const filter: any = {};

    if (query.search) {
      filter.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.repo.findUsers(
      filter,
      (query.page - 1) * query.limit,
      query.limit,
    );
  }

  updateUserStatus(dto: UpdateUserStatusDto) {
    return this.repo.updateUserStatus(dto.userId, {
      isBlocked: dto.isBlocked,
      isVerified: dto.isVerified,
    });
  }

  broadcast(dto: BroadcastDto) {
    // Hook: NotificationService / FCM / Email
    return { success: true, message: 'Broadcast sent' };
  }
}
