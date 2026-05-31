import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
import { NotificationRealtimeService } from './services/notification-realtime.service';
import { NotificationsGateway } from './controllers/notifications.gateway';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    forwardRef(() => SettingsModule),
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
    NotificationsGateway,
    NotificationsService,
    NotificationRepository,
    NotificationRealtimeService,
    EmailNotificationProvider,
    SmsNotificationProvider,
    PushNotificationProvider,
    NotificationQueueService,
    NotificationDispatchWorker,
  ],
  exports: [NotificationsService, NotificationRealtimeService],
})
export class NotificationsModule {}
