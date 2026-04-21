import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { AppLogger } from 'src/common/logger/logger.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { ListNotificationsDto } from '../dto/list-notifications.dto';
import { NotificationAnalyticsQueryDto } from '../dto/notification-analytics-query.dto';
import { NotificationDlqQueryDto } from '../dto/notification-dlq-query.dto';
import { NotificationDlqPurgeDto } from '../dto/notification-dlq-purge.dto';
import { NotificationDlqReplayAllDto } from '../dto/notification-dlq-replay-all.dto';
import { SendTemplateNotificationDto } from '../dto/send-template-notification.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
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
export class NotificationService implements OnModuleInit {
  private readonly channelProviders: NotificationChannelProvider[];

  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly smsProvider: SmsNotificationProvider,
    private readonly pushProvider: PushNotificationProvider,
    private readonly queueService: NotificationQueueService,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
  ) {
    this.channelProviders = [
      this.pushProvider,
      this.emailProvider,
      this.smsProvider,
    ];
  }

  async onModuleInit() {
    await this.seedDefaultTemplates();
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

    const settings = await this.notificationRepo.getOrCreateUserSettings(
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

  getSettings(userId: string) {
    return this.notificationRepo.getOrCreateUserSettings(userId);
  }

  updateSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    const patch: Record<string, unknown> = {};

    if (dto.inAppEnabled !== undefined) patch.inAppEnabled = dto.inAppEnabled;
    if (dto.pushEnabled !== undefined) patch.pushEnabled = dto.pushEnabled;
    if (dto.emailEnabled !== undefined) patch.emailEnabled = dto.emailEnabled;
    if (dto.smsEnabled !== undefined) patch.smsEnabled = dto.smsEnabled;
    if (dto.doNotDisturb !== undefined) patch.doNotDisturb = dto.doNotDisturb;
    if (dto.quietHours) patch.quietHours = dto.quietHours;
    if (dto.preferences) patch.preferences = dto.preferences;
    if (dto.dndStart !== undefined) patch.dndStart = dto.dndStart;
    if (dto.dndEnd !== undefined) patch.dndEnd = dto.dndEnd;

    return this.notificationRepo.updateUserSettings(userId, patch);
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

    const settings = await this.notificationRepo.getOrCreateUserSettings(
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
      dndStart?: string;
      dndEnd?: string;
      preferences?: Record<
        string,
        { inApp?: boolean; push?: boolean; email?: boolean; sms?: boolean }
      >;
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
    const preference = settings.preferences?.[preferenceKey] ?? {};
    const inRequested = (channel: NotificationChannel) =>
      !requestedChannels || requestedChannels.includes(channel);

    const inTemplate = (channel: NotificationChannel) => {
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
        preference.inApp !== false,
      push:
        inRequested('push') &&
        inTemplate('push') &&
        settings.pushEnabled !== false &&
        preference.push !== false &&
        (!inDnd || canBypassDnd),
      email:
        inRequested('email') &&
        inTemplate('email') &&
        settings.emailEnabled !== false &&
        preference.email !== false &&
        (!inDnd || canBypassDnd),
      sms:
        inRequested('sms') &&
        inTemplate('sms') &&
        settings.smsEnabled === true &&
        preference.sms === true &&
        (!inDnd || canBypassDnd),
    };
  }

  private isInDndWindow(settings: {
    doNotDisturb?: boolean;
    quietHours?: { enabled?: boolean; start?: string; end?: string };
    dndStart?: string;
    dndEnd?: string;
  }) {
    if (!settings.doNotDisturb && !settings.quietHours?.enabled) {
      return false;
    }

    const start = settings.quietHours?.start ?? settings.dndStart;
    const end = settings.quietHours?.end ?? settings.dndEnd;

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
  ) {
    return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        return '';
      }

      return String(value);
    });
  }

  private async seedDefaultTemplates() {
    const shouldSeed = this.configService.get<boolean>(
      'notification.seedDefaults',
      true,
    );

    if (!shouldSeed) {
      return;
    }

    const defaults: Array<{
      key: string;
      name: string;
      category: NotificationCategory;
      priority: NotificationPriority;
      title: string;
      message: string;
      pushTitle?: string;
      pushBody?: string;
      emailSubject?: string;
      emailBody?: string;
      smsBody?: string;
      variables: string[];
      channels: {
        inApp: boolean;
        push: boolean;
        email: boolean;
        sms: boolean;
      };
    }> = [
      {
        key: 'INTEREST_RECEIVED',
        name: 'Interest Received',
        category: 'interest_received',
        priority: 'normal',
        title: 'New interest from {{name}}',
        message: '{{name}} has sent you an interest.',
        pushTitle: 'You received a new interest',
        pushBody: '{{name}} sent you an interest.',
        emailSubject: 'You got a new interest on MatchMate',
        emailBody:
          'Hi {{userName}}, you received a new interest from {{name}}.',
        smsBody: 'New interest from {{name}} on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'INTEREST_ACCEPTED',
        name: 'Interest Accepted',
        category: 'interest_accepted',
        priority: 'high',
        title: '{{name}} accepted your interest',
        message: 'Great news! {{name}} accepted your interest.',
        pushTitle: 'Interest accepted',
        pushBody: '{{name}} accepted your interest.',
        emailSubject: 'Your interest was accepted',
        emailBody:
          'Hi {{userName}}, {{name}} accepted your interest. Start chatting now.',
        smsBody: '{{name}} accepted your interest on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'INTEREST_REMINDER',
        name: 'Interest Response Reminder',
        category: 'interest_received',
        priority: 'normal',
        title: 'You have pending interests',
        message:
          'You have {{pendingCount}} pending interests waiting for response.',
        pushTitle: 'Pending interests',
        pushBody: '{{pendingCount}} interests are waiting for your response.',
        emailSubject: 'Respond to your pending interests',
        emailBody:
          'Hi {{userName}}, you have {{pendingCount}} pending interests.',
        smsBody: 'You have {{pendingCount}} pending interests on MatchMate.',
        variables: ['pendingCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'MATCH_FOUND',
        name: 'Match Found',
        category: 'match_found',
        priority: 'high',
        title: "It's a match with {{name}}",
        message: 'You and {{name}} are now matched. Start a conversation now.',
        pushTitle: "It's a match",
        pushBody: 'You matched with {{name}}.',
        emailSubject: 'You have a new match',
        emailBody: 'You matched with {{name}}. Open MatchMate to connect.',
        smsBody: 'You matched with {{name}} on MatchMate.',
        variables: ['name'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'MATCH_REMINDER',
        name: 'Match Follow-up Reminder',
        category: 'match_found',
        priority: 'normal',
        title: 'Reconnect with {{name}}',
        message: '{{name}} is waiting to hear from you. Send a message now.',
        pushTitle: 'Your match is waiting',
        pushBody: 'Send a message to {{name}}.',
        emailSubject: 'Reconnect with your match',
        emailBody:
          'Hi {{userName}}, your match {{name}} is waiting for your reply.',
        smsBody: '{{name}} is waiting for your message on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'NEW_MATCHES_DIGEST',
        name: 'New Matches Digest',
        category: 'match_found',
        priority: 'normal',
        title: 'You have {{matchCount}} new compatible matches',
        message:
          'Your profile matched with {{matchCount}} new people this week.',
        pushTitle: 'New matches for you',
        pushBody: '{{matchCount}} new compatible matches found.',
        emailSubject: 'Your weekly match digest',
        emailBody:
          'Hi {{userName}}, you have {{matchCount}} new compatible matches.',
        smsBody: '{{matchCount}} new matches are waiting on MatchMate.',
        variables: ['matchCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'MESSAGE_RECEIVED',
        name: 'Message Received',
        category: 'message_received',
        priority: 'normal',
        title: 'New message from {{name}}',
        message: '{{name}}: {{messagePreview}}',
        pushTitle: 'New message',
        pushBody: '{{name}} sent you a message.',
        emailSubject: 'You received a new message',
        emailBody: 'You have a new message from {{name}}.',
        smsBody: 'New message from {{name}} on MatchMate.',
        variables: ['name', 'messagePreview'],
        channels: { inApp: true, push: true, email: false, sms: false },
      },
      {
        key: 'UNREAD_MESSAGES_REMINDER',
        name: 'Unread Messages Reminder',
        category: 'message_received',
        priority: 'normal',
        title: 'You have {{unreadCount}} unread messages',
        message: 'Open MatchMate to respond to your pending conversations.',
        pushTitle: 'Unread messages waiting',
        pushBody: '{{unreadCount}} unread messages are waiting for you.',
        emailSubject: 'You have unread messages',
        emailBody: 'Hi {{userName}}, you have {{unreadCount}} unread messages.',
        smsBody: 'You have unread messages on MatchMate.',
        variables: ['unreadCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'CHAT_INACTIVE_REMINDER',
        name: 'Inactive Chat Reminder',
        category: 'message_received',
        priority: 'low',
        title: 'Your conversation with {{name}} is quiet',
        message:
          'Break the ice again and continue your conversation with {{name}}.',
        pushTitle: 'Continue your chat',
        pushBody: 'Say hello to {{name}}.',
        emailSubject: 'Continue your conversation',
        emailBody: 'Hi {{userName}}, continue your conversation with {{name}}.',
        smsBody: 'Continue your chat with {{name}} on MatchMate.',
        variables: ['name', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'PROFILE_VIEW_MILESTONE',
        name: 'Profile View Milestone',
        category: 'profile_view',
        priority: 'normal',
        title: 'Your profile got {{viewCount}} views',
        message:
          'Your profile is trending. Update details to improve responses.',
        pushTitle: 'Profile activity is up',
        pushBody: 'Your profile reached {{viewCount}} views.',
        emailSubject: 'Your profile is getting attention',
        emailBody: 'Hi {{userName}}, your profile crossed {{viewCount}} views.',
        smsBody: 'Your profile crossed {{viewCount}} views on MatchMate.',
        variables: ['viewCount', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'PROFILE_COMPLETION_REMINDER',
        name: 'Profile Completion Reminder',
        category: 'system',
        priority: 'normal',
        title: 'Complete your profile to get better matches',
        message:
          'Your profile is {{completionPercent}}% complete. Add details to improve match quality.',
        pushTitle: 'Complete your profile',
        pushBody: 'Profile is {{completionPercent}}% complete.',
        emailSubject: 'Complete your MatchMate profile',
        emailBody:
          'Hi {{userName}}, complete your profile to improve visibility and matches.',
        smsBody: 'Complete your MatchMate profile for better matches.',
        variables: ['completionPercent', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'ID_VERIFICATION_APPROVED',
        name: 'ID Verification Approved',
        category: 'system',
        priority: 'high',
        title: 'Your profile verification is approved',
        message:
          'Your identity verification is complete. Your trust badge is now visible.',
        pushTitle: 'Verification approved',
        pushBody: 'Your verified badge is now active.',
        emailSubject: 'Verification approved on MatchMate',
        emailBody:
          'Hi {{userName}}, your profile verification has been approved.',
        smsBody: 'Your MatchMate profile verification is approved.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'ID_VERIFICATION_REJECTED',
        name: 'ID Verification Rejected',
        category: 'system',
        priority: 'high',
        title: 'Verification needs attention',
        message: 'Verification was not approved. Reason: {{reason}}',
        pushTitle: 'Verification action required',
        pushBody: 'Please re-submit your documents.',
        emailSubject: 'Action needed: verification failed',
        emailBody:
          'Hi {{userName}}, verification was not approved. Reason: {{reason}}.',
        smsBody:
          'Verification failed on MatchMate. Please re-submit documents.',
        variables: ['userName', 'reason'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'PHOTO_APPROVED',
        name: 'Photo Approved',
        category: 'system',
        priority: 'normal',
        title: 'Your photo was approved',
        message: 'Your profile photo is now visible to potential matches.',
        pushTitle: 'Photo approved',
        pushBody: 'Your profile photo is now live.',
        emailSubject: 'Profile photo approved',
        emailBody: 'Hi {{userName}}, your new profile photo has been approved.',
        smsBody: 'Your MatchMate profile photo was approved.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: false, sms: false },
      },
      {
        key: 'PHOTO_REJECTED',
        name: 'Photo Rejected',
        category: 'system',
        priority: 'normal',
        title: 'Photo could not be approved',
        message: 'Please upload another photo that meets profile guidelines.',
        pushTitle: 'Photo upload required',
        pushBody: 'Please upload a new profile photo.',
        emailSubject: 'Photo update needed',
        emailBody:
          'Hi {{userName}}, your uploaded photo could not be approved.',
        smsBody: 'Your MatchMate photo was rejected. Upload a new one.',
        variables: ['userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'SUBSCRIPTION_RENEWAL',
        name: 'Subscription Renewal',
        category: 'subscription',
        priority: 'high',
        title: 'Your {{planName}} plan renews soon',
        message: 'Your {{planName}} plan renews on {{renewalDate}}.',
        pushTitle: 'Plan renewal reminder',
        pushBody: '{{planName}} renews on {{renewalDate}}.',
        emailSubject: 'Subscription renewal reminder',
        emailBody: 'Your {{planName}} plan renews on {{renewalDate}}.',
        smsBody: '{{planName}} plan renews on {{renewalDate}}.',
        variables: ['planName', 'renewalDate'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'SUBSCRIPTION_EXPIRED',
        name: 'Subscription Expired',
        category: 'subscription',
        priority: 'high',
        title: 'Your {{planName}} plan has expired',
        message: 'Renew your plan to keep premium features active.',
        pushTitle: 'Subscription expired',
        pushBody: 'Renew your {{planName}} plan now.',
        emailSubject: 'Your subscription has expired',
        emailBody:
          'Hi {{userName}}, your {{planName}} subscription has expired.',
        smsBody: 'Your {{planName}} subscription expired. Renew on MatchMate.',
        variables: ['planName', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'PAYMENT_SUCCESS',
        name: 'Payment Successful',
        category: 'subscription',
        priority: 'normal',
        title: 'Payment successful for {{planName}}',
        message:
          'Your payment of {{amount}} was successful. Transaction: {{transactionId}}.',
        pushTitle: 'Payment successful',
        pushBody: '{{amount}} payment received for {{planName}}.',
        emailSubject: 'Payment receipt - MatchMate',
        emailBody:
          'Hi {{userName}}, payment {{transactionId}} for {{planName}} was successful.',
        smsBody:
          'Payment successful: {{amount}} for {{planName}} on MatchMate.',
        variables: ['planName', 'amount', 'transactionId', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'PAYMENT_FAILED',
        name: 'Payment Failed',
        category: 'subscription',
        priority: 'high',
        title: 'Payment failed for {{planName}}',
        message:
          'We could not process your payment. Please retry to continue premium benefits.',
        pushTitle: 'Payment failed',
        pushBody: 'Please retry your payment for {{planName}}.',
        emailSubject: 'Payment failed - action needed',
        emailBody:
          'Hi {{userName}}, payment for {{planName}} failed. Please retry.',
        smsBody: 'Payment failed for {{planName}} on MatchMate. Retry now.',
        variables: ['planName', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'PROMO_OFFER',
        name: 'Promotional Offer',
        category: 'system',
        priority: 'low',
        title: '{{discount}}% off on {{planName}}',
        message: 'Limited period offer valid until {{validTill}}. Upgrade now.',
        pushTitle: 'Special offer for you',
        pushBody: '{{discount}}% off expires on {{validTill}}.',
        emailSubject: 'Exclusive MatchMate offer inside',
        emailBody:
          'Hi {{userName}}, enjoy {{discount}}% off on {{planName}} till {{validTill}}.',
        smsBody:
          '{{discount}}% off on {{planName}} till {{validTill}}. MatchMate.',
        variables: ['discount', 'planName', 'validTill', 'userName'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
      {
        key: 'PASSWORD_CHANGED',
        name: 'Password Changed',
        category: 'system',
        priority: 'critical',
        title: 'Your password was changed',
        message: 'If this was not you, secure your account immediately.',
        pushTitle: 'Security alert',
        pushBody: 'Your account password was changed.',
        emailSubject: 'Security alert: password changed',
        emailBody:
          'Hi {{userName}}, your password was changed on {{changedAt}}.',
        smsBody: 'Security alert: your MatchMate password was changed.',
        variables: ['userName', 'changedAt'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'NEW_DEVICE_LOGIN',
        name: 'New Device Login',
        category: 'system',
        priority: 'critical',
        title: 'New login detected',
        message: 'New login from {{device}} at {{location}} on {{loginTime}}.',
        pushTitle: 'New device login',
        pushBody: 'Login detected from {{device}}.',
        emailSubject: 'New login detected on your account',
        emailBody:
          'Hi {{userName}}, we noticed a login from {{device}} in {{location}}.',
        smsBody: 'New login detected on MatchMate from {{device}}.',
        variables: ['userName', 'device', 'location', 'loginTime'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'ACCOUNT_BLOCKED',
        name: 'Account Blocked',
        category: 'system',
        priority: 'critical',
        title: 'Your account is temporarily restricted',
        message: 'Your account has been restricted. Reason: {{reason}}.',
        pushTitle: 'Account restricted',
        pushBody: 'Open app for details on account status.',
        emailSubject: 'Account restriction notice',
        emailBody:
          'Hi {{userName}}, your account is restricted. Reason: {{reason}}.',
        smsBody:
          'Your MatchMate account is restricted. Check email for details.',
        variables: ['userName', 'reason'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'SAFETY_ALERT',
        name: 'Safety Alert',
        category: 'system',
        priority: 'critical',
        title: 'Important safety alert',
        message: '{{alertMessage}}',
        pushTitle: 'Safety alert',
        pushBody: '{{alertMessage}}',
        emailSubject: 'Important safety notice from MatchMate',
        emailBody: 'Hi {{userName}}, {{alertMessage}}',
        smsBody: '{{alertMessage}}',
        variables: ['userName', 'alertMessage'],
        channels: { inApp: true, push: true, email: true, sms: true },
      },
      {
        key: 'SYSTEM_ANNOUNCEMENT',
        name: 'System Announcement',
        category: 'system',
        priority: 'normal',
        title: '{{title}}',
        message: '{{message}}',
        pushTitle: '{{title}}',
        pushBody: '{{message}}',
        emailSubject: '{{title}}',
        emailBody: '{{message}}',
        smsBody: '{{message}}',
        variables: ['title', 'message'],
        channels: { inApp: true, push: true, email: true, sms: false },
      },
    ];

    for (const template of defaults) {
      await this.notificationRepo.upsertTemplate(template.key, {
        ...template,
        isActive: true,
      });
    }

    this.logger.log('Notification templates seeded', {
      count: defaults.length,
    });
  }
}
