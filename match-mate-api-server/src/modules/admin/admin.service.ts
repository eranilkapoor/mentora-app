import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { BroadcastDto } from './dto/broadcast.dto';

interface AdminUsersQuery {
  search?: string;
  page?: number;
  limit?: number;
}

interface AdminUsersFilter {
  $or?: Array<{
    email?: { $regex: string; $options: string };
    phone?: { $regex: string; $options: string };
  }>;
}

@Injectable()
export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  getUsers(query: AdminUsersQuery) {
    const filter: AdminUsersFilter = {};
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (query.search) {
      filter.$or = [
        { email: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    return this.repo.findUsers(filter, (page - 1) * limit, limit);
  }

  updateUserStatus(dto: UpdateUserStatusDto) {
    return this.repo.updateUserStatus(dto.userId, {
      isBlocked: dto.isBlocked,
      isVerified: dto.isVerified,
    });
  }

  broadcast(dto: BroadcastDto) {
    void dto;
    // Hook: NotificationService / FCM / Email
    return { success: true, message: 'Broadcast sent' };
  }
}
