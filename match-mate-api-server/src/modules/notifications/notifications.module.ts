import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from './schemas/notification-templates.schema';
import {
  NotificationLog,
  NotificationLogSchema,
} from './schemas/notification-logs.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { NotificationsService } from './services/notifications.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsController } from './controllers/notifications.controller';
import { EmailNotificationProvider } from './providers/email-notification.provider';
import { SmsNotificationProvider } from './providers/sms-notification.provider';
import { PushNotificationProvider } from './providers/push-notification.provider';
import { NotificationQueueService } from './services/notification-queue.service';
import { NotificationDispatchWorker } from './notification-dispatch.worker';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    ConfigModule,
    SettingsModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      {
        name: NotificationTemplate.name,
        schema: NotificationTemplateSchema,
      },
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRepository,
    EmailNotificationProvider,
    SmsNotificationProvider,
    PushNotificationProvider,
    NotificationQueueService,
    NotificationDispatchWorker,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
