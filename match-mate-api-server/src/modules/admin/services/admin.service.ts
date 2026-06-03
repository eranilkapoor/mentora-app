import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AdminRepository } from '../repositories/admin.repository';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { BroadcastDto, BroadcastTarget } from '../dto/broadcast.dto';
import { AdminQueryDto } from '../dto/admin-query.dto';
import { FilterQuery, Model, Types } from 'mongoose';
import { UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
  MediaModerationStatus,
} from '@/modules/profiles/schemas/media/media.schema';
import {
  Verification,
  VerificationDocument,
  VerificationStatus,
} from '@/modules/safety/schemas/verification.schema';
import {
  UserReport,
  UserReportDocument,
} from '@/modules/safety/schemas/user-report.schema';
import {
  Payment,
  PaymentDocument,
} from '@/modules/payments/schemas/payment.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '@/modules/subscriptions/schemas/subscription.schema';
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum';
import { SubscriptionStatus } from '@/common/enums';
import { Status } from '@/common/enums';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';
import { AnalyticsQueryDto } from '@/modules/analytics/dto/analytics-query.dto';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { NotificationChannel } from '@/modules/notifications/notification.constants';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { AdminAuditService } from './admin-audit.service';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';

@Injectable()
export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly auditService: AdminAuditService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationsService: NotificationsService,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    @InjectModel(UserReport.name)
    private readonly reportModel: Model<UserReportDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
  ) {}

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
      filter.status = Status.BLOCKED;
    } else if (query.status === 'active') {
      filter.status = Status.ACTIVE;
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
    const userObjectId = new Types.ObjectId(userId);
    const [user, profile, verification, payments, subscriptions, reports] =
      await Promise.all([
        this.repo.findUserById(userId),
        this.profileModel.findOne({ userId: userObjectId }).lean().exec(),
        this.verificationModel.findOne({ userId: userObjectId }).lean().exec(),
        this.paymentModel
          .find({ userId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('-gatewayPayload')
          .lean()
          .exec(),
        this.subscriptionModel
          .find({ userId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
          .exec(),
        this.reportModel
          .find({ reportedUserId: userObjectId })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .exec(),
      ]);

    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);
    return {
      user,
      profile,
      verification,
      payments,
      subscriptions,
      reports,
      risk: {
        reportCount: reports.length,
        status: user.status,
        isBlocked: user.status === Status.BLOCKED,
        kycStatus: verification?.status,
        profileCompletionPercentage: profile?.profileCompletionPercentage,
      },
    };
  }

  async updateUserStatus(
    dto: UpdateUserStatusDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    if (dto.isBlocked === undefined && dto.isVerified === undefined) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'admin_user_status_update_empty',
      });
    }

    const user = await this.repo.findUserById(dto.userId);
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    const update: { status?: Status } = {};
    if (dto.isVerified !== undefined) {
      update.status = dto.isVerified ? Status.VERIFIED : Status.ACTIVE;
    }
    if (dto.isBlocked !== undefined) {
      update.status = dto.isBlocked ? Status.BLOCKED : Status.ACTIVE;
    }

    const updated = await this.repo.updateUserStatus(dto.userId, update);

    if (actorId) {
      await this.auditService.write({
        req,
        actorId,
        action: 'user.status_updated',
        resource: 'user',
        targetId: dto.userId,
        reason: dto.reason,
        before: {
          status: user.status,
        },
        after: {
          status: updated?.status,
        },
      });
    }

    return updated;
  }

  async broadcast(
    dto: BroadcastDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    const targetLabel = dto.target ?? BroadcastTarget.ALL;
    const channels = dto.channels ?? ['in_app'];
    const users = await this.repo.findUsersForBroadcast(
      this.buildBroadcastFilter(targetLabel),
    );

    const results = await Promise.allSettled(
      users.map((user) =>
        this.notificationsService.notify({
          userId: String(user._id),
          title: dto.title,
          message: dto.message,
          category: 'system',
          type: 'system',
          channels: channels as NotificationChannel[],
          priority: 'normal',
          actorId,
          dedupeKey: `admin-broadcast-${targetLabel}-${dto.title}-${String(user._id)}`,
          metadata: {
            source: 'admin_broadcast',
            target: targetLabel,
          },
        }),
      ),
    );

    const failed = results.filter((result) => result.status === 'rejected');

    if (actorId) {
      await this.auditService.write({
        req,
        actorId,
        action: 'broadcast.sent',
        resource: 'notification',
        reason: `Admin broadcast to ${targetLabel}`,
        after: {
          title: dto.title,
          channels,
          target: targetLabel,
          targetedUsers: users.length,
          failed: failed.length,
        },
      });
    }

    return {
      success: true,
      message: `Broadcast queued for ${users.length} ${targetLabel} users via ${channels.join(', ')}`,
      target: targetLabel,
      targetedUsers: users.length,
      failed: failed.length,
    };
  }

  async getModerationQueue() {
    const [media, kyc, reports] = await Promise.all([
      this.mediaModel
        .find({
          moderationStatus: {
            $in: [MediaModerationStatus.FLAGGED, MediaModerationStatus.PENDING],
          },
        })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean()
        .exec(),
      this.verificationModel
        .find({ status: VerificationStatus.PENDING })
        .sort({ submittedAt: 1, createdAt: 1 })
        .limit(100)
        .lean()
        .exec(),
      this.reportModel.find().sort({ createdAt: 1 }).limit(100).lean().exec(),
    ]);

    return {
      counts: {
        media: media.length,
        kyc: kyc.length,
        reports: reports.length,
      },
      items: [
        ...media.map((item) => ({
          type: 'media',
          id: String(item._id),
          userId: String(item.userId),
          status: item.moderationStatus,
          reason: item.moderationReasons?.join(', '),
          createdAt: (item as { createdAt?: Date }).createdAt,
          payload: item,
        })),
        ...kyc.map((item) => ({
          type: 'kyc',
          id: String(item._id),
          userId: String(item.userId),
          status: item.status,
          reason: item.rejectionReason,
          createdAt:
            item.submittedAt ?? (item as { createdAt?: Date }).createdAt,
          payload: item,
        })),
        ...reports.map((item) => ({
          type: 'report',
          id: String(item._id),
          userId: String(item.reportedUserId),
          status: 'reported',
          reason: item.reason,
          createdAt: (item as { createdAt?: Date }).createdAt,
          payload: item,
        })),
      ].sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aDate - bDate;
      }),
    };
  }

  async getDashboard(query: AnalyticsQueryDto) {
    const now = new Date();
    const fromDate = query.from
      ? new Date(query.from)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const toDate = query.to ? new Date(query.to) : now;

    const [
      analyticsOverview,
      users,
      revenue,
      activeSubscriptions,
      pendingMedia,
      pendingKyc,
      reports,
    ] = await Promise.all([
      this.analyticsService.getOverview({
        ...query,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      }),
      this.repo.countUsers({
        createdAt: { $gte: fromDate, $lte: toDate },
      } as FilterQuery<UserDocument>),
      this.paymentModel
        .aggregate<{ _id: string; total: number; count: number }>([
          {
            $match: {
              status: PaymentStatus.SUCCESS,
              paidAt: { $gte: fromDate, $lte: toDate },
            },
          },
          {
            $group: {
              _id: '$currency',
              total: { $sum: '$netAmount' },
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.subscriptionModel
        .countDocuments({
          status: {
            $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
          },
          endDate: { $gt: now },
        })
        .exec(),
      this.mediaModel
        .countDocuments({
          moderationStatus: {
            $in: [MediaModerationStatus.FLAGGED, MediaModerationStatus.PENDING],
          },
        })
        .exec(),
      this.verificationModel
        .countDocuments({ status: VerificationStatus.PENDING })
        .exec(),
      this.reportModel.countDocuments().exec(),
    ]);

    return {
      range: { fromDate, toDate },
      analytics: analyticsOverview,
      users: {
        registeredInRange: users,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
      revenue,
      moderation: {
        pendingMedia,
        pendingKyc,
        reports,
      },
    };
  }

  private buildBroadcastFilter(target: BroadcastTarget) {
    switch (target) {
      case BroadcastTarget.PREMIUM:
        return { 'membership.tier': { $ne: 'free' }, status: Status.ACTIVE };
      case BroadcastTarget.UNVERIFIED:
        return {
          $and: [
            { status: Status.ACTIVE },
            { isEmailVerified: false },
            { isPhoneVerified: false },
          ],
        };
      case BroadcastTarget.BLOCKED:
        return { status: Status.BLOCKED };
      case BroadcastTarget.ACTIVE:
        return { status: Status.ACTIVE };
      case BroadcastTarget.ALL:
      default:
        return {};
    }
  }
}
