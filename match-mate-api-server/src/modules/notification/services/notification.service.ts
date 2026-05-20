import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { ListNotificationsDto } from '../dto/list-notifications.dto';
import { NotificationAnalyticsQueryDto } from '../dto/notification-analytics-query.dto';
import { NotificationDlqQueryDto } from '../dto/notification-dlq-query.dto';
import { NotificationDlqPurgeDto } from '../dto/notification-dlq-purge.dto';
import { NotificationDlqReplayAllDto } from '../dto/notification-dlq-replay-all.dto';
import { SendTemplateNotificationDto } from '../dto/send-template-notification.dto';
import { UpsertNotificationTemplateDto } from '../dto/upsert-notification-template.dto';
import {
  DeliveryLogChannel,
  DeliveryLogStatus,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from '../notification.constants';
import {
  NotificationChannelPayload,
  NotificationChannelProvider,
} from '../interfaces/notification-channel.interface';
import { EmailNotificationProvider } from '../providers/email-notification.provider';
import { PushNotificationProvider } from '../providers/push-notification.provider';
import { SmsNotificationProvider } from '../providers/sms-notification.provider';
import {
  NotificationDispatchJobData,
  NotificationQueueService,
} from './notification-queue.service';
import { SettingsService } from 'src/modules/settings/services/settings.service';
import { NotificationPreferencesType } from 'src/modules/settings/schemas/notification-settings.schema';

interface DeliveryDecision {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
}

interface DispatchAcrossChannelsResult {
  hasDeliveryFailure: boolean;
  failedChannels: DeliveryLogChannel[];
}

@Injectable()
export class NotificationService {
  private readonly channelProviders: NotificationChannelProvider[];

  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly smsProvider: SmsNotificationProvider,
    private readonly pushProvider: PushNotificationProvider,
    private readonly queueService: NotificationQueueService,
    private readonly settingsService: SettingsService,
  ) {
    this.channelProviders = [
      this.pushProvider,
      this.emailProvider,
      this.smsProvider,
    ];
  }

  async notify(dto: CreateNotificationDto) {
    if (dto.templateKey) {
      return this.sendTemplateNotification({
        userId: dto.userId,
        templateKey: dto.templateKey,
        variables: dto.variables,
        metadata: dto.metadata,
        channels: dto.channels,
        actorId: dto.actorId,
      });
    }

    if (!dto.category) {
      throw new BadRequestException(
        'category is required for custom notifications',
      );
    }

    const user = await this.notificationRepo.findUserById(dto.userId);
    if (!user) {
      throw new NotFoundException('Notification user not found');
    }

    const settings = await this.settingsService.getOrCreateUserSettings(
      dto.userId,
    );
    const decision = this.resolveDeliveryDecision(
      dto.category,
      settings,
      dto.channels,
      dto.priority,
    );

    const notification = await this.notificationRepo.create({
      userId: new Types.ObjectId(dto.userId),
      title: dto.title,
      message: dto.message,
      category: dto.category,
      type: dto.type ?? 'info',
      actorId: dto.actorId ? new Types.ObjectId(dto.actorId) : undefined,
      actorName: dto.actorName,
      actorImage: dto.actorImage,
      referenceId: dto.referenceId,
      action: dto.action,
      metadata: dto.metadata,
      priority: dto.priority ?? 'normal',
      templateKey: undefined,
      delivery: {},
    });

    await this.queueOrDispatch({
      notificationId: String(notification._id),
      userId: dto.userId,
      email: user.email,
      phone: user.phone
        ? `${user.phone.countryCode}${user.phone.phone}`
        : undefined,
      title: dto.title,
      message: dto.message,
      subject: dto.title,
      templateKey: undefined,
      metadata: dto.metadata,
      decision,
    });

    return notification;
  }

  getUserNotifications(userId: string, query: ListNotificationsDto) {
    return this.notificationRepo.findByUser(userId, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      unreadOnly: query.unreadOnly,
      category: query.category,
      type: query.type,
    });
  }

  getUnreadCount(userId: string) {
    return this.notificationRepo.countUnread(userId);
  }

  markRead(userId: string, notificationId: string) {
    return this.notificationRepo.markAsRead(notificationId, userId);
  }

  markAllRead(userId: string) {
    return this.notificationRepo.markAllAsRead(userId);
  }

  listTemplates(includeInactive = false) {
    return this.notificationRepo.listTemplates(includeInactive);
  }

  getAnalytics(query: NotificationAnalyticsQueryDto) {
    return this.notificationRepo.getDeliveryAnalytics({
      days: query.days ?? 30,
      channel: query.channel,
      templateKey: query.templateKey,
    });
  }

  async listDeadLetterJobs(query: NotificationDlqQueryDto) {
    this.ensureQueueEnabledForAdmin();
    return this.queueService.listDeadLetters({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      state: query.state,
    });
  }

  async getDeadLetterJob(jobId: string) {
    this.ensureQueueEnabledForAdmin();
    const job = await this.queueService.getDeadLetter(jobId);

    if (!job) {
      throw new NotFoundException('Dead-letter notification job not found');
    }

    return job;
  }

  async replayDeadLetterJob(jobId: string, adminUserId?: string) {
    this.ensureQueueEnabledForAdmin();
    const replay = await this.queueService.replayDeadLetter(jobId, adminUserId);

    if (!replay) {
      throw new NotFoundException('Dead-letter notification job not found');
    }

    return replay;
  }

  async replayAllDeadLetterJobs(
    dto: NotificationDlqReplayAllDto,
    adminUserId?: string,
  ) {
    this.ensureQueueEnabledForAdmin();
    return this.queueService.replayDeadLettersBulk({
      state: dto.state,
      limit: dto.limit ?? 100,
      olderThanDays: dto.olderThanDays,
      intervalMs: dto.intervalMs ?? 200,
      replayedBy: adminUserId,
    });
  }

  async purgeDeadLetterJobs(dto: NotificationDlqPurgeDto) {
    this.ensureQueueEnabledForAdmin();
    return this.queueService.purgeDeadLetters({
      state: dto.state,
      limit: dto.limit ?? 500,
      olderThanDays: dto.olderThanDays,
    });
  }

  upsertTemplate(key: string, dto: UpsertNotificationTemplateDto) {
    const normalizedKey = key.trim().toUpperCase();

    return this.notificationRepo.upsertTemplate(normalizedKey, {
      ...dto,
      key: normalizedKey,
      channels: {
        inApp: dto.channels?.inApp ?? true,
        push: dto.channels?.push ?? true,
        email: dto.channels?.email ?? false,
        sms: dto.channels?.sms ?? false,
      },
      variables: dto.variables ?? [],
      isActive: dto.isActive ?? true,
    });
  }

  async sendTemplateNotification(dto: SendTemplateNotificationDto) {
    const normalizedKey = dto.templateKey.trim().toUpperCase();
    const [template, user] = await Promise.all([
      this.notificationRepo.findTemplateByKey(normalizedKey),
      this.notificationRepo.findUserById(dto.userId),
    ]);

    if (!template || !template.isActive) {
      throw new NotFoundException(
        'Notification template not found or inactive',
      );
    }

    if (!user) {
      throw new NotFoundException('Notification user not found');
    }

    const settings = await this.settingsService.getOrCreateUserSettings(
      dto.userId,
    );
    const variables = dto.variables ?? {};
    const renderedTitle = this.render(template.title, variables);
    const renderedMessage = this.render(template.message, variables);
    const renderedPushTitle = this.render(
      template.pushTitle ?? template.title,
      variables,
    );
    const renderedPushBody = this.render(
      template.pushBody ?? template.message,
      variables,
    );
    const renderedEmailSubject = this.render(
      template.emailSubject ?? template.title,
      variables,
    );
    const renderedEmailBody = this.render(
      template.emailBody ?? template.message,
      variables,
    );
    const renderedSmsBody = this.render(
      template.smsBody ?? template.message,
      variables,
    );

    const decision = this.resolveDeliveryDecision(
      template.category,
      settings,
      dto.channels,
      template.priority,
      template.channels,
    );

    const notification = await this.notificationRepo.create({
      userId: new Types.ObjectId(dto.userId),
      title: renderedTitle,
      message: renderedMessage,
      category: template.category,
      type: this.typeFromCategory(template.category),
      actorId: dto.actorId ? new Types.ObjectId(dto.actorId) : undefined,
      priority: template.priority,
      templateKey: template.key,
      metadata: {
        ...(dto.metadata ?? {}),
        variables,
      },
      delivery: {},
    });

    await this.queueOrDispatch({
      notificationId: String(notification._id),
      userId: dto.userId,
      email: user.email,
      phone: user.phone
        ? `${user.phone.countryCode}${user.phone.phone}`
        : undefined,
      title: renderedPushTitle,
      message: renderedPushBody,
      subject: renderedEmailSubject,
      emailBody: renderedEmailBody,
      smsBody: renderedSmsBody,
      templateKey: template.key,
      metadata: {
        ...(dto.metadata ?? {}),
        variables,
      },
      decision,
    });

    return notification;
  }

  async processDispatchJob(
    payload: NotificationDispatchJobData,
    attemptNo = 1,
  ) {
    const result = await this.dispatchAcrossChannels(payload, attemptNo);
    if (result.hasDeliveryFailure) {
      throw new Error(
        `Notification delivery failed for channels: ${result.failedChannels.join(', ')}`,
      );
    }
  }

  private async queueOrDispatch(payload: NotificationDispatchJobData) {
    if (this.queueService.isEnabled()) {
      await this.queueService.enqueueDispatch(payload);
      return;
    }

    await this.dispatchAcrossChannels(payload, 1);
  }

  private ensureQueueEnabledForAdmin() {
    if (!this.queueService.isEnabled()) {
      throw new BadRequestException(
        'Notification queue is disabled; DLQ operations are unavailable',
      );
    }
  }

  private async dispatchAcrossChannels(
    params: {
      notificationId: string;
      userId: string;
      email?: string;
      phone?: string;
      title: string;
      message: string;
      subject: string;
      emailBody?: string;
      smsBody?: string;
      templateKey?: string;
      metadata?: Record<string, unknown>;
      decision: DeliveryDecision;
    },
    attemptNo = 1,
  ): Promise<DispatchAcrossChannelsResult> {
    const deliveryState: Record<string, unknown> = {};
    let hasDeliveryFailure = false;
    const failedChannels: DeliveryLogChannel[] = [];

    const existingNotification = await this.notificationRepo.findById(
      params.notificationId,
    );
    const previouslySent = {
      push: Boolean(existingNotification?.isSentPush),
      email: Boolean(existingNotification?.isSentEmail),
      sms: Boolean(existingNotification?.isSentSms),
    };

    const channelPayloads: Array<{
      channel: DeliveryLogChannel;
      enabled: boolean;
      payload: NotificationChannelPayload;
    }> = [
      {
        channel: 'push',
        enabled: params.decision.push,
        payload: {
          notificationId: params.notificationId,
          userId: params.userId,
          to: params.userId,
          title: params.title,
          message: params.message,
          metadata: params.metadata,
          templateKey: params.templateKey,
        },
      },
      {
        channel: 'email',
        enabled: params.decision.email,
        payload: {
          notificationId: params.notificationId,
          userId: params.userId,
          to: params.email ?? '',
          subject: params.subject,
          title: params.subject,
          message: params.emailBody ?? params.message,
          metadata: params.metadata,
          templateKey: params.templateKey,
        },
      },
      {
        channel: 'sms',
        enabled: params.decision.sms,
        payload: {
          notificationId: params.notificationId,
          userId: params.userId,
          to: params.phone ?? '',
          message: params.smsBody ?? params.message,
          metadata: params.metadata,
          templateKey: params.templateKey,
        },
      },
    ];

    for (const channelPayload of channelPayloads) {
      const provider = this.channelProviders.find(
        (channelProvider) => channelProvider.channel === channelPayload.channel,
      );

      if (!provider) {
        continue;
      }

      const log = await this.notificationRepo.createDeliveryLog({
        notificationId: new Types.ObjectId(params.notificationId),
        userId: new Types.ObjectId(params.userId),
        channel: channelPayload.channel,
        status: 'pending',
        templateKey: params.templateKey,
        provider: 'pending',
        attemptedAt: new Date(),
        retryCount: Math.max(attemptNo - 1, 0),
        requestPayload: {
          hasRecipient: Boolean(channelPayload.payload.to),
          templateKey: params.templateKey,
          attemptNo,
        },
      });

      let result: {
        status: DeliveryLogStatus;
        provider?: string;
        providerResponse?: string;
        error?: string;
        responsePayload?: Record<string, unknown>;
      };

      if (previouslySent[channelPayload.channel]) {
        result = {
          status: 'skipped',
          provider: 'already-sent',
          error: 'Channel already sent in previous attempt',
        };
      } else if (!channelPayload.enabled) {
        result = {
          status: 'skipped',
          provider: 'preference-filter',
          error: 'Channel disabled by template/settings/request',
        };
      } else {
        result = await provider.send(channelPayload.payload);
      }

      await this.notificationRepo.updateDeliveryLog(String(log._id), {
        status: result.status,
        provider: result.provider,
        providerResponse: result.providerResponse,
        error: result.error,
        deliveredAt: result.status === 'sent' ? new Date() : undefined,
        responsePayload: result.responsePayload,
      });

      if (result.status === 'failed') {
        hasDeliveryFailure = true;
        failedChannels.push(channelPayload.channel);
      }

      deliveryState[channelPayload.channel] = {
        status: result.status,
        attemptedAt: new Date(),
        deliveredAt: result.status === 'sent' ? new Date() : undefined,
        error: result.error,
      };
    }

    await this.notificationRepo.updateDeliveryStatus(params.notificationId, {
      isSentPush:
        previouslySent.push ||
        (deliveryState.push as { status?: string } | undefined)?.status ===
          'sent',
      isSentEmail:
        previouslySent.email ||
        (deliveryState.email as { status?: string } | undefined)?.status ===
          'sent',
      isSentSms:
        previouslySent.sms ||
        (deliveryState.sms as { status?: string } | undefined)?.status ===
          'sent',
      hasDeliveryFailure,
      delivery: {
        ...((existingNotification?.delivery as
          | Record<string, unknown>
          | undefined) ?? {}),
        ...deliveryState,
      },
    });

    return {
      hasDeliveryFailure,
      failedChannels,
    };
  }

  private resolveDeliveryDecision(
    category: NotificationCategory,

    settings: {
      inAppEnabled?: boolean;
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;

      doNotDisturb?: boolean;

      quietHours?: {
        enabled?: boolean;
        start?: string;
        end?: string;
      };

      preferences?: Partial<NotificationPreferencesType>;
    },

    requestedChannels?: NotificationChannel[],

    priority: NotificationPriority = 'normal',

    templateChannels?: {
      inApp?: boolean;
      push?: boolean;
      email?: boolean;
      sms?: boolean;
    },
  ): DeliveryDecision {
    const preferenceKey = this.preferenceKeyFromCategory(category);

    const preference = settings.preferences?.[preferenceKey];

    const inRequested = (channel: NotificationChannel): boolean =>
      !requestedChannels || requestedChannels.includes(channel);

    const inTemplate = (channel: NotificationChannel): boolean => {
      if (!templateChannels) {
        return true;
      }

      switch (channel) {
        case 'in_app':
          return templateChannels.inApp !== false;

        case 'push':
          return templateChannels.push !== false;

        case 'email':
          return templateChannels.email !== false;

        case 'sms':
          return templateChannels.sms !== false;

        default:
          return true;
      }
    };

    const inDnd = this.isInDndWindow(settings);

    const canBypassDnd = priority === 'critical';

    return {
      inApp:
        inRequested('in_app') &&
        inTemplate('in_app') &&
        settings.inAppEnabled !== false &&
        preference?.inApp !== false,

      push:
        inRequested('push') &&
        inTemplate('push') &&
        settings.pushEnabled !== false &&
        preference?.push !== false &&
        (!inDnd || canBypassDnd),

      email:
        inRequested('email') &&
        inTemplate('email') &&
        settings.emailEnabled !== false &&
        preference?.email !== false &&
        (!inDnd || canBypassDnd),

      sms:
        inRequested('sms') &&
        inTemplate('sms') &&
        settings.smsEnabled === true &&
        preference?.sms === true &&
        (!inDnd || canBypassDnd),
    };
  }

  private isInDndWindow(settings: {
    doNotDisturb?: boolean;
    quietHours?: { enabled?: boolean; start?: string; end?: string };
  }) {
    if (!settings.doNotDisturb && !settings.quietHours?.enabled) {
      return false;
    }

    const start = settings.quietHours?.start;
    const end = settings.quietHours?.end;

    if (!start || !end) {
      return Boolean(settings.doNotDisturb || settings.quietHours?.enabled);
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.toMinutes(start);
    const endMinutes = this.toMinutes(end);

    if (startMinutes === null || endMinutes === null) {
      return false;
    }

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  private toMinutes(value: string) {
    const [hours, minutes] = value.split(':').map((part) => Number(part));

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  private preferenceKeyFromCategory(category: NotificationCategory) {
    switch (category) {
      case 'interest_received':
        return 'interestReceived';
      case 'interest_accepted':
        return 'interestAccepted';
      case 'profile_view':
        return 'profileView';
      case 'match_found':
        return 'matchFound';
      case 'message_received':
        return 'messageReceived';
      case 'subscription':
        return 'subscription';
      case 'system':
      default:
        return 'system';
    }
  }

  private typeFromCategory(category: NotificationCategory) {
    switch (category) {
      case 'interest_received':
      case 'interest_accepted':
      case 'match_found':
        return 'match' as const;
      case 'message_received':
        return 'chat' as const;
      case 'subscription':
        return 'payment' as const;
      case 'profile_view':
        return 'info' as const;
      case 'system':
      default:
        return 'system' as const;
    }
  }

  private render(
    template: string,
    variables: Record<string, string | number | boolean | null>,
  ): string {
    return template.replace(
      /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
      (_: string, key: string): string => {
        if (!Object.prototype.hasOwnProperty.call(variables, key)) {
          return '';
        }

        const value = variables[key];

        if (value === null) {
          return '';
        }

        return String(value);
      },
    );
  }
}
