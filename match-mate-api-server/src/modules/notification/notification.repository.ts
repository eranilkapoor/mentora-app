import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
  ) {}

  create(data: Partial<Notification>) {
    return this.model.create(data);
  }

  findByUser(userId: string) {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  markAsRead(notificationId: string) {
    return this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
  }

  markAllAsRead(userId: string) {
    return this.model.updateMany(
      { userId: new Types.ObjectId(userId) },
      { isRead: true },
    );
  }
}