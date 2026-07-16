import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Status, ProfileStatus, MediaType } from '@/common/enums';
import { StorageService } from '@/modules/storage/services/storage.service';
import { AppLogger } from '@/common/logger/logger.service';
import { User, UserDocument } from '@/modules/auth/schemas/user.schema';
import {
  UserSession,
  UserSessionDocument,
} from '@/modules/auth/schemas/user-session.schema';
import {
  Profile,
  ProfileDocument,
} from '@/modules/profiles/schemas/profile/profile.schema';
import {
  Media,
  MediaDocument,
} from '@/modules/profiles/schemas/media/media.schema';
import { MediaStatus } from '@/modules/profiles/enums/profile-media.enums';
import {
  Preference,
  PreferenceDocument,
} from '@/modules/profiles/schemas/preference/preference.schema';
import {
  AccountSetting,
  AccountSettingDocument,
} from '../schemas/account-setting.schema';
import {
  Payment,
  PaymentDocument,
} from '@/modules/payments/schemas/payment.schema';
import {
  PaymentInvoice,
  PaymentInvoiceDocument,
} from '@/modules/payments/schemas/payment-invoice.schema';
import {
  Subscription,
  SubscriptionDocument,
} from '@/modules/subscriptions/schemas/subscription.schema';
import {
  Verification,
  VerificationDocument,
} from '@/modules/safety/schemas/verification.schema';
import {
  UserReport,
  UserReportDocument,
} from '@/modules/safety/schemas/user-report.schema';
import {
  AdminAuditLog,
  AdminAuditLogDocument,
} from '@/modules/admin/schemas/admin-audit-log.schema';

const PROFILE_IMAGE_FOLDER = 'profiles/images';
const PROFILE_VIDEO_FOLDER = 'profiles/videos';
const PROFILE_VIDEO_THUMBNAIL_FOLDER = 'profiles/video-thumbnails';
const ACCOUNT_ERASURE_SOURCE = 'account-erasure-job';
const FINANCE_RETENTION_REASON = 'finance_tax_compliance';
const AUDIT_RETENTION_REASON = 'security_audit_compliance';
const SAFETY_RETENTION_REASON = 'trust_safety_compliance';

