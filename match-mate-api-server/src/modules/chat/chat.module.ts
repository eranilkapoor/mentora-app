import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './controllers/chat.gateway';
import { ChatRealtimeService } from './services/chat-realtime.service';
import { ChatService } from './services/chat.service';
import { ChatRepository } from './repositories/chat.repository';
import { ChatController } from './controllers/chat.controller';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatRoom, ChatRoomSchema } from './schemas/chat-room.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  Profile,
  ProfileSchema,
} from '../profile/schemas/profile/profile.schema';
import {
  PrivacySetting,
  PrivacySettingSchema,
} from '../profile/schemas/settings/privacy-setting.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import { SafetyModule } from '../safety/safety.module';
import { ChatPresenceService } from './services/chat-presence.service';
import { ChatAccessService } from './services/chat-access.service';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
    SafetyModule,
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  providers: [
    ChatGateway,
    ChatRealtimeService,
    ChatService,
    ChatRepository,
    ChatPresenceService,
    ChatAccessService,
  ],
  controllers: [ChatController],
  exports: [ChatService, ChatPresenceService, ChatRealtimeService],
})
export class ChatModule {}
