import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { AdminRepository } from '../repositories/admin.repository';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { BroadcastDto } from '../dto/broadcast.dto';
import { BroadcastTarget } from '../enums/broadcast.enums';
import { AdminQueryDto } from '../dto/admin-query.dto';
import {
  AdminAssignUserPlanDto,
  AdminCancelUserPlanDto,
  AdminCompleteUserSetupDto,
  AdminCreateUserProfileDto,
  AdminCreateUserDto,
  AdminProfileSection,
  AdminSettingsCategory,
  AdminUpdateUserProfileSectionDto,
  AdminUpdateUserSettingsDto,
} from '../dto/admin-user-operation.dto';
import { FilterQuery, Model, Types } from 'mongoose';
import { buildPaginationMeta } from '@/common/utils/pagination';
import { UserDocument } from '@/modules/auth/schemas/user.schema';
import { AuthProvider } from '@/modules/auth/enums/auth-provider.enum';
import { Media, MediaDocument } from '@/common/schemas/user-media.schema';
import { MediaModerationStatus } from '@/common/enums/user-media.enums';
import {
  StudentProfile,
  StudentProfileDocument,
} from '@/modules/learning/schemas/learning.schemas';
import {
  Verification,
  VerificationDocument,
} from '@/modules/safety/schemas/verification.schema';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
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
import { Role, Status, SubscriptionStatus } from '@/common/enums';
import { AnalyticsService } from '@/modules/analytics/services/analytics.service';
import { AnalyticsQueryDto } from '@/modules/analytics/dto/analytics-query.dto';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { AdminAuditService } from './admin-audit.service';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwConflict,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { SubscriptionsService } from '@/modules/subscriptions/services/subscriptions.service';
import { SettingsService } from '@/modules/settings/services/settings.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly repo: AdminRepository,
    private readonly auditService: AdminAuditService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationsService: NotificationsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly settingsService: SettingsService,
    @InjectModel(StudentProfile.name)
    private readonly profileModel: Model<StudentProfileDocument>,
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
      meta: buildPaginationMeta(total, page, limit),
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

  async createUser(
    dto: AdminCreateUserDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    if (!dto.email && !dto.phone) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'email_or_phone_required',
      });
    }

    if (dto.email && (await this.repo.findUserByEmail(dto.email))) {
      return throwConflict(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }

    if (
      dto.phone &&
      (await this.repo.findUserByPhone(dto.countryCode, dto.phone))
    ) {
      return throwConflict(ErrorCode.AUTH_PHONE_ALREADY_EXISTS);
    }

    const authAccounts = [];
    if (dto.email) {
      authAccounts.push({
        provider: AuthProvider.EMAIL,
        providerId: dto.email.toLowerCase(),
        passwordHash: dto.password
          ? await bcrypt.hash(dto.password, 10)
          : undefined,
        isVerified: dto.isEmailVerified ?? false,
        isPrimary: true,
      });
    }
    if (dto.phone) {
      authAccounts.push({
        provider: AuthProvider.PHONE,
        providerId: dto.phone,
        isVerified: dto.isPhoneVerified ?? false,
        isPrimary: !dto.email,
      });
    }

    const user = await this.repo.createUser({
      email: dto.email?.toLowerCase(),
      phone: dto.phone
        ? {
            countryCode: dto.countryCode ?? '+91',
            phone: dto.phone,
          }
        : undefined,
      status: dto.status ?? Status.ACTIVE,
      isEmailVerified: dto.isEmailVerified ?? false,
      isPhoneVerified: dto.isPhoneVerified ?? false,
      roles: dto.roles?.length ? dto.roles : [Role.USER],
      authAccounts,
      createdBy: actorId,
      updatedBy: actorId,
    });

    if (actorId) {
      await this.auditService.write({
        req,
        actorId,
        action: 'user.created',
        resource: 'user',
        targetId: String(user._id),
        reason: dto.reason,
        after: {
          email: user.email,
          phone: user.phone,
          status: user.status,
          roles: user.roles,
        },
      });
    }

    return this.repo.findUserById(String(user._id));
  }

  async completeUserSetup(
    userId: string,
    dto: AdminCompleteUserSetupDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    await this.ensureUserExists(userId);
    const result: Record<string, unknown> = {};

    if (dto.profile) {
      result.profile = await this.createUserProfile(
        userId,
        dto.profile,
        actorId,
        req,
      );
    }

    if (dto.subscription) {
      result.subscription = await this.assignUserPlan(
        userId,
        dto.subscription,
        actorId,
        req,
      );
    }

    return result;
  }

  async createUserProfile(
    userId: string,
    dto: AdminCreateUserProfileDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    await this.ensureUserExists(userId);
    const dtoRecord: Record<string, unknown> = { ...dto };
    const personal = dto.personal ?? dtoRecord;
    const academic =
      (dtoRecord.education as Record<string, unknown> | undefined) ??
      dto.academic ??
      {};
    const firstName =
      typeof personal.firstName === 'string'
        ? personal.firstName
        : typeof dtoRecord.firstName === 'string'
          ? dtoRecord.firstName
          : 'Student';
    const lastName =
      typeof personal.lastName === 'string' ? personal.lastName : undefined;
    const dateOfBirthValue =
      personal.dateOfBirth ?? dtoRecord.dateOfBirth ?? new Date('2000-01-01');
    const dateOfBirth =
      dateOfBirthValue instanceof Date
        ? dateOfBirthValue
        : typeof dateOfBirthValue === 'string' ||
            typeof dateOfBirthValue === 'number'
          ? new Date(dateOfBirthValue)
          : new Date('2000-01-01');
    const profile = await this.profileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $setOnInsert: {
            userId: new Types.ObjectId(userId),
            createdByUserId: new Types.ObjectId(actorId ?? userId),
            ownershipType: 'self_managed',
            registrationMode: 'admin_created',
          },
          $set: {
            firstName,
            lastName,
            dateOfBirth,
            gender:
              typeof personal.gender === 'string' ? personal.gender : undefined,
            email:
              typeof dtoRecord.email === 'string' ? dtoRecord.email : undefined,
            phone:
              typeof dtoRecord.phone === 'string' ? dtoRecord.phone : undefined,
            personal,
            academic,
            parents:
              (dtoRecord.family as Record<string, unknown> | undefined) ??
              dto.parents ??
              {},
            address: dto.address ?? {},
            coursePreference:
              dtoRecord.preferences ?? dto.coursePreference ?? {},
            status: 'active',
          },
        },
        { new: true, runValidators: true, upsert: true },
      )
      .lean()
      .exec();
    await this.writeUserOperationAudit(
      req,
      actorId,
      'user.profile_created',
      userId,
      {
        sections: Object.keys(dto),
      },
    );
    return profile;
  }

  async updateUserProfileSection(
    userId: string,
    dto: AdminUpdateUserProfileSectionDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    await this.ensureUserExists(userId);
    const before = await this.profileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
    const update: Record<string, unknown> = {};

    switch (dto.section) {
      case AdminProfileSection.PERSONAL:
        update.personal = dto.data;
        if (typeof dto.data.firstName === 'string') {
          update.firstName = dto.data.firstName;
        }
        if (typeof dto.data.lastName === 'string') {
          update.lastName = dto.data.lastName;
        }
        if (typeof dto.data.gender === 'string') {
          update.gender = dto.data.gender;
        }
        if (typeof dto.data.dateOfBirth === 'string') {
          update.dateOfBirth = new Date(dto.data.dateOfBirth);
        }
        break;
      case AdminProfileSection.PHYSICAL:
        update['personal.physical'] = dto.data;
        break;
      case AdminProfileSection.EDUCATION:
        update.academic = dto.data;
        break;
      case AdminProfileSection.FAMILY:
        update.parents = dto.data;
        break;
      default:
        return throwBadRequest(ErrorCode.INVALID_REQUEST, {
          reason: 'unsupported_profile_section',
        });
    }
    const profile = await this.profileModel
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();

    await this.writeUserOperationAudit(
      req,
      actorId,
      'user.profile_updated',
      userId,
      {
        section: dto.section,
        reason: dto.reason,
        before: before
          ? { [dto.section]: (before as Record<string, unknown>)[dto.section] }
          : null,
        after: { [dto.section]: dto.data },
      },
    );

    return profile;
  }

  async assignUserPlan(
    userId: string,
    dto: AdminAssignUserPlanDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    const user = await this.ensureUserExists(userId);
    const before = user.membership;
    const result = await this.subscriptionsService.purchasePlan(
      userId,
      dto.planId,
      {
        autoRenew: dto.autoRenew,
      },
    );

    await this.writeUserOperationAudit(
      req,
      actorId,
      'user.subscription_assigned',
      userId,
      {
        reason: dto.reason,
        before,
        after: {
          planId: dto.planId,
          autoRenew: dto.autoRenew,
        },
      },
    );

    return result;
  }

  async cancelUserPlan(
    userId: string,
    dto: AdminCancelUserPlanDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    const user = await this.ensureUserExists(userId);
    const result = await this.subscriptionsService.cancelSubscription(
      userId,
      dto.reason ?? 'Cancelled by admin',
    );

    await this.writeUserOperationAudit(
      req,
      actorId,
      'user.subscription_cancelled',
      userId,
      {
        reason: dto.reason,
        before: user.membership,
      },
    );

    return result;
  }

  async updateUserSettings(
    userId: string,
    dto: AdminUpdateUserSettingsDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    await this.ensureUserExists(userId);
    const before = await this.settingsService.getAllSettings(userId);
    let settings;

    switch (dto.category) {
      case AdminSettingsCategory.PRIVACY:
        settings = await this.settingsService.updatePrivacy(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.NOTIFICATIONS:
        settings = await this.settingsService.updateNotification(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.COMMUNICATION:
        settings = await this.settingsService.updateCommunication(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.SECURITY:
        settings = await this.settingsService.updateSecurity(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.LOCALIZATION:
        settings = await this.settingsService.updateLocalization(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.ACCESSIBILITY:
        settings = await this.settingsService.updateAccessibility(
          userId,
          dto.settings,
        );
        break;
      case AdminSettingsCategory.MEDIA:
        settings = await this.settingsService.updateMedia(userId, dto.settings);
        break;
      case AdminSettingsCategory.AI:
        settings = await this.settingsService.updateAi(userId, dto.settings);
        break;
      default:
        return throwBadRequest(ErrorCode.INVALID_REQUEST, {
          reason: 'unsupported_settings_category',
        });
    }

    await this.writeUserOperationAudit(
      req,
      actorId,
      'user.settings_updated',
      userId,
      {
        reason: dto.reason,
        category: dto.category,
        before,
        after: dto.settings,
      },
    );

    return settings;
  }

  async updateUserStatus(
    dto: UpdateUserStatusDto,
    actorId?: string,
    req?: AuthenticatedRequest,
  ) {
    const user = await this.repo.findUserById(dto.userId);
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);

    const update: { status?: Status } = {};
    if (dto.status) {
      update.status = dto.status;
    } else if (dto.isBlocked !== undefined) {
      update.status = dto.isBlocked ? Status.BLOCKED : Status.ACTIVE;
    } else {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'status_or_isBlocked_required',
      });
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

  private async ensureUserExists(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) return throwNotFound(ErrorCode.USER_NOT_FOUND);
    return user;
  }

  private async writeUserOperationAudit(
    req: AuthenticatedRequest | undefined,
    actorId: string | undefined,
    action: string,
    targetId: string,
    data: {
      reason?: string;
      before?: unknown;
      after?: unknown;
      [key: string]: unknown;
    },
  ) {
    if (!actorId) return;
    const { reason, before, after, ...metadata } = data;
    await this.auditService.write({
      req,
      actorId,
      action,
      resource: 'user',
      targetId,
      reason,
      before: this.toAuditRecord(before),
      after: this.toAuditRecord(after),
      metadata,
    });
  }

  private toAuditRecord(value: unknown): Record<string, unknown> | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'object') return value as Record<string, unknown>;
    return { value };
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
          channels: channels,
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
      cancelledSubscriptions,
      pendingMedia,
      pendingKyc,
      reports,
      profileQualityRows,
      revenueKpiRows,
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
      this.subscriptionModel
        .countDocuments({
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: { $gte: fromDate, $lte: toDate },
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
      this.profileModel
        .aggregate<{
          _id: string;
          count: number;
          averageProfileScore: number;
          averageCompletion: number;
          averageVisibility: number;
        }>([
          {
            $bucket: {
              groupBy: '$profileScore',
              boundaries: [0, 40, 70, 90, 101],
              default: 'unknown',
              output: {
                count: { $sum: 1 },
                averageProfileScore: { $avg: '$profileScore' },
                averageCompletion: { $avg: '$profileCompletionPercentage' },
                averageVisibility: { $avg: '$visibilityScore' },
              },
            },
          },
        ])
        .exec(),
      this.paymentModel
        .aggregate<{
          _id: string;
          grossAmount: number;
          netAmount: number;
          taxAmount: number;
          discountAmount: number;
          transactionCount: number;
        }>([
          {
            $match: {
              status: PaymentStatus.SUCCESS,
              paidAt: { $gte: fromDate, $lte: toDate },
            },
          },
          {
            $group: {
              _id: '$currency',
              grossAmount: { $sum: '$amount' },
              netAmount: { $sum: '$netAmount' },
              taxAmount: { $sum: '$taxAmount' },
              discountAmount: { $sum: '$discountAmount' },
              transactionCount: { $sum: 1 },
            },
          },
        ])
        .exec(),
    ]);

    const safeProfileQualityRows = Array.isArray(profileQualityRows)
      ? profileQualityRows
      : [];
    const safeRevenueKpiRows = Array.isArray(revenueKpiRows)
      ? revenueKpiRows
      : [];
    const conversion = analyticsOverview?.conversion ?? {};
    const rangeDays = Math.max(
      1,
      Math.ceil((toDate.getTime() - fromDate.getTime()) / 86_400_000),
    );
    const subscriptionChurnRate =
      activeSubscriptions + cancelledSubscriptions > 0
        ? Number(
            (
              (cancelledSubscriptions /
                (activeSubscriptions + cancelledSubscriptions)) *
              100
            ).toFixed(2),
          )
        : 0;
    const profileQuality = {
      buckets: safeProfileQualityRows.map((row) => ({
        bucket: String(row._id),
        count: row.count,
        averageProfileScore: Number(
          Number(row.averageProfileScore ?? 0).toFixed(2),
        ),
        averageCompletion: Number(
          Number(row.averageCompletion ?? 0).toFixed(2),
        ),
        averageVisibility: Number(
          Number(row.averageVisibility ?? 0).toFixed(2),
        ),
      })),
    };

    return {
      range: { fromDate, toDate },
      analytics: analyticsOverview,
      learningConversion: {
        impressionToViewRate: conversion.impressionToViewRate ?? 0,
        viewToSessionRequestRate: conversion.viewToSessionRequestRate ?? 0,
        sessionRequestToStartRate: conversion.sessionRequestToStartRate ?? 0,
        sessionStartToChatRate: conversion.sessionStartToChatRate ?? 0,
      },
      users: {
        registeredInRange: users,
      },
      subscriptions: {
        active: activeSubscriptions,
        cancelledInRange: cancelledSubscriptions,
        churnRate: subscriptionChurnRate,
      },
      revenue,
      revenueKpis: {
        byCurrency: safeRevenueKpiRows,
        mrrEstimate: safeRevenueKpiRows.map((row) => ({
          currency: row._id,
          amount: Number(((row.netAmount / rangeDays) * 30).toFixed(2)),
        })),
        arrEstimate: safeRevenueKpiRows.map((row) => ({
          currency: row._id,
          amount: Number(((row.netAmount / rangeDays) * 365).toFixed(2)),
        })),
      },
      moderation: {
        pendingMedia,
        pendingKyc,
        reports,
      },
      fakeProfileDetection: {
        pendingMedia,
        pendingKyc,
        reports,
        ruleBasedRiskSignals: pendingMedia + pendingKyc + reports,
      },
      profileQuality,
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
