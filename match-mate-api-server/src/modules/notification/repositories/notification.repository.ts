import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import {
  NotificationTemplates,
  NotificationTemplatesDocument,
} from '../schemas/notification-templates.schema';
import {
  NotificationLogs,
  NotificationLogsDocument,
} from '../schemas/notification-logs.schema';
import {
  UserNotificationSettings,
  UserNotificationSettingsDocument,
} from '../schemas/user-notification-settings.schema';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import {
  DeliveryLogChannel,
  DeliveryLogStatus,
} from '../notification.constants';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,

    @InjectModel(NotificationTemplates.name)
    private readonly templateModel: Model<NotificationTemplatesDocument>,

    @InjectModel(NotificationLogs.name)
    private readonly logModel: Model<NotificationLogsDocument>,

    @InjectModel(UserNotificationSettings.name)
    private readonly settingsModel: Model<UserNotificationSettingsDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  create(data: Partial<Notification>) {
    return this.model.create(data);
  }

  findById(notificationId: string) {
    return this.model.findById(notificationId).lean();
  }

  async findByUser(
    userId: string,
    query: {
      page: number;
      limit: number;
      unreadOnly?: boolean;
      category?: string;
      type?: string;
    },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
      isDeleted: { $ne: true },
    };

    if (query.unreadOnly) {
      filter.isRead = false;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.type) {
      filter.type = query.type;
    }

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  countUnread(userId: string) {
    return this.model.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
      isDeleted: { $ne: true },
    });
  }

  markAsRead(notificationId: string, userId?: string) {
    const filter: Record<string, unknown> = {
      _id: new Types.ObjectId(notificationId),
      isDeleted: { $ne: true },
    };

    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    return this.model.findOneAndUpdate(
      filter,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  markAllAsRead(userId: string) {
    return this.model.updateMany(
      {
        userId: new Types.ObjectId(userId),
        isDeleted: { $ne: true },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );
  }

  updateDeliveryStatus(
    notificationId: string,
    patch: {
      isSentPush?: boolean;
      isSentEmail?: boolean;
      isSentSms?: boolean;
      hasDeliveryFailure?: boolean;
      delivery?: Record<string, unknown>;
    },
  ) {
    return this.model.findByIdAndUpdate(
      notificationId,
      { $set: patch },
      { new: true },
    );
  }

  findTemplateByKey(key: string) {
    return this.templateModel.findOne({ key }).lean();
  }

  listTemplates(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return this.templateModel.find(filter).sort({ key: 1 }).lean();
  }

  upsertTemplate(key: string, data: Partial<NotificationTemplates>) {
    const { ...dataWithoutKey } = data;

    return this.templateModel.findOneAndUpdate(
      { key },
      {
        $set: dataWithoutKey,
        $setOnInsert: {
          key,
          version: 1,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }

  createDeliveryLog(data: Partial<NotificationLogs>) {
    return this.logModel.create(data);
  }

  updateDeliveryLog(
    logId: string,
    patch: Partial<NotificationLogs> & { status: DeliveryLogStatus },
  ) {
    return this.logModel.findByIdAndUpdate(
      logId,
      { $set: patch },
      { new: true },
    );
  }

  async getOrCreateUserSettings(userId: string) {
    const objectId = new Types.ObjectId(userId);
    const existing = await this.settingsModel
      .findOne({ userId: objectId })
      .lean();

    if (existing) {
      return existing;
    }

    const created = await this.settingsModel.create({
      userId: objectId,
      inAppEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      doNotDisturb: false,
      quietHours: {
        enabled: false,
        timezone: 'UTC',
      },
      preferences: {
        interestReceived: { inApp: true, push: true, email: true, sms: false },
        interestAccepted: { inApp: true, push: true, email: true, sms: false },
        profileView: { inApp: true, push: false, email: false, sms: false },
        matchFound: { inApp: true, push: true, email: true, sms: false },
        messageReceived: { inApp: true, push: true, email: false, sms: false },
        subscription: { inApp: true, push: true, email: true, sms: false },
        system: { inApp: true, push: true, email: true, sms: false },
      },
    });

    return created.toObject();
  }

  updateUserSettings(userId: string, patch: Partial<UserNotificationSettings>) {
    return this.settingsModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: patch },
      { new: true, upsert: true },
    );
  }

  findUserById(userId: string) {
    return this.userModel.findById(userId).lean();
  }

  async getDeliveryAnalytics(query: {
    days: number;
    channel?: DeliveryLogChannel;
    templateKey?: string;
  }) {
    const since = new Date(Date.now() - query.days * 24 * 60 * 60 * 1000);
    const match: Record<string, unknown> = { createdAt: { $gte: since } };

    if (query.channel) {
      match.channel = query.channel;
    }

    if (query.templateKey) {
      match.templateKey = query.templateKey.trim().toUpperCase();
    }

    const [overall, byChannelRaw, byTemplateRaw, trendRaw] = await Promise.all([
      this.logModel.aggregate<{
        total: number;
        sent: number;
        failed: number;
        skipped: number;
        pending: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            skipped: {
              $sum: { $cond: [{ $eq: ['$status', 'skipped'] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            sent: 1,
            failed: 1,
            skipped: 1,
            pending: 1,
          },
        },
      ]),
      this.logModel.aggregate<{
        _id: { channel: string; status: string };
        count: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              channel: '$channel',
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.channel': 1 } },
      ]),
      this.logModel.aggregate<{
        _id: { templateKey: string; status: string };
        count: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              templateKey: { $ifNull: ['$templateKey', 'UNSPECIFIED'] },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      this.logModel.aggregate<{
        _id: { day: string; status: string };
        count: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              day: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                },
              },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.day': 1 } },
      ]),
    ]);

    const base = overall[0] ?? {
      total: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
    };

    const successRate =
      base.total > 0 ? Number((base.sent / base.total).toFixed(4)) : 0;
    const failureRate =
      base.total > 0 ? Number((base.failed / base.total).toFixed(4)) : 0;

    const byChannelMap = new Map<string, Record<string, number>>();
    for (const row of byChannelRaw) {
      const channel = row._id.channel;
      const current = byChannelMap.get(channel) ?? {
        sent: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
      };
      current[row._id.status] = row.count;
      byChannelMap.set(channel, current);
    }

    const byTemplateMap = new Map<string, Record<string, number>>();
    for (const row of byTemplateRaw) {
      const templateKey = row._id.templateKey;
      const current = byTemplateMap.get(templateKey) ?? {
        sent: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
      };
      current[row._id.status] = row.count;
      byTemplateMap.set(templateKey, current);
    }

    const trendMap = new Map<string, Record<string, number>>();
    for (const row of trendRaw) {
      const day = row._id.day;
      const current = trendMap.get(day) ?? {
        sent: 0,
        failed: 0,
        skipped: 0,
        pending: 0,
      };
      current[row._id.status] = row.count;
      trendMap.set(day, current);
    }

    return {
      window: {
        from: since,
        to: new Date(),
        days: query.days,
        channel: query.channel ?? null,
        templateKey: query.templateKey ?? null,
      },
      overall: {
        ...base,
        successRate,
        failureRate,
      },
      byChannel: Array.from(byChannelMap.entries()).map(([channel, stats]) => ({
        channel,
        total:
          (stats.sent ?? 0) +
          (stats.failed ?? 0) +
          (stats.skipped ?? 0) +
          (stats.pending ?? 0),
        sent: stats.sent ?? 0,
        failed: stats.failed ?? 0,
        skipped: stats.skipped ?? 0,
        pending: stats.pending ?? 0,
      })),
      byTemplate: Array.from(byTemplateMap.entries()).map(
        ([templateKey, stats]) => ({
          templateKey,
          total:
            (stats.sent ?? 0) +
            (stats.failed ?? 0) +
            (stats.skipped ?? 0) +
            (stats.pending ?? 0),
          sent: stats.sent ?? 0,
          failed: stats.failed ?? 0,
          skipped: stats.skipped ?? 0,
          pending: stats.pending ?? 0,
        }),
      ),
      trend: Array.from(trendMap.entries()).map(([day, stats]) => ({
        day,
        total:
          (stats.sent ?? 0) +
          (stats.failed ?? 0) +
          (stats.skipped ?? 0) +
          (stats.pending ?? 0),
        sent: stats.sent ?? 0,
        failed: stats.failed ?? 0,
        skipped: stats.skipped ?? 0,
        pending: stats.pending ?? 0,
      })),
    };
  }
}
