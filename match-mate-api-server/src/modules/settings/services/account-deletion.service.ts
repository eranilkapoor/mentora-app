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

const PROFILE_IMAGE_FOLDER = 'profiles/images';
const PROFILE_VIDEO_FOLDER = 'profiles/videos';
const PROFILE_VIDEO_THUMBNAIL_FOLDER = 'profiles/video-thumbnails';

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

    await Promise.all([
      this.userModel
        .findByIdAndUpdate(userObjectId, {
          $set: {
            status: Status.DELETED,
            email: anonymizedEmail,
            isEmailVerified: false,
            isPhoneVerified: false,
            isOnboardingCompleted: false,
            updatedBy: 'account-erasure-job',
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
