import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepo: NotificationRepository,
  ) {}

  async notify(dto: CreateNotificationDto) {
    const notification = await this.notificationRepo.create({
      ...dto,
      userId: new Types.ObjectId(dto.userId),
    });

    /**
     * Hooks:
     * - Send FCM Push
     * - Send Email
     * - Publish Redis Event
     */

    return notification;
  }

  getUserNotifications(userId: string) {
    return this.notificationRepo.findByUser(userId);
  }

  markRead(notificationId: string) {
    return this.notificationRepo.markAsRead(notificationId);
  }

  markAllRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }
}