import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { ChatRealtimeService } from './chat-realtime.service';
import { ChatService } from './chat.service';
import { ChatRepository } from './chat.repository';
import { ChatController } from './chat.controller';
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
} from '../profile/schemas/settings/privacy.schema';
import { Match, MatchSchema } from '../match/schemas/match.schema';
import {
  UserBlock,
  UserBlockSchema,
} from '../profile/schemas/settings/user-block.schema';
import { ChatPresenceService } from './chat-presence.service';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: User.name, schema: UserSchema },
      { name: Profile.name, schema: ProfileSchema },
      { name: PrivacySetting.name, schema: PrivacySettingSchema },
      { name: Match.name, schema: MatchSchema },
      { name: UserBlock.name, schema: UserBlockSchema },
    ]),
  ],
  providers: [
    ChatGateway,
    ChatRealtimeService,
    ChatService,
    ChatRepository,
    ChatPresenceService,
  ],
  controllers: [ChatController],
  exports: [ChatService, ChatPresenceService, ChatRealtimeService],
})
export class ChatModule {}
