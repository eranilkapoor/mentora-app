import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './controllers/chat.gateway';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { ChatController } from './controllers/chat.controller';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatRoom, ChatRoomSchema } from './schemas/chat-room.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  StudentProfile,
  StudentProfileSchema,
} from '../learning/schemas/learning.schemas';
import { SafetyModule } from '../safety/safety.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { ChatPresenceService } from './services/chat-presence.service';
import { ChatAccessService } from './services/chat-access.service';
import {
  CommunicationSetting,
  CommunicationSettingSchema,
} from '../settings/schemas/communication-setting.schema';
import { Media, MediaSchema } from '../../common/schemas/user-media.schema';
import { ChatRealtimeModule } from './chat-realtime.module';
import {
  Verification,
  VerificationSchema,
} from '../safety/schemas/verification.schema';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => NotificationsModule),
    SafetyModule,
    SubscriptionsModule,
    ChatRealtimeModule,
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: User.name, schema: UserSchema },
      { name: StudentProfile.name, schema: StudentProfileSchema },
      { name: Media.name, schema: MediaSchema },
      { name: CommunicationSetting.name, schema: CommunicationSettingSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
  ],
  providers: [
    ChatGateway,
    ChatService,
    ChatRepository,
    ChatPresenceService,
    ChatAccessService,
  ],
  controllers: [ChatController],
  exports: [ChatService, ChatPresenceService, ChatRealtimeModule],
})
export class ChatModule {}