@Injectable()
export class AccountDeletionService {
  constructor(
    @InjectModel(AccountSetting.name)
    private readonly accountModel: Model<AccountSettingDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserSession.name)
    private readonly sessionModel: Model<UserSessionDocument>,
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(Media.name)
    private readonly mediaModel: Model<MediaDocument>,
    @InjectModel(Preference.name)
    private readonly preferenceModel: Model<PreferenceDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(PaymentInvoice.name)
    private readonly invoiceModel: Model<PaymentInvoiceDocument>,
    @InjectModel(Subscription.name)
    private readonly subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Verification.name)
    private readonly verificationModel: Model<VerificationDocument>,
    @InjectModel(UserReport.name)
    private readonly reportModel: Model<UserReportDocument>,
    @InjectModel(AdminAuditLog.name)
    private readonly auditLogModel: Model<AdminAuditLogDocument>,
    private readonly storageService: StorageService,
    private readonly logger: AppLogger,
  ) {}

  async purgeDueAccountDeletions(now = new Date()) {
    const accounts = await this.accountModel
      .find({
        deletionScheduledAt: { $lte: now },
        deletionCompletedAt: { $exists: false },
      })
      .limit(100)
      .lean<Array<AccountSetting & { _id: Types.ObjectId }>>()
      .exec();

    let purgedCount = 0;
    for (const account of accounts) {
      await this.purgeUser(account.userId.toString(), 'scheduled_erasure');
      purgedCount += 1;
    }

    return { purgedCount };
  }

  async purgeUser(userId: string, reason = 'user_requested_erasure') {
    const userObjectId = new Types.ObjectId(userId);
    const anonymizedEmail = `deleted.${userObjectId.toString()}@deleted.matchmate.local`;
    const now = new Date();

    const media = await this.mediaModel
      .find({ userId: userObjectId })
      .select('filename url thumbnailUrl type')
      .lean<Array<Media & { _id: Types.ObjectId }>>()
      .exec();

    await Promise.allSettled(
      media.flatMap((item) => this.buildStorageDeleteTasks(item)),
    );

    const retentionUpdate = (retentionReason: string) => ({
      anonymizedAt: now,
      retentionReason,
      source: ACCOUNT_ERASURE_SOURCE,
      reason,
    });

    await Promise.all([
      this.userModel
        .findByIdAndUpdate(userObjectId, {
          $set: {
            status: Status.DELETED,
            email: anonymizedEmail,
            isEmailVerified: false,
            isPhoneVerified: false,
            isOnboardingCompleted: false,
            updatedBy: ACCOUNT_ERASURE_SOURCE,
            deletedAt: now,
            anonymizedAt: now,
            retentionReason: 'user_requested_erasure',
          },
          $unset: {
            phone: 1,
            authAccounts: 1,
            referralCode: 1,
            referredBy: 1,
            lockUntil: 1,
            lastLoginIp: 1,
            lastLoginDevice: 1,
          },
        })
        .exec(),
      this.profileModel
        .updateOne(
          { userId: userObjectId },
          {
            $set: {
              status: ProfileStatus.DELETED,
              deletedAt: now,
              anonymizedAt: now,
              retentionReason: 'user_requested_erasure',
              personal: {
                firstName: 'Deleted',
                lastName: 'Member',
              },
              searchTags: [],
              aiTags: [],
              profileScore: 0,
              profileCompletionPercentage: 0,
              visibilityScore: 0,
            },
            $unset: {
              physical: 1,
              education: 1,
              family: 1,
              location: 1,
              createdBy: 1,
              updatedBy: 1,
            },
          },
        )
        .exec(),
      this.mediaModel
        .updateMany(
          { userId: userObjectId },
          {
            $set: {
              status: MediaStatus.DELETED,
              isActive: false,
              isPrimary: false,
              deletedAt: now,
              anonymizedAt: now,
              retentionReason: 'user_requested_erasure',
            },
          },
        )
        .exec(),
      this.preferenceModel.deleteMany({ userId: userObjectId }).exec(),
      this.sessionModel
        .updateMany(
          { userId: userObjectId },
          { $set: { isActive: false, loggedOutAt: now } },
        )
        .exec(),
      this.accountModel
        .updateOne(
          { userId: userObjectId },
          {
            $set: {
              isDeactivated: true,
              deletionCompletedAt: now,
              deletionReason: reason,
              anonymizedAt: now,
              retentionReason: 'user_requested_erasure',
            },
          },
        )
        .exec(),
      this.paymentModel
        .updateMany(
          { userId: userObjectId },
          {
            $set: {
              ...retentionUpdate(FINANCE_RETENTION_REASON),
              customer: {
                name: 'Deleted Member',
                email: anonymizedEmail,
              },
            },
            $unset: {
              'customer.phone': 1,
              'customer.gstin': 1,
            },
          },
        )
        .exec(),
      this.invoiceModel
        .updateMany(
          { userId: userObjectId },
          {
            $set: {
              ...retentionUpdate(FINANCE_RETENTION_REASON),
              customer: {
                name: 'Deleted Member',
                email: anonymizedEmail,
              },
            },
            $unset: {
              customerGstin: 1,
              'customer.phone': 1,
            },
          },
        )
        .exec(),
      this.subscriptionModel
        .updateMany(
          { userId: userObjectId },
          {
            $set: retentionUpdate(FINANCE_RETENTION_REASON),
            $unset: {
              storePurchaseToken: 1,
            },
          },
        )
        .exec(),
      this.verificationModel
        .updateMany(
          { userId: userObjectId },
          {
            $set: retentionUpdate(SAFETY_RETENTION_REASON),
            $unset: {
              idProofUrl: 1,
              selfieUrl: 1,
              providerPayload: 1,
            },
          },
        )
        .exec(),
      this.reportModel
        .updateMany(
          {
            $or: [
              { reportedBy: userObjectId },
              { reportedUserId: userObjectId },
            ],
          },
          {
            $set: retentionUpdate(SAFETY_RETENTION_REASON),
          },
        )
        .exec(),
      this.auditLogModel
        .updateMany(
          {
            $or: [{ actorId: userObjectId }, { targetId: userId }],
          },
          {
            $set: retentionUpdate(AUDIT_RETENTION_REASON),
            $unset: {
              ipAddress: 1,
              userAgent: 1,
            },
          },
        )
        .exec(),
    ]);

    return { userId, deleted: true };
  }

  private buildStorageDeleteTasks(media: Media): Array<Promise<void>> {
    const tasks: Array<Promise<void>> = [];
    const folder =
      media.type === MediaType.VIDEO
        ? PROFILE_VIDEO_FOLDER
        : PROFILE_IMAGE_FOLDER;

    if (media.filename) {
      tasks.push(this.storageService.deleteFile(media.filename, folder));
    }

    const thumbnailFilename = this.getFilenameFromUrl(media.thumbnailUrl);
    if (thumbnailFilename) {
      tasks.push(
        this.storageService.deleteFile(
          thumbnailFilename,
          PROFILE_VIDEO_THUMBNAIL_FOLDER,
        ),
      );
    }

    return tasks.map((task) =>
      task.catch((error: unknown) => {
        this.logger.warn('Account media erasure file deletion failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      }),
    );
  }

  private getFilenameFromUrl(url?: string): string | undefined {
    if (!url) return undefined;
    return url.split('/').filter(Boolean).pop();
  }
}
