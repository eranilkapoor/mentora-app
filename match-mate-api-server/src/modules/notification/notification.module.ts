import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  NotificationTemplates,
  NotificationTemplatesSchema,
} from './schemas/notification-templates.schema';
import {
  NotificationLogs,
  NotificationLogsSchema,
} from './schemas/notification-logs.schema';
import {
  UserNotificationSettings,
  UserNotificationSettingsSchema,
} from './schemas/user-notification-settings.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { NotificationService } from './services/notification.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationController } from './controllers/notification.controller';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationDispatchWorker } from './notification-dispatch.worker';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      {
        name: NotificationTemplates.name,
        schema: NotificationTemplatesSchema,
      },
      { name: NotificationLogs.name, schema: NotificationLogsSchema },
      {
        name: UserNotificationSettings.name,
        schema: UserNotificationSettingsSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    EmailNotificationProvider,
    SmsNotificationProvider,
    PushNotificationProvider,
    NotificationQueueService,
    NotificationDispatchWorker,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
